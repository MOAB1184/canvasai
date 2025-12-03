import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateStudyTasks, generateCalendarEvents, GeneratedTask, CanvasAssignment } from '@/lib/openai';
import { getDb } from '@/lib/db';

// Store generated tasks in MongoDB
const TASKS_COLLECTION = 'ai_tasks';

interface StoredTask extends GeneratedTask {
  userId: string;
  createdAt: number;
  completed: boolean;
  source: 'ai' | 'canvas' | 'manual';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDb();
    const tasksCollection = db.collection<StoredTask>(TASKS_COLLECTION);

    // Get user's tasks
    const tasks = await tasksCollection
      .find({ userId: session.userId })
      .sort({ suggestedDate: 1 })
      .toArray();

    // Also get Canvas assignments if token is stored
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ id: session.userId });
    
    let assignments: CanvasAssignment[] = [];
    if (user?.canvasToken && user?.canvasDomain) {
      try {
        assignments = await fetchCanvasAssignments(user.canvasToken, user.canvasDomain);
      } catch (e) {
        console.error('Failed to fetch Canvas assignments:', e);
      }
    }

    // Generate calendar events
    const calendarEvents = generateCalendarEvents(assignments, tasks);

    return NextResponse.json({ 
      tasks,
      assignments,
      calendarEvents
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to get tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { action, taskId, canvasToken, canvasDomain } = await request.json();

    const db = await getDb();
    const tasksCollection = db.collection<StoredTask>(TASKS_COLLECTION);
    const usersCollection = db.collection('users');

    if (action === 'generate') {
      // Store Canvas credentials if provided
      if (canvasToken && canvasDomain) {
        await usersCollection.updateOne(
          { id: session.userId },
          { $set: { canvasToken, canvasDomain } }
        );
      }

      // Get user's Canvas credentials
      const user = await usersCollection.findOne({ id: session.userId });
      const token = canvasToken || user?.canvasToken;
      const domain = canvasDomain || user?.canvasDomain;

      if (!token || !domain) {
        return NextResponse.json({ 
          error: 'Canvas token not configured. Please set up your Canvas API token in settings.' 
        }, { status: 400 });
      }

      // Fetch assignments from Canvas
      const assignments = await fetchCanvasAssignments(token, domain);

      // Get existing task titles to avoid duplicates
      const existingTasks = await tasksCollection
        .find({ userId: session.userId })
        .project({ title: 1 })
        .toArray();
      const existingTitles = existingTasks.map(t => t.title);

      // Generate AI tasks
      const aiTasks = await generateStudyTasks(
        assignments,
        [], // courses - could be fetched separately
        existingTitles
      );

      // Store new tasks
      const now = Date.now();
      const tasksToInsert: StoredTask[] = aiTasks.map(task => ({
        ...task,
        userId: session.userId,
        createdAt: now,
        completed: false,
        source: 'ai' as const
      }));

      if (tasksToInsert.length > 0) {
        await tasksCollection.insertMany(tasksToInsert);
      }

      // Get all tasks
      const allTasks = await tasksCollection
        .find({ userId: session.userId })
        .sort({ suggestedDate: 1 })
        .toArray();

      // Generate calendar events
      const calendarEvents = generateCalendarEvents(assignments, allTasks);

      return NextResponse.json({ 
        tasks: allTasks,
        assignments,
        calendarEvents,
        generated: tasksToInsert.length
      });
    }

    if (action === 'toggle' && taskId) {
      // Toggle task completion
      const task = await tasksCollection.findOne({ id: taskId, userId: session.userId });
      if (task) {
        await tasksCollection.updateOne(
          { id: taskId, userId: session.userId },
          { $set: { completed: !task.completed } }
        );
      }

      const tasks = await tasksCollection
        .find({ userId: session.userId })
        .sort({ suggestedDate: 1 })
        .toArray();

      return NextResponse.json({ tasks });
    }

    if (action === 'delete' && taskId) {
      await tasksCollection.deleteOne({ id: taskId, userId: session.userId });
      
      const tasks = await tasksCollection
        .find({ userId: session.userId })
        .sort({ suggestedDate: 1 })
        .toArray();

      return NextResponse.json({ tasks });
    }

    if (action === 'clear_completed') {
      await tasksCollection.deleteMany({ userId: session.userId, completed: true });
      
      const tasks = await tasksCollection
        .find({ userId: session.userId })
        .sort({ suggestedDate: 1 })
        .toArray();

      return NextResponse.json({ tasks });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Task action error:', error);
    return NextResponse.json({ error: 'Failed to process task action' }, { status: 500 });
  }
}

// Helper function to make Canvas API requests with fallback authentication
async function canvasApiRequest(url: string, token: string): Promise<Response> {
  // Try Bearer token method first
  let resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // If Bearer fails with 401, try query parameter method
  if (!resp.ok && resp.status === 401) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('access_token', token);
    resp = await fetch(urlObj.toString());
  }

  return resp;
}

async function fetchCanvasAssignments(token: string, domain: string): Promise<CanvasAssignment[]> {
  const assignments: CanvasAssignment[] = [];

  try {
    // First get courses
    const coursesResp = await canvasApiRequest(
      `https://${domain}/api/v1/courses?enrollment_state=active&per_page=20`,
      token
    );
    
    if (!coursesResp.ok) {
      throw new Error('Failed to fetch courses');
    }

    const courses = await coursesResp.json();

    if (!Array.isArray(courses)) {
      return [];
    }

    // Fetch assignments from each course
    for (const course of courses.slice(0, 10)) {
      try {
        const assignResp = await canvasApiRequest(
          `https://${domain}/api/v1/courses/${course.id}/assignments?per_page=20&order_by=due_at&bucket=upcoming`,
          token
        );

        if (assignResp.ok) {
          const courseAssignments = await assignResp.json();
          
          if (Array.isArray(courseAssignments)) {
            for (const assign of courseAssignments) {
              assignments.push({
                id: assign.id.toString(),
                name: assign.name,
                dueAt: assign.due_at,
                courseName: course.name,
                courseCode: course.course_code || course.name,
                description: assign.description,
                submissionTypes: assign.submission_types,
                pointsPossible: assign.points_possible
              });
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch assignments for course ${course.name}:`, e);
      }
    }

    // Sort by due date
    assignments.sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });

    return assignments;
  } catch (error) {
    console.error('Failed to fetch Canvas assignments:', error);
    return [];
  }
}


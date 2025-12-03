import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use gpt-5-nano for lightweight tasks (classification, simple analysis)
// This is the most cost-effective model for simple tasks
const LIGHT_MODEL = 'gpt-5-nano';

// Use gpt-4o for complex tasks (content generation, detailed analysis)
const SMART_MODEL = 'gpt-4o';

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'review' | 'practice' | 'preparation' | 'break';
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  relatedAssignment?: string;
  relatedCourse?: string;
  suggestedDate?: string;
  suggestedTime?: string;
}

export interface CanvasAssignment {
  id: string;
  name: string;
  dueAt: string | null;
  courseName: string;
  courseCode: string;
  description?: string;
  submissionTypes?: string[];
  pointsPossible?: number;
}

export interface CanvasCourse {
  id: string;
  name: string;
  code: string;
}

/**
 * Lightweight classification using gpt-5-nano
 */
export async function classifyIntent(message: string): Promise<{ type: string; query?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { type: 'CHAT' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: LIGHT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a classifier. Determine if the user wants to:
1. Generate flashcards (GENERATE_FLASHCARDS)
2. Get study suggestions (STUDY_SUGGESTIONS)
3. Ask about assignments (ASSIGNMENT_QUERY)
4. General chat (CHAT)

Reply ONLY with JSON: {"type":"TYPE","query":"extracted topic if applicable"}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content || '{"type":"CHAT"}';
    try {
      return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      return { type: 'CHAT' };
    }
  } catch (error) {
    console.error('Classification error:', error);
    return { type: 'CHAT' };
  }
}

/**
 * Search and rank content using gpt-5-nano
 */
export async function rankContentRelevance(
  query: string,
  contentItems: { title: string; preview?: string }[]
): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY || contentItems.length === 0) {
    return [];
  }

  try {
    const contentList = contentItems.slice(0, 50).map((item, i) => 
      `${i}. ${item.title}${item.preview ? ` - ${item.preview.substring(0, 100)}` : ''}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: LIGHT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You rank content relevance. Return ONLY a JSON array of indices (numbers) of the most relevant items, e.g., [0, 5, 12]. Max 10 items.'
        },
        {
          role: 'user',
          content: `Query: "${query}"\n\nContent:\n${contentList}`
        }
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content || '[]';
    try {
      const indices = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
      return Array.isArray(indices) ? indices.filter(i => typeof i === 'number') : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Ranking error:', error);
    return [];
  }
}

/**
 * Generate AI-powered study tasks based on upcoming assignments
 */
export async function generateStudyTasks(
  assignments: CanvasAssignment[],
  courses: CanvasCourse[],
  existingTasks: string[] = []
): Promise<GeneratedTask[]> {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackTasks(assignments);
  }

  try {
    const now = new Date();
    const assignmentList = assignments
      .filter(a => a.dueAt && new Date(a.dueAt) > now)
      .slice(0, 15)
      .map(a => ({
        name: a.name,
        course: a.courseCode || a.courseName,
        dueAt: a.dueAt,
        points: a.pointsPossible,
        type: a.submissionTypes?.join(', ') || 'unknown'
      }));

    if (assignmentList.length === 0) {
      return [];
    }

    const response = await openai.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a study planning AI. Given a student's upcoming assignments, generate personalized study tasks.

Rules:
1. Create 3-5 actionable tasks per major assignment
2. Consider assignment type (quiz = practice questions, essay = outline then draft, etc.)
3. Space tasks appropriately before due dates
4. Include break reminders for long study sessions
5. Prioritize based on due date and point value
6. Don't duplicate existing tasks

Return JSON array of tasks:
[{
  "id": "unique-id",
  "title": "Short task title",
  "description": "What to do",
  "type": "study|review|practice|preparation|break",
  "priority": "high|medium|low",
  "estimatedMinutes": 30,
  "relatedAssignment": "Assignment name",
  "relatedCourse": "COURSE 101",
  "suggestedDate": "YYYY-MM-DD",
  "suggestedTime": "HH:MM"
}]`
        },
        {
          role: 'user',
          content: `Current date/time: ${now.toISOString()}

Upcoming assignments:
${JSON.stringify(assignmentList, null, 2)}

Existing tasks to avoid duplicating:
${existingTasks.join(', ') || 'None'}

Generate study tasks:`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    try {
      let jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBracket = jsonStr.indexOf('[');
      const lastBracket = jsonStr.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
      }
      const tasks = JSON.parse(jsonStr);
      return Array.isArray(tasks) ? tasks : [];
    } catch (e) {
      console.error('Failed to parse AI tasks:', e);
      return generateFallbackTasks(assignments);
    }
  } catch (error) {
    console.error('Task generation error:', error);
    return generateFallbackTasks(assignments);
  }
}

/**
 * Fallback task generation when AI is unavailable
 */
function generateFallbackTasks(assignments: CanvasAssignment[]): GeneratedTask[] {
  const tasks: GeneratedTask[] = [];
  const now = new Date();

  for (const assignment of assignments.slice(0, 5)) {
    if (!assignment.dueAt) continue;
    
    const dueDate = new Date(assignment.dueAt);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) continue;

    // Create study task 2 days before due
    if (daysUntilDue >= 2) {
      const studyDate = new Date(dueDate);
      studyDate.setDate(studyDate.getDate() - 2);
      
      tasks.push({
        id: `study-${assignment.id}`,
        title: `Study for: ${assignment.name}`,
        description: `Review materials and prepare for ${assignment.name}`,
        type: 'study',
        priority: daysUntilDue <= 3 ? 'high' : 'medium',
        estimatedMinutes: 45,
        relatedAssignment: assignment.name,
        relatedCourse: assignment.courseCode,
        suggestedDate: studyDate.toISOString().split('T')[0],
        suggestedTime: '14:00'
      });
    }

    // Create review task 1 day before due
    if (daysUntilDue >= 1) {
      const reviewDate = new Date(dueDate);
      reviewDate.setDate(reviewDate.getDate() - 1);
      
      tasks.push({
        id: `review-${assignment.id}`,
        title: `Review: ${assignment.name}`,
        description: `Final review before submission`,
        type: 'review',
        priority: 'high',
        estimatedMinutes: 30,
        relatedAssignment: assignment.name,
        relatedCourse: assignment.courseCode,
        suggestedDate: reviewDate.toISOString().split('T')[0],
        suggestedTime: '10:00'
      });
    }
  }

  return tasks;
}

/**
 * Generate calendar events from tasks and assignments
 */
export function generateCalendarEvents(
  assignments: CanvasAssignment[],
  aiTasks: GeneratedTask[]
): Array<{
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'assignment' | 'quiz' | 'study' | 'review' | 'break';
  course?: string;
  color: string;
}> {
  const events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    type: 'assignment' | 'quiz' | 'study' | 'review' | 'break';
    course?: string;
    color: string;
  }> = [];

  // Add assignments as events
  for (const assignment of assignments) {
    if (!assignment.dueAt) continue;
    
    const isQuiz = assignment.submissionTypes?.includes('online_quiz');
    events.push({
      id: `assign-${assignment.id}`,
      title: assignment.name,
      start: assignment.dueAt,
      end: assignment.dueAt,
      type: isQuiz ? 'quiz' : 'assignment',
      course: assignment.courseCode,
      color: isQuiz ? '#f97316' : '#ef4444'
    });
  }

  // Add AI-generated tasks as events
  for (const task of aiTasks) {
    if (!task.suggestedDate) continue;
    
    const startTime = task.suggestedTime || '09:00';
    const start = `${task.suggestedDate}T${startTime}:00`;
    const endDate = new Date(start);
    endDate.setMinutes(endDate.getMinutes() + task.estimatedMinutes);
    
    const colorMap: Record<string, string> = {
      study: '#3b82f6',
      review: '#8b5cf6',
      practice: '#10b981',
      preparation: '#6366f1',
      break: '#64748b'
    };

    events.push({
      id: task.id,
      title: task.title,
      start,
      end: endDate.toISOString(),
      type: task.type as 'study' | 'review' | 'break',
      course: task.relatedCourse,
      color: colorMap[task.type] || '#3b82f6'
    });
  }

  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Chat completion for the AI agent
 */
export async function chatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "I'm sorry, but the AI service is not configured. Please set up the OpenAI API key.";
  }

  try {
    const systemMessage = {
      role: 'system' as const,
      content: `You are CanvasAI, a helpful AI study assistant for students using Canvas LMS. 
You help students with:
- Understanding course materials
- Study planning and time management
- Explaining concepts
- Creating study guides
- Answering questions about assignments

Be concise, helpful, and encouraging. If you don't know something, say so.
${context ? `\nContext from Canvas:\n${context}` : ''}`
    };

    const response = await openai.chat.completions.create({
      model: SMART_MODEL,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Chat completion error:', error);
    return "I'm having trouble connecting to the AI service. Please try again later.";
  }
}

export default openai;


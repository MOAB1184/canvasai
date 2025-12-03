import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatCompletion } from '@/lib/openai';
import { getDb } from '@/lib/db';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const CONVERSATIONS_COLLECTION = 'ai_conversations';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const db = await getDb();
    const conversationsCollection = db.collection<Conversation>(CONVERSATIONS_COLLECTION);
    const usersCollection = db.collection('users');

    // Get or create conversation
    let conversation: Conversation | null = null;
    let convId = conversationId;

    if (conversationId) {
      conversation = await conversationsCollection.findOne({ 
        id: conversationId, 
        userId: session.userId 
      });
    }

    if (!conversation) {
      convId = crypto.randomUUID();
      conversation = {
        id: convId,
        userId: session.userId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await conversationsCollection.insertOne(conversation);
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    // Get Canvas context if available
    let context = '';
    const user = await usersCollection.findOne({ id: session.userId });
    if (user?.canvasToken && user?.canvasDomain) {
      try {
        context = await getCanvasContext(user.canvasToken, user.canvasDomain);
      } catch (e) {
        console.warn('Failed to get Canvas context:', e);
      }
    }

    // Prepare messages for OpenAI (last 10 messages for context)
    const recentMessages = conversation.messages.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));
    recentMessages.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await chatCompletion(recentMessages, context);

    // Add assistant message
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    };

    // Update conversation
    await conversationsCollection.updateOne(
      { id: convId },
      { 
        $push: { 
          messages: { 
            $each: [userMessage, assistantMessage] 
          } 
        },
        $set: { updatedAt: Date.now() }
      }
    );

    return NextResponse.json({ 
      response: aiResponse,
      conversationId: convId
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const conversationId = request.nextUrl.searchParams.get('conversationId');

    const db = await getDb();
    const conversationsCollection = db.collection<Conversation>(CONVERSATIONS_COLLECTION);

    if (conversationId) {
      // Get specific conversation
      const conversation = await conversationsCollection.findOne({ 
        id: conversationId, 
        userId: session.userId 
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json({ conversation });
    } else {
      // Get all conversations (just metadata)
      const conversations = await conversationsCollection
        .find({ userId: session.userId })
        .project({ id: 1, createdAt: 1, updatedAt: 1, 'messages': { $slice: -1 } })
        .sort({ updatedAt: -1 })
        .limit(20)
        .toArray();

      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
  }
}

async function getCanvasContext(token: string, domain: string): Promise<string> {
  const headers = { 'Authorization': `Bearer ${token}` };
  const context: string[] = [];

  try {
    // Get upcoming assignments
    const todoResp = await fetch(
      `https://${domain}/api/v1/users/self/todo?per_page=10`,
      { headers }
    );

    if (todoResp.ok) {
      const todos = await todoResp.json();
      if (Array.isArray(todos) && todos.length > 0) {
        context.push('Upcoming assignments:');
        for (const todo of todos.slice(0, 5)) {
          const name = todo.assignment?.name || todo.title || 'Unknown';
          const due = todo.assignment?.due_at ? new Date(todo.assignment.due_at).toLocaleDateString() : 'No due date';
          context.push(`- ${name} (due: ${due})`);
        }
      }
    }

    // Get active courses
    const coursesResp = await fetch(
      `https://${domain}/api/v1/courses?enrollment_state=active&per_page=5`,
      { headers }
    );

    if (coursesResp.ok) {
      const courses = await coursesResp.json();
      if (Array.isArray(courses) && courses.length > 0) {
        context.push('\nEnrolled courses:');
        for (const course of courses) {
          context.push(`- ${course.course_code || course.name}`);
        }
      }
    }

    return context.join('\n');
  } catch (error) {
    console.error('Failed to get Canvas context:', error);
    return '';
  }
}


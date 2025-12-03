import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getConversation, getConversationMessages, createMessage } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const conversationId = request.nextUrl.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation || !conversation.participants.includes(session.userId)) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const messages = await getConversationMessages(conversationId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { conversationId, content } = await request.json();
    
    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation || !conversation.participants.includes(session.userId)) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const message = await createMessage({
      id: crypto.randomUUID(),
      conversationId,
      senderId: session.userId,
      content,
      createdAt: Date.now(),
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

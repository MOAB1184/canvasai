import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserConversations, createConversation, findConversation, getUserById } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const conversations = await getUserConversations(session.userId);
    
    // Enrich with participant info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId = conv.participants.find(p => p !== session.userId);
        const otherUser = otherParticipantId ? await getUserById(otherParticipantId) : null;
        
        return {
          ...conv,
          otherUser: otherUser ? {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
          } : null,
        };
      })
    );

    return NextResponse.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations' },
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

    const { participantId } = await request.json();
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    let conversation = await findConversation(session.userId, participantId);
    
    if (!conversation) {
      conversation = await createConversation({
        id: crypto.randomUUID(),
        participants: [session.userId, participantId],
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

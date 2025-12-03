import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById, updateUser, saveFlashcardSet, getUserFlashcardSets, FlashcardSet } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, data } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'getSettings':
        return NextResponse.json({
          settings: {
            canvasToken: user.canvasToken,
            // Don't send gemini key back - it's managed by the server
          },
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        });

      case 'syncSettings':
        if (data?.canvasToken) {
          await updateUser(user.id, { canvasToken: data.canvasToken });
        }
        return NextResponse.json({ success: true });

      case 'syncFlashcards':
        // Sync flashcards from extension to server
        if (data?.flashcards && Array.isArray(data.flashcards)) {
          for (const fc of data.flashcards) {
            const flashcardSet: FlashcardSet = {
              id: crypto.randomUUID(),
              userId: user.id,
              topic: fc.topic,
              flashcards: fc.flashcards,
              createdAt: fc.date ? new Date(fc.date).getTime() : Date.now(),
              source: 'extension',
            };
            await saveFlashcardSet(flashcardSet);
          }
        }
        return NextResponse.json({ success: true });

      case 'getFlashcards':
        const flashcardSets = await getUserFlashcardSets(user.id);
        return NextResponse.json({ flashcardSets });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Extension sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with extension' },
      { status: 500 }
    );
  }
}

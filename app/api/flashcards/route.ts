import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserFlashcardSets, saveFlashcardSet, deleteFlashcardSet, FlashcardSet } from '@/lib/db';

// GET - Get all flashcard sets for the current user
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const flashcardSets = await getUserFlashcardSets(session.userId);
    
    return NextResponse.json({ flashcardSets });
  } catch (error) {
    console.error('Get flashcards error:', error);
    return NextResponse.json(
      { error: 'Failed to get flashcards' },
      { status: 500 }
    );
  }
}

// POST - Create or sync a flashcard set
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic, flashcards, source = 'web' } = body;

    if (!topic || !flashcards || !Array.isArray(flashcards)) {
      return NextResponse.json(
        { error: 'Topic and flashcards are required' },
        { status: 400 }
      );
    }

    const flashcardSet: FlashcardSet = {
      id: crypto.randomUUID(),
      userId: session.userId,
      topic,
      flashcards,
      createdAt: Date.now(),
      source,
    };

    await saveFlashcardSet(flashcardSet);

    return NextResponse.json({ flashcardSet });
  } catch (error) {
    console.error('Create flashcard set error:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard set' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a flashcard set
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Flashcard set ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteFlashcardSet(id, session.userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Flashcard set not found or not owned by user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete flashcard set error:', error);
    return NextResponse.json(
      { error: 'Failed to delete flashcard set' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    console.log('[Onboarding] Session:', session);
    
    if (!session) {
      console.log('[Onboarding] No session found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { canvasToken } = await request.json();

    const user = await getUserById(session.userId);
    console.log('[Onboarding] User lookup for ID:', session.userId, '- Found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('[Onboarding] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with Canvas token
    await updateUser(user.id, {
      canvasToken: canvasToken || undefined,
      onboardingComplete: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

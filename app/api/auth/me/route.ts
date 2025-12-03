import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getOrCreateUserStats, addXP } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserById(session.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    // Award daily login XP (only once per day)
    try {
      const stats = await getOrCreateUserStats(session.userId);
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastActivityDate !== today) {
        await addXP(session.userId, 10, 'daily_login', 'Daily login bonus');
        console.log('[Auth/Me] Awarded daily login XP to user:', session.userId);
      }
    } catch (xpError) {
      console.error('[Auth/Me] Failed to award daily XP:', xpError);
      // Don't fail the request if XP award fails
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingComplete: user.onboardingComplete,
        token: token
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

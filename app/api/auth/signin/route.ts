import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getOrCreateUserStats, addXP } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    let user;
    try {
      user = await getUserByEmail(email.toLowerCase().trim());
    } catch (dbError) {
      console.error('[Signin] Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MongoDB configuration.' },
        { status: 500 }
      );
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create token and set cookie
    const token = await createToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Award daily login XP (only once per day)
    try {
      const stats = await getOrCreateUserStats(user.id);
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastActivityDate !== today) {
        await addXP(user.id, 10, 'daily_login', 'Daily login bonus');
        console.log('[Signin] Awarded daily login XP to user:', user.id);
      }
    } catch (xpError) {
      console.error('[Signin] Failed to award daily XP:', xpError);
      // Don't fail login if XP award fails
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('[Signin] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign in' },
      { status: 500 }
    );
  }
}

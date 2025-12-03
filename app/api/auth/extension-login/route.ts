import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getOrCreateUserStats, addXP } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

// POST - Login directly from extension
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
    const user = await getUserByEmail(email.toLowerCase().trim());
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

    // Create token
    const token = await createToken(user.id);

    // Award daily login XP
    const stats = await getOrCreateUserStats(user.id);
    const today = new Date().toISOString().split('T')[0];
    
    // Only award XP if user hasn't logged in today
    if (stats.lastActivityDate !== today) {
      await addXP(user.id, 10, 'daily_login', 'Daily login bonus');
    }

    // Return token and user info for extension storage
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('[Extension Login] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign in' },
      { status: 500 }
    );
  }
}


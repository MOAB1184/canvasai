import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, getOrCreateUserStats, addXP } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

// POST - Sign up directly from extension
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    console.log('[Extension Signup] Creating user with ID:', userId);
    
    const user = await createUser({
      id: userId,
      email: email.toLowerCase().trim(),
      name: name?.trim(),
      passwordHash,
      onboardingComplete: false,
      createdAt: Date.now(),
    });

    console.log('[Extension Signup] User created:', user.id);

    // Create token
    const token = await createToken(user.id);

    // Award daily login XP for new signups
    await addXP(user.id, 10, 'daily_login', 'Welcome bonus - Daily login');

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
    console.error('[Extension Signup] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}


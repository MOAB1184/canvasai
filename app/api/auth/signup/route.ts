import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let existingUser;
    try {
      existingUser = await getUserByEmail(email);
    } catch (dbError) {
      console.error('[Signup] Database error checking existing user:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MongoDB configuration.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    console.log('[Signup] Creating user with ID:', userId);
    
    let user;
    try {
      user = await createUser({
        id: userId,
        email: email.toLowerCase().trim(),
        name: name?.trim(),
        passwordHash,
        onboardingComplete: false,
        createdAt: Date.now(),
      });
    } catch (dbError) {
      console.error('[Signup] Database error creating user:', dbError);
      return NextResponse.json(
        { error: 'Failed to create account. Database error: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
        { status: 500 }
      );
    }

    console.log('[Signup] User created:', user.id);

    // Create token and set cookie
    const token = await createToken(user.id);
    console.log('[Signup] Token created for user:', user.id);
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('[Signup] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode, createToken } from '@/lib/auth';
import { createUser, getUserByEmail, getUserByGoogleId, linkGoogleId, updateUser } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const googleUser = await exchangeGoogleCode(code);
    
    if (!googleUser) {
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    }

    // Check if user exists by Google ID
    let user = await getUserByGoogleId(googleUser.googleId);
    
    if (!user) {
      // Check if user exists by email
      user = await getUserByEmail(googleUser.email);
      
      if (user) {
        // Link Google ID to existing account
        await linkGoogleId(user.id, googleUser.googleId);
        await updateUser(user.id, { googleId: googleUser.googleId });
      } else {
        // Create new user
        user = await createUser({
          id: crypto.randomUUID(),
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          onboardingComplete: false,
          createdAt: Date.now(),
        });
        await linkGoogleId(user.id, googleUser.googleId);
      }
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

    // Redirect based on onboarding status
    if (!user.onboardingComplete) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}

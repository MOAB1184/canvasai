import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { searchUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const query = request.nextUrl.searchParams.get('q') || '';
    
    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await searchUsers(query, session.userId);
    
    // Return only public info
    const publicUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));

    return NextResponse.json({ users: publicUsers });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}

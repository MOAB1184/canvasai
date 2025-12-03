import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getFriendsLeaderboard, getGlobalLeaderboard, getOrCreateUserStats } from '@/lib/db';

// GET - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'friends';
    const limit = parseInt(searchParams.get('limit') || '50');

    let leaderboard;
    if (type === 'global') {
      leaderboard = await getGlobalLeaderboard(limit);
    } else {
      leaderboard = await getFriendsLeaderboard(session.userId);
    }

    // Get current user's stats for comparison
    const myStats = await getOrCreateUserStats(session.userId);
    
    // Find current user's rank
    const myRank = leaderboard.findIndex(entry => entry.stats.userId === session.userId) + 1;

    // Format leaderboard for response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.stats.userId,
      name: entry.user?.name || 'Unknown',
      email: entry.user?.email || '',
      xp: entry.stats.xp,
      level: entry.stats.level,
      currentStreak: entry.stats.currentStreak,
      badges: entry.stats.badges,
      isCurrentUser: entry.stats.userId === session.userId
    }));

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      myStats: {
        rank: myRank || formattedLeaderboard.length + 1,
        xp: myStats.xp,
        level: myStats.level,
        currentStreak: myStats.currentStreak,
        badges: myStats.badges
      },
      type
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyToken } from '@/lib/auth';
import { getOrCreateUserStats, addXP, incrementStat, awardBadge, getRecentXPActivities } from '@/lib/db';
import { BADGES } from '@/lib/types';

// GET - Get current user's stats
export async function GET(request: NextRequest) {
  try {
    // Try to get session from cookie first, then from Authorization header
    let session = await getSession();
    
    // If no session from cookie, check Authorization header (for extension)
    if (!session) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await verifyToken(token);
        if (payload) {
          session = { userId: payload.userId };
        }
      }
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const stats = await getOrCreateUserStats(session.userId);
    const activities = await getRecentXPActivities(session.userId, 10);
    
    // Get badge details
    const earnedBadges = BADGES.filter(b => stats.badges.includes(b.id));
    const availableBadges = BADGES.filter(b => !stats.badges.includes(b.id));

    return NextResponse.json({ 
      stats,
      activities,
      earnedBadges,
      availableBadges,
      allBadges: BADGES
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}

// POST - Record activity and earn XP
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { action, data } = await request.json();

    let stats;
    switch (action) {
      case 'daily_login':
        stats = await addXP(session.userId, 10, 'daily_login', 'Daily login bonus');
        break;
      
      case 'flashcard_study':
        stats = await addXP(session.userId, 25, 'flashcard_study', data?.topic ? `Studied: ${data.topic}` : 'Studied flashcards');
        await incrementStat(session.userId, 'flashcardsStudied');
        break;
      
      case 'assignment_complete':
        stats = await addXP(session.userId, 50, 'assignment_complete', data?.name || 'Completed assignment');
        await incrementStat(session.userId, 'assignmentsCompleted');
        break;
      
      case 'quiz_complete':
        const quizXP = data?.score ? Math.floor(data.score * 0.5) + 20 : 30;
        stats = await addXP(session.userId, quizXP, 'quiz_complete', data?.name || 'Completed quiz');
        await incrementStat(session.userId, 'quizzesTaken');
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check for badge eligibility
    if (stats) {
      await checkAndAwardBadges(session.userId, stats);
    }

    // Refresh stats after potential badge awards
    const updatedStats = await getOrCreateUserStats(session.userId);
    
    return NextResponse.json({ success: true, stats: updatedStats });
  } catch (error) {
    console.error('Record activity error:', error);
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
  }
}

async function checkAndAwardBadges(userId: string, stats: any) {
  const badgesToCheck = [
    { id: 'first_flashcard', check: () => stats.flashcardsStudied >= 1 },
    { id: 'flashcard_master', check: () => stats.flashcardsStudied >= 50 },
    { id: 'week_streak', check: () => stats.currentStreak >= 7 },
    { id: 'month_streak', check: () => stats.currentStreak >= 30 },
    { id: 'early_bird', check: () => stats.assignmentsCompleted >= 10 },
    { id: 'quiz_whiz', check: () => stats.quizzesTaken >= 20 },
    { id: 'level_10', check: () => stats.level >= 10 },
    { id: 'level_25', check: () => stats.level >= 25 },
    { id: 'xp_1000', check: () => stats.xp >= 1000 },
  ];

  for (const badge of badgesToCheck) {
    if (!stats.badges.includes(badge.id) && badge.check()) {
      await awardBadge(userId, badge.id);
      const badgeInfo = BADGES.find(b => b.id === badge.id);
      if (badgeInfo) {
        await addXP(userId, badgeInfo.xpReward, 'badge_earned', `Earned badge: ${badgeInfo.name}`);
      }
    }
  }
}


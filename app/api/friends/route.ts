import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  getFriends,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendshipStatus,
  getUserById,
  addXP,
  awardBadge,
  getOrCreateUserStats
} from '@/lib/db';

// GET - Get friends list and pending requests
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    if (type === 'status') {
      const friendId = searchParams.get('friendId');
      if (!friendId) {
        return NextResponse.json({ error: 'friendId required' }, { status: 400 });
      }
      const status = await getFriendshipStatus(session.userId, friendId);
      return NextResponse.json({ status });
    }

    // Get all friends
    const friendIds = await getFriends(session.userId);
    const friends = await Promise.all(
      friendIds.map(async (id) => {
        const user = await getUserById(id);
        return user ? { id: user.id, name: user.name, email: user.email } : null;
      })
    );

    // Get pending requests (received)
    const pendingRequests = await getPendingFriendRequests(session.userId);
    const pendingWithUsers = await Promise.all(
      pendingRequests.map(async (req) => {
        const user = await getUserById(req.userId);
        return {
          ...req,
          user: user ? { id: user.id, name: user.name, email: user.email } : null
        };
      })
    );

    // Get sent requests
    const sentRequests = await getSentFriendRequests(session.userId);
    const sentWithUsers = await Promise.all(
      sentRequests.map(async (req) => {
        const user = await getUserById(req.friendId);
        return {
          ...req,
          user: user ? { id: user.id, name: user.name, email: user.email } : null
        };
      })
    );

    return NextResponse.json({
      friends: friends.filter(Boolean),
      pendingRequests: pendingWithUsers,
      sentRequests: sentWithUsers,
      friendCount: friendIds.length
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json({ error: 'Failed to get friends' }, { status: 500 });
  }
}

// POST - Send friend request or accept/reject
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { action, friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json({ error: 'friendId required' }, { status: 400 });
    }

    if (friendId === session.userId) {
      return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'send':
        result = await sendFriendRequest(session.userId, friendId);
        return NextResponse.json({ success: true, friendship: result });
      
      case 'accept':
        result = await acceptFriendRequest(session.userId, friendId);
        if (result) {
          // Award XP for making a friend
          await addXP(session.userId, 20, 'daily_login', 'Made a new friend!');
          await addXP(friendId, 20, 'daily_login', 'Made a new friend!');
          
          // Check for social butterfly badge
          const friendIds = await getFriends(session.userId);
          if (friendIds.length >= 5) {
            await awardBadge(session.userId, 'social_butterfly');
          }
          const otherFriendIds = await getFriends(friendId);
          if (otherFriendIds.length >= 5) {
            await awardBadge(friendId, 'social_butterfly');
          }
        }
        return NextResponse.json({ success: true, friendship: result });
      
      case 'reject':
        const rejected = await rejectFriendRequest(session.userId, friendId);
        return NextResponse.json({ success: rejected });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Friend action error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process friend action' }, { status: 500 });
  }
}

// DELETE - Remove friend
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json({ error: 'friendId required' }, { status: 400 });
    }

    const removed = await removeFriend(session.userId, friendId);
    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error('Remove friend error:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}


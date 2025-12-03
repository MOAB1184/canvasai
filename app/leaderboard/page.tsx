'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Star, TrendingUp, Users, Crown, Medal,
  ChevronLeft, Settings, LogOut, LayoutGrid, MessageCircle, Layers,
  Award, Zap, Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  currentStreak: number;
  badges: string[];
  isCurrentUser: boolean;
}

interface MyStats {
  rank: number;
  xp: number;
  level: number;
  currentStreak: number;
  badges: string[];
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [activeTab, setActiveTab] = useState<'streaks' | 'xp'>('streaks');
  const [leaderboardType, setLeaderboardType] = useState<'friends' | 'global'>('friends');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user, leaderboardType]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    } catch {
      router.push('/login');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?type=${leaderboardType}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setMyStats(data.myStats);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000) {
      return (xp / 1000).toFixed(1) + 'k';
    }
    return xp.toLocaleString();
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sort by streak or XP based on active tab
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (activeTab === 'streaks') {
      return b.currentStreak - a.currentStreak;
    }
    return b.xp - a.xp;
  });

  return (
    <div className="min-h-screen bg-[#050505] flex font-sans text-neutral-200 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-red-600/30 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-red-900/40 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Sidebar - Matching Dashboard Style */}
      <aside className="w-72 bg-[#0a0a0a] text-white flex flex-col flex-shrink-0 sticky top-0 h-screen z-30 shadow-[5px_0_30px_rgba(0,0,0,0.5)] border-r border-white/10">
        <div className="p-6 flex items-center gap-3 mb-2">
          <Link href="/" className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center font-serif font-bold text-2xl text-white shadow-[0_10px_20px_-5px_rgba(220,38,38,0.5)] border-t border-red-400 border-b-[4px] border-b-red-950">
             C
          </Link>
          <span className="font-bold text-xl tracking-tight text-white">CanvasAI</span>
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mt-2">Main</div>
          
          <Link 
            href="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group text-neutral-400 hover:text-white hover:bg-white/5"
          >
            <LayoutGrid size={20} className="text-neutral-500 group-hover:text-white" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/leaderboard"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group bg-red-600 text-white shadow-lg shadow-red-900/50 border-b-[3px] border-red-800"
          >
            <Trophy size={20} className="text-white" />
            <span>Leaderboard</span>
          </Link>
          
          <Link 
            href="/dashboard?view=flashcards"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group text-neutral-400 hover:text-white hover:bg-white/5"
          >
            <Layers size={20} className="text-neutral-500 group-hover:text-white" />
            <span>Flashcards</span>
          </Link>
          
          <Link 
            href="/dashboard?view=friends"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group text-neutral-400 hover:text-white hover:bg-white/5"
          >
            <Users size={20} className="text-neutral-500 group-hover:text-white" />
            <span>Friends</span>
          </Link>
          
          <Link 
            href="/dashboard?view=chat"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group text-neutral-400 hover:text-white hover:bg-white/5"
          >
            <MessageCircle size={20} className="text-neutral-500 group-hover:text-white" />
            <span>Messages</span>
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto border-t border-white/5">
          <div className="bg-[#111] rounded-lg border border-white/5 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-neutral-500 truncate">{user?.email}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" className="flex-1 py-2 text-center text-xs font-bold text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors">
                <Settings size={14} className="inline mr-1" /> Settings
              </Link>
              <button onClick={handleSignOut} className="flex-1 py-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded-md transition-colors">
                <LogOut size={14} className="inline mr-1" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0"></div>
        
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Trophy size={24} className="text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
                  <p className="text-neutral-500 text-sm">Compete with friends and climb the ranks</p>
                </div>
              </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-neutral-900 rounded-xl p-1 border border-neutral-800">
              <button
                onClick={() => setActiveTab('streaks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'streaks' 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Flame size={16} className={activeTab === 'streaks' ? 'text-orange-400' : ''} />
                Streaks
              </button>
              <button
                onClick={() => setActiveTab('xp')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'xp' 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Star size={16} className={activeTab === 'xp' ? 'text-blue-400' : ''} />
                XP
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {myStats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 text-center">
                <TrendingUp size={24} className="mx-auto mb-3 text-amber-400" />
                <div className="text-4xl font-bold text-white mb-1">#{myStats.rank}</div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Your Rank</div>
              </div>
              <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 text-center">
                <Flame size={24} className="mx-auto mb-3 text-orange-400" />
                <div className="text-4xl font-bold text-white mb-1">{myStats.currentStreak}</div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Current Streak</div>
              </div>
              <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 text-center">
                <Star size={24} className="mx-auto mb-3 text-blue-400" />
                <div className="text-4xl font-bold text-white mb-1">{formatXP(myStats.xp)}</div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total XP</div>
              </div>
            </div>
          )}

          {/* Leaderboard Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLeaderboardType('friends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                leaderboardType === 'friends'
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Users size={14} className="inline mr-2" />
              Friends
            </button>
            <button
              onClick={() => setLeaderboardType('global')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                leaderboardType === 'global'
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Trophy size={14} className="inline mr-2" />
              Global
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[60px_1fr_100px] px-6 py-4 border-b border-neutral-800 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <div>Rank</div>
              <div>Student</div>
              <div className="text-right">Score</div>
            </div>

            {/* Entries */}
            {sortedLeaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-neutral-700" />
                <p className="text-neutral-500">No entries yet. Add some friends to compete!</p>
              </div>
            ) : (
              sortedLeaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-[60px_1fr_100px] px-6 py-4 items-center border-b border-neutral-800/50 last:border-b-0 transition-colors ${
                    entry.isCurrentUser 
                      ? 'bg-brand-900/20 border-l-4 border-l-brand-500' 
                      : 'hover:bg-neutral-800/30'
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-lg font-bold ${
                    index === 0 ? 'text-amber-400' :
                    index === 1 ? 'text-neutral-300' :
                    index === 2 ? 'text-amber-600' :
                    'text-neutral-500'
                  }`}>
                    #{index + 1}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      entry.isCurrentUser 
                        ? 'bg-brand-600 text-white' 
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {getInitials(entry.name, entry.email)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {entry.isCurrentUser ? 'You' : entry.name || 'Unknown'}
                      </span>
                      {index === 0 && <Crown size={16} className="text-amber-400" />}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right font-bold text-white">
                    {activeTab === 'streaks' 
                      ? entry.currentStreak.toLocaleString()
                      : formatXP(entry.xp)
                    }
                  </div>
                </div>
              ))
            )}
          </div>

          {/* XP Guide */}
          <div className="mt-8 bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-amber-400" />
              How to Earn XP
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">+10</div>
                <div className="text-xs text-neutral-500">Daily Login</div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">+25</div>
                <div className="text-xs text-neutral-500">Study Flashcards</div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">+50</div>
                <div className="text-xs text-neutral-500">Complete Assignment</div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400 mb-1">+30</div>
                <div className="text-xs text-neutral-500">Complete Quiz</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}


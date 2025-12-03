export interface FAQItem {
  question: string;
  answer: string;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
}

export interface NavLink {
  label: string;
  href: string;
  page?: Page;
}

export enum Page {
  HOME = 'home',
  PRICING = 'pricing',
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  DASHBOARD = 'dashboard',
  ONBOARDING = 'onboarding',
  SETTINGS = 'settings',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash?: string;
  googleId?: string;
  canvasToken?: string;
  geminiKey?: string;
  onboardingComplete?: boolean;
  createdAt: number;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: number;
  createdAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
}

// Gamification Types
export interface UserStats {
  id: string;
  userId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  assignmentsCompleted: number;
  flashcardsStudied: number;
  quizzesTaken: number;
  badges: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface XPActivity {
  id: string;
  userId: string;
  type: 'flashcard_study' | 'assignment_complete' | 'quiz_complete' | 'daily_login' | 'streak_bonus' | 'badge_earned';
  xpEarned: number;
  description: string;
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  xpReward: number;
}

export const BADGES: Badge[] = [
  { id: 'first_flashcard', name: 'First Steps', description: 'Study your first flashcard set', icon: '🎯', requirement: 'flashcardsStudied >= 1', xpReward: 50 },
  { id: 'flashcard_master', name: 'Flashcard Master', description: 'Study 50 flashcard sets', icon: '🧠', requirement: 'flashcardsStudied >= 50', xpReward: 500 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', requirement: 'currentStreak >= 7', xpReward: 200 },
  { id: 'month_streak', name: 'Monthly Champion', description: 'Maintain a 30-day streak', icon: '👑', requirement: 'currentStreak >= 30', xpReward: 1000 },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', requirement: 'friends >= 5', xpReward: 150 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete 10 assignments on time', icon: '🐦', requirement: 'assignmentsCompleted >= 10', xpReward: 300 },
  { id: 'quiz_whiz', name: 'Quiz Whiz', description: 'Complete 20 quizzes', icon: '⚡', requirement: 'quizzesTaken >= 20', xpReward: 400 },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', icon: '⭐', requirement: 'level >= 10', xpReward: 250 },
  { id: 'level_25', name: 'Superstar', description: 'Reach level 25', icon: '🌟', requirement: 'level >= 25', xpReward: 750 },
  { id: 'xp_1000', name: 'XP Hunter', description: 'Earn 1,000 total XP', icon: '💎', requirement: 'xp >= 1000', xpReward: 100 },
];


import { MongoClient, Db, Collection, ObjectId, ServerApiVersion } from 'mongodb';
import { User, Conversation, Message, UserStats, Friendship, XPActivity } from './types';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'canvasai';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Use a global variable to store the client promise across hot reloads in development
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000, // 10 second timeout
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });
  clientPromise = client.connect();
}

async function getClient(): Promise<MongoClient> {
  try {
    return await clientPromise;
  } catch (error) {
    console.error('[DB] Connection error:', error);
    throw new Error('Failed to connect to MongoDB. Please check your MONGODB_URI.');
  }
}

export async function getDb(): Promise<Db> {
  const mongoClient = await getClient();
  return mongoClient.db(DB_NAME);
}

// Collection getters
async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>('users');
}

async function getConversationsCollection(): Promise<Collection<Conversation>> {
  const db = await getDb();
  return db.collection<Conversation>('conversations');
}

async function getMessagesCollection(): Promise<Collection<Message>> {
  const db = await getDb();
  return db.collection<Message>('messages');
}

async function getFlashcardsCollection(): Promise<Collection<FlashcardSet>> {
  const db = await getDb();
  return db.collection<FlashcardSet>('flashcards');
}

// User operations
export async function createUser(user: User): Promise<User> {
  const users = await getUsersCollection();
  console.log('[DB] Creating user:', user.id);
  
  await users.insertOne(user);
  console.log('[DB] User created successfully');
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsersCollection();
  console.log('[DB] Looking up user:', id);
  
  const user = await users.findOne({ id });
  console.log('[DB] User lookup result:', user ? 'FOUND' : 'NOT FOUND');
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsersCollection();
  return users.findOne({ email: email.toLowerCase() });
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  const users = await getUsersCollection();
  return users.findOne({ googleId });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsersCollection();
  
  const result = await users.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  return result;
}

export async function linkGoogleId(userId: string, googleId: string): Promise<void> {
  const users = await getUsersCollection();
  await users.updateOne({ id: userId }, { $set: { googleId } });
}

// Search users
export async function searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
  const users = await getUsersCollection();
  const searchLower = query.toLowerCase().trim();
  
  console.log('[DB] Searching users with query:', searchLower);
  
  const filter: any = {
    $or: [
      { email: { $regex: searchLower, $options: 'i' } },
      { name: { $regex: searchLower, $options: 'i' } }
    ]
  };
  
  if (excludeUserId) {
    filter.id = { $ne: excludeUserId };
  }
  
  const results = await users.find(filter).limit(20).toArray();
  console.log('[DB] Search returned', results.length, 'users');
  return results;
}

// Get all users (for debugging/testing)
export async function getAllUsers(): Promise<User[]> {
  const users = await getUsersCollection();
  return users.find({}).toArray();
}

// Conversation operations
export async function createConversation(conversation: Conversation): Promise<Conversation> {
  const conversations = await getConversationsCollection();
  await conversations.insertOne(conversation);
  return conversation;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const conversations = await getConversationsCollection();
  return conversations.findOne({ id });
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const conversations = await getConversationsCollection();
  
  const results = await conversations
    .find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .toArray();
  
  return results;
}

export async function findConversation(participant1: string, participant2: string): Promise<Conversation | null> {
  const conversations = await getConversationsCollection();
  
  return conversations.findOne({
    participants: { $all: [participant1, participant2] }
  });
}

export async function updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
  const conversations = await getConversationsCollection();
  
  const result = await conversations.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  return result;
}

// Message operations
export async function createMessage(message: Message): Promise<Message> {
  const messages = await getMessagesCollection();
  await messages.insertOne(message);
  
  // Update conversation's last message
  await updateConversation(message.conversationId, {
    lastMessage: message.content,
    lastMessageAt: message.createdAt,
  });
  
  return message;
}

export async function getConversationMessages(conversationId: string, limit = 50): Promise<Message[]> {
  const messages = await getMessagesCollection();
  
  const results = await messages
    .find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();
  
  return results;
}

// Flashcard operations
export interface FlashcardSet {
  id: string;
  userId: string;
  topic: string;
  flashcards: { front: string; back: string }[];
  createdAt: number;
  source: 'extension' | 'web';
}

export async function saveFlashcardSet(set: FlashcardSet): Promise<FlashcardSet> {
  const flashcards = await getFlashcardsCollection();
  
  // Upsert to handle duplicates
  await flashcards.updateOne(
    { id: set.id },
    { $set: set },
    { upsert: true }
  );
  
  return set;
}

export async function getUserFlashcardSets(userId: string): Promise<FlashcardSet[]> {
  const flashcards = await getFlashcardsCollection();
  
  const results = await flashcards
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return results;
}

export async function getFlashcardSet(id: string): Promise<FlashcardSet | null> {
  const flashcards = await getFlashcardsCollection();
  return flashcards.findOne({ id });
}

export async function deleteFlashcardSet(id: string, userId: string): Promise<boolean> {
  const flashcards = await getFlashcardsCollection();
  
  const result = await flashcards.deleteOne({ id, userId });
  return result.deletedCount > 0;
}

// ============ USER STATS (Gamification) ============

async function getUserStatsCollection(): Promise<Collection<UserStats>> {
  const db = await getDb();
  return db.collection<UserStats>('user_stats');
}

async function getFriendshipsCollection(): Promise<Collection<Friendship>> {
  const db = await getDb();
  return db.collection<Friendship>('friendships');
}

async function getXPActivitiesCollection(): Promise<Collection<XPActivity>> {
  const db = await getDb();
  return db.collection<XPActivity>('xp_activities');
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const stats = await getUserStatsCollection();
  return stats.findOne({ userId });
}

export async function createUserStats(userId: string): Promise<UserStats> {
  const stats = await getUserStatsCollection();
  const newStats: UserStats = {
    id: crypto.randomUUID(),
    userId,
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    assignmentsCompleted: 0,
    flashcardsStudied: 0,
    quizzesTaken: 0,
    badges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await stats.insertOne(newStats);
  return newStats;
}

export async function getOrCreateUserStats(userId: string): Promise<UserStats> {
  let stats = await getUserStats(userId);
  if (!stats) {
    stats = await createUserStats(userId);
  }
  return stats;
}

export async function updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | null> {
  const stats = await getUserStatsCollection();
  const result = await stats.findOneAndUpdate(
    { userId },
    { $set: { ...updates, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function addXP(userId: string, amount: number, type: XPActivity['type'], description: string): Promise<UserStats | null> {
  const stats = await getOrCreateUserStats(userId);
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate streak
  let newStreak = stats.currentStreak;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (stats.lastActivityDate === yesterday) {
    newStreak = stats.currentStreak + 1;
  } else if (stats.lastActivityDate !== today) {
    newStreak = 1;
  }
  
  const longestStreak = Math.max(newStreak, stats.longestStreak);
  
  // Calculate level (100 XP per level, exponential growth)
  const newXP = stats.xp + amount;
  const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
  
  // Record XP activity
  const activities = await getXPActivitiesCollection();
  await activities.insertOne({
    id: crypto.randomUUID(),
    userId,
    type,
    xpEarned: amount,
    description,
    createdAt: Date.now(),
  });
  
  // Update stats
  return updateUserStats(userId, {
    xp: newXP,
    level: newLevel,
    currentStreak: newStreak,
    longestStreak,
    lastActivityDate: today,
  });
}

export async function awardBadge(userId: string, badgeId: string): Promise<UserStats | null> {
  const stats = await getOrCreateUserStats(userId);
  if (stats.badges.includes(badgeId)) return stats;
  
  const statsCollection = await getUserStatsCollection();
  const result = await statsCollection.findOneAndUpdate(
    { userId },
    { 
      $push: { badges: badgeId },
      $set: { updatedAt: Date.now() }
    },
    { returnDocument: 'after' }
  );
  return result;
}

export async function incrementStat(userId: string, stat: 'assignmentsCompleted' | 'flashcardsStudied' | 'quizzesTaken'): Promise<void> {
  const statsCollection = await getUserStatsCollection();
  await statsCollection.updateOne(
    { userId },
    { 
      $inc: { [stat]: 1 },
      $set: { updatedAt: Date.now() }
    }
  );
}

// ============ FRIENDSHIPS ============

export async function sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
  const friendships = await getFriendshipsCollection();
  
  // Check if friendship already exists
  const existing = await friendships.findOne({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId }
    ]
  });
  
  if (existing) {
    throw new Error('Friendship already exists or pending');
  }
  
  const friendship: Friendship = {
    id: crypto.randomUUID(),
    userId,
    friendId,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  await friendships.insertOne(friendship);
  return friendship;
}

export async function acceptFriendRequest(userId: string, friendId: string): Promise<Friendship | null> {
  const friendships = await getFriendshipsCollection();
  const result = await friendships.findOneAndUpdate(
    { userId: friendId, friendId: userId, status: 'pending' },
    { $set: { status: 'accepted' } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function rejectFriendRequest(userId: string, friendId: string): Promise<boolean> {
  const friendships = await getFriendshipsCollection();
  const result = await friendships.deleteOne({
    userId: friendId,
    friendId: userId,
    status: 'pending'
  });
  return result.deletedCount > 0;
}

export async function removeFriend(userId: string, friendId: string): Promise<boolean> {
  const friendships = await getFriendshipsCollection();
  const result = await friendships.deleteOne({
    $or: [
      { userId, friendId, status: 'accepted' },
      { userId: friendId, friendId: userId, status: 'accepted' }
    ]
  });
  return result.deletedCount > 0;
}

export async function getFriends(userId: string): Promise<string[]> {
  const friendships = await getFriendshipsCollection();
  const results = await friendships.find({
    $or: [
      { userId, status: 'accepted' },
      { friendId: userId, status: 'accepted' }
    ]
  }).toArray();
  
  return results.map(f => f.userId === userId ? f.friendId : f.userId);
}

export async function getPendingFriendRequests(userId: string): Promise<Friendship[]> {
  const friendships = await getFriendshipsCollection();
  return friendships.find({ friendId: userId, status: 'pending' }).toArray();
}

export async function getSentFriendRequests(userId: string): Promise<Friendship[]> {
  const friendships = await getFriendshipsCollection();
  return friendships.find({ userId, status: 'pending' }).toArray();
}

export async function getFriendshipStatus(userId: string, friendId: string): Promise<Friendship | null> {
  const friendships = await getFriendshipsCollection();
  return friendships.findOne({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId }
    ]
  });
}

// ============ LEADERBOARD ============

export async function getFriendsLeaderboard(userId: string): Promise<{ stats: UserStats; user: User | null }[]> {
  const friendIds = await getFriends(userId);
  const allUserIds = [userId, ...friendIds];
  
  const statsCollection = await getUserStatsCollection();
  const usersCollection = await getUsersCollection();
  
  const allStats = await statsCollection.find({ userId: { $in: allUserIds } }).toArray();
  
  // Get user info for each
  const results = await Promise.all(
    allStats.map(async (stats) => {
      const user = await usersCollection.findOne({ id: stats.userId });
      return { stats, user };
    })
  );
  
  // Sort by XP descending
  return results.sort((a, b) => b.stats.xp - a.stats.xp);
}

export async function getGlobalLeaderboard(limit = 50): Promise<{ stats: UserStats; user: User | null }[]> {
  const statsCollection = await getUserStatsCollection();
  const usersCollection = await getUsersCollection();
  
  const topStats = await statsCollection.find({}).sort({ xp: -1 }).limit(limit).toArray();
  
  const results = await Promise.all(
    topStats.map(async (stats) => {
      const user = await usersCollection.findOne({ id: stats.userId });
      return { stats, user };
    })
  );
  
  return results;
}

export async function getRecentXPActivities(userId: string, limit = 20): Promise<XPActivity[]> {
  const activities = await getXPActivitiesCollection();
  return activities.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
}

// Initialize indexes for better performance
export async function initializeIndexes(): Promise<void> {
  try {
    const db = await getDb();
    
    // Users indexes
    const users = db.collection('users');
    await users.createIndex({ id: 1 }, { unique: true });
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ googleId: 1 }, { sparse: true });
    
    // Conversations indexes
    const conversations = db.collection('conversations');
    await conversations.createIndex({ id: 1 }, { unique: true });
    await conversations.createIndex({ participants: 1 });
    await conversations.createIndex({ lastMessageAt: -1 });
    
    // Messages indexes
    const messages = db.collection('messages');
    await messages.createIndex({ id: 1 }, { unique: true });
    await messages.createIndex({ conversationId: 1, createdAt: 1 });
    
    // Flashcards indexes
    const flashcards = db.collection('flashcards');
    await flashcards.createIndex({ id: 1 }, { unique: true });
    await flashcards.createIndex({ userId: 1, createdAt: -1 });
    
    // User Stats indexes
    const userStats = db.collection('user_stats');
    await userStats.createIndex({ userId: 1 }, { unique: true });
    await userStats.createIndex({ xp: -1 });
    
    // Friendships indexes
    const friendships = db.collection('friendships');
    await friendships.createIndex({ id: 1 }, { unique: true });
    await friendships.createIndex({ userId: 1, friendId: 1 });
    await friendships.createIndex({ friendId: 1, status: 1 });
    
    // XP Activities indexes
    const xpActivities = db.collection('xp_activities');
    await xpActivities.createIndex({ userId: 1, createdAt: -1 });
    
    console.log('[DB] Indexes initialized');
  } catch (error) {
    console.error('[DB] Failed to initialize indexes:', error);
  }
}

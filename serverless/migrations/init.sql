-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  displayName TEXT,
  avatar TEXT,
  createdAt TIMESTAMP NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  senderId TEXT NOT NULL,
  recipientId TEXT NOT NULL,
  content TEXT,
  createdAt TIMESTAMP NOT NULL,
  attachmentUrl TEXT,
  attachmentType TEXT
);

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  friendId TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  createdAt TIMESTAMP NOT NULL,
  UNIQUE(userId, friendId)
);

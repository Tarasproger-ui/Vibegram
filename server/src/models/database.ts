import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database | null = null;

export async function initializeDatabase() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../vibegram.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT,
      avatar TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      recipientId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (senderId) REFERENCES users(id),
      FOREIGN KEY (recipientId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      friendId TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      UNIQUE(userId, friendId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (friendId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(senderId, recipientId);
    CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(userId);
    CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
  `);

  // Add attachment columns if they don't exist (safe for existing DBs)
  try {
    const cols = await db.all("PRAGMA table_info('messages')");
    const names = cols.map((c: any) => c.name);
    if (!names.includes('attachmentUrl')) {
      await db.exec("ALTER TABLE messages ADD COLUMN attachmentUrl TEXT");
    }
    if (!names.includes('attachmentType')) {
      await db.exec("ALTER TABLE messages ADD COLUMN attachmentType TEXT");
    }
  } catch (e) {
    // ignore
  }

  return db;
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

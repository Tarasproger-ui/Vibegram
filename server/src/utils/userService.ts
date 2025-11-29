import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export async function registerUser(phone: string, username: string, password: string) {
  const db = getDatabase();
  const userId = uuidv4();
  const hashedPassword = await hashPassword(password);
  // Check for existing phone or username to provide clearer errors
  const existingByPhone = await db.get('SELECT id FROM users WHERE phone = ?', [phone]);
  if (existingByPhone) {
    const err: any = new Error('Phone already registered');
    err.code = 'PHONE_EXISTS';
    throw err;
  }

  const existingByUsername = await db.get('SELECT id FROM users WHERE username = ?', [username]);
  if (existingByUsername) {
    const err: any = new Error('Username already taken');
    err.code = 'USERNAME_EXISTS';
    throw err;
  }

  await db.run(
    `INSERT INTO users (id, phone, username, password, displayName, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, phone, username, hashedPassword, username, new Date().toISOString()]
  );

  const token = generateToken(userId, phone);
  return { userId, phone, username, token };
}

export async function loginUser(phone: string, password: string) {
  const db = getDatabase();

  const user = await db.get(
    'SELECT id, phone, username, password, displayName, avatar FROM users WHERE phone = ?',
    [phone]
  );

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = generateToken(user.id, phone);
  return {
    userId: user.id,
    phone: user.phone,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    token,
  };
}

export async function getUserById(userId: string) {
  const db = getDatabase();

  const user = await db.get(
    'SELECT id, phone, username, displayName, avatar, createdAt FROM users WHERE id = ?',
    [userId]
  );

  return user;
}

export async function updateUserProfile(userId: string, displayName?: string, avatar?: string) {
  const db = getDatabase();

  if (displayName) {
    await db.run('UPDATE users SET displayName = ? WHERE id = ?', [displayName, userId]);
  }

  if (avatar) {
    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);
  }

  return getUserById(userId);
}

export async function searchUsers(query: string) {
  const db = getDatabase();

  const users = await db.all(
    `SELECT id, username, displayName, avatar FROM users 
     WHERE username LIKE ? OR displayName LIKE ?
     LIMIT 20`,
    [`%${query}%`, `%${query}%`]
  );

  return users;
}

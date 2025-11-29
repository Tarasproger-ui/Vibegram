import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database';

export async function sendFriendRequest(userId: string, friendId: string) {
  const db = getDatabase();
  const id = uuidv4();

  try {
    await db.run(
      `INSERT INTO friendships (id, userId, friendId, status, createdAt)
       VALUES (?, ?, ?, 'pending', ?)`,
      [id, userId, friendId, new Date().toISOString()]
    );

    return { id, userId, friendId, status: 'pending' };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Friend request already exists');
    }
    throw error;
  }
}

export async function acceptFriendRequest(requestId: string) {
  const db = getDatabase();

  await db.run(
    'UPDATE friendships SET status = ? WHERE id = ?',
    ['accepted', requestId]
  );

  return { id: requestId, status: 'accepted' };
}

export async function rejectFriendRequest(requestId: string) {
  const db = getDatabase();

  await db.run(
    'DELETE FROM friendships WHERE id = ? AND status = ?',
    [requestId, 'pending']
  );

  return { id: requestId, status: 'rejected' };
}

export async function getFriendsList(userId: string) {
  const db = getDatabase();

  const friends = await db.all(
    `SELECT u.id, u.username, u.displayName, u.avatar 
     FROM users u
     JOIN friendships f ON (
       (f.userId = ? AND f.friendId = u.id) OR
       (f.friendId = ? AND f.userId = u.id)
     )
     WHERE f.status = 'accepted'`,
    [userId, userId]
  );

  return friends;
}

export async function getPendingRequests(userId: string) {
  const db = getDatabase();

  const requests = await db.all(
    `SELECT f.id, f.userId, u.username, u.displayName, u.avatar, f.createdAt
     FROM friendships f
     JOIN users u ON f.userId = u.id
     WHERE f.friendId = ? AND f.status = 'pending'`,
    [userId]
  );

  return requests;
}

export async function getSentRequests(userId: string) {
  const db = getDatabase();

  const requests = await db.all(
    `SELECT f.id, f.friendId, u.username, u.displayName, u.avatar, f.createdAt
     FROM friendships f
     JOIN users u ON f.friendId = u.id
     WHERE f.userId = ? AND f.status = 'pending'`,
    [userId]
  );

  return requests;
}

export async function removeFriend(userId: string, friendId: string) {
  const db = getDatabase();

  await db.run(
    `DELETE FROM friendships 
     WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)
     AND status = 'accepted'`,
    [userId, friendId, friendId, userId]
  );

  return { userId, friendId, status: 'removed' };
}

export async function isFriend(userId: string, friendId: string): Promise<boolean> {
  const db = getDatabase();

  const friendship = await db.get(
    `SELECT id FROM friendships 
     WHERE ((userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?))
     AND status = 'accepted'`,
    [userId, friendId, friendId, userId]
  );

  return !!friendship;
}

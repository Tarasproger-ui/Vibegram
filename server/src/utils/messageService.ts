import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database';

export async function saveMessage(senderId: string, recipientId: string, content: string) {
  const db = getDatabase();
  const id = uuidv4();

  await db.run(
    `INSERT INTO messages (id, senderId, recipientId, content, createdAt, attachmentUrl, attachmentType)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, senderId, recipientId, content, new Date().toISOString(), null, null]
  );

  return {
    id,
    senderId,
    recipientId,
    content,
    createdAt: new Date().toISOString(),
  };
}

export async function saveMessageWithAttachment(
  senderId: string,
  recipientId: string,
  content: string | null,
  attachmentUrl: string,
  attachmentType: string
) {
  const db = getDatabase();
  const id = uuidv4();

  await db.run(
    `INSERT INTO messages (id, senderId, recipientId, content, createdAt, attachmentUrl, attachmentType)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, senderId, recipientId, content || '', new Date().toISOString(), attachmentUrl, attachmentType]
  );

  return {
    id,
    senderId,
    recipientId,
    content: content || '',
    attachmentUrl,
    attachmentType,
    createdAt: new Date().toISOString(),
  };
}

export async function getConversation(userId: string, friendId: string, limit = 50, offset = 0) {
  const db = getDatabase();

  const messages = await db.all(
    `SELECT id, senderId, recipientId, content, createdAt, attachmentUrl, attachmentType
     FROM messages
     WHERE (senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?)
     ORDER BY createdAt DESC
     LIMIT ? OFFSET ?`,
    [userId, friendId, friendId, userId, limit, offset]
  );

  return messages.reverse();
}

export async function getRecentConversations(userId: string, limit = 20) {
  const db = getDatabase();

  const conversations = await db.all(
    `SELECT 
       CASE 
         WHEN senderId = ? THEN recipientId
         ELSE senderId
       END as otherUserId,
       MAX(createdAt) as lastMessageAt
     FROM messages
     WHERE senderId = ? OR recipientId = ?
     GROUP BY otherUserId
     ORDER BY lastMessageAt DESC
     LIMIT ?`,
    [userId, userId, userId, limit]
  );

  // Get user details for each conversation
  const result = await Promise.all(
    conversations.map(async (conv: any) => {
      const otherUser = await db.get(
        'SELECT id, username, displayName, avatar FROM users WHERE id = ?',
        [conv.otherUserId]
      );
      return {
        ...conv,
        user: otherUser,
      };
    })
  );

  return result;
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_helpers/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vibegram_dev_secret';

function getTokenFromHeader(req: VercelRequest) {
  const header = req.headers.authorization || '';
  const parts = (Array.isArray(header) ? header[0] : header).split(' ');
  return parts.length === 2 ? parts[1] : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const payload = (() => {
    try { return jwt.verify(token, JWT_SECRET) as any; } catch { return null; }
  })();
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const userId = payload.userId;

  if (req.method === 'GET') {
    try {
      const { data } = await supabase.from('users').select('id,phone,username,displayName,avatar,createdAt').eq('id', userId).limit(1).maybeSingle();
      return res.status(200).json(data || null);
    } catch (err: any) {
      console.error('Profile GET error', err);
      return res.status(500).json({ error: 'Failed to load profile' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { displayName, avatar } = req.body || {};
      const updates: any = {};
      if (displayName) updates.displayName = displayName;
      if (avatar) updates.avatar = avatar;
      await supabase.from('users').update(updates).eq('id', userId);
      const { data } = await supabase.from('users').select('id,phone,username,displayName,avatar,createdAt').eq('id', userId).limit(1).maybeSingle();
      return res.status(200).json(data || null);
    } catch (err: any) {
      console.error('Profile PUT error', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

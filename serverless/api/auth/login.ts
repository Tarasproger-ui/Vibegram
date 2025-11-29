import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_helpers/supabaseClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vibegram_dev_secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, password } = req.body || {};
  if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });

  try {
    const { data: user } = await supabase.from('users').select('id,phone,username,password,displayName,avatar').eq('phone', phone).limit(1).maybeSingle();
    if (!user) return res.status(401).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ userId: user.id, phone: user.phone, username: user.username, displayName: user.displayName, avatar: user.avatar, token });
  } catch (err: any) {
    console.error('Login function error', err && (err.stack || err.message || err));
    return res.status(500).json({ error: 'Login failed' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_helpers/supabaseClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'vibegram_dev_secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, username, password } = req.body || {};
  if (!phone || !username || !password) return res.status(400).json({ error: 'phone, username and password required' });

  try {
    // Check existing
    const { data: existingPhone } = await supabase.from('users').select('id').eq('phone', phone).limit(1).maybeSingle();
    if (existingPhone) return res.status(409).json({ error: 'Phone already registered' });

    const { data: existingUsername } = await supabase.from('users').select('id').eq('username', username).limit(1).maybeSingle();
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);

    const { error } = await supabase.from('users').insert({
      id,
      phone,
      username,
      password: hashed,
      displayName: username,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase insert error', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const token = jwt.sign({ userId: id, phone }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({ userId: id, phone, username, token });
  } catch (err: any) {
    console.error('Register function error', err && (err.stack || err.message || err));
    return res.status(500).json({ error: 'Registration failed' });
  }
}

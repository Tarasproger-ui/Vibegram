import { Router, Request, Response } from 'express';
import { registerUser, loginUser, getUserById, updateUserProfile, searchUsers } from '../utils/userService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, username, password } = req.body;

    if (!phone || !username || !password) {
      res.status(400).json({ error: 'Phone, username, and password are required' });
      return;
    }

    const user = await registerUser(phone, username, password);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Registration error:', error && (error.stack || error.message || error));
    // Map custom error codes to proper HTTP status
    if (error.code === 'PHONE_EXISTS' || error.message?.toLowerCase().includes('phone')) {
      res.status(409).json({ error: 'Phone already registered' });
      return;
    }

    if (error.code === 'USERNAME_EXISTS' || error.message?.toLowerCase().includes('username')) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    // Fallback: unknown server error
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ error: 'Phone and password are required' });
      return;
    }

    const user = await loginUser(phone, password);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { displayName, avatar } = req.body;
    const user = await updateUserProfile(req.userId!, displayName, avatar);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const users = await searchUsers(q as string);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

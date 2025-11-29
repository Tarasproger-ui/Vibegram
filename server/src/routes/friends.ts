import { Router, Request, Response } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList,
  getPendingRequests,
  getSentRequests,
  removeFriend,
} from '../utils/friendService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/request/:friendId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const request = await sendFriendRequest(req.userId!, friendId);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/accept/:requestId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const result = await acceptFriendRequest(requestId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reject/:requestId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const result = await rejectFriendRequest(requestId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const friends = await getFriendsList(req.userId!);
    res.status(200).json(friends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requests = await getPendingRequests(req.userId!);
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requests = await getSentRequests(req.userId!);
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:friendId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const result = await removeFriend(req.userId!, friendId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

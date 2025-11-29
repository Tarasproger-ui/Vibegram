import { Router, Request, Response } from 'express';
import { getConversation, getRecentConversations, saveMessageWithAttachment } from '../utils/messageService';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Setup multer
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const router = Router();

router.get('/conversation/:friendId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    const messages = await getConversation(
      req.userId!,
      friendId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;
    const conversations = await getRecentConversations(req.userId!, parseInt(limit as string));
    res.status(200).json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload attachment and create a message
router.post('/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { recipientId, content } = req.body;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!recipientId) return res.status(400).json({ error: 'Missing recipientId' });

    // Public URL for the uploaded file
    const host = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${host}/uploads/${file.filename}`;

    const message = await saveMessageWithAttachment(req.userId!, recipientId, content || '', fileUrl, file.mimetype);

    // Optionally emit via Socket.IO: socket handling is in index.ts, not accessible here. Clients polling will pick up message.

    res.status(200).json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

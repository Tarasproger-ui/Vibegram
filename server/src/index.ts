import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import 'dotenv/config';
import os from 'os';

import { initializeDatabase } from './models/database';
import { verifyToken } from './utils/auth';
import { saveMessage } from './utils/messageService';
import { isFriend } from './utils/friendService';

// Routes
import authRoutes from './routes/auth';
import friendRoutes from './routes/friends';
import messageRoutes from './routes/messages';

const app: Express = express();
const httpServer = createServer(app);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('authenticate', (token: string) => {
    const payload = verifyToken(token);
    if (payload) {
      connectedUsers.set(payload.userId, socket.id);
      socket.data.userId = payload.userId;
      socket.data.phone = payload.phone;
      console.log(`User ${payload.userId} authenticated`);
      socket.emit('authenticated', { success: true });
    } else {
      socket.emit('authenticated', { success: false });
      socket.disconnect();
    }
  });

  socket.on('send_message', async (data: { recipientId: string; content: string }, callback) => {
    try {
      const senderId = socket.data.userId;
      
      if (!senderId) {
        callback({ success: false, error: 'Not authenticated' });
        return;
      }

      // Check if they are friends
      const areFriends = await isFriend(senderId, data.recipientId);
      if (!areFriends) {
        callback({ success: false, error: 'You are not friends with this user' });
        return;
      }

      const message = await saveMessage(senderId, data.recipientId, data.content);

      // Emit to recipient if online
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', message);
      }

      callback({ success: true, message });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on('typing', (data: { recipientId: string; isTyping: boolean }) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', {
        userId: socket.data.userId,
        isTyping: data.isTyping,
      });
    }
  });

  // Call signaling events
  socket.on('call_offer', (data: { recipientId: string; offer: any; callType: 'audio' | 'video' }) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('incoming_call', {
        callerId: socket.data.userId,
        offer: data.offer,
        callType: data.callType,
      });
    }
  });

  socket.on('call_answer', (data: { recipientId: string; answer: any }) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call_answered', {
        answererId: socket.data.userId,
        answer: data.answer,
      });
    }
  });

  socket.on('ice_candidate', (data: { recipientId: string; candidate: any }) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('ice_candidate', {
        from: socket.data.userId,
        candidate: data.candidate,
      });
    }
  });

  socket.on('call_end', (data: { recipientId: string }) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call_ended', {
        from: socket.data.userId,
      });
    }
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
      io.emit('user_offline', { userId });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

  // Initialize and start server
async function start() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    const PORT = Number(process.env.PORT || 5000);
    const HOST = process.env.HOST || '0.0.0.0';
    const PUBLIC_URL = process.env.PUBLIC_URL; // optional, e.g. https://my-ngrok-url.ngrok.io

    httpServer.listen(PORT, HOST, () => {
      console.log(`Vibegram server running on http://${HOST}:${PORT}`);
      if (PUBLIC_URL) {
        console.log(`Public URL configured: ${PUBLIC_URL}`);
      } else {
        console.log('No PUBLIC_URL configured; use port-forwarding, ngrok, or deploy to cloud to expose publicly.');
      }
      if (CORS_ORIGIN && CORS_ORIGIN !== '*') {
        console.log(`Socket.IO / CORS origin restricted to: ${CORS_ORIGIN}`);
      }

      // Log network interfaces so user can see accessible IPs on the LAN
      const nets = os.networkInterfaces();
      const addresses: string[] = [];
      Object.keys(nets).forEach((name) => {
        (nets as any)[name].forEach((net: any) => {
          // skip internal (i.e. 127.0.0.1) and non-ipv4
          if (net.family === 'IPv4' && !net.internal) {
            addresses.push(net.address);
          }
        });
      });

      if (addresses.length > 0) {
        console.log('Accessible on your LAN at:');
        addresses.forEach((a) => console.log(`  http://${a}:${PORT}`));
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

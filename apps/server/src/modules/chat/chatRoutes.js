// Chat router. Mounted at /api/chat in app.js (after attachUser, before the
// 404 handler). All endpoints require authentication.
import { Router } from 'express';
import { requireAuth } from '../auth/session.js';
import {
  getConversations, getMessages, postMessage, markConversationRead,
} from './chatController.js';

export const chatRouter = Router();

chatRouter.get('/conversations', requireAuth, getConversations);
chatRouter.get('/conversations/:id/messages', requireAuth, getMessages);
chatRouter.post('/conversations/:id/read', requireAuth, markConversationRead);
chatRouter.post('/messages', requireAuth, postMessage);

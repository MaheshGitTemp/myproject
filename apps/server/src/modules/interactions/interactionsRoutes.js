// Interaction routers. Each is mounted at its own base path in app.js (after
// attachUser, before the 404 handler). All endpoints require authentication.
import { Router } from 'express';
import { requireAuth } from '../auth/session.js';
import {
  addToShortlist, removeFromShortlist, getShortlist,
  expressInterest, acceptInterest, declineInterest, getInterests,
  getMatches,
} from './interactionsController.js';
import {
  createBlock, removeBlock, getBlocks,
} from './blocksController.js';
import {
  getNotifications, markNotificationsRead,
} from './notificationsController.js';
import { reportUser } from './reportsController.js';

// --- /api/shortlist ---
export const shortlistRouter = Router();
shortlistRouter.get('/', requireAuth, getShortlist);
shortlistRouter.post('/:matId', requireAuth, addToShortlist);
shortlistRouter.delete('/:matId', requireAuth, removeFromShortlist);

// --- /api/interests ---
export const interestsRouter = Router();
interestsRouter.get('/', requireAuth, getInterests);
interestsRouter.post('/:matId', requireAuth, expressInterest);
interestsRouter.post('/:matId/accept', requireAuth, acceptInterest);
interestsRouter.post('/:matId/decline', requireAuth, declineInterest);

// --- /api/matches ---
export const matchesRouter = Router();
matchesRouter.get('/', requireAuth, getMatches);

// --- /api/blocks ---
export const blocksRouter = Router();
blocksRouter.get('/', requireAuth, getBlocks);
blocksRouter.post('/:matId', requireAuth, createBlock);
blocksRouter.delete('/:matId', requireAuth, removeBlock);

// --- /api/notifications ---
export const notificationsRouter = Router();
notificationsRouter.get('/', requireAuth, getNotifications);
notificationsRouter.post('/read', requireAuth, markNotificationsRead);

// --- /api/reports ---
export const reportsRouter = Router();
reportsRouter.post('/:matId', requireAuth, reportUser);

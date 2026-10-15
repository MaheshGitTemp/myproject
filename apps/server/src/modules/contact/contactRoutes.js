// Contact routes. Mounted at /api/contact in app.js (after attachUser, before
// the 404 handler). All endpoints require authentication — anonymous visitors
// never see unlocked contact details.
import { Router } from 'express';
import { requireAuth } from '../auth/session.js';
import { unlockContact, getContact } from './contactController.js';

export const contactRouter = Router();

// Unlock a specific profile's contact (records the unlock; enforces daily
// limit + free-window pricing + blocking). The frontend "View Contact Details"
// button POSTs here.
contactRouter.post('/unlock/:matId', requireAuth, unlockContact);

// Read the gated contact block for a target without unlocking.
contactRouter.get('/:matId', requireAuth, getContact);

// Account router. Mounted at /api/account in app.js (after attachUser, before
// the 404 handler). Self-service account management; all routes require auth.
import { Router } from 'express';
import { requireAuth } from '../auth/session.js';
import { closeAccount, deactivateAccount } from './accountController.js';

export const accountRouter = Router();

// POST /api/account/close — permanently delete the signed-in user's account.
accountRouter.post('/close', requireAuth, closeAccount);
// POST /api/account/deactivate — soft-disable (status='suspended'), reversible.
accountRouter.post('/deactivate', requireAuth, deactivateAccount);

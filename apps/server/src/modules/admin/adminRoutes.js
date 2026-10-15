// Admin router. Mounted at /api/admin in app.js (after attachUser, before the
// 404 handler). EVERY route is behind requireAdmin and writes an admin_audit
// row (except the read-only pending queue). No admin UI yet — these back the
// dashboard built later.
import { Router } from 'express';
import {
  requireAdmin,
  approveProfile,
  approvePhoto,
  rejectPhoto,
  blockUser,
  deleteUser,
  updateSettings,
  listPending,
  getStats,
  listUsers,
  getUserDetail,
  suspendUser,
  unsuspendUser,
  unblockUser,
  getSettings,
  listAudit,
} from './adminController.js';

export const adminRouter = Router();

// Every admin route requires an administrator.
adminRouter.use(requireAdmin);

// Static read-only paths first (declared before any /:param route to avoid
// param shadowing).
adminRouter.get('/stats', getStats);
adminRouter.get('/pending', listPending);
adminRouter.get('/settings', getSettings);
adminRouter.get('/audit', listAudit);

// User listing + detail.
adminRouter.get('/users', listUsers);
adminRouter.get('/users/:matId', getUserDetail);

// Mutating member actions.
adminRouter.post('/profiles/:matId/approve', approveProfile);
adminRouter.post('/photos/:id/approve', approvePhoto);
adminRouter.post('/photos/:id/reject', rejectPhoto);
adminRouter.post('/users/:matId/suspend', suspendUser);
adminRouter.post('/users/:matId/unsuspend', unsuspendUser);
adminRouter.post('/users/:matId/block', blockUser);
adminRouter.post('/users/:matId/unblock', unblockUser);
adminRouter.delete('/users/:matId', deleteUser);
adminRouter.put('/settings', updateSettings);

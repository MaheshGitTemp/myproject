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
} from './adminController.js';

export const adminRouter = Router();

// Every admin route requires an administrator.
adminRouter.use(requireAdmin);

adminRouter.get('/pending', listPending);
adminRouter.post('/profiles/:matId/approve', approveProfile);
adminRouter.post('/photos/:id/approve', approvePhoto);
adminRouter.post('/photos/:id/reject', rejectPhoto);
adminRouter.post('/users/:matId/block', blockUser);
adminRouter.delete('/users/:matId', deleteUser);
adminRouter.put('/settings', updateSettings);

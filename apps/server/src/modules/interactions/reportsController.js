// Request handler for creating a user report. Thin: resolve the reported MAT
// id -> user id, call the repo.
import { getUserIdByMatId } from '../profiles/profilesRepo.js';
import { normalizeMatId } from '../profiles/matId.js';
import { createReport } from './reportsRepo.js';

/** POST /api/reports/:matId  body { reason } */
export async function reportUser(req, res, next) {
  try {
    const matId = normalizeMatId(req.params.matId);
    if (!matId) return res.status(400).json({ error: 'invalid_mat_id' });

    const reportedId = await getUserIdByMatId(matId);
    if (!reportedId) return res.status(404).json({ error: 'not_found' });
    if (reportedId === req.user.id) return res.status(400).json({ error: 'self_action' });

    const reason = req.body && typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    const report = await createReport(req.user.id, reportedId, reason || null);
    res.json({ ok: true, reportId: report.id, status: report.status });
  } catch (err) {
    next(err);
  }
}

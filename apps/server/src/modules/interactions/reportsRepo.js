// Reports data access. Raw parameterized SQL (no ORM).
// A user reports another user; admins triage via `status` (open by default).
import { query } from '../../db.js';

/** Create a report reporterId -> reportedUserId with a free-text reason. */
export async function createReport(reporterId, reportedUserId, reason) {
  const { rows } = await query(
    `INSERT INTO reports (reporter_id, reported_user_id, reason)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [reporterId, reportedUserId, reason || null],
  );
  return rows[0];
}

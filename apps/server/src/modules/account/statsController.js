// Stats + dashboard read handlers for the signed-in member. Thin controllers:
// run parameterized, read-only COUNTs/selects over existing tables (001-008)
// and shape { ok, ... } responses. Mounted directly in app.js:
//   GET /api/me/stats   -> getStats
//   GET /api/dashboard  -> getDashboard
// Both behind requireAuth. Reuses rowToCard + PHOTO_MEDIA_SELECT so the
// recentActivity / matchOfTheDay cards match the search/matches card shape.
import { query, queryOne } from '../../db.js';
import { rowToCard, PHOTO_MEDIA_SELECT } from '../profiles/profilesRepo.js';

// COUNT(*) -> Number helper (pg returns bigint counts as strings).
async function countOne(sql, params) {
  const row = await queryOne(sql, params);
  return Number(row ? row.count : 0);
}

/** The four interaction counts shared by stats + dashboard, for user id $1. */
async function coreCounts(userId) {
  const proposalsReceived = await countOne(
    "SELECT COUNT(*) AS count FROM interests WHERE receiver_id = $1 AND status = 'pending'",
    [userId],
  );
  const proposalsSent = await countOne(
    'SELECT COUNT(*) AS count FROM interests WHERE sender_id = $1',
    [userId],
  );
  const mutual = await countOne(
    `SELECT COUNT(*) AS count
       FROM interests i1
       JOIN interests i2
         ON i2.sender_id = i1.receiver_id
        AND i2.receiver_id = i1.sender_id
      WHERE i1.sender_id = $1
        AND i1.status = 'accepted'
        AND i2.status = 'accepted'`,
    [userId],
  );
  const profileViews = await countOne(
    'SELECT COUNT(DISTINCT viewer_id) AS count FROM profile_views WHERE viewed_id = $1',
    [userId],
  );
  return { proposalsReceived, proposalsSent, mutual, profileViews };
}

/**
 * GET /api/me/stats  (requireAuth)
 * Headline counts for the current member + unread badges.
 */
export async function getStats(req, res, next) {
  try {
    const userId = req.user.id;
    const { proposalsReceived, proposalsSent, mutual, profileViews } = await coreCounts(userId);

    const shortlistedCount = await countOne(
      'SELECT COUNT(*) AS count FROM shortlists WHERE user_id = $1',
      [userId],
    );
    const notifications = await countOne(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND read = false',
      [userId],
    );
    const chat = await countOne(
      `SELECT COUNT(*) AS count
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
        WHERE (c.a_id = $1 OR c.b_id = $1)
          AND m.sender_id <> $1
          AND m.read = false`,
      [userId],
    );

    res.json({
      ok: true,
      stats: { proposalsReceived, proposalsSent, mutual, profileViews, shortlistedCount },
      unread: { notifications, chat },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard  (requireAuth)
 * The four core counts + recent interest activity + a match-of-the-day card.
 */
export async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const { proposalsReceived, proposalsSent, mutual, profileViews } = await coreCounts(userId);

    // Up to 5 recent interests involving me, joined to the OTHER member.
    const { rows: activityRows } = await query(
      `SELECT i.status, i.created_at,
              p.*, u.id AS user_id, u.mat_id, u.is_verified,
              ${PHOTO_MEDIA_SELECT}
         FROM interests i
         JOIN users u
           ON u.id = CASE WHEN i.sender_id = $1 THEN i.receiver_id ELSE i.sender_id END
         JOIN profiles p ON p.user_id = u.id
        WHERE i.sender_id = $1 OR i.receiver_id = $1
        ORDER BY i.created_at DESC
        LIMIT 5`,
      [userId],
    );
    const recentActivity = activityRows.map((row) => {
      const card = rowToCard(row);
      return {
        type: row.status,
        name: card.name,
        matId: card.matId,
        image: card.image,
        when: row.created_at,
      };
    });

    // One not-self, active + approved profile as the "match of the day".
    const motdRow = await queryOne(
      `SELECT p.*, u.id AS user_id, u.mat_id, u.is_verified,
              ${PHOTO_MEDIA_SELECT}
         FROM profiles p
         JOIN users u ON u.id = p.user_id
        WHERE u.status = 'active'
          AND u.admin_approved = true
          AND u.id <> $1
        ORDER BY u.created_at DESC
        LIMIT 1`,
      [userId],
    );
    const matchOfTheDay = rowToCard(motdRow);

    res.json({
      ok: true,
      stats: { proposalsReceived, proposalsSent, mutual, profileViews },
      recentActivity,
      matchOfTheDay,
    });
  } catch (err) {
    next(err);
  }
}

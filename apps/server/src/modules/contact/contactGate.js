// The single source of truth for contact-visibility gating. Enforced on the
// SERVER (business rule 4: hiding contact only in the UI is bypassable).
//
// A field (phone / email / whatsapp) is revealed to a viewer ONLY when ALL of:
//   (a) the viewer has UNLOCKED this target's contact, AND
//   (b) the pair is NOT blocked (either direction), AND
//   (c) reciprocal privacy allows it:
//         - viewer.hide_phone blocks BOTH phone and whatsapp (whatsapp === phone),
//         - viewer.hide_email blocks email.
//       Rationale (business rule 4 / user message 4): a user who hides their
//       own phone cannot view other users' phones; same for email. The flag is
//       the VIEWER's own hide_phone / hide_email, read from req.user.
//
// When not revealed, the field is:
//   - the sentinel string 'Verification Pending' when the TARGET is not yet
//     public (status !== 'active' / not admin-approved) — mirrors the pending
//     treatment the rest of the app shows (business rule 1), OR
//   - null otherwise (locked). A sibling `contactUnlocked` boolean and
//     `contactLockedReason` tell the UI why.
//
// whatsapp is derived from the target's phone (same number) — there is no
// separate whatsapp column — and follows the phone privacy rule.

export const SENTINEL_PENDING = 'Verification Pending';

/**
 * Compute the gated contact block for one target as seen by one viewer.
 *
 * @param {object} args
 * @param {object} args.target   joined profile+user row (needs phone, email,
 *                               status, admin_approved).
 * @param {object|null} args.viewer  req.user (needs id, hide_phone, hide_email)
 *                               or null for anonymous.
 * @param {boolean} args.unlocked whether the viewer has unlocked this target.
 * @param {boolean} args.blocked  whether the pair is FULL-blocked either way.
 * @returns {{ phone, email, whatsapp, contactUnlocked, contactLockedReason }}
 */
export function gateContact({ target, viewer, unlocked, blocked }) {
  const self = !!(viewer && target && viewer.id === target.user_id);
  if (self) {
    return {
      phone: target.phone ?? null,
      email: target.email ?? null,
      whatsapp: target.phone ?? null,
      contactUnlocked: true,
      contactLockedReason: null,
    };
  }

  const targetPublic = target && target.status === 'active' && target.admin_approved === true;
  const lockedValue = targetPublic ? null : SENTINEL_PENDING;

  if (!viewer) {
    return locked(lockedValue, 'locked');
  }
  if (blocked) {
    return locked(lockedValue, 'blocked');
  }
  if (!unlocked) {
    return locked(lockedValue, targetPublic ? 'locked' : 'verification_pending');
  }

  // Unlocked + not blocked: reveal per reciprocal privacy.
  const canSeePhone = !viewer.hide_phone;
  const canSeeEmail = !viewer.hide_email;
  return {
    phone: canSeePhone ? (target.phone ?? null) : null,
    email: canSeeEmail ? (target.email ?? null) : null,
    whatsapp: canSeePhone ? (target.phone ?? null) : null,
    contactUnlocked: true,
    contactLockedReason: null,
  };
}

function locked(value, reason) {
  return {
    phone: value,
    email: value,
    whatsapp: value,
    contactUnlocked: false,
    contactLockedReason: reason,
  };
}

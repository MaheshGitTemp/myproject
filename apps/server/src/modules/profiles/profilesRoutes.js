// Profiles routes. Mounted at /api/profiles in app.js (after attachUser).
// Declare `/me` before any `/:matId` route (added in P2) to avoid shadowing.
import { Router } from 'express';
import { requireAuth } from '../auth/session.js';
import {
  getMyProfile, updateMyProfile, updateMyPrivacy, createProfile,
  getProfileByMat, getProfilesBase,
} from './profilesController.js';

export const profilesRouter = Router();

profilesRouter.get('/me', requireAuth, getMyProfile);
profilesRouter.put('/me', requireAuth, updateMyProfile);
// Contact-visibility flags (users.hide_phone/hide_email). Declared BEFORE the
// `/:matId` route below so the param route never shadows it.
profilesRouter.put('/me/privacy', requireAuth, updateMyPrivacy);
profilesRouter.post('/', requireAuth, createProfile);

// Single-profile lookup. `/me` and `/` are declared BEFORE `/:matId` so the
// param route never shadows them. `GET /` handles the PROFILE_ENDPOINT ?id=
// style; `GET /:matId` handles the REST path style. Both are public (no auth)
// so anonymous visitors can view approved profiles; req.user (if present) only
// unlocks own-contact visibility.
profilesRouter.get('/', getProfilesBase);
profilesRouter.get('/:matId', getProfileByMat);

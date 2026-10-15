// Search handler for POST /api/Fetchlistdata (exact path the frontend posts to;
// see src/services/profileLookupService.js searchProfiles()). Accepts the filter
// payload the search form sends and returns { results, total } where each result
// is a profilesRepo.rowToCard() card. Only publicly visible members are returned
// (status='active' AND admin_approved=true), enforced in profilesRepo.searchProfiles.
import { searchProfiles } from './profilesRepo.js';

/**
 * POST /api/Fetchlistdata
 * Body (all optional except gender is usually sent):
 *   gender, ageFrom, ageTo, maritalStatus, caste, rasi, nakshatra, education,
 *   occupation, state, city, annualIncome, page, limit, sort
 * Response: { results: [card...], total: <int> }
 */
export async function fetchList(req, res, next) {
  try {
    const body = req.body || {};
    const page = body.page != null ? body.page : 1;
    const limit = body.limit != null ? body.limit : 20;

    const { results, total } = await searchProfiles({
      filters: {
        gender: body.gender,
        ageFrom: body.ageFrom,
        ageTo: body.ageTo,
        maritalStatus: body.maritalStatus,
        caste: body.caste,
        rasi: body.rasi,
        nakshatra: body.nakshatra,
        education: body.education,
        occupation: body.occupation,
        state: body.state,
        city: body.city,
        annualIncome: body.annualIncome,
      },
      page,
      limit,
      viewerId: req.user ? req.user.id : null,
    });

    res.json({ results, total });
  } catch (err) {
    next(err);
  }
}

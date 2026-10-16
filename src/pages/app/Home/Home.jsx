import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { profileUrl, searchProfiles } from '../../../services/profileLookupService.js';
import { sendInterest } from '../../../services/matchesService.js';
import { HOME_DRAWER_ITEMS } from './homeData.js';
import { mapApiError } from '../../../services/apiError.js';
import GreetingHeader from './components/GreetingHeader.jsx';
import MatchStrip from './components/MatchStrip.jsx';
import HomeProfileCard from './components/HomeProfileCard.jsx';

export default function Home() {
  usePageMeta({
    title: 'Home | Telugu Sambandham',
    description: 'Your daily matches and recommended profiles on Telugu Sambandham.',
    robots: 'noindex, nofollow',
  });
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [interested, setInterested] = useState({});
  // Fully API-driven: render whatever searchProfiles({}) returns (even empty),
  // never the old static seed. `loading` gates the empty-state so we don't flash
  // "no matches" before the first fetch resolves.
  const [recommended, setRecommended] = useState([]);
  const [matchesOfDay, setMatchesOfDay] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const res = await searchProfiles({});
      if (!active) return;
      const results = res.results || [];
      setRecommended(results);
      setMatchesOfDay(results.slice(0, 5));
      setLoading(false);
      if (res.error) {
        const { title, message } = mapApiError({ status: res.status });
        showToast(title, message, 'error');
      }
    })();
    return () => { active = false; };
  }, [showToast]);

  const onView = (p) => navigate(profileUrl(p.id));
  const onInterest = (p) => {
    setInterested((m) => ({ ...m, [p.id]: true }));
    sendInterest(p.matId || p.id); // optimistic: keep the toast even on non-ok
    showToast('Interest Sent', `Your interest has been sent to ${p.name}!`);
  };

  return (
    <MainLayout
      variant="app"
      active="home"
      drawer={{ items: HOME_DRAWER_ITEMS, member: true, logout: true, logoutDivider: false }}
      mainClassName="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 animate-fade-in"
    >
      <GreetingHeader name={user?.firstName} />

      <MatchStrip profiles={matchesOfDay} onOpen={onView} />

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i aria-hidden="true" className="fas fa-heart text-brand" /> Recommended for You
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <i aria-hidden="true" className="fas fa-circle-notch fa-spin text-2xl" />
          </div>
        ) : recommended.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <i aria-hidden="true" className="fas fa-user-friends text-4xl mb-4 opacity-40" />
            <p className="font-semibold">No matches to show yet</p>
            <p className="text-sm mt-1">Try adjusting your preferences or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((p, i) => (
              <HomeProfileCard
                key={p.id}
                profile={p}
                index={i}
                interested={!!interested[p.id]}
                onInterest={onInterest}
                onView={onView}
              />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}

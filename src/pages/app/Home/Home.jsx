import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { profileUrl } from '../../../services/profileLookupService.js';
import { sendInterest } from '../../../services/matchesService.js';
import { HOME_DRAWER_ITEMS } from './homeData.js';
import { MATCHES_OF_DAY, RECOMMENDED } from './homeFeedData.js';
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

      <MatchStrip profiles={MATCHES_OF_DAY} onOpen={onView} />

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i aria-hidden="true" className="fas fa-heart text-brand" /> Recommended for You
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECOMMENDED.map((p, i) => (
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
      </section>
    </MainLayout>
  );
}

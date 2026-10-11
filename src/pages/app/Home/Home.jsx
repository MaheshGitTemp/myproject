import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import SwipeDeck from './components/SwipeDeck.jsx';
import { HOME_DRAWER_ITEMS, PROFILES, RESET_PROFILES } from './homeData.js';

export default function Home() {
  usePageMeta({
    title: 'Home | Telugu Sambandham',
    description: 'Swipe through curated profiles on Telugu Sambandham. Like, skip, or learn more.',
    robots: 'noindex, nofollow',
  });
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(PROFILES);

  return (
    <MainLayout
      variant="app"
      active="home"
      drawer={{ items: HOME_DRAWER_ITEMS, member: true, logout: true, logoutDivider: false }}
      mainClassName="max-w-2xl mx-auto px-4 py-6 md:py-10 h-[calc(100vh-5rem)] flex flex-col"
    >
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold mb-2">Find Your <span className="gradient-text">Perfect Match</span></h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Swipe through curated profiles. Like, skip, or learn more.</p>
      </div>
      <SwipeDeck
        profiles={profiles}
        onDone={() => setProfiles((l) => l.slice(1))}
        onReset={() => setProfiles(RESET_PROFILES)}
        onInfo={(p) => navigate(`/profile-details?id=${p.matId}`)}
      />
    </MainLayout>
  );
}

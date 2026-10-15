import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { getDashboard } from '../../../services/accountService.js';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { MATCH_OF_THE_DAY, QUICK_ACTIONS, RECENT_ACTIVITY, STATS } from './dashboardData.js';
import MatchOfTheDay from './components/MatchOfTheDay.jsx';
import QuickActionCard from './components/QuickActionCard.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import StatCard from './components/StatCard.jsx';

// Map an interest status to the UI pill label RecentActivity/STATUS_CLASS expect.
const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', declined: 'Rejected', rejected: 'Rejected' };

// Build the StatCard grid from live stats, keeping the icon/color config from
// dashboardData.js STATS and only swapping the value (matched by order).
function statsToCards(stats) {
  const values = [stats.proposalsReceived, stats.proposalsSent, stats.mutual, stats.profileViews];
  return STATS.map((s, i) => ({ ...s, value: Number(values[i]) || 0 }));
}

// recentActivity {type,name,matId,image,when} -> RecentActivity {name,alt,meta,status,photo}.
function activityToItems(recentActivity) {
  return recentActivity.map((a) => ({
    name: a.name,
    alt: a.name,
    meta: a.matId,
    status: STATUS_LABEL[a.type] || 'Pending',
    photo: a.image,
  }));
}

// matchOfTheDay card -> MatchOfTheDay match shape.
function matchToDay(card) {
  return {
    name: card.age ? `${card.name}, ${card.age}` : card.name,
    compatibility: card.compatibility?.label || 'New Match',
    job: [card.occupation || card.job, card.city || card.location].filter(Boolean).join(' • '),
    online: !!card.online,
    photo: card.image,
    profileLink: `/profile-details?id=${card.matId}`,
  };
}

export default function Dashboard() {
  usePageMeta({
    title: 'Dashboard | Telugu Sambandham',
    description: 'Your Telugu Sambandham dashboard: activity, match of the day and quick actions.',
    robots: 'noindex, nofollow',
  });
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await getDashboard();
      if (!active) return;
      setData(res);
    })();
    return () => { active = false; };
  }, []);

  // Live when the API returned stats; otherwise fall back to dashboardData.js.
  const live = data && data.stats;
  const stats = live ? statsToCards(data.stats) : STATS;
  const activity = live && data.recentActivity.length ? activityToItems(data.recentActivity) : RECENT_ACTIVITY;
  const match = live && data.matchOfTheDay ? matchToDay(data.matchOfTheDay) : MATCH_OF_THE_DAY;

  return (
    <AccountLayout
      subtitle="Member Dashboard"
      title={<>Welcome back, <span className="gradient-text">{user.firstName}!</span></>}
      description="Here's what's happening with your profile today."
      sidebarActive="dashboard"
    >
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((a) => <QuickActionCard key={a.title} {...a} />)}
      </div>

      {/* 3. Recent Activity & Match of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity items={activity} />
        <MatchOfTheDay match={match} />
      </div>

      {/* Need Help Section */}
      <div className="glass rounded-2xl p-6 card-shadow text-center bg-brand-soft/30 dark:bg-brand/10 border-brand/20">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Need Help?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Get answers to your questions or contact our support team.</p>
        <div className="flex justify-center gap-4">
          <Link to="/help-support" className="px-5 py-2 bg-white dark:bg-slate-800 text-brand border border-brand/20 rounded-lg font-semibold hover:bg-brand hover:text-white transition text-sm">
            <i aria-hidden="true" className="fas fa-question-circle mr-1" /> Help &amp; Support
          </Link>
          <Link to="/terms-privacy" className="px-5 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm">
            <i aria-hidden="true" className="fas fa-shield-alt mr-1" /> Terms &amp; Privacy
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
}

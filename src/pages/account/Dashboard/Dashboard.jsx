import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { MATCH_OF_THE_DAY, QUICK_ACTIONS, RECENT_ACTIVITY, STATS } from './dashboardData.js';
import MatchOfTheDay from './components/MatchOfTheDay.jsx';
import QuickActionCard from './components/QuickActionCard.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import StatCard from './components/StatCard.jsx';

export default function Dashboard() {
  usePageMeta({
    title: 'Dashboard | Telugu Sambandham',
    description: 'Your Telugu Sambandham dashboard: activity, match of the day and quick actions.',
    robots: 'noindex, nofollow',
  });
  const { user } = useAuth();

  return (
    <AccountLayout
      subtitle="Member Dashboard"
      title={<>Welcome back, <span className="gradient-text">{user.firstName}!</span></>}
      description="Here's what's happening with your profile today."
      sidebarActive="dashboard"
    >
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((a) => <QuickActionCard key={a.title} {...a} />)}
      </div>

      {/* 3. Recent Activity & Match of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity items={RECENT_ACTIVITY} />
        <MatchOfTheDay match={MATCH_OF_THE_DAY} />
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

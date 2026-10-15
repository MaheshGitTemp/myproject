import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import * as matchesService from '../../../services/matchesService.js';
import '../../../styles/pages/notifications.css';
import { NOTIFICATION_PILLS } from './notificationsData.js';
import ProposalRow from './ProposalRow.jsx';

// Map an interests-feed card to the ProposalRow shape. The feed carries the
// full MAT id string in card.matId; the row DISPLAYS/links on the numeric part
// (it renders `MAT{p.matId}`) while API calls need the full MAT string, kept as
// apiMatId. interestStatus 'declined' surfaces as the UI 'rejected' pill.
function toProposal(card) {
  const full = card.matId || card.id || '';
  const numeric = String(full).replace(/^MAT/i, '');
  return {
    id: card.uid ?? card.id ?? full,
    name: card.fullName || card.name,
    age: card.age,
    location: card.city || card.location,
    matId: numeric,
    apiMatId: full,
    status: card.interestStatus === 'declined' ? 'rejected' : card.interestStatus,
    image: card.image,
  };
}

const TAB = 'flex-1 py-4 px-6 text-sm font-semibold transition-colors relative tab-btn flex items-center justify-center gap-2';

function Empty({ icon, text }) {
  return (
    <div className="text-center py-12">
      <i aria-hidden="true" className={`${icon} text-4xl text-slate-300 dark:text-slate-600 mb-3`} />
      <p className="text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

export default function Notifications() {
  usePageMeta({
    title: 'Proposals & Notifications | Telugu Sambandham',
    description: 'Manage the interests you have received and track the ones you have sent.',
    robots: 'noindex, nofollow',
  });
  const { member } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const pending = received.filter((p) => p.status === 'pending').length;

  // Received = incoming interests, Sent = outgoing interests (via matchesService).
  useEffect(() => {
    let active = true;
    (async () => {
      const [incoming, outgoing] = await Promise.all([
        matchesService.getInterests('incoming'),
        matchesService.getInterests('outgoing'),
      ]);
      if (!active) return;
      setReceived((incoming.results || []).map(toProposal));
      setSent((outgoing.results || []).map(toProposal));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setStatus = (id, status) => setReceived((list) => list.map((p) => (p.id === id ? { ...p, status } : p)));
  async function accept(p) {
    await matchesService.acceptInterest(p.apiMatId);
    setStatus(p.id, 'accepted');
    showToast('Proposal Accepted!', `You and ${p.name} are now a match! 🎉`, 'success');
  }
  async function reject(p) {
    await matchesService.declineInterest(p.apiMatId);
    setStatus(p.id, 'rejected');
    showToast('Proposal Rejected', `You have declined ${p.name}'s proposal.`, 'info');
  }

  return (
    <AccountLayout
      pageClass="page-notifications"
      subtitle="Notifications & Proposals"
      title={<>Proposals &amp; <span className="gradient-text">Notifications</span></>}
      description="Manage the interests you've received and track the ones you've sent."
      pills={NOTIFICATION_PILLS}
      navActive="dashboard"
      navLastItem="dashboard"
      badges={{ chat: member?.unread?.chat ?? 0 }}
    >
      <div className="glass rounded-2xl card-shadow overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50">
          <button type="button" onClick={() => setTab('received')} className={`${TAB}${tab === 'received' ? ' active' : ''}`}>
            <i aria-hidden="true" className="far fa-bell" /> Received
            {pending > 0 && <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce-in">{pending} New</span>}
          </button>
          <button type="button" onClick={() => setTab('sent')} className={`${TAB}${tab === 'sent' ? ' active' : ''}`}>
            <i aria-hidden="true" className="far fa-paper-plane" /> Sent
          </button>
        </div>

        {/* pt-4 on the lists = the 1rem the original gets from space-y-4 because Alpine <template> tags precede the first row */}
        <div className="p-4 sm:p-6 min-h-[400px]">
          {tab === 'received' ? (
            <div className="space-y-4 pt-4">
              {loading && <Empty icon="far fa-bell" text="Loading proposals…" />}
              {!loading && received.length === 0 && <Empty icon="far fa-bell" text="No proposals received yet." />}
              {received.map((p) => <ProposalRow key={p.id} proposal={p} onAccept={accept} onReject={reject} />)}
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {loading && <Empty icon="far fa-paper-plane" text="Loading proposals…" />}
              {!loading && sent.length === 0 && <Empty icon="far fa-paper-plane" text="You haven't sent any proposals yet." />}
              {sent.map((p) => <ProposalRow key={p.id} proposal={p} />)}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}

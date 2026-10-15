import { useEffect, useState } from 'react';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import * as chatService from '../../../services/chatService.js';
import { CHAT_DRAWER_ITEMS } from './chatData.js';
import ChatWindow from './components/ChatWindow.jsx';
import ConversationList from './components/ConversationList.jsx';

// A conversation always carries a messages[] array so ChatWindow can read it
// safely; the list endpoint omits messages, so default to [] until opened.
const withMessages = (c) => ({ ...c, messages: Array.isArray(c.messages) ? c.messages : [] });

export default function Chat() {
  usePageMeta({
    title: 'Messages | Telugu Sambandham',
    description: 'Chat with your matches on Telugu Sambandham.',
    robots: 'noindex, nofollow',
  });
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');

  // Load conversations on mount and poll every ~7s (no websockets). Fetched
  // messages already loaded onto a conversation are preserved across refetches.
  useEffect(() => {
    let alive = true;
    async function load() {
      const { conversations: list } = await chatService.getConversations();
      if (!alive) return;
      setConversations((prev) => list.map((c) => {
        const existing = prev.find((p) => p.id === c.id);
        return existing && existing.messages.length ? { ...withMessages(c), messages: existing.messages } : withMessages(c);
      }));
      setLoading(false);
    }
    load();
    const timer = setInterval(load, 7000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  // Sync chat area height with visual viewport (iOS keyboard shrinks it).
  // Lives here so --chat-vh is set whenever the Chat page is mounted (list view or open conversation).
  useEffect(() => {
    function setVh() {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--chat-vh', `${h}px`);
    }
    setVh();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', setVh);
      vv.addEventListener('scroll', setVh);
    } else {
      window.addEventListener('resize', setVh);
    }
    return () => {
      if (vv) {
        vv.removeEventListener('resize', setVh);
        vv.removeEventListener('scroll', setVh);
      } else {
        window.removeEventListener('resize', setVh);
      }
    };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q ? conversations.filter((c) => c.name.toLowerCase().includes(q)) : conversations;
  const active = conversations.find((c) => c.id === selectedId) || null;

  async function select(id) {
    setSelectedId(id);
    // opening a chat marks it read locally and clears the unread badge
    setConversations((list) => list.map((c) => (c.id === id
      ? { ...c, unread: 0, messages: c.messages.map((m) => (m.isSent ? m : { ...m, read: true })) }
      : c)));
    // fetch the conversation's messages from the backend and store them on it
    const { messages } = await chatService.getMessages(id);
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, messages } : c)));
    chatService.markRead(id);
  }

  async function send(text) {
    if (!active) return;
    const { ok, status, reason, message } = await chatService.sendMessage(active.otherMatId, text);
    if (!ok) {
      if (status === 403 || reason === 'messaging_blocked') {
        showToast('Message not sent', 'Messaging is blocked for this conversation.', 'error');
      }
      return;
    }
    const time = (message && message.time) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sent = message || { id: Date.now(), text, isSent: true, time, read: false };
    setConversations((list) => {
      const chat = list.find((c) => c.id === selectedId);
      if (!chat) return list;
      const updated = { ...chat, lastMessage: sent.text, lastMessageTime: time, messages: [...chat.messages, sent] };
      return [updated, ...list.filter((c) => c.id !== selectedId)]; // newest conversation first
    });
    setDraft('');
  }

  return (
    <MainLayout
      variant="app"
      active="chat"
      drawer={{ items: CHAT_DRAWER_ITEMS }}
      mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:py-8 flex flex-col overflow-hidden"
      mainStyle={{ height: 'calc(var(--chat-vh, 100dvh) - 4rem)' }}
    >
      <div className="md:hidden mb-4 flex-shrink-0 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold mb-1">Your <span className="gradient-text">Conversations</span></h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Connect with your matches and start meaningful conversations.</p>
      </div>
      <div className="glass rounded-3xl card-shadow overflow-hidden flex flex-col md:flex-row flex-1 min-h-0 animate-slide-up">
        <ConversationList conversations={visible} selectedId={selectedId} query={query} onQuery={setQuery} onSelect={select} />
        <ChatWindow chat={active} draft={draft} onDraft={setDraft} onBack={() => setSelectedId(null)} onSend={send} />
      </div>
    </MainLayout>
  );
}

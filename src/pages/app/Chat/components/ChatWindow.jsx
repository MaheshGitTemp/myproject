import { useEffect, useRef } from 'react';

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-brand/10 dark:bg-brand/20 rounded-full flex items-center justify-center mb-4 animate-float"><i aria-hidden="true" className="fas fa-comments text-4xl text-brand" /></div>
      <h3 className="text-2xl font-heading font-bold mb-2">Select a Conversation</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm">Choose a contact from the list to start chatting. Your messages are private and secure.</p>
    </div>
  );
}

function Bubble({ msg }) {
  const sent = msg.isSent;
  return (
    <div className={`flex ${sent ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%] md:max-w-[60%]">
        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${sent ? 'bg-brand text-white rounded-br-md' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'}`}>
          <p>{msg.text}</p>
        </div>
        <div className={`text-[10px] text-slate-400 mt-1 flex items-center gap-1 ${sent ? 'justify-end' : 'justify-start'}`}>
          <span>{msg.time}</span>
          {sent && <i aria-hidden="true" className={`fas fa-check-double text-[10px] ${msg.read ? 'text-blue-400' : 'text-slate-400'}`} />}
        </div>
      </div>
    </div>
  );
}

// Right-hand pane: empty state, or header + messages + composer for the open conversation.
// The draft lives in the page (like the original), so it survives switching conversations.
export default function ChatWindow({ chat, draft, onDraft, onBack, onSend }) {
  const listRef = useRef(null);
  const count = chat?.messages.length;

  // like the original: jump to the newest message when a chat opens or a message is added
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chat?.id, count]);

  // Sync chat panel height with visual viewport (iOS keyboard shrinks it)
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

  function send() {
    if (!draft.trim()) return;
    onSend(draft.trim());
  }

  return (
    <div className={`flex-1 flex-col bg-white/30 dark:bg-slate-900/30 relative ${chat ? 'flex' : 'hidden md:flex'}`} style={{ height: 'var(--chat-vh, 100%)' }}>
      {!chat ? <EmptyState /> : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onBack} className="md:hidden w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center" aria-label="Go back"><i aria-hidden="true" className="fas fa-arrow-left text-slate-600 dark:text-slate-300" /></button>
              <div className="relative">
                <img loading="lazy" decoding="async" alt="Profile photo" src={chat.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
                {chat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{chat.name}</h3>
                <p className={`text-xs ${chat.online ? 'text-green-500' : 'text-slate-500'}`}>{chat.online ? 'Online' : 'Last seen recently'}</p>
              </div>
            </div>
            <button type="button" className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500" aria-label="More options"><i aria-hidden="true" className="fas fa-ellipsis-v" /></button>
          </div>

          {/* pt-8 = p-4 + the 1rem the original gets from space-y-4 because Alpine <template> tags precede the first message */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-4 pt-8 space-y-4 hide-scrollbar" id="messagesContainer">
            {chat.messages.length === 0 && <div className="text-center py-8 text-slate-400"><p>No messages yet. Say hello! 👋</p></div>}
            {chat.messages.map((m) => <Bubble key={m.id} msg={m} />)}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2">
              <button type="button" className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition flex-shrink-0" aria-label="Attach file"><i aria-hidden="true" className="fas fa-paperclip" /></button>
              <div className="flex-1 relative">
                <textarea
                  value={draft}
                  onChange={(e) => onDraft(e.target.value)}
                  onKeyDown={(e) => {
                    // Only send on Enter for non-touch devices (mobile keyboards use Enter for newline)
                    const isTouch = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
                    if (e.key === 'Enter' && !e.shiftKey && !isTouch) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition text-sm resize-none hide-scrollbar"
                  style={{ minHeight: 42, maxHeight: 120 }}
                />
              </div>
              <button type="submit" disabled={!draft.trim()} className="w-10 h-10 rounded-full bg-brand hover:bg-brand-dark text-white flex items-center justify-center shadow-lg shadow-brand/30 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message"><i aria-hidden="true" className="fas fa-paper-plane text-sm" /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

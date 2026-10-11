export default function ConversationList({ conversations, selectedId, query, onQuery, onSelect }) {
  return (
    <div className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex-col bg-white/50 dark:bg-slate-900/50 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="hidden md:block text-xl font-heading font-bold mb-3">Conversations</h2>
        <div className="relative">
          <i aria-hidden="true" className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition text-sm" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500">
            <i aria-hidden="true" className="fas fa-inbox text-4xl mb-3 opacity-50" />
            <p className="text-sm font-medium">No conversations found</p>
          </div>
        )}
        {conversations.map((chat) => (
          <div key={chat.id} onClick={() => onSelect(chat.id)} className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-4 border-transparent hover:bg-brand/5 dark:hover:bg-brand/10${selectedId === chat.id ? ' bg-brand/10 dark:bg-brand/20 border-l-brand' : ''}`}>
            <div className="relative flex-shrink-0">
              <img loading="lazy" decoding="async" alt="Profile photo" src={chat.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
              {chat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">{chat.name}</h3>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.lastMessageTime}</span>
              </div>
              <p className={`text-xs text-slate-500 dark:text-slate-400 truncate${chat.unread > 0 ? ' font-semibold text-slate-700 dark:text-slate-200' : ''}`}>{chat.lastMessage}</p>
            </div>
            {chat.unread > 0 && <span className="flex-shrink-0 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">{chat.unread}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

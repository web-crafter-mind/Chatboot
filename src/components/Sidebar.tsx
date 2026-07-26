import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Conversation } from '@/types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onPinConversation: (id: string) => void;
  onArchiveConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  onChangeName?: () => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
  userName = 'User',
  onChangeName,
}: SidebarProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId) {
      renameRef.current?.focus();
    }
  }, [renamingId]);

  const nonArchived = conversations.filter((c) => !c.isArchived);
  const pinned = nonArchived.filter((c) => c.isPinned);
  const regular = nonArchived.filter((c) => !c.isPinned);

  const startRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
    setOpenMenuId(null);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameConversation(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const ConvItem = ({ conv, isActive }: { conv: Conversation; isActive: boolean }) => {
    const isRenaming = renamingId === conv.id;
    const isMenuOpen = openMenuId === conv.id;

    return (
      <div
        className={cn(
          'group relative flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
          isActive ? 'bg-emerald-100 dark:bg-gray-700 text-emerald-700 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        )}
      >
        {isRenaming ? (
          <input
            ref={renameRef}
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setRenamingId(null);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm px-2 py-1 rounded outline-none border-none"
            placeholder="Chat title"
            maxLength={60}
          />
        ) : (
          <button
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
            onClick={() => onSelectConversation(conv.id)}
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {conv.isPinned && <span className="text-xs text-yellow-400 shrink-0">📌</span>}
            <span className="truncate flex-1">{conv.title}</span>
          </button>
        )}

        {!isRenaming && (
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(isMenuOpen ? null : conv.id);
              }}
              className="rounded p-1 text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
              title="More options"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="19" cy="12" r="1.75" />
              </svg>
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                  <button
                    onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    Rename
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPinConversation(conv.id); setOpenMenuId(null); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 8l14-4M4 12l4 4-4 4v-8zM20 8v8" />
                    </svg>
                    {conv.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onArchiveConversation(conv.id); setOpenMenuId(null); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="4" rx="1" />
                      <path d="M5 8v12a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4" />
                    </svg>
                    {conv.isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                  <div className="h-px bg-gray-700 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${conv.title}"? This cannot be undone.`)) {
                        onDeleteConversation(conv.id);
                      }
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/40"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar panel — stays collapsed by default on desktop too */}
      <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform transition-transform duration-300',
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      >
        {/* Logo + controls */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/20">
            <span className="text-white text-base leading-none">✨</span>
          </div>
          <span className="text-sm font-semibold text-white flex-1">ChatBot AI</span>

          {/* New chat button */}
          <button
            onClick={onNewConversation}
            title="New conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Close on mobile */}
          <button
            onClick={onToggle}
            title="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conversations */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-3 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">No conversations yet.<br />Start chatting below!</p>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Pinned</p>
                  <div className="space-y-0.5 mb-2">
                    {pinned.map((conv) => (
                      <ConvItem key={conv.id} conv={conv} isActive={activeConversationId === conv.id} />
                    ))}
                  </div>
                </>
              )}

              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Chats</p>
              <div className="space-y-0.5">
                {regular.map((conv) => (
                  <ConvItem key={conv.id} conv={conv} isActive={activeConversationId === conv.id} />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer with user name */}
        <div className="border-t border-gray-800 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{userName}</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
            {onChangeName && (
              <button
                onClick={onChangeName}
                title="Change your name"
                className="rounded-lg p-2 text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

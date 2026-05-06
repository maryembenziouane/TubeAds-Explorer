// Slide-in messages panel. Reads from the same `chatThreads` collection the
// mobile app uses, so unread conversations show up wherever the user signs in.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  listenChatThreads,
  listenThreadMessages,
  sendChatMessage,
} from '../services/chat';
import { Icon } from './Icons';

function formatTime(ts) {
  if (!ts) return '';
  let ms = null;
  if (typeof ts.toMillis === 'function') ms = ts.toMillis();
  else if (typeof ts.seconds === 'number') ms = ts.seconds * 1000;
  if (ms == null) return '';
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesDrawer({ open, onClose, onRequireLogin }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    if (!user) {
      onRequireLogin?.();
      onClose();
      return undefined;
    }
    setLoading(true);
    return listenChatThreads(
      user.uid,
      (list) => {
        setThreads(list);
        setLoading(false);
        setActiveId((prev) => prev ?? list[0]?.id ?? null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [open, user, onClose, onRequireLogin]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[680px] max-w-full bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">Messages</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close messages"
            className="p-2 -m-2 text-slate-500 hover:text-slate-800"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[260px_1fr] min-h-0">
          <ThreadList
            threads={threads}
            activeId={activeId}
            onSelect={setActiveId}
            loading={loading}
            error={error}
          />
          <ChatPane
            user={user}
            thread={threads.find((t) => t.id === activeId) || null}
          />
        </div>
      </aside>
    </div>
  );
}

function ThreadList({ threads, activeId, onSelect, loading, error }) {
  if (loading) {
    return (
      <div className="border-r border-slate-200 p-3 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="border-r border-slate-200 p-4 text-sm text-red-700">
        Couldn’t load conversations: {error.message}
      </div>
    );
  }
  if (threads.length === 0) {
    return (
      <div className="border-r border-slate-200 p-4 text-sm text-slate-500">
        No conversations yet. Start one from a listing.
      </div>
    );
  }
  return (
    <ul className="border-r border-slate-200 overflow-y-auto">
      {threads.map((t) => {
        const active = t.id === activeId;
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t.id)}
              className={
                'w-full flex items-center gap-3 px-3 py-3 text-left border-b border-slate-100 hover:bg-slate-50 ' +
                (active ? 'bg-brand-50/50' : '')
              }
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {t.productThumb ? (
                  <img
                    src={t.productThumb}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {t.productTitle || 'Conversation'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {t.lastMessageText || t.priceLabel || ''}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChatPane({ user, thread }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    if (!thread) return undefined;
    return listenThreadMessages(thread.id, setMessages, (err) =>
      console.warn('messages listener', err),
    );
  }, [thread]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sortedMessages = useMemo(() => messages.slice(), [messages]);

  if (!thread) {
    return (
      <div className="grid place-items-center text-sm text-slate-500 p-6">
        Select a conversation to view messages.
      </div>
    );
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendChatMessage(thread.id, text);
      setDraft('');
    } catch (err) {
      console.error('sendChatMessage', err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 h-14 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
          {thread.productThumb ? (
            <img
              src={thread.productThumb}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">
            {thread.productTitle || 'Conversation'}
          </div>
          <div className="text-xs text-slate-500">{thread.priceLabel}</div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50/40"
      >
        {sortedMessages.map((m) => {
          const mine = m.senderUid === user?.uid;
          return (
            <div
              key={m.id}
              className={'flex ' + (mine ? 'justify-end' : 'justify-start')}
            >
              <div
                className={
                  'max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ' +
                  (mine
                    ? 'bg-brand-500 text-white rounded-br-md'
                    : 'bg-white text-slate-800 rounded-bl-md border border-slate-200')
                }
              >
                {m.text && (
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                )}
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt=""
                    className="mt-1 max-w-full rounded-lg"
                  />
                )}
                <div
                  className={
                    'mt-1 text-[10px] ' +
                    (mine ? 'text-white/80 text-right' : 'text-slate-400')
                  }
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        {sortedMessages.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-6">
            Say hello — your message will reach them on mobile too.
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-slate-200 p-3 flex items-center gap-2 bg-white"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="grid place-items-center w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 transition"
          aria-label="Send message"
        >
          <Icon name="send" className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

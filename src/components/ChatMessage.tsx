import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  userName?: string;
}

export default function ChatMessage({ message, userName = 'You' }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={cn(
        'group flex w-full px-4 py-5 transition-colors',
        isUser
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-50 dark:bg-gray-800/60'
      )}
    >
      <div className="flex w-full max-w-3xl mx-auto gap-4">
        {/* Avatar */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm',
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-violet-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          )}
        >
          {isUser ? (
            <span className="text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className="text-white text-base leading-none">✨</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + timestamp row */}
          <div className="flex items-center gap-2 mb-1.5">
            <p className={cn('text-sm font-semibold', isUser ? 'text-gray-800 dark:text-gray-100' : 'text-emerald-700 dark:text-emerald-400')}>
              {isUser ? userName : 'ChatBot AI'}
            </p>
            <span className="text-[11px] text-gray-400 dark:text-gray-600">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message body */}
          <div className={cn(
            'message-prose text-sm leading-relaxed whitespace-pre-wrap break-words',
            isUser ? 'text-gray-800 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'
          )}>
            {message.content}
          </div>

          {/* Copy button — appears on hover */}
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy message"
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="h-3 w-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

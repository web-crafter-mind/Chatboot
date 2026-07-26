import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = 'Ask anything...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const isDisabled = isLoading || disabled;
  const canSend = input.trim().length > 0 && !isDisabled;

  const handleSend = () => {
    if (canSend) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-4">

        {/* Pill-shaped input container */}
        <div
          className={[
            'flex items-end gap-3 rounded-3xl border px-4 py-3 shadow-sm transition-all duration-200',
            isDisabled
              ? 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:border-emerald-400 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 dark:focus-within:ring-emerald-900/40',
          ].join(' ')}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none min-h-[24px] max-h-[200px] leading-6"
            disabled={isDisabled}
          />

          {/* Paper airplane send button — circular */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title="Send message (Enter)"
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200',
              canSend
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed',
            ].join(' ')}
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              // Paper airplane icon
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-3 text-center text-[11px] text-gray-400 dark:text-gray-600">
          <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono font-normal">Enter</kbd>
          <span className="mx-1">to send</span>
          <span className="mx-1">·</span>
          <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono font-normal">Shift+Enter</kbd>
          <span className="mx-1">for new line</span>
          <span className="mx-1">·</span>
          <span>ChatBot AI may make mistakes</span>
        </p>
      </div>
    </div>
  );
}

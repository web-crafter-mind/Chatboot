interface TypingIndicatorProps {
  label?: string;
}

export default function TypingIndicator({ label = 'Thinking...' }: TypingIndicatorProps) {
  return (
    <div className="flex w-full px-4 py-5 bg-gray-50 dark:bg-gray-800/60">
      <div className="flex w-full max-w-3xl mx-auto gap-4">
        {/* Avatar — green sparkle ✨ */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
          <span className="text-white text-base leading-none">✨</span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold mb-2.5 text-emerald-700 dark:text-emerald-400">ChatBot AI</p>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-bounce [animation-delay:-0.32s]" />
              <span className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-bounce [animation-delay:-0.16s]" />
              <span className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-bounce" />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

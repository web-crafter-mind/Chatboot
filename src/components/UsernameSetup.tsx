import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';

interface UsernameSetupProps {
  onDone: () => void;
}

export default function UsernameSetup({ onDone }: UsernameSetupProps) {
  const { setName, dismissWelcome } = useProfile();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setName(input.trim());
    } else {
      setName('User');
    }
    onDone();
  };

  const handleSkip = () => {
    dismissWelcome();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/20 mb-3">
            <span className="text-white text-4xl leading-none">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome to ChatBot AI</h2>
          <p className="text-emerald-100 text-sm">Let's get started. What should I call you?</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your name
            </label>
            <input
              id="username"
              type="text"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Alex, Sarah, Muhammad..."
              maxLength={30}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 transition-all"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Used in chat messages and the sidebar. You can change it later.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-[2] rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold px-4 py-3 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            >
              Get started →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

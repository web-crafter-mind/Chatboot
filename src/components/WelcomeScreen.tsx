interface WelcomeScreenProps {
  onSuggestionClick?: (s: string) => void;
}

export default function WelcomeScreen({}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 min-h-full">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
            <span className="text-white text-4xl leading-none">✨</span>
          </div>
          <span className="absolute -z-10 -inset-6 rounded-3xl bg-emerald-400 blur-3xl opacity-20" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          ChatBot <span className="text-emerald-600 dark:text-emerald-400">AI</span>
        </h1>
      </div>
    </div>
  );
}

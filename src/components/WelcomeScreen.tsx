interface WelcomeScreenProps {
  onSuggestionClick?: (prompt: string) => void;
}

const suggestions = [
  "Explain quantum computing simply",
  "Build a React dashboard with Tailwind CSS",
  "Summarize an article",
  "Plan my weekend trip",
];

export default function WelcomeScreen({
  onSuggestionClick,
}: WelcomeScreenProps) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="w-full max-w-3xl">

        {/* Logo */}
        <div className="flex flex-col items-center text-center">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
            <span className="text-2xl">✨</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            ChatBot <span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            How can I help today?
          </p>

        </div>

        {/* Suggestions */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {suggestions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSuggestionClick?.(prompt)}
              className="
                group
                rounded-2xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-800
                p-5
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-emerald-500
                hover:bg-emerald-50
                dark:hover:bg-gray-700
                hover:shadow-xl
                active:scale-[0.98]
              "
            >
              <div className="flex items-center justify-between gap-4">

                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-6">
                  {prompt}
                </span>

                <svg
                  className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>

              </div>
            </button>
          ))}

        </div>

      </div>
    </div>
  );
}
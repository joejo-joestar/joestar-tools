import React from "react";

interface UrlInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({
  url,
  setUrl,
  handleSubmit,
  isLoading,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-3"
    >
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/news/latest-article"
        className="w-full bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 p-3 text-sm text-ctp-blue placeholder-ctp-sapphire-500/25 focus:ring-1 focus:ring-ctp-blue-400 focus:outline-none transition duration-200"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto flex-shrink-0 bg-ctp-mauve-700 hover:bg-ctp-mauve-600 cursor-pointer disabled:bg-ctp-mauve-700/25 disabled:text-ctp-mauve-700/25 disabled:cursor-wait text-ctp-mauve-50 font-semibold py-3 px-6 transition duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Searching...
          </>
        ) : (
          "Find Feed"
        )}
      </button>
    </form>
  );
};

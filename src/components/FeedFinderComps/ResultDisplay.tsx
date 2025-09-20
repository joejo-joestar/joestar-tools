import React, { useState } from "react";
import { RSSIcon } from "@/assets/Icons";

interface ResultDisplayProps {
  feedUrl: string | null;
  sourceUrl: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  feedUrl,
  sourceUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (feedUrl) {
      navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!feedUrl) {
    let hostname = "example.com";
    try {
      hostname = new URL(sourceUrl).hostname;
    } catch (e) {
      console.error("Could not parse hostname from sourceUrl", e);
    }
    const query = `${hostname} RSS feed`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    return (
      <div className="bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 p-6 text-center animate-fade-in">
        <h2 className="text-xl font-semibold text-ctp-sapphire-300 mb-3">
          No Feed Found
        </h2>
        <p className="text-ctp-sapphire-400 max-w-md mx-auto">
          Couldn't find a feed after checking the page, its homepage, and common
          feed locations.
        </p>
        <div className="mt-4 text-ctp-sapphire-400 space-y-3 text-sm">
          <p>
            Try a manual search on Google:
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 bg-ctp-sapphire-700/50 text-ctp-rosewater-300 p-2 hover:bg-ctp-sapphire-500/75 cursor-pointer transition-colors inline-block"
            >
              Search for "{query}"
            </a>
          </p>
          <p>
            Alternatively, for general news, try{" "}
            <a
              href="https://news.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ctp-blue-300 hover:underline"
            >
              news.google.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ctp-green-900/20 border border-ctp-green/50 p-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-ctp-green-300 mb-4 flex items-center gap-2">
        <RSSIcon className="w-6 h-6 fill-ctp-green" />
        Feed Found!
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-ctp-green-900/50 p-4 ">
        <a
          href={feedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-grow text-ctp-blue-300 break-all hover:underline"
        >
          {feedUrl}
        </a>
        <button
          onClick={handleCopy}
          className={`${!copied ? "bg-ctp-mauve-700 hover:bg-ctp-mauve-600 text-ctp-mauve-50" : "bg-ctp-green-700 hover:bg-ctp-green-600 text-ctp-green-50"} flex-shrink-0 cursor-pointer w-full sm:w-auto font-medium py-2 px-4 transition duration-200 flex items-center justify-center gap-2`}
        >
          {copied ? (
            <>
              <svg
                className="fill-ctp-green-50 w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="fill-ctp-mauve-50 w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M448 96L439.4 96C428.4 76.9 407.7 64 384 64L256 64C232.3 64 211.6 76.9 200.6 96L192 96C156.7 96 128 124.7 128 160L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 160C512 124.7 483.3 96 448 96zM264 176C250.7 176 240 165.3 240 152C240 138.7 250.7 128 264 128L376 128C389.3 128 400 138.7 400 152C400 165.3 389.3 176 376 176L264 176z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

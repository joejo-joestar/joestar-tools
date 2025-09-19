import React, { useState, useCallback } from "react";
import { UrlInputForm } from "@components/FeedFinderComps/UrlInputForm";
import { ResultDisplay } from "@components/FeedFinderComps/ResultDisplay";
import { ErrorDisplay } from "@components/FeedFinderComps/ErrorDisplay";
import { findRssFeed } from "@hooks/searchService";
import type { FeedFinderResponse } from "@shared/types";

function FeedFinder() {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [result, setResult] = useState<FeedFinderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!url.trim()) {
        setError("Please enter a valid URL.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setResult(null);
      setLoadingMessage("Searching...");

      try {
        const onProgress = (message: string) => {
          setLoadingMessage(message);
        };
        const response = await findRssFeed(url, onProgress);
        if (response.error) {
          setError(response.error);
        } else {
          setResult(response);
        }
      } catch (e) {
        console.error(e);
        setError(
          "An unexpected error occurred. Please check the console for details."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [url]
  );

  return (
    <section className="flex flex-col min-h-screen w-10/12 bg-ctp-base text-ctp-rosewater">
      <div className="bg-ctp-base min-h-screen flex items-center justify-center  p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-ctp-mauve mb-2">
              Feed Finder
            </h1>
            <p className="text-ctp-blue-950 text-lg">
              Enter a URL to discover its RSS or Atom feed.
            </p>
          </div>
          <div>
            <UrlInputForm
              url={url}
              setUrl={setUrl}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />

            <div className="mt-8 min-h-[120px]">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center gap-4 text-center">
                  <p className="text-ctp-rosewater-500/25 cursor-wait">
                    {loadingMessage}
                  </p>
                </div>
              ) : error ? (
                <ErrorDisplay message={error} />
              ) : result ? (
                <ResultDisplay feedUrl={result.feedUrl} sourceUrl={url} />
              ) : (
                <div className="text-center text-ctp-rosewater-700/75 p-6 bg-ctp-sapphire-950/25 border border-ctp-sapphire-700">
                  <p>Results appear here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeedFinder;

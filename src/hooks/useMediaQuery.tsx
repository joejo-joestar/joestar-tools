import { useState, useEffect } from "react";

// refer: https://dev.to/salimzade/handle-media-query-in-react-with-hooks-3cp3
// Define the hook with 'query' parameter typed as a string
const useMediaQuery = (query: string): boolean => {
  // Initialize state directly with the media query's current match status
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      // Ensure window is available (for SSR)
      return window.matchMedia(query).matches;
    }
    return false; // Default if window is not available
  });

  useEffect(() => {
    // Ensure window is available before trying to use matchMedia
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);

    // Update state if the initial server-rendered state (or previous query state) doesn't match
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Define the listener
    const listener = () => setMatches(media.matches);

    // Use 'change' event for media query changes
    media.addEventListener("change", listener);

    // Cleanup function to remove the event listener
    return () => media.removeEventListener("change", listener);
  }, [query, matches]); // Re-run effect if query changes or if matches was updated by the effect itself

  return matches;
};

export default useMediaQuery;

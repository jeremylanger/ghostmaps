import { useCallback, useRef, useState } from "react";
import { useAISearch } from "../hooks/useAISearch";
import { formatDistanceLive } from "../lib/geo-utils";
import { useAppStore } from "../store";
import type { Place } from "../types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { search, abort } = useAISearch();
  const results = useAppStore((s) => s.searchResults);
  const loading = useAppStore((s) => s.loading);
  const statusMessage = useAppStore((s) => s.statusMessage);
  const error = useAppStore((s) => s.error);
  const ranking = useAppStore((s) => s.ranking);
  const selectPlace = useAppStore((s) => s.selectPlace);
  const clearSearch = useAppStore((s) => s.clearSearch);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        abort();
        clearSearch();
        return;
      }

      setShowResults(true);
      debounceRef.current = setTimeout(() => {
        search(value);
      }, 600);
    },
    [search, abort, clearSearch],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (query.trim()) {
        setShowResults(true);
        search(query);
      }
    },
    [query, search],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    abort();
    clearSearch();
  }, [abort, clearSearch]);

  const handleSelectResult = useCallback(
    (place: Place) => {
      setQuery(place.name);
      setShowResults(false);
      selectPlace(place);
    },
    [selectPlace],
  );

  // Sort results: top pick first, then alternatives in order
  const sortedResults = ranking
    ? [...results].sort((a, b) => {
        if (a.id === ranking.topPick) return -1;
        if (b.id === ranking.topPick) return 1;
        const aAlt = ranking.alternatives.findIndex((alt) => alt.id === a.id);
        const bAlt = ranking.alternatives.findIndex((alt) => alt.id === b.id);
        if (aAlt !== -1 && bAlt === -1) return -1;
        if (aAlt === -1 && bAlt !== -1) return 1;
        if (aAlt !== -1 && bAlt !== -1) return aAlt - bAlt;
        return 0;
      })
    : results;

  const getWhyNot = (placeId: string): string | null => {
    if (!ranking) return null;
    const alt = ranking.alternatives.find((a) => a.id === placeId);
    return alt?.whyNot || null;
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search places..."
          value={query}
          onChange={handleChange}
          autoComplete="off"
        />
        {query && (
          <button type="button" className="search-clear" onClick={handleClear}>
            &times;
          </button>
        )}
      </form>

      {(loading || error || (results.length > 0 && showResults)) && query && (
        <div className="search-results">
          {statusMessage && (
            <div className="search-status">{statusMessage}</div>
          )}
          {error && <div className="search-error">{error}</div>}

          {ranking?.summary && !loading && (
            <div className="search-summary">{ranking.summary}</div>
          )}

          {!error &&
            sortedResults.map((place) => {
              const isTopPick = ranking?.topPick === place.id;
              const whyNot = getWhyNot(place.id);

              return (
                <div
                  key={place.id}
                  className={`search-result-item ${isTopPick ? "top-pick" : ""}`}
                  onClick={() => handleSelectResult(place)}
                >
                  <div className="result-header">
                    <div>
                      <div className="result-name">
                        {isTopPick && (
                          <span className="top-pick-badge">Top Pick</span>
                        )}
                        {place.name}
                      </div>
                      {place.category && (
                        <div className="result-category">
                          {place.category.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                    {whyNot && <div className="result-why-not">{whyNot}</div>}
                  </div>
                  {isTopPick && ranking?.topPickReason && (
                    <div className="result-reason">{ranking.topPickReason}</div>
                  )}
                  <div className="result-meta">
                    {place.address && (
                      <span className="result-address">{place.address}</span>
                    )}
                    {place.distanceMeters != null && (
                      <span className="result-distance">
                        {formatDistanceLive(place.distanceMeters)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

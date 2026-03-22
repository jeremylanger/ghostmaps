import { Search, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useAISearch } from "../hooks/useAISearch";
import { formatDistanceLive } from "../lib/geo-utils";
import { useAppStore } from "../store";
import type { Place } from "../types";
import HamburgerMenu from "./HamburgerMenu";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
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
        setHasSearched(false);
        return;
      }

      setShowResults(true);
      debounceRef.current = setTimeout(() => {
        setHasSearched(true);
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
        setHasSearched(true);
        search(query);
      }
    },
    [query, search],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setHasSearched(false);
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

  const searchComplete = hasSearched && !loading && !statusMessage;
  const hasResults = results.length > 0;
  const showDropdown =
    query &&
    showResults &&
    hasSearched &&
    (loading || error || hasResults || searchComplete);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 max-w-[520px]">
      <form
        className="group flex items-center rounded-xl border border-edge bg-surface/90 h-12 shadow-panel backdrop-blur-md transition-all focus-within:border-cyan focus-within:shadow-glow"
        onSubmit={handleSubmit}
      >
        <HamburgerMenu />
        <div className="w-px h-6 bg-edge shrink-0" />
        <Search className="size-5 shrink-0 text-blue-gray group-focus-within:text-cyan transition-colors ml-3" />
        <input
          type="text"
          placeholder="Search places..."
          value={query}
          onChange={handleChange}
          autoComplete="off"
          className="flex-1 h-full bg-transparent border-none outline-none text-bone text-base font-body placeholder:text-blue-gray ml-2.5"
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-gray hover:text-bone transition-colors p-1 mr-3"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="mt-2 rounded-xl border border-edge bg-surface/95 shadow-panel backdrop-blur-md max-h-[60vh] overflow-y-auto animate-decloak">
          {statusMessage && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-blue-gray border-b border-edge">
              <span className="size-3 rounded-full border-2 border-edge border-t-cyan animate-spin" />
              {statusMessage}
            </div>
          )}
          {error && (
            <div className="px-4 py-4 text-center text-sm text-coral">
              {error}
            </div>
          )}
          {searchComplete && !error && !hasResults && (
            <div className="px-4 py-4 text-center text-sm text-blue-gray">
              No places found. Try a different search.
            </div>
          )}

          {!error &&
            sortedResults.map((place) => {
              const isTopPick = ranking?.topPick === place.id;
              const whyNot = getWhyNot(place.id);

              return (
                <div
                  key={place.id}
                  className={`px-4 py-3 cursor-pointer border-b border-edge/50 transition-colors last:border-b-0 ${
                    isTopPick
                      ? "bg-cyan-muted border-l-2 border-l-cyan hover:bg-cyan-muted/80"
                      : "hover:bg-surface-raised"
                  }`}
                  onClick={() => handleSelectResult(place)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-[15px] text-bone">
                        {isTopPick && (
                          <span className="inline-block bg-cyan text-void text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mr-1.5 align-middle">
                            Top Pick
                          </span>
                        )}
                        {place.name}
                      </div>
                      {place.category && (
                        <div className="text-sm text-blue-gray capitalize mt-0.5">
                          {place.category.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                    {whyNot && (
                      <div className="text-[11px] text-muted shrink-0 mt-0.5">
                        {whyNot}
                      </div>
                    )}
                  </div>
                  {isTopPick && ranking?.topPickReason && (
                    <div className="text-sm text-cyan-dim mt-1 leading-snug">
                      {ranking.topPickReason}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mt-0.5">
                    {place.rating && (
                      <span className="text-sm text-muted shrink-0">
                        <span className="text-amber">★</span>{" "}
                        {place.rating.toFixed(1)}
                        {place.reviewCount
                          ? ` (${place.reviewCount.toLocaleString()})`
                          : ""}
                      </span>
                    )}
                    {place.address && (
                      <span className="text-sm text-muted flex-1 min-w-0 truncate">
                        {place.address}
                      </span>
                    )}
                    {place.distanceMeters != null && !Number.isNaN(place.distanceMeters) && (
                      <span className="text-xs font-semibold text-cyan font-mono shrink-0">
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

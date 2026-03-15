import { useState, useRef, useCallback } from 'react'

export default function SearchBar({ onSearch, results, loading, error, onSelectResult, onClear }) {
  const [query, setQuery] = useState('')
  const debounceRef = useRef(null)

  const handleChange = useCallback((e) => {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      onClear()
      return
    }

    debounceRef.current = setTimeout(() => {
      onSearch(value)
    }, 400)
  }, [onSearch, onClear])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim()) onSearch(query)
  }, [query, onSearch])

  const handleClear = useCallback(() => {
    setQuery('')
    onClear()
  }, [onClear])

  const handleSelectResult = useCallback((place) => {
    setQuery(place.name)
    onSelectResult(place)
  }, [onSelectResult])

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {(loading || error || results.length > 0) && query && (
        <div className="search-results">
          {loading && <div className="search-loading">Searching...</div>}
          {error && <div className="search-error">{error}</div>}
          {!loading && !error && results.map((place) => (
            <div
              key={place.id}
              className="search-result-item"
              onClick={() => handleSelectResult(place)}
            >
              <div className="result-name">{place.name}</div>
              {place.category && (
                <div className="result-category">
                  {place.category.replace(/_/g, ' ')}
                </div>
              )}
              {place.address && (
                <div className="result-address">{place.address}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

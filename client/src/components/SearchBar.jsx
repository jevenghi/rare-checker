import styles from "./SearchBar.module.css";
import { useRef, useEffect } from "react";

function SearchBar({ getReleaseStats, query, setQuery, loading }) {
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  return (
    <form onSubmit={getReleaseStats} className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
          placeholder="Enter release title"
          disabled={loading}
        />
        <button
          type="submit"
          className={styles.searchIcon}
          disabled={loading || !query.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </form>
  );
}

export default SearchBar;

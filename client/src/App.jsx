import { useState } from "react";
import "./App.css";

const baseDiscogsURL = "https://www.discogs.com/release/";

function App() {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  async function getReleaseStats(e) {
    if (e) e.preventDefault();

    if (!query.trim() || loading) return;

    try {
      setStats([]);
      setNoResults(false);
      const releases = await getReleasesByTitle();
      if (releases && releases.length > 0) {
        const newStats = await Promise.all(
          releases.map(async (release) => {
            const statsData = await getStatsById(release.id);
            return statsData
              ? {
                  ...statsData,
                  id: release.id,
                  thumb: release.thumb,
                  title: release.title,
                  year: release.year,
                  demand: release.demand.want,
                  desc: release.format.text ? release.format.text : "Black",
                }
              : null;
          })
        );
        const filteredStats = newStats.filter(Boolean);
        setStats(filteredStats);
        setNoResults(filteredStats.length === 0);
      } else {
        setStats([]);
        setNoResults(true);
      }
    } catch (err) {
      alert("Error fetching release stats:", err);
    } finally {
      setQuery("");
    }
  }
  async function getReleasesByTitle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/discogs/search?query=${query}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching releases by title:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getStatsById(releaseId) {
    try {
      const res = await fetch(`/api/discogs/stats/${releaseId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`Error fetching stats for release ${releaseId}:`, err);
      return null;
    }
  }

  return (
    <div className="app-container">
      <form onSubmit={getReleaseStats} className="search-container">
        <div className="search-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            placeholder="Enter release title"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-icon"
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

      {loading && <p className="loading-text">Loading...</p>}

      {noResults && <p>No items found</p>}

      {stats.length > 0 && <List stats={stats} />}
    </div>
  );
}

function Release({ release }) {
  const isHighPrice = release.lowest_price?.value > 50;
  const isForSale = release.num_for_sale > 0;

  return (
    <li
      onClick={() => window.open(`${baseDiscogsURL}${release.id}`, "_blank")}
      className={`release-item ${isHighPrice ? "high-price" : ""}`}
    >
      <div className="thumb-container">
        {release.thumb ? (
          <img
            src={release.thumb}
            alt="Album thumbnail"
            className="thumb-image"
          />
        ) : (
          <div className="no-thumb">
            <span>No image</span>
          </div>
        )}
      </div>
      <div className="release-info">
        {release.blocked_from_sale ? (
          <p className="blocked-text">Blocked from sale</p>
        ) : (
          <>
            <div className="release-title">
              <p>
                {release.title} ({release.year}, {release.desc})
              </p>
            </div>
            <div className="release-sale">
              <p>
                For sale: {release.num_for_sale} | From:{" "}
                {release.lowest_price?.value
                  ? `${release.lowest_price.value}`
                  : "N/A"}
              </p>
            </div>
            <div className="release-wants">
              <p>Wants: {release.demand}</p>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function List({ stats }) {
  return (
    <ul className="releases-list">
      {stats.map((release) => (
        <Release key={release.id} release={release} />
      ))}
    </ul>
  );
}

export default App;

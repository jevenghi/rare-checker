import { useState, useReducer } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import SourceChips from "./components/SourceChips";
import DiscogsRelease from "./components/DiscogsRelease";
import PopsikeRelease from "./components/PopsikeRelease";
// import getPopsikeStats from "../../server/popsike-service";

const baseDiscogsURL = "https://www.discogs.com/release/";

const ACTIONS = {
  SEARCH_START: "search_start",
  SEARCH_SUCCESS: "search_success",
  SEARCH_ERROR: "search_error",
  SEARCH_NO_RESULTS: "search_no_results",
  SET_SOURCE: "set_source",
};

const SOURCES = {
  DISCOGS: "discogs",
  POPSIKE: "popsike",
  EBAY: "ebay",
};

const initialState = {
  results: [],
  loading: false,
  error: null,
  noResults: false,
  source: SOURCES.DISCOGS,
};

function searchReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SEARCH_START:
      return {
        ...state,
        loading: true,
        error: null,
        noResults: false,
        results: [],
      };
    case ACTIONS.SEARCH_SUCCESS:
      return {
        ...state,
        loading: false,
        results: action.payload,
        noResults: action.payload.length === 0,
      };
    case ACTIONS.SEARCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        noResults: false,
      };
    case ACTIONS.SEARCH_NO_RESULTS:
      return {
        ...state,
        loading: false,
        noResults: true,
        results: [],
      };
    case ACTIONS.SET_SOURCE:
      return {
        ...state,
        source: action.payload,
        results: [],
      };
    default:
      return state;
  }
}

function App() {
  const [query, setQuery] = useState("");
  const [state, dispatch] = useReducer(searchReducer, initialState);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!query.trim() || state.loading) return;

    dispatch({ type: ACTIONS.SEARCH_START });

    try {
      switch (state.source) {
        case SOURCES.DISCOGS:
          await searchDiscogs();
          break;
        case SOURCES.POPSIKE:
          await searchPopsike();
          break;
        case SOURCES.EBAY:
          await searchEbay();
          break;
        default:
          await searchDiscogs();
      }
    } catch (err) {
      dispatch({
        type: ACTIONS.SEARCH_ERROR,
        payload: `Error searching ${state.source}: ${err.message}`,
      });
    }
  }

  async function searchPopsike() {
    try {
      const releases = await getReleasesByTitle();

      if (releases && releases.length > 0) {
        const popsikeResults = releases.map((item) => ({
          ...item,
          source: SOURCES.POPSIKE,
        }));

        dispatch({ type: ACTIONS.SEARCH_SUCCESS, payload: popsikeResults });
      } else {
        dispatch({ type: ACTIONS.SEARCH_NO_RESULTS });
      }
    } catch (err) {
      dispatch({ type: ACTIONS.SEARCH_ERROR, payload: err.message });
    }
  }

  async function searchDiscogs() {
    try {
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
                  source: SOURCES.DISCOGS,
                }
              : null;
          })
        );

        const filteredStats = newStats.filter(Boolean);
        dispatch({ type: ACTIONS.SEARCH_SUCCESS, payload: filteredStats });
      } else {
        dispatch({ type: ACTIONS.SEARCH_NO_RESULTS });
      }
    } catch (err) {
      dispatch({
        type: ACTIONS.SEARCH_ERROR,
        payload: `Error searching Discogs: ${err.message}`,
      });
    }
  }

  async function getReleasesByTitle() {
    console.log(query);
    try {
      const res = await fetch(`/api/${state.source}/search?query=${query}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! Status: ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error("Error fetching releases by title:", err);
      throw err;
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

  function handleSourceChange(source) {
    dispatch({ type: ACTIONS.SET_SOURCE, payload: source });
  }

  return (
    <div className="app-container">
      <SourceChips
        SOURCES={SOURCES}
        state={state}
        handleSourceChange={handleSourceChange}
      />

      {state.loading && <div className="spinner" />}

      {state.error && <p className="error-message">{state.error}</p>}

      {state.noResults && <p className="no-items">No items found</p>}

      {state.results.length > 0 && (
        <List results={state.results} source={state.source} />
      )}

      <SearchBar
        handleSearch={handleSearch}
        query={query}
        setQuery={setQuery}
        loading={state.loading}
      />
    </div>
  );
}

function List({ results, source }) {
  return (
    <ul className="releases-list">
      {results.map((item) => {
        switch (source) {
          case SOURCES.DISCOGS:
            return <DiscogsRelease key={item.id} release={item} />;
          case SOURCES.POPSIKE:
            return <PopsikeRelease key={item.link} release={item} />;
          case SOURCES.EBAY:
            return <DiscogsRelease key={item.id} release={item} />;
          default:
            return <DiscogsRelease key={item.id} release={item} />;
        }
      })}
    </ul>
  );
}

export default App;

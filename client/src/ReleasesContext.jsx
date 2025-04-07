import { createContext, useContext, useState, useEffect, use } from "react";

const discogsApiHeader = {
  Authorization:
    "Discogs key=DLLNCnxDEvwZRUoNqCmq, secret=cfJyPzbXYgiCNzTyQhzCOzLUfZuldcAe",
  "User-Agent": "lp search",
};

const ReleasesContext = createContext();

function ReleasesProvider({ children }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getReleasesByTitle(title) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.discogs.com/database/search?query=${title}&type=release&format=vinyl`,
        { headers: discogsApiHeader }
      );
      const data = await res.json();
      const ids = data.map((release) => release.id);
      setReleases(ids);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <ReleasesContext.Provider value={{ releases, loading, getReleasesByTitle }}>
      {children}
    </ReleasesContext.Provider>
  );
}

function useReleases() {
  const context = useContext(ReleasesContext);
  if (context === undefined)
    throw new Error("ReleasesContext used outside post provider");
  return context;
}

export { ReleasesProvider, useReleases };

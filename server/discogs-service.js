import { Router } from "express";
const router = Router();
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const discogsApiHeader = {
  Authorization: `${process.env.DISCOGS_AUTH}`,
  "User-Agent": "lp search",
};

router.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await fetch(
      `https://api.discogs.com/database/search?query=${encodeURIComponent(
        query
      )}&type=release&format=vinyl`,
      { headers: discogsApiHeader }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const releases = data.results.slice(0, 5).map((release) => ({
      id: release.id,
      thumb: release.thumb,
      title: release.title,
      year: release.year,
      demand: release.community,
      format: release.formats[0],
    }));

    res.json(releases);
  } catch (error) {
    console.error("Error fetching releases by title:", error);
    res.status(500).json({ error: "Failed to fetch releases" });
  }
});

// Get stats by release ID
router.get("/stats/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(
      `https://api.discogs.com/marketplace/stats/${id}?curr_abbr=EUR`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching stats by ID:", error);
    res.status(500).json({ error: "Failed to fetch release stats" });
  }
});

// Get all release stats (releases + detailed stats)
router.get("/release-stats", async (req, res) => {
  const { query } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // First get the releases
    const releasesResponse = await fetch(
      `https://api.discogs.com/database/search?query=${encodeURIComponent(
        query
      )}&type=release&format=vinyl`,
      { headers: discogsApiHeader }
    );

    if (!releasesResponse.ok) {
      throw new Error(`HTTP error! Status: ${releasesResponse.status}`);
    }

    const releasesData = await releasesResponse.json();
    const releases = releasesData.results.slice(0, 5);

    if (releases.length === 0) {
      return res.json({ stats: [], noResults: true });
    }

    // Then get stats for each release
    const stats = await Promise.all(
      releases.map(async (release) => {
        try {
          const statsResponse = await fetch(
            `https://api.discogs.com/releases/${release.id}`,
            { headers: discogsApiHeader }
          );

          if (!statsResponse.ok) {
            return null;
          }

          const statsData = await statsResponse.json();
          return {
            id: release.id,
            thumb: release.thumb,
            title: release.title,
            year: release.year,
            demand: release.community?.want,
            formats: statsData.formats,
            genres: statsData.genres,
            styles: statsData.styles,
            tracklist: statsData.tracklist,
            // Add any other data you need
          };
        } catch (error) {
          console.error(
            `Error fetching stats for release ${release.id}:`,
            error
          );
          return null;
        }
      })
    );

    const filteredStats = stats.filter(Boolean);
    res.json({
      stats: filteredStats,
      noResults: filteredStats.length === 0,
    });
  } catch (error) {
    console.error("Error fetching release stats:", error);
    res.status(500).json({ error: "Failed to fetch release stats" });
  }
});

export default router;

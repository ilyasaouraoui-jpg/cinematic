const axios = require("axios");

const TMDB_BASE = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY;

const tmdb = axios.create({ baseURL: TMDB_BASE, params: { api_key: TMDB_KEY } });

const IMG_BASE = "https://image.tmdb.org/t/p";

const posterUrl = (path) => (path ? `${IMG_BASE}/w500${path}` : "");
const backdropUrl = (path) => (path ? `${IMG_BASE}/original${path}` : "");
const stillUrl = (path) => (path ? `${IMG_BASE}/w300${path}` : "");

const mapMovieResult = (m) => ({
  id: m.id,
  tmdb_id: m.id,
  imdb_id: m.imdb_id || null,
  title: m.title || m.name,
  name: m.title || m.name,
  year: (m.release_date || "").slice(0, 4),
  poster: posterUrl(m.poster_path),
  backdrop: backdropUrl(m.backdrop_path),
  overview: m.overview || "",
  rating: m.vote_average || 0,
  votes: m.vote_count || 0,
  genre_ids: m.genre_ids || [],
  genres: (m.genres || []).map((g) => g.name),
  media_type: m.media_type || "movie",
  popularity: m.popularity || 0,
});

const mapTvResult = (m) => ({
  id: m.id,
  tmdb_id: m.id,
  imdb_id: m.imdb_id || null,
  title: m.name || m.title,
  name: m.name || m.title,
  year: (m.first_air_date || "").slice(0, 4),
  poster: posterUrl(m.poster_path),
  backdrop: backdropUrl(m.backdrop_path),
  overview: m.overview || "",
  rating: m.vote_average || 0,
  votes: m.vote_count || 0,
  genre_ids: m.genre_ids || [],
  genres: (m.genres || []).map((g) => g.name),
  media_type: m.media_type || "tv",
  popularity: m.popularity || 0,
  seasons: m.number_of_seasons || 0,
  episodes_count: m.number_of_episodes || 0,
});

const generateEmbedUrl = (tmdbId, mediaType, season, episode) => {
  if (mediaType === "tv" && season && episode) {
    return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
  }
  return `https://vidsrc.to/embed/movie/${tmdbId}`;
};

const searchMulti = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const { data } = await tmdb.get("/search/multi", { params: { query, language: "en-US" } });
    const results = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => (r.media_type === "movie" ? mapMovieResult(r) : mapTvResult(r)));

    res.json({ results, totalResults: results.length });
  } catch (error) {
    console.error("[SEARCH]", error.message);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

const getDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "movie" } = req.query;

    const endpoint = type === "tv" ? `/tv/${id}` : `/movie/${id}`;
    const { data } = await tmdb.get(endpoint, {
      params: {
        language: "en-US",
        append_to_response: "credits,videos,similar,recommendations,external_ids",
      },
    });

    const cast = (data.credits?.cast || []).slice(0, 10).map((c) => ({
      name: c.name,
      character: c.character,
      profile: posterUrl(c.profile_path),
    }));

    const crew = data.credits?.crew || [];
    const director = crew.find((c) => c.job === "Director")?.name || "";
    const writers = crew.filter((c) => c.department === "Writing").map((w) => w.name);

    const trailer = (data.videos?.results || []).find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || (data.videos?.results || []).find((v) => v.site === "YouTube");

    const title = data.title || data.name;
    const tmdbId = data.id;
    const embedUrl = generateEmbedUrl(tmdbId, type);

    res.json({
      id: data.id,
      tmdb_id: data.id,
      imdb_id: data.external_ids?.imdb_id || null,
      title,
      name: title,
      year: (data.release_date || data.first_air_date || "").slice(0, 4),
      released: data.release_date || data.first_air_date || "",
      rated: data.adult ? "R" : "PG-13",
      runtime: data.runtime ? `${data.runtime} min` : "",
      genres: (data.genres || []).map((g) => g.name),
      genre_ids: (data.genres || []).map((g) => g.id),
      director,
      writers,
      cast,
      plot: data.overview || "",
      language: data.original_language,
      country: (data.production_countries || []).map((c) => c.name).join(", "),
      awards: "",
      poster: posterUrl(data.poster_path),
      backdrop: backdropUrl(data.backdrop_path),
      rating: data.vote_average || 0,
      votes: data.vote_count || 0,
      popularity: data.popularity || 0,
      type,
      seasons: data.number_of_seasons || 0,
      episodes_count: data.number_of_episodes || 0,
      trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      trailer_key: trailer?.key || null,
      embed_url: embedUrl,
      production: (data.production_companies || []).map((c) => c.name).join(", "),
      box_office: data.revenue || 0,
      similar: (data.similar?.results || []).slice(0, 10).map(mapMovieResult),
      recommendations: (data.recommendations?.results || []).slice(0, 10).map(mapMovieResult),
    });
  } catch (error) {
    console.error("[DETAILS]", error.message);
    res.status(500).json({ message: "Failed to fetch details", error: error.message });
  }
};

const getTrending = async (req, res) => {
  try {
    const { time_window = "week" } = req.params;
    const { data } = await tmdb.get(`/trending/all/${time_window}`, {
      params: { language: "en-US" },
    });

    const results = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 40)
      .map((r) => (r.media_type === "movie" ? mapMovieResult(r) : mapTvResult(r)));

    res.json({ results, totalResults: results.length });
  } catch (error) {
    console.error("[TRENDING]", error.message);
    res.status(500).json({ message: "Failed to fetch trending", error: error.message });
  }
};

const getGenres = async (req, res) => {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      tmdb.get("/genre/movie/list", { params: { language: "en-US" } }),
      tmdb.get("/genre/tv/list", { params: { language: "en-US" } }),
    ]);

    const merged = new Map();
    for (const g of [...(movieGenres.data.genres || []), ...(tvGenres.data.genres || [])]) {
      if (!merged.has(g.id)) merged.set(g.id, g.name);
    }

    const genres = Array.from(merged.entries()).map(([id, name]) => ({ id, name }));
    res.json({ genres });
  } catch (error) {
    console.error("[GENRES]", error.message);
    res.status(500).json({ message: "Failed to fetch genres", error: error.message });
  }
};

const getDiscover = async (req, res) => {
  try {
    const { genre, year, sort = "popularity.desc", type = "all" } = req.query;
    console.log(`[DISCOVER] genre=${genre}, year=${year}, sort=${sort}, type=${type}`);

    const discoverType = type === "series" ? "tv" : type === "movie" ? "movie" : null;
    const types = discoverType ? [discoverType] : ["movie", "tv"];

    const allResults = [];

    for (const mediaType of types) {
      const params = {
        language: "en-US",
        sort_by: sort,
        page: 1,
        include_adult: false,
      };

      if (genre) params.with_genres = genre;
      if (year) {
        if (mediaType === "tv") params.first_air_date_year = year;
        else params.year = year;
      }

      try {
        const { data } = await tmdb.get(`/discover/${mediaType}`, { params });
        const items = (data.results || [])
          .filter((r) => r.poster_path)
          .slice(0, 15)
          .map((r) => {
            const mapped = mediaType === "movie" ? mapMovieResult(r) : mapTvResult(r);
            mapped.media_type = mediaType;
            return mapped;
          });
        allResults.push(...items);
      } catch (err) {
        console.error(`[DISCOVER] ${mediaType} error:`, err.message);
      }
    }

    allResults.sort((a, b) => b.popularity - a.popularity);

    res.json({ results: allResults, totalResults: allResults.length });
    console.log(`[DISCOVER] returning ${allResults.length} results`);
  } catch (error) {
    console.error("[DISCOVER]", error.message);
    res.status(500).json({ message: "Failed to discover titles", error: error.message });
  }
};

const getSeasons = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "tv" } = req.query;
    console.log(`[SEASONS] id=${id}, type=${type}`);

    if (type === "movie") {
      return res.json({ seasons: [], totalSeasons: 0 });
    }

    const { data: tvData } = await tmdb.get(`/tv/${id}`, {
      params: { language: "en-US" },
    });

    const totalSeasons = tvData.number_of_seasons || 0;
    const seasonsList = [];

    for (let s = 1; s <= Math.min(totalSeasons, 10); s++) {
      try {
        const { data: seasonData } = await tmdb.get(`/tv/${id}/season/${s}`, {
          params: { language: "en-US" },
        });
        seasonsList.push({
          season: s,
          title: seasonData.name || `Season ${s}`,
          overview: seasonData.overview || "",
          episodes: seasonData.episodes?.length || 0,
          air_date: seasonData.air_date || "",
          episodesList: (seasonData.episodes || []).map((ep) => ({
            id: ep.id,
            Episode: String(ep.episode_number),
            Title: ep.name || `Episode ${ep.episode_number}`,
            Released: ep.air_date || "",
            Overview: ep.overview || "",
            Runtime: ep.runtime || 0,
            Still: stillUrl(ep.still_path),
            imdbRating: ep.vote_average || 0,
            imdbID: `tt${ep.id}`,
          })),
        });
      } catch (err) {
        console.error(`[SEASONS] season ${s} error:`, err.message);
      }
    }

    res.json({
      imdb_id: id,
      title: tvData.name || tvData.title,
      totalSeasons,
      seasons: seasonsList,
    });
  } catch (error) {
    console.error("[SEASONS]", error.message);
    res.status(500).json({ message: "Failed to fetch seasons", error: error.message });
  }
};

const getEpisodeEmbed = async (req, res) => {
  try {
    const { tmdbId, season, episode } = req.params;
    const embedUrl = `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
    res.json({ embed_url: embedUrl, season: Number(season), episode: Number(episode) });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate embed URL", error: error.message });
  }
};

const getSimilar = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "movie" } = req.query;
    console.log(`[SIMILAR] id=${id}, type=${type}`);

    const endpoint = type === "tv" ? `/tv/${id}/similar` : `/movie/${id}/similar`;
    const { data } = await tmdb.get(endpoint, { params: { language: "en-US", page: 1 } });

    const results = (data.results || [])
      .filter((r) => r.poster_path)
      .slice(0, 10)
      .map((r) => (type === "tv" ? mapTvResult(r) : mapMovieResult(r)));

    res.json({ results });
    console.log(`[SIMILAR] returning ${results.length} results for ${id}`);
  } catch (error) {
    console.error("[SIMILAR]", error.message);
    res.status(500).json({ message: "Failed to fetch similar titles", error: error.message });
  }
};

const getPopular = async (req, res) => {
  try {
    const { media_type = "movie" } = req.params;
    const endpoint = media_type === "tv" ? "/tv/popular" : "/movie/popular";
    const { data } = await tmdb.get(endpoint, { params: { language: "en-US", page: 1 } });

    const results = (data.results || [])
      .filter((r) => r.poster_path)
      .map((r) => (media_type === "tv" ? mapTvResult(r) : mapMovieResult(r)));

    res.json({ results, totalResults: results.length });
  } catch (error) {
    console.error("[POPULAR]", error.message);
    res.status(500).json({ message: "Failed to fetch popular", error: error.message });
  }
};

module.exports = {
  getTrending,
  searchMulti,
  getDetails,
  getDiscover,
  getGenres,
  getSeasons,
  getEpisodeEmbed,
  getSimilar,
  getPopular,
};

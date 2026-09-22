import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url || "";
    console.error(`[API] ${url}:`, err?.response?.data?.message || err.message);
    throw err;
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    API.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    API.post("/auth/login", data),
  googleLogin: (credential: string) =>
    API.post("/auth/google", { credential }),
  getMe: () => API.get("/auth/me"),
};

export const tmdbAPI = {
  search: (query: string) => API.get("/tmdb/search", { params: { query } }),
  details: (id: number | string, type = "movie") =>
    API.get(`/tmdb/details/${id}`, { params: { type } }),
  trending: (timeWindow = "week") => API.get(`/tmdb/trending/${timeWindow}`),
  genres: () => API.get("/tmdb/genres"),
  discover: (params: {
    genre?: string;
    year?: string;
    sort?: string;
    type?: string;
  }) => API.get("/tmdb/discover", { params }),
  seasons: (id: number | string, type = "tv") =>
    API.get(`/tmdb/seasons/${id}`, { params: { type } }),
  episodeEmbed: (tmdbId: number | string, season: number, episode: number) =>
    API.get(`/tmdb/embed/${tmdbId}/season/${season}/episode/${episode}`),
  similar: (id: number | string, type = "movie") =>
    API.get(`/tmdb/similar/${id}`, { params: { type } }),
  popular: (mediaType = "movie") => API.get(`/tmdb/popular/${mediaType}`),
};

export const watchlistAPI = {
  get: () => API.get("/watchlist/"),
  add: (item: {
    mediaId: number;
    mediaType: string;
    title: string;
    posterPath: string;
  }) => API.post("/watchlist/", item),
  remove: (mediaType: string, mediaId: number) =>
    API.delete(`/watchlist/${mediaType}/${mediaId}`),
};

export interface TMDBTitle {
  id: number;
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  name: string;
  year: string;
  poster: string;
  backdrop: string;
  overview: string;
  rating: number;
  votes: number;
  genre_ids: number[];
  genres: string[];
  media_type: "movie" | "tv";
  popularity: number;
  seasons?: number;
  episodes_count?: number;
}

export interface TMDBDetails {
  id: number;
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  name: string;
  year: string;
  released: string;
  rated: string;
  runtime: string;
  genres: string[];
  genre_ids: number[];
  director: string;
  writers: string[];
  cast: { name: string; character: string; profile: string }[];
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  backdrop: string;
  rating: number;
  votes: number;
  popularity: number;
  type: string;
  seasons: number;
  episodes_count: number;
  trailer_url: string | null;
  trailer_key: string | null;
  embed_url: string;
  production: string;
  box_office: number;
  similar: TMDBTitle[];
  recommendations: TMDBTitle[];
}

export interface TMDBEpisode {
  id: number;
  Episode: string;
  Title: string;
  Released: string;
  Overview: string;
  Runtime: number;
  Still: string;
  imdbRating: number;
  imdbID: string;
}

export interface TMDBSeason {
  season: number;
  title: string;
  overview: string;
  episodes: number;
  air_date: string;
  episodesList: TMDBEpisode[];
}

export function tmdbToTitle(item: TMDBTitle) {
  return {
    id: String(item.tmdb_id),
    name: item.title || item.name,
    poster: item.poster,
    backdrop: item.backdrop,
    year: parseInt(item.year) || 2024,
    rating: "PG-13",
    score: Math.round(item.rating * 10) / 10,
    genres: item.genres,
    kind: (item.media_type === "tv" ? "series" : "movie") as
      | "movie"
      | "series"
      | "anime",
    synopsis: item.overview,
    media_type: item.media_type,
    seasons: item.seasons,
    badge:
      item.rating > 8
        ? ("S" as const)
        : item.year === String(new Date().getFullYear())
          ? ("NEW" as const)
          : undefined,
  };
}

export default API;

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Plus, Check, Share2, Star, ChevronDown, Loader2, Clock, Tv, X,
} from "lucide-react";
import { tmdbAPI, type TMDBDetails, type TMDBSeason, type TMDBEpisode, type TMDBTitle, tmdbToTitle } from "../api";
import type { Title } from "../data";
import { PosterCard } from "./PosterCard";
import { cn } from "../utils/cn";
import { useWatchlist, type WatchlistItem } from "../context/WatchlistContext";

export function TitlePage({
  onOpen,
}: {
  onPlayEmbed?: (url: string, title: string, season?: number, episode?: number) => void;
  onOpen?: (t: Title) => void;
}) {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { has, toggle } = useWatchlist();

  const [details, setDetails] = useState<TMDBDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<TMDBSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [similarItems, setSimilarItems] = useState<Title[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string | null>(null);

  const mediaType = type === "tv" ? "tv" : "movie";

  const saved = id ? has(id) : false;

  const watchlistItem: WatchlistItem | null = details
    ? {
        id: String(id),
        name: details.title || details.name,
        poster: details.poster,
        backdrop: details.backdrop,
        year: details.year ? parseInt(details.year.slice(0, 4)) : 0,
        rating: details.rated || "PG-13",
        score: details.rating || 0,
        genres: Array.isArray(details.genres) && typeof details.genres[0] === "string"
          ? details.genres as string[]
          : [],
        kind: mediaType === "tv" ? "series" : "movie",
        synopsis: details.plot || "",
        media_type: mediaType,
      }
    : null;

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await tmdbAPI.details(id, mediaType);
      setDetails(data);
    } catch (error) {
      console.error("[TitlePage] Failed to fetch details:", error);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [id, mediaType]);

  const fetchSeasons = useCallback(async () => {
    if (!id || mediaType !== "tv") return;
    setEpisodesLoading(true);
    try {
      const { data } = await tmdbAPI.seasons(id, "tv");
      setSeasons(data.seasons || []);
      if (data.seasons?.length > 0) {
        setSelectedSeason(data.seasons[0].season);
      }
    } catch (error) {
      console.error("[TitlePage] Failed to fetch seasons:", error);
      setSeasons([]);
    } finally {
      setEpisodesLoading(false);
    }
  }, [id, mediaType]);

  const fetchSimilar = useCallback(async () => {
    if (!id) return;
    setSimilarLoading(true);
    try {
      const { data } = await tmdbAPI.similar(id, mediaType);
      if (data.results) {
        const mapped = data.results.map((m: TMDBTitle) => {
          const t = tmdbToTitle(m);
          return {
            id: String(m.tmdb_id),
            name: t.name,
            poster: t.poster,
            backdrop: t.backdrop,
            year: t.year,
            rating: "PG-13",
            score: t.score,
            genres: t.genres,
            kind: t.kind,
            synopsis: t.synopsis,
            media_type: m.media_type,
          } as Title;
        });
        setSimilarItems(mapped);
      }
    } catch (error) {
      console.error("[TitlePage] Failed to fetch similar:", error);
      setSimilarItems([]);
    } finally {
      setSimilarLoading(false);
    }
  }, [id, mediaType]);

  useEffect(() => {
    fetchDetails();
    fetchSeasons();
    fetchSimilar();
  }, [fetchDetails, fetchSeasons, fetchSimilar]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  const currentSeason = seasons.find((s) => s.season === selectedSeason);
  const episodes: TMDBEpisode[] = currentSeason?.episodesList || [];

  const handlePlayEpisode = (ep: TMDBEpisode) => {
    const epNum = parseInt(ep.Episode);
    if (id) {
      const url = `https://vidlink.pro/tv/${id}/${selectedSeason}/${epNum}`;
      setActiveEmbedUrl(url);
      setPlaying(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlayAll = () => {
    if (!details) return;
    if (id) {
      if (mediaType === "tv" && episodes.length > 0) {
        handlePlayEpisode(episodes[0]);
      } else {
        const url = details.embed_url || `https://vidlink.pro/movie/${id}`;
        setActiveEmbedUrl(url);
        setPlaying(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-8 w-8 animate-spin text-neon-400" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 text-white">
        <p className="text-lg">Title not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Go Back</button>
      </div>
    );
  }

  const genres = details.genres || [];

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Hero Banner — order-1: Movie info section (poster, title, synopsis, action buttons) */}
      <div className="relative h-[65vh] min-h-[420px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={details.backdrop || details.poster} alt={details.title} className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 to-transparent" />
        </div>

        {!playing && (
          <button onClick={() => navigate(-1)} className="absolute left-4 top-20 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white md:left-8">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 md:px-12 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="hidden md:block">
              <img src={details.poster} alt={details.title} className="h-[280px] w-[190px] rounded-xl object-cover shadow-2xl ring-1 ring-white/10" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">{details.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
                {details.rated && details.rated !== "N/A" && (
                  <span className="rounded border border-white/20 px-1.5 py-0.5 text-xs font-semibold text-white/85">{details.rated}</span>
                )}
                <span className="font-medium text-white/85">{details.year}</span>
                {details.runtime && (
                  <><span className="text-white/25">&bull;</span><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{details.runtime}</span></>
                )}
                {mediaType === "tv" && details.seasons > 0 && (
                  <><span className="text-white/25">&bull;</span><span className="flex items-center gap-1"><Tv className="h-3.5 w-3.5" />{details.seasons} Season{details.seasons > 1 ? "s" : ""}</span></>
                )}
                {details.rating > 0 && (
                  <><span className="text-white/25">&bull;</span><span className="flex items-center gap-1 text-amber-300"><Star className="h-3.5 w-3.5 fill-amber-300" />{details.rating.toFixed(1)}</span></>
                )}
                {genres.map((g) => (
                  <span key={g} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs">{g}</span>
                ))}
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">{details.plot}</p>
              <div className="mt-6 flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handlePlayAll} className="flex items-center gap-2 rounded-full bg-gradient-to-br from-neon-400 to-neon-600 px-6 py-3 text-sm font-semibold text-white neon-glow">
                  <Play className="h-5 w-5 fill-white" />
                  {playing ? "Replay" : `Play ${mediaType === "tv" ? "S1 E1" : "Now"}`}
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={() => watchlistItem && toggle(watchlistItem)} className={cn("grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md transition-colors", saved ? "border-white/40 bg-white/25 text-white" : "border-white/15 bg-white/[0.08] text-white/80 hover:bg-white/16")}>
                  {saved ? <Check className="h-5 w-5 fill-white" /> : <Plus className="h-5 w-5" />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.08] text-white/80 backdrop-blur-md transition-colors hover:bg-white/16">
                  <Share2 className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Player — order-2: Below movie info, above details */}
      <AnimatePresence>
        {playing && activeEmbedUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden bg-black"
          >
            <div className="mx-auto w-full" style={{ maxWidth: "1200px" }}>
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={activeEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  title={details.title}
                />
              </div>
            </div>
            <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/60 via-transparent to-transparent p-4 md:p-6 pointer-events-none">
              <button onClick={() => navigate(-1)} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white md:left-8">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button onClick={() => { setPlaying(false); setActiveEmbedUrl(null); }} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 md:p-6 pointer-events-none">
              <div className="pointer-events-auto">
                <p className="font-display text-xl text-white md:text-2xl">{details.title}</p>
                {mediaType === "tv" && (
                  <p className="mt-1 text-sm text-neon-300">Season {selectedSeason}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Section — order-3: Cast, metadata, episodes, recommendations */}
      <div className="relative z-10 px-5 pb-16 md:px-12 lg:px-16">
        {/* Cast & Crew */}
        {details.cast.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-white">Cast & Crew</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {details.cast.map((c) => (
                <div key={c.name} className="flex shrink-0 flex-col items-center gap-2">
                  <img src={c.profile || ""} alt={c.name} className="h-20 w-20 rounded-full object-cover ring-1 ring-white/10" />
                  <div className="text-center">
                    <p className="max-w-[100px] truncate text-xs font-medium text-white/85">{c.name}</p>
                    <p className="max-w-[100px] truncate text-[10px] text-white/40">{c.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Metadata Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10 grid grid-cols-2 gap-4 rounded-2xl glass p-5 sm:grid-cols-4">
          {details.director && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Director</p>
              <p className="mt-1 text-sm text-white/85">{details.director}</p>
            </div>
          )}
          {details.cast.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Cast</p>
              <p className="mt-1 text-sm text-white/85">{details.cast.slice(0, 5).map((c) => c.name).join(", ")}</p>
            </div>
          )}
          {details.language && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Language</p>
              <p className="mt-1 text-sm text-white/85">{details.language}</p>
            </div>
          )}
          {details.country && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Country</p>
              <p className="mt-1 text-sm text-white/85">{details.country}</p>
            </div>
          )}
          {details.box_office > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Box Office</p>
              <p className="mt-1 text-sm text-white/85">${(details.box_office / 1_000_000).toFixed(0)}M</p>
            </div>
          )}
          {details.production && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Production</p>
              <p className="mt-1 text-sm text-white/85">{details.production}</p>
            </div>
          )}
        </motion.div>

        {/* Episodes for TV */}
        {mediaType === "tv" && seasons.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Episodes</h2>
              <div className="relative">
                <button onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)} className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/12">
                  Season {selectedSeason}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {seasonDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl glass-dark shadow-2xl">
                      {seasons.map((s) => (
                        <button key={s.season} onClick={() => { setSelectedSeason(s.season); setSeasonDropdownOpen(false); }}
                          className={cn("flex w-full items-center justify-between px-4 py-3 text-sm transition-colors", s.season === selectedSeason ? "bg-neon-500/20 text-neon-300" : "text-white/70 hover:bg-white/[0.06]")}>
                          Season {s.season}
                          <span className="text-white/35">{s.episodes} eps</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {episodesLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-white/40">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Loading episodes...</span>
                </div>
              ) : episodes.length > 0 ? (
                episodes.map((ep) => (
                  <motion.button key={ep.id} whileHover={{ x: 4 }} onClick={() => handlePlayEpisode(ep)}
                    className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-white/[0.05]">
                    {ep.Still && <img src={ep.Still} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />}
                    <span className="w-8 text-center text-lg font-semibold text-white/35">{ep.Episode}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white/90">{ep.Title}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {ep.Released && ep.Released !== "N/A" ? ep.Released : ""}
                        {ep.imdbRating > 0 ? ` · ★ ${ep.imdbRating.toFixed(1)}` : ""}
                        {ep.Runtime > 0 ? ` · ${ep.Runtime}m` : ""}
                      </p>
                      {ep.Overview && <p className="mt-1 line-clamp-2 text-xs text-white/35">{ep.Overview}</p>}
                    </div>
                    <Play className="h-5 w-5 shrink-0 text-white/30" />
                  </motion.button>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-white/35">No episodes available</p>
              )}
            </div>
          </motion.div>
        )}

        {/* You May Like */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="mb-4 text-lg font-semibold text-white">You May Like</h2>
          {similarLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-white/40">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading recommendations...</span>
            </div>
          ) : similarItems.length > 0 ? (
            <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
              {similarItems.map((item, i) => (
                <div key={`${item.id}-${i}`} className="shrink-0">
                  <PosterCard item={item} index={i} onOpen={onOpen || (() => {})} onPlay={() => {}} />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-white/35">No recommendations available</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

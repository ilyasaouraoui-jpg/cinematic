import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play, Plus, Check, Star, ThumbsUp, Share2, ChevronDown, Loader2 } from "lucide-react";
import type { Title } from "../data";
import { tmdbAPI, type TMDBSeason, type TMDBEpisode } from "../api";
import { useWatchlist, type WatchlistItem } from "../context/WatchlistContext";
import { cn } from "../utils/cn";

export function DetailModal({
  item,
  onClose,
  onPlay,
  embedUrl,
  onPlayEpisode,
  onPlayEmbed,
}: {
  item: Title | null;
  onClose: () => void;
  onPlay: () => void;
  embedUrl?: string | null;
  onPlayEpisode?: (season: number, episode: number) => void;
  onPlayEmbed?: (url: string, title?: string, season?: number, episode?: number) => void;
}) {
  const [seasons, setSeasons] = useState<TMDBSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const { has, toggle } = useWatchlist();

  const isSeries = item?.kind === "series";
  const saved = item ? has(item.id) : false;

  const watchlistItem: WatchlistItem | null = item
    ? {
        id: String(item.id),
        name: item.name,
        poster: item.poster,
        backdrop: item.backdrop,
        year: item.year,
        rating: item.rating,
        score: item.score,
        genres: item.genres,
        kind: item.kind,
        synopsis: item.synopsis,
        media_type: (item as any).media_type,
      }
    : null;

  useEffect(() => {
    if (!item || !isSeries) return;
    setEpisodesLoading(true);
    const mediaType = (item as any).media_type || (item.kind === "series" ? "tv" : "movie");
    tmdbAPI
      .seasons(item.id, mediaType)
      .then(({ data }) => {
        setSeasons(data.seasons || []);
        if (data.seasons?.length > 0) {
          setSelectedSeason(data.seasons[0].season);
        }
      })
      .catch(() => setSeasons([]))
      .finally(() => setEpisodesLoading(false));
  }, [item, isSeries]);

  const currentSeason = seasons.find((s) => s.season === selectedSeason);
  const episodes: TMDBEpisode[] = currentSeason?.episodesList || [];

  const handlePlayEpisode = (ep: TMDBEpisode) => {
    const epNum = parseInt(ep.Episode);
    if (onPlayEmbed && item) {
      const url = `https://vidsrc.to/embed/tv/${item.id}/${selectedSeason}/${epNum}`;
      onPlayEmbed(url, `${item.name} - S${selectedSeason}E${epNum}`, selectedSeason, epNum);
    } else if (onPlayEpisode) {
      onPlayEpisode(selectedSeason, epNum);
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] grid place-items-end overflow-y-auto bg-black/80 backdrop-blur-md sm:place-items-center sm:p-6"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-t-[26px] bg-ink-900 ring-1 ring-white/10 sm:rounded-[26px]"
          >
            <div className="relative h-56 sm:h-72">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="h-full w-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  title={item.name}
                />
              ) : (
                <img src={item.poster} alt="" className="h-full w-full object-cover object-top" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white/80 backdrop-blur-md hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">{item.name}</h2>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/60">
                <span className="rounded border border-white/20 px-1.5 text-[10px] font-semibold text-white/85">{item.rating}</span>
                <span className="text-white/85">{item.year}</span>
                {item.seasons && <><span className="text-white/25">&bull;</span><span>{item.seasons} Seasons</span></>}
                <span className="flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-amber-300" />{item.score}</span>
                {item.genres.map((g) => (
                  <span key={g} className="rounded-full border border-white/10 bg-white/5 px-2 py-[2px] text-[10.5px]">{g}</span>
                ))}
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">{item.synopsis}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (isSeries && episodes.length > 0) {
                      handlePlayEpisode(episodes[0]);
                    } else if (onPlayEmbed && embedUrl) {
                      onPlayEmbed(embedUrl, item.name);
                    } else {
                      onPlay();
                    }
                  }}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-br from-neon-400 to-neon-600 px-5 py-2.5 text-[13px] font-semibold text-white neon-glow"
                >
                  <Play className="h-4 w-4 fill-white" /> Play
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => watchlistItem && toggle(watchlistItem)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border backdrop-blur-md transition-colors",
                    saved
                      ? "border-white/40 bg-white/25 text-white"
                      : "border-white/12 bg-white/[0.06] text-white/80 hover:bg-white/12"
                  )}
                >
                  {saved ? <Check className="h-[17px] w-[17px] fill-white" /> : <Plus className="h-[17px] w-[17px]" />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white/80 hover:bg-white/12">
                  <ThumbsUp className="h-[17px] w-[17px]" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white/80 hover:bg-white/12">
                  <Share2 className="h-[17px] w-[17px]" />
                </motion.button>
              </div>

              {isSeries && seasons.length > 0 && (
                <>
                  <div className="mt-7 flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-white/85">Episodes</h3>
                    <div className="relative">
                      <button
                        onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/80 transition hover:bg-white/12"
                      >
                        Season {selectedSeason}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <AnimatePresence>
                        {seasonDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl glass-dark shadow-2xl"
                          >
                            {seasons.map((s) => (
                              <button
                                key={s.season}
                                onClick={() => {
                                  setSelectedSeason(s.season);
                                  setSeasonDropdownOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-[12px] transition-colors ${
                                  s.season === selectedSeason
                                    ? "bg-neon-500/20 text-neon-300"
                                    : "text-white/70 hover:bg-white/[0.06]"
                                }`}
                              >
                                Season {s.season}
                                <span className="text-white/35">{s.episodes} eps</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {episodesLoading ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-white/40">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-[12px]">Loading episodes...</span>
                      </div>
                    ) : episodes.length > 0 ? (
                      episodes.map((ep) => (
                        <motion.button
                          key={ep.imdbID}
                          whileHover={{ x: 4 }}
                          onClick={() => handlePlayEpisode(ep)}
                          className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-white/[0.05]"
                        >
                          <span className="w-6 text-center text-[13px] font-semibold text-white/35">{ep.Episode}</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[12.5px] font-medium text-white/90">{ep.Title}</p>
                            <p className="mt-0.5 text-[11px] text-white/40">
                              {ep.Released} {ep.imdbRating > 0 ? `· ★ ${ep.imdbRating}` : ""}
                            </p>
                          </div>
                          <Play className="h-4 w-4 shrink-0 text-white/30" />
                        </motion.button>
                      ))
                    ) : (
                      <p className="py-4 text-center text-[12px] text-white/35">No episodes available</p>
                    )}
                  </div>
                </>
              )}

              {!isSeries && !episodesLoading && (
                <></>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

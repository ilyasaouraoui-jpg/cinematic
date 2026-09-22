import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Loader2 } from "lucide-react";
import { tmdbAPI, type TMDBTitle, tmdbToTitle } from "../api";
import type { Title } from "../data";
import { PosterCard } from "./PosterCard";
import { cn } from "../utils/cn";

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animation" },
  { id: 12, name: "Adventure" },
  { id: 10749, name: "Romance" },
  { id: 9648, name: "Mystery" },
  { id: 80, name: "Crime" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 10751, name: "Family" },
  { id: 10402, name: "Music" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

const sortOptions = [
  { id: "popularity.desc", label: "Most Popular" },
  { id: "primary_release_date.desc", label: "Latest" },
  { id: "vote_average.desc", label: "Top Rated" },
  { id: "revenue.desc", label: "Revenue" },
];

const typeOptions = [
  { id: "all", label: "All" },
  { id: "movie", label: "Movies" },
  { id: "series", label: "Series" },
];

export function AdvancedBrowsePage({
  onOpen,
  onPlay,
}: {
  onOpen: (t: Title) => void;
  onPlay: () => void;
}) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState("popularity.desc");
  const [selectedType, setSelectedType] = useState("all");
  const [hideFilters, setHideFilters] = useState(false);
  const [items, setItems] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        genre?: string;
        year?: string;
        sort?: string;
        type?: string;
      } = {};
      if (selectedGenre) params.genre = String(selectedGenre);
      if (selectedYear) params.year = selectedYear;
      params.sort = selectedSort;
      if (selectedType !== "all") params.type = selectedType;

      console.log("[Browse] Fetching discover with params:", params);
      const { data } = await tmdbAPI.discover(params);
      console.log("[Browse] Got", data.results?.length, "results");

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
          };
        });
        setItems(mapped);
      }
    } catch (error) {
      console.error("[Browse] Failed to fetch discover results:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, selectedYear, selectedSort, selectedType]);

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  const hasFilters =
    selectedGenre !== null ||
    selectedYear !== null ||
    selectedSort !== "popularity.desc" ||
    selectedType !== "all";

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedYear(null);
    setSelectedSort("popularity.desc");
    setSelectedType("all");
  };

  return (
    <div className="min-h-screen bg-ink-950 px-5 pb-16 pt-24 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-white md:text-4xl">
              Browse
            </h1>
            <p className="mt-1.5 text-sm text-white/45">
              {items.length} titles &middot; updated hourly
            </p>
          </div>
          <button
            onClick={() => setHideFilters(!hideFilters)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              hideFilters
                ? "border-red-500/50 bg-red-500/20 text-red-300"
                : "border-white/15 bg-white/[0.06] text-white/70 hover:bg-white/12"
            )}
          >
            {hideFilters ? (
              <>
                <X className="h-4 w-4" /> Show Filters
              </>
            ) : (
              <>
                <Filter className="h-4 w-4" /> Hide Filter
              </>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {!hideFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Genre
                </p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      onClick={() =>
                        setSelectedGenre(
                          selectedGenre === g.id ? null : g.id
                        )
                      }
                      className={cn(
                        "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        selectedGenre === g.id
                          ? "text-white"
                          : "text-white/50 hover:text-white/85"
                      )}
                    >
                      {selectedGenre === g.id && (
                        <motion.span
                          layoutId="genre-pill"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-500/45 to-neon-600/20 ring-1 ring-neon-400/40"
                        />
                      )}
                      <span className="relative">{g.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Type
                  </p>
                  <div className="flex gap-2">
                    {typeOptions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={cn(
                          "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          selectedType === t.id
                            ? "text-white"
                            : "text-white/50 hover:text-white/85"
                        )}
                      >
                        {selectedType === t.id && (
                          <motion.span
                            layoutId="type-pill"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-500/45 to-neon-600/20 ring-1 ring-neon-400/40"
                          />
                        )}
                        <span className="relative">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Year
                  </p>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setYearDropdownOpen(!yearDropdownOpen)
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        selectedYear
                          ? "text-white"
                          : "text-white/50 hover:text-white/85"
                      )}
                    >
                      {selectedYear || "All Years"}
                      <motion.span
                        animate={{
                          rotate: yearDropdownOpen ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg
                          viewBox="0 0 12 12"
                          className="h-3 w-3"
                          fill="currentColor"
                        >
                          <path d="M2 4l4 4 4-4" />
                        </svg>
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {yearDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute left-0 top-full z-50 mt-1 max-h-60 w-32 overflow-y-auto rounded-xl glass-dark shadow-2xl"
                        >
                          <button
                            onClick={() => {
                              setSelectedYear(null);
                              setYearDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center px-3 py-2 text-sm transition-colors",
                              !selectedYear
                                ? "bg-neon-500/20 text-neon-300"
                                : "text-white/70 hover:bg-white/[0.06]"
                            )}
                          >
                            All Years
                          </button>
                          {years.map((y) => (
                            <button
                              key={y}
                              onClick={() => {
                                setSelectedYear(y);
                                setYearDropdownOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center px-3 py-2 text-sm transition-colors",
                                selectedYear === y
                                  ? "bg-neon-500/20 text-neon-300"
                                  : "text-white/70 hover:bg-white/[0.06]"
                              )}
                            >
                              {y}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Sort
                  </p>
                  <div className="flex gap-2">
                    {sortOptions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSort(s.id)}
                        className={cn(
                          "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          selectedSort === s.id
                            ? "text-white"
                            : "text-white/50 hover:text-white/85"
                        )}
                      >
                        {selectedSort === s.id && (
                          <motion.span
                            layoutId="sort-pill"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-500/45 to-neon-600/20 ring-1 ring-neon-400/40"
                          />
                        )}
                        <span className="relative">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/40">Active:</span>
                  {selectedGenre && (
                    <span className="flex items-center gap-1 rounded-full border border-neon-400/30 bg-neon-500/15 px-2.5 py-1 text-xs text-neon-300">
                      {genres.find((g) => g.id === selectedGenre)?.name}
                      <button
                        onClick={() => setSelectedGenre(null)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedYear && (
                    <span className="flex items-center gap-1 rounded-full border border-neon-400/30 bg-neon-500/15 px-2.5 py-1 text-xs text-neon-300">
                      {selectedYear}
                      <button
                        onClick={() => setSelectedYear(null)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedType !== "all" && (
                    <span className="flex items-center gap-1 rounded-full border border-neon-400/30 bg-neon-500/15 px-2.5 py-1 text-xs text-neon-300">
                      {
                        typeOptions.find(
                          (t) => t.id === selectedType
                        )?.label
                      }
                      <button
                        onClick={() => setSelectedType("all")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-xs text-white/50 hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-white/40">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading titles...</span>
          </div>
        ) : items.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          >
            {items.map((it, i) => (
              <div
                key={`${it.id}-${i}`}
                className="[&>article]:w-full"
              >
                <PosterCard
                  item={it}
                  index={i}
                  onOpen={onOpen}
                  onPlay={onPlay}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-white/40">
              No titles found matching your filters
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-neon-300 hover:text-neon-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

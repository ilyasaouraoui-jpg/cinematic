import { motion } from "framer-motion";
import { Play, Plus, Check, Star } from "lucide-react";
import type { Title } from "../data";
import { cn } from "../utils/cn";
import { useWatchlist, type WatchlistItem } from "../context/WatchlistContext";

const badgeStyles: Record<string, string> = {
  S: "bg-gradient-to-br from-neon-400 to-neon-600 text-white",
  ORIGINAL: "bg-gradient-to-br from-neon-400 to-neon-600 text-white",
  NEW: "bg-emerald-500 text-white",
  "4K": "bg-white/15 text-white backdrop-blur-md border border-white/20",
};

export function PosterCard({
  item,
  onOpen,
  onPlay,
  index = 0,
  progress,
}: {
  item: Title;
  onOpen: (t: Title) => void;
  onPlay: () => void;
  index?: number;
  progress?: number;
}) {
  const { has, toggle } = useWatchlist();
  const saved = has(item.id);

  const watchlistItem: WatchlistItem = {
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
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.35) }}
      whileHover={{ scale: 1.06, y: -8 }}
      onClick={() => onOpen(item)}
      className="group relative w-[136px] shrink-0 cursor-pointer sm:w-[158px] lg:w-[176px]"
      style={{ transformOrigin: "center bottom" }}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[14px] bg-ink-800 ring-1 ring-white/[0.07] transition-shadow duration-300 group-hover:shadow-[0_22px_50px_-14px_rgba(124,77,255,0.55)] group-hover:ring-neon-400/50">
        <img
          src={item.poster}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80" />

        {item.badge && (
          <span
            className={cn(
              "absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-[7px] px-1.5 text-[9.5px] font-extrabold tracking-wide shadow-lg",
              badgeStyles[item.badge]
            )}
          >
            {item.badge}
          </span>
        )}

        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-[2px] text-[9.5px] font-semibold text-amber-300 backdrop-blur-md">
          <Star className="h-2.5 w-2.5 fill-amber-300" />
          {item.score}
        </div>

        {/* hover actions */}
        <div className="absolute inset-x-0 bottom-0 translate-y-3 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="grid h-8 w-8 place-items-center rounded-full bg-white text-black transition-transform hover:scale-110"
            >
              <Play className="h-[13px] w-[13px] fill-black" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle(watchlistItem);
              }}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-all hover:scale-110",
                saved
                  ? "border-white/40 bg-white/25 text-white"
                  : "border-white/25 bg-black/50 text-white"
              )}
            >
              {saved ? (
                <Check className="h-[14px] w-[14px] fill-white" />
              ) : (
                <Plus className="h-[14px] w-[14px]" />
              )}
            </button>
            <span className="ml-auto rounded border border-white/25 px-1 text-[8.5px] font-semibold text-white/80">
              {item.rating}
            </span>
          </div>
        </div>

        {typeof progress === "number" && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15 group-hover:opacity-0">
            <div className="h-full bg-neon-400" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="truncate text-[12.5px] font-semibold text-white/90">{item.name}</h3>
        <p className="mt-0.5 truncate text-[10.5px] text-white/40">
          {item.year} • {item.genres.slice(0, 2).join(" · ")}
        </p>
      </div>
    </motion.article>
  );
}

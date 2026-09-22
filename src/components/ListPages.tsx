import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Crown,
  Zap,
  Plus,
  Sparkles,
  CheckCheck,
  ChevronRight,
  Bookmark,
  BookmarkPlus,
} from "lucide-react";
import {
  myList,
  trending,
  initialAlerts,
  type Title,
  type Alert,
} from "../data";
import { PosterCard } from "./PosterCard";
import { cn } from "../utils/cn";
import { useWatchlist } from "../context/WatchlistContext";

/* ---------------- shared header shell ---------------- */
function PageHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-end justify-between"
    >
      <div>
        <h1 className="font-display text-3xl text-white md:text-[40px]">{title}</h1>
        <p className="mt-1.5 text-[13px] text-white/45">{sub}</p>
      </div>
      {right}
    </motion.div>
  );
}

/* ================= MY LIST ================= */
export function MyListPage({
  onOpen,
  onPlay,
}: {
  onOpen: (t: Title) => void;
  onPlay: () => void;
}) {
  const [sort, setSort] = useState("recent");
  const { items } = useWatchlist();

  const displayItems = items;
  const sortedItems = sort === "az"
    ? [...displayItems].sort((a, b) => a.name.localeCompare(b.name))
    : [...displayItems].reverse();

  return (
    <div className="px-5 pb-16 pt-24 md:px-12 lg:px-16">
      <PageHead
        title="My List"
        sub={`${displayItems.length} title${displayItems.length !== 1 ? "s" : ""} saved for later`}
        right={
          displayItems.length > 0 ? (
            <div className="hidden items-center gap-2 sm:flex">
              {["recent", "az"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                    sort === s
                      ? "bg-gradient-to-br from-neon-500/45 to-neon-600/20 text-white ring-1 ring-neon-400/40"
                      : "border border-white/10 text-white/50 hover:text-white/85"
                  )}
                >
                  {s === "recent" ? "Recent" : "A–Z"}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />

      {displayItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/10">
            <BookmarkPlus className="h-12 w-12 text-white/20" />
          </div>
          <h2 className="font-display text-2xl text-white/80">Your list is empty</h2>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/40">
            Start adding movies and shows! Tap the + button on any title to save it here.
          </p>
          <button
            onClick={() => onOpen({ id: "1", name: "Browse", poster: "", year: 2024, rating: "PG-13", score: 0, genres: [], kind: "movie", synopsis: "" })}
            className="mt-6 rounded-full bg-neon-600 px-6 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-neon-600/20 transition hover:bg-neon-500"
          >
            Browse Titles
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sortedItems.map((it, i) => (
            <div key={`${it.id}-${i}`} className="[&>article]:w-full">
              <PosterCard item={it} index={i} onOpen={onOpen} onPlay={onPlay} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= TRENDING ================= */
export function TrendingPage({ onOpen, onPlay, trendingItems = [] }: { onOpen: (t: Title) => void; onPlay: () => void; trendingItems?: Title[] }) {
  const trendingData = trendingItems.length > 0
    ? trendingItems.map((item, i) => ({ item, delta: i < 3 ? (i === 0 ? 2 : 1) : (i < 7 ? -1 : 0) as number | "new" }))
    : trending;
  return (
    <div className="px-5 pb-16 pt-24 md:px-12 lg:px-16">
      <PageHead
        title="Trending"
        sub="Top 10 in your region this week · rated by slothui viewers"
        right={
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[11.5px] font-medium text-white/60 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Updated hourly
          </span>
        }
      />

      <div className="mt-7 grid gap-2.5 lg:grid-cols-2">
        {trendingData.map(({ item, delta }, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
            whileHover={{ scale: 1.015, x: 4 }}
            onClick={() => onOpen(item)}
            className="group flex items-center gap-4 rounded-2xl glass p-3 text-left transition-shadow hover:shadow-[0_16px_50px_-16px_rgba(124,77,255,0.4)]"
          >
            <span className="w-12 shrink-0 select-none text-center font-display text-[42px] leading-none text-white/15 transition-colors group-hover:text-neon-400/60">
              {i + 1}
            </span>
            <img
              src={item.poster}
              alt={item.name}
              loading="lazy"
              className="h-[76px] w-[52px] shrink-0 rounded-xl object-cover ring-1 ring-white/10"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-[14px] font-semibold text-white/95">{item.name}</span>
                {delta === "new" && (
                  <span className="shrink-0 rounded bg-gradient-to-br from-neon-400 to-neon-600 px-1.5 py-[1px] text-[8.5px] font-extrabold tracking-wide text-white">
                    NEW
                  </span>
                )}
              </span>
              <span className="mt-1 flex items-center gap-2 text-[11.5px] text-white/40">
                <span>{item.year}</span>
                <span className="text-white/20">·</span>
                <span className="truncate">{item.genres.slice(0, 2).join(" · ")}</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-300" />
              {item.score}
            </span>
            <span
              className={cn(
                "flex w-11 shrink-0 items-center justify-center gap-0.5 rounded-full px-1.5 py-1 text-[10.5px] font-bold",
                delta === "new"
                  ? "bg-neon-500/20 text-neon-300"
                  : delta > 0
                    ? "bg-emerald-500/15 text-emerald-300"
                    : delta < 0
                      ? "bg-rose-500/15 text-rose-300"
                      : "bg-white/[0.06] text-white/35"
              )}
            >
              {delta === "new" ? (
                "NEW"
              ) : delta > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" /> {delta}
                </>
              ) : delta < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3" /> {Math.abs(delta)}
                </>
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white/95 md:text-[17px]">Keep watching what's hot</h2>
        <button
          onClick={onPlay}
          className="flex items-center gap-1.5 text-[12px] font-medium text-white/45 transition-colors hover:text-neon-300"
        >
          Play #1 now <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="no-scrollbar mask-fade-r mt-4 flex gap-3.5 overflow-x-auto pb-6">
        {trendingData.slice(0, 8).map(({ item }, i) => (
          <div key={item.id} className="[&>article]:w-full">
            <PosterCard item={item} index={i} onOpen={onOpen} onPlay={onPlay} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ALERTS ================= */
const kindStyle: Record<Alert["kind"], { icon: typeof Bell; cls: string }> = {
  episode: { icon: Play, cls: "from-neon-400 to-neon-600" },
  season: { icon: Crown, cls: "from-amber-400 to-rose-500" },
  trend: { icon: Zap, cls: "from-emerald-400 to-teal-500" },
  match: { icon: Plus, cls: "from-aqua-400 to-neon-500" },
  quality: { icon: Sparkles, cls: "from-slate-300 to-slate-500" },
};

export function AlertsPage({ onOpen }: { onOpen: (t: Title) => void }) {
  const alerts = initialAlerts;
  const [read, setRead] = useState<Record<string, boolean>>({});
  const unreadCount = alerts.filter((a) => a.unread && !read[a.id]).length;

  const markAll = () =>
    setRead(Object.fromEntries(alerts.map((a) => [a.id, true])));

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-24 md:px-8">
      <PageHead
        title="Alerts"
        sub={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        right={
          <button
            onClick={markAll}
            className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-[12px] font-medium text-white/75 transition hover:bg-white/12 hover:text-white"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        }
      />

      <div className="mt-7 space-y-2.5">
        {alerts.map((a, i) => {
          const isRead = read[a.id] || !a.unread;
          const K = kindStyle[a.kind];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setRead((r) => ({ ...r, [a.id]: true }))}
              className={cn(
                "group flex cursor-pointer items-center gap-4 rounded-2xl p-3.5 ring-1 transition-all",
                isRead
                  ? "bg-white/[0.025] ring-white/[0.06] hover:bg-white/[0.05]"
                  : "bg-white/[0.06] ring-neon-400/25 hover:ring-neon-400/50"
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                  K.cls
                )}
              >
                <K.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-white/95">
                  {a.title}
                  {a.unread && !isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_8px_rgba(154,123,255,0.9)]" />
                  )}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-white/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const found = myList.find((m) => m.name === a.show) || trending.find((t) => t.item.name === a.show)?.item;
                      if (found) onOpen(found);
                    }}
                    className="font-medium text-white/70 underline decoration-neon-400/40 underline-offset-2 transition-colors hover:text-neon-300"
                  >
                    {a.show}
                  </button>{" "}
                  — {a.desc}
                </p>
              </div>
              <img src={a.poster} alt="" loading="lazy" className="hidden h-[62px] w-[44px] shrink-0 rounded-lg object-cover ring-1 ring-white/10 sm:block" />
              <span className="w-12 shrink-0 text-right text-[10.5px] text-white/35">{a.time}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
        <p className="flex items-center gap-2 text-[12px] text-white/45">
          <Bookmark className="h-4 w-4" />
          Manage notification preferences in Settings
        </p>
      </div>
    </div>
  );
}

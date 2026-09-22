import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  X,
  Play,
  ChevronRight,
  Bookmark,
  TrendingUp,
  Bell,
  Settings as SettingsIcon,
  CreditCard,
  MonitorPlay,
  Shield,
  Globe,
  Smartphone,
  User,
  Baby,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { library, rows, type Title } from "../data";
import { PosterCard } from "./PosterCard";
import { cn } from "../utils/cn";
import { tmdbAPI, type TMDBTitle, tmdbToTitle } from "../api";
import { loadProfiles } from "../lib/profiles";

const Shell = ({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) => (
  <div className="px-5 pb-16 pt-24 md:px-12 md:pt-24 lg:px-16">
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="font-display text-3xl text-white md:text-[40px]">{title}</h1>
      <p className="mt-1.5 text-[13px] text-white/45">{sub}</p>
    </motion.div>
    <div className="mt-8">{children}</div>
  </div>
);

const filters = ["All", "Anime", "Movies", "Series", "Originals", "4K"];

export function BrowsePage({ onOpen, onPlay }: { onOpen: (t: Title) => void; onPlay: () => void }) {
  const [f, setF] = useState("All");
  const items = useMemo(() => {
    if (f === "All") return library;
    if (f === "Originals") return library.filter((i) => i.badge === "ORIGINAL" || i.badge === "S");
    if (f === "4K") return library.filter((i) => i.badge === "4K");
    const map: Record<string, Title["kind"]> = { Anime: "anime", Movies: "movie", Series: "series" };
    return library.filter((i) => i.kind === map[f]);
  }, [f]);

  return (
    <Shell title="Browse" sub={`${items.length} titles in your region · updated hourly`}>
      <div className="no-scrollbar -mx-1 mb-7 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
              f === x ? "text-white" : "text-white/50 hover:text-white/85"
            )}
          >
            {f === x && (
              <motion.span layoutId="browse-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-500/45 to-neon-600/20 ring-1 ring-neon-400/40" />
            )}
            <span className="relative">{x}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((it, i) => (
          <div key={it.id} className="[&>article]:w-full">
            <PosterCard item={it} index={i} onOpen={onOpen} onPlay={onPlay} />
          </div>
        ))}
      </motion.div>
    </Shell>
  );
}

export function SearchPage({
  onOpen,
  onPlay,
  initial = "",
  onSearchResults,
}: {
  onOpen: (t: Title) => void;
  onPlay: () => void;
  initial?: string;
  onSearchResults?: (results: Title[]) => void;
}) {
  const [q, setQ] = useState(initial);
  const [apiResults, setApiResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setApiResults([]); return; }
    setLoading(true);
    try {
      const { data } = await tmdbAPI.search(query);
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
        setApiResults(mapped);
        onSearchResults?.(mapped);
      }
    } catch (err) {
      console.error("[Search] Failed:", err);
      setApiResults([]);
    } finally {
      setLoading(false);
    }
  }, [onSearchResults]);

  useEffect(() => {
    const t = setTimeout(() => { if (q.trim()) doSearch(q); }, 400);
    return () => clearTimeout(t);
  }, [q, doSearch]);

  const localResults = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return library.filter(
      (i) => i.name.toLowerCase().includes(s) || i.genres.some((g) => g.toLowerCase().includes(s))
    );
  }, [q]);

  const results = apiResults.length > 0 ? apiResults : localResults;

  return (
    <Shell title="Search" sub="Find movies, anime, originals and more">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 transition-all focus-within:border-neon-400/55 focus-within:shadow-[0_0_0_4px_rgba(124,77,255,0.12)]">
        <SearchIcon className="h-[18px] w-[18px] text-white/35" strokeWidth={1.7} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Titles, genres, people..."
          className="w-full bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!q && (
        <>
          <p className="mb-3 mt-8 text-[13px] font-semibold text-white/80">Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {["Demonic Slash", "Cyberpunk", "Fantasy", "Mecha", "Anime", "4K HDR", "Houses & Dragons"].map((t) => (
              <button key={t} onClick={() => setQ(t)}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[12px] text-white/65 transition hover:border-neon-400/40 hover:text-white">
                {t}
              </button>
            ))}
          </div>
          <p className="mb-4 mt-9 text-[13px] font-semibold text-white/80">Top 10 today</p>
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
            {library.slice(0, 6).map((it, i) => (
              <div key={it.id} className="[&>article]:w-full">
                <PosterCard item={it} index={i} onOpen={onOpen} onPlay={onPlay} />
              </div>
            ))}
          </div>
        </>
      )}

      {q && (
        <>
          <p className="mb-4 mt-7 text-[12.5px] text-white/45">
            {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} for "${q}"`}
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.map((it, i) => (
                <div key={it.id} className="[&>article]:w-full">
                  <PosterCard item={it} index={i} onOpen={onOpen} onPlay={onPlay} />
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchIcon className="mb-4 h-12 w-12 text-white/15" />
              <p className="text-[15px] font-medium text-white/55">No results found</p>
              <p className="mt-1 text-[13px] text-white/35">Try a different search term</p>
            </div>
          ) : null}
        </>
      )}
    </Shell>
  );
}

export function ProfilePage({
  onOpen,
  onPlay,
  onLogout,
  user,
}: {
  onOpen: (t: Title) => void;
  onPlay: () => void;
  onLogout?: () => void;
  user?: { name: string; email: string } | null;
}) {
  const navigate = useNavigate();
  const quick: { path: string; icon: typeof Bell; label: string; sub: string }[] = [
    { path: "/mylist", icon: Bookmark, label: "My List", sub: "8 titles" },
    { path: "/trending", icon: TrendingUp, label: "Trending", sub: "Top 10 this week" },
    { path: "/alerts", icon: Bell, label: "Alerts", sub: "2 unread" },
    { path: "/settings", icon: SettingsIcon, label: "Settings", sub: "Playback & more" },
  ];
  const profiles = [
    { n: "Amir", c: "from-amber-400 to-rose-500" },
    { n: "Layla", c: "from-neon-400 to-aqua-400" },
    { n: "Kids", c: "from-emerald-400 to-teal-500" },
    { n: "Guest", c: "from-slate-400 to-slate-600" },
  ];
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@cinematic.com";
  return (
    <Shell title="Your Profile" sub={`${displayName} · Premium Ultra plan`}>
      <div className="flex flex-col gap-6 rounded-[26px] glass p-6 sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-neon-600 text-[22px] font-bold text-white ring-2 ring-white/20">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{displayName}</h2>
          <p className="text-[13px] text-white/45">{displayEmail}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-gradient-to-br from-neon-400 to-neon-600 px-3 py-1 font-semibold text-white">Premium Ultra</span>
            <span className="rounded-full border border-white/12 px-3 py-1 text-white/70">4 screens · 4K HDR</span>
            <span className="rounded-full border border-white/12 px-3 py-1 text-white/70">Renews Apr 12</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5 text-center sm:gap-7">
          {[["248", "Watched"], ["31", "My List"], ["4.9", "Avg ★"]].map(([a, b]) => (
            <div key={b}>
              <p className="font-display text-2xl text-white">{a}</p>
              <p className="text-[10.5px] uppercase tracking-wider text-white/40">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quick.map((qk) => (
          <motion.button
            key={qk.path}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(qk.path)}
            className="flex items-center gap-3 rounded-2xl glass p-3.5 text-left transition-shadow hover:shadow-[0_16px_40px_-14px_rgba(124,77,255,0.45)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-400/30 to-neon-600/15 text-neon-300 ring-1 ring-neon-400/30">
              <qk.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-white/95">{qk.label}</span>
              <span className="block text-[10.5px] text-white/40">{qk.sub}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/25" />
          </motion.button>
        ))}
      </div>

      <p className="mb-3.5 mt-9 text-[13px] font-semibold text-white/80">Who's watching?</p>
      <div className="flex flex-wrap gap-5">
        {profiles.map((p) => (
          <motion.button key={p.n} whileHover={{ y: -6, scale: 1.05 }} className="flex flex-col items-center gap-2">
            <span className={cn("grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white ring-1 ring-white/20 sm:h-20 sm:w-20", p.c)}>
              {p.n[0]}
            </span>
            <span className="text-[12px] text-white/60">{p.n}</span>
          </motion.button>
        ))}
      </div>

      <p className="mb-4 mt-10 text-[13px] font-semibold text-white/80">My List</p>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
        {rows[1].items.slice(0, 6).map((it, i) => (
          <div key={it.id + i} className="[&>article]:w-full">
            <PosterCard item={it} index={i} onOpen={onOpen} onPlay={onPlay} />
          </div>
        ))}
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="mt-10 rounded-full border border-white/12 bg-white/[0.05] px-5 py-2.5 text-[13px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      )}
    </Shell>
  );
}

export function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    autoplay: true,
    previews: true,
    data: false,
    dolby: true,
    mature: false,
    downloads: true,
    kids_lock: false,
  });

  const profiles = loadProfiles();

  const membershipSections = [
    {
      title: "Membership & Billing",
      icon: CreditCard,
      items: [
        { label: "Plan", value: "Premium Ultra", action: "Manage" },
        { label: "Payment method", value: "Visa •••• 4242", action: "Update" },
        { label: "Billing date", value: "April 12, 2026", action: null },
        { label: "Next payment", value: "$19.99/mo", action: null },
      ],
    },
    {
      title: "Plan Details",
      icon: MonitorPlay,
      items: [
        { label: "Video quality", value: "4K Ultra HD + HDR", action: null },
        { label: "Spatial audio", value: "Dolby Atmos", action: null },
        { label: "Supported devices", value: "4 simultaneous", action: null },
        { label: "Download devices", value: "6 devices", action: null },
      ],
    },
  ];

  const playbackToggles = [
    { k: "autoplay", label: "Autoplay next episode", desc: "Continue watching automatically" },
    { k: "previews", label: "Autoplay previews", desc: "Play trailers while browsing" },
    { k: "dolby", label: "Dolby Vision & Atmos", desc: "Use highest available quality" },
    { k: "downloads", label: "Smart downloads", desc: "Download next episode on Wi-Fi" },
  ];

  const profileControlToggles = [
    { k: "kids_lock", label: "Kids profile lock", desc: "Require PIN to switch out of Kids profiles" },
    { k: "mature", label: "Mature content lock", desc: "Require PIN for TV-MA titles" },
  ];

  const languageItems = [
    { label: "Display language", value: "English" },
    { label: "Default subtitles", value: "Arabic" },
    { label: "Subtitle appearance", value: "Medium · Drop shadow" },
  ];

  return (
    <div className="px-5 pb-16 pt-24 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl text-white md:text-[40px]">Account</h1>
        <p className="mt-1.5 text-[13px] text-white/45">
          Manage your membership, plan, and profile settings
        </p>
      </motion.div>

      <div className="mx-auto mt-8 max-w-3xl space-y-10">
        {/* Membership & Billing */}
        {membershipSections.map((section, si) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1, duration: 0.5 }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon-500/15 text-neon-400">
                <section.icon className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-semibold text-white/90">{section.title}</h2>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.07]">
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    i < section.items.length - 1 && "border-b border-white/[0.06]"
                  )}
                >
                  <div>
                    <p className="text-[13.5px] text-white/70">{item.label}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-white/90">{item.value}</p>
                  </div>
                  {item.action && (
                    <button className="text-[12.5px] font-medium text-neon-400 transition-colors hover:text-neon-300">
                      {item.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* Profile & Parental Controls */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon-500/15 text-neon-400">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="text-[14px] font-semibold text-white/90">Profile & Parental Controls</h2>
          </div>

          {/* Profile grid */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.07]">
            <div className="p-5">
              <p className="mb-4 text-[12px] text-white/40">
                {profiles.length} profile{profiles.length !== 1 ? "s" : ""} on this account
              </p>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {profiles.map((p) => (
                  <div key={p.id} className="group relative">
                    <div
                      className={`aspect-square rounded-xl bg-gradient-to-br ${p.avatarColor} flex items-center justify-center transition-all group-hover:ring-2 group-hover:ring-white/40`}
                    >
                      {p.isKids ? (
                        <Baby className="h-8 w-8 text-white/85" />
                      ) : (
                        <User className="h-8 w-8 text-white/85" />
                      )}
                    </div>
                    <p className="mt-2 truncate text-center text-[11.5px] text-white/70">
                      {p.name}
                    </p>
                    <button className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-ink-800/90 text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.06]">
              {profileControlToggles.map((item, i) => (
                <div
                  key={item.k}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    i < profileControlToggles.length - 1 && "border-b border-white/[0.06]"
                  )}
                >
                  <div>
                    <p className="text-[13.5px] text-white/70">{item.label}</p>
                    <p className="mt-0.5 text-[12px] text-white/40">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setToggles((t) => ({ ...t, [item.k]: !t[item.k] }))}
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      toggles[item.k] ? "bg-gradient-to-r from-neon-400 to-neon-600" : "bg-white/12"
                    )}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow",
                        toggles[item.k] ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Playback */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon-500/15 text-neon-400">
              <Play className="h-4 w-4" />
            </div>
            <h2 className="text-[14px] font-semibold text-white/90">Playback</h2>
          </div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.07]">
            {playbackToggles.map((item, i) => (
              <div
                key={item.k}
                className={cn(
                  "flex items-center justify-between px-5 py-4",
                  i < playbackToggles.length - 1 && "border-b border-white/[0.06]"
                )}
              >
                <div>
                  <p className="text-[13.5px] text-white/70">{item.label}</p>
                  <p className="mt-0.5 text-[12px] text-white/40">{item.desc}</p>
                </div>
                <button
                  onClick={() => setToggles((t) => ({ ...t, [item.k]: !t[item.k] }))}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    toggles[item.k] ? "bg-gradient-to-r from-neon-400 to-neon-600" : "bg-white/12"
                  )}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow",
                      toggles[item.k] ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Language & Subtitles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon-500/15 text-neon-400">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-[14px] font-semibold text-white/90">Language & Subtitles</h2>
          </div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.07]">
            {languageItems.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between px-5 py-4",
                  i < languageItems.length - 1 && "border-b border-white/[0.06]"
                )}
              >
                <div>
                  <p className="text-[13.5px] text-white/70">{item.label}</p>
                </div>
                <button className="flex items-center gap-1.5 text-[12.5px] text-white/55 hover:text-white">
                  {item.value}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* App & Device Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon-500/15 text-neon-400">
              <Smartphone className="h-4 w-4" />
            </div>
            <h2 className="text-[14px] font-semibold text-white/90">App & Device Info</h2>
          </div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.07]">
            {[
              { label: "Version", value: "3.2.1 (build 847)" },
              { label: "Device", value: "Chrome on Windows" },
              { label: "Parental controls", value: "Managed in Profile settings" },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between px-5 py-4",
                  i < arr.length - 1 && "border-b border-white/[0.06]"
                )}
              >
                <p className="text-[13.5px] text-white/70">{item.label}</p>
                <p className="text-[12.5px] text-white/50">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
        >
          <h3 className="text-[14px] font-semibold text-red-400">Danger Zone</h3>
          <p className="mt-1 text-[12.5px] text-white/40">
            These actions are permanent and cannot be undone.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-full border border-white/15 px-4 py-2 text-[12.5px] text-white/70 transition hover:bg-white/[0.06] hover:text-white">
              Pause membership
            </button>
            <button className="rounded-full border border-red-500/30 px-4 py-2 text-[12.5px] text-red-400 transition hover:bg-red-500/10">
              Cancel membership
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

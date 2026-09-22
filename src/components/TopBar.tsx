import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Bell, Menu, X } from "lucide-react";
import { library, type Title } from "../data";
import { cn } from "../utils/cn";
import { ProfileSwitcher } from "./ProfileSwitcher";
import type { Profile } from "../lib/profiles";

const navLinks: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/browse", label: "Browse" },
  { path: "/mylist", label: "My List" },
  { path: "/trending", label: "Trending" },
];

export function TopBar({
  onOpen,
  onGoSearch,
  activeProfile,
  onSwitchProfile,
  onLogout,
}: {
  onOpen: (t: Title) => void;
  onGoSearch: (q: string) => void;
  searchResults?: Title[];
  user?: { name: string; email: string } | null;
  activeProfile?: Profile | null;
  onSwitchProfile?: (profile: Profile) => void;
  onLogout?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  const currentPath = location.pathname;

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 160 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 160) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  const results: Title[] = q.trim()
    ? library
        .filter((t) => {
          const s = q.toLowerCase();
          return (
            t.name.toLowerCase().includes(s) ||
            t.genres.some((g) => g.toLowerCase().includes(s))
          );
        })
        .slice(0, 5)
    : [];

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between gap-4 px-4 transition-colors duration-300 sm:px-6 lg:px-10",
          scrolled
            ? "glass-dark shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)]"
            : "border-b border-transparent bg-gradient-to-b from-black/80 via-black/35 to-transparent"
        )}
      >
        {/* LEFT: Logo + Nav */}
        <div className="flex min-w-0 shrink-0 items-center gap-6">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="shrink-0 font-display text-[18px] font-bold tracking-wide text-neon-400 transition-colors hover:text-neon-300"
          >
            CINEMATIC
          </button>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(({ path, label }) => {
              const active = currentPath === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "relative rounded px-3 py-1.5 text-[13px] font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-white/60 hover:text-white/90"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="topnav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 rounded bg-white/[0.08]"
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded text-white/85 md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* RIGHT: Search + Notifications + Profile */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[400px]">
            <div
              className={cn(
                "relative flex items-center gap-2 rounded border px-3 py-1.5 transition-all duration-200 sm:px-3.5",
                focused
                  ? "border-white/30 bg-black/70 shadow-lg backdrop-blur-xl"
                  : "border-transparent bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.1]"
              )}
            >
              <Search
                className="h-4 w-4 shrink-0 text-white/50"
                strokeWidth={1.8}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (results[0]) onOpen(results[0]);
                    else onGoSearch(q);
                    setFocused(false);
                  }
                  if (e.key === "Escape") setQ("");
                }}
                placeholder="Search"
                className="w-full bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-white/40 hover:text-white"
                >
                  <svg
                    viewBox="0 0 14 14"
                    className="h-3 w-3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                  >
                    <path
                      d="M3 3l8 8M11 3l-8 8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <AnimatePresence>
              {focused && q.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-[calc(100%+8px)] right-0 w-[min(100vw-2rem,380px)] overflow-hidden rounded-lg bg-ink-900/95 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.08] backdrop-blur-xl"
                >
                  {results.length > 0 ? (
                    results.map((t, i) => (
                      <button
                        key={`${t.id}-${i}`}
                        onMouseDown={() => {
                          onOpen(t);
                          setQ("");
                          setFocused(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <img
                          src={t.poster}
                          alt=""
                          className="h-[46px] w-[32px] shrink-0 rounded object-cover ring-1 ring-white/10"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-white/90">
                            {t.name}
                          </span>
                          <span className="block truncate text-[11px] text-white/40">
                            {t.year} · {t.genres[0]}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-5 text-center text-[12.5px] text-white/40">
                      No results for "{q}"
                    </p>
                  )}
                  <div className="border-t border-white/[0.06] px-4 py-2.5">
                    <button
                      onMouseDown={() => onGoSearch(q)}
                      className="text-[12px] font-medium text-neon-300 hover:text-neon-200"
                    >
                      View all results →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <button
            onClick={() => navigate("/alerts")}
            title="Notifications"
            className={cn(
              "relative grid h-9 w-9 place-items-center rounded transition-colors",
              currentPath === "/alerts"
                ? "text-white"
                : "text-white/60 hover:text-white/90"
            )}
          >
            <Bell className="h-5 w-5" strokeWidth={1.6} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-neon-400" />
          </button>

          {/* Profile switcher */}
          {activeProfile && onSwitchProfile && (
            <ProfileSwitcher
              activeProfile={activeProfile}
              onSelectProfile={onSwitchProfile}
              onManageProfiles={() => navigate("/profile")}
              onAccount={() => navigate("/settings")}
              onHelpCenter={() => window.open("https://help.cinematic.com", "_blank")}
              onSignOut={() => {
                if (onLogout) onLogout();
              }}
            />
          )}
        </div>
      </motion.header>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className="fixed left-0 right-0 top-[60px] z-50 border-b border-white/[0.06] bg-ink-900/95 p-4 shadow-2xl backdrop-blur-xl md:hidden"
            >
              {activeProfile && (
                <div className="mb-3 flex items-center gap-3 px-2 py-2">
                  <div
                    className={`h-10 w-10 rounded bg-gradient-to-br ${activeProfile.avatarColor} flex items-center justify-center`}
                  >
                    <span className="text-[14px] font-bold text-white/90">
                      {activeProfile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[14px] font-medium text-white/90">
                      {activeProfile.name}
                    </span>
                    {activeProfile.isKids && (
                      <span className="text-[10px] text-blue-400">
                        Kids Profile
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="h-px bg-white/[0.08]" />
              <div className="mt-2 space-y-0.5">
                {navLinks.map(({ path, label }) => (
                  <button
                    key={path}
                    onClick={() => {
                      navigate(path);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded px-3 py-2.5 text-left text-[14px] font-medium transition-colors",
                      currentPath === path
                        ? "bg-white/[0.08] text-white"
                        : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="my-2 h-px bg-white/[0.08]" />
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center rounded px-3 py-2.5 text-left text-[14px] font-medium text-white/65 hover:bg-white/[0.05] hover:text-white"
                >
                  Account
                </button>
                <button
                  onClick={() => {
                    navigate("/alerts");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center rounded px-3 py-2.5 text-left text-[14px] font-medium text-white/65 hover:bg-white/[0.05] hover:text-white"
                >
                  Notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

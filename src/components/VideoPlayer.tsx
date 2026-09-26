import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Volume2,
  Maximize2,
  Subtitles,
  Settings2,
  X,
  Check,
  Languages,
  AudioLines,
  Type,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { languages } from "../data";
import { cn } from "../utils/cn";

type NativeEvent = Event & { stopImmediatePropagation(): void };

const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-presentation";
const SHIELD_MIN_MS = 1800;

const ALLOWED_HOSTS =
  /^(vidsrc\.(to|cc|pro|xyz)|vidcore\.org|multiembed\.mov|streamingnow\.mov)$/;

type EmbedInfo = {
  type: "movie" | "tv";
  id: string;
  season?: number;
  episode?: number;
};

type Provider = {
  id: string;
  label: string;
  note?: string;
  build: (i: EmbedInfo) => string;
};

const PROVIDERS: Provider[] = [
  {
    id: "vidsrc",
    label: "VidSrc",
    note: "Classic",
    build: (i) =>
      i.type === "tv"
        ? `https://vidsrc.to/embed/tv/${i.id}/${i.season ?? 1}/${i.episode ?? 1}`
        : `https://vidsrc.to/embed/movie/${i.id}`,
  },
  {
    id: "vidcore",
    label: "VidCore",
    note: "Fast",
    build: (i) =>
      i.type === "tv"
        ? `https://vidcore.org/embed/tv/${i.id}/${i.season ?? 1}/${i.episode ?? 1}`
        : `https://vidcore.org/embed/movie/${i.id}`,
  },
  {
    id: "multiembed",
    label: "MultiEmbed",
    note: "Alt",
    build: (i) =>
      i.type === "tv"
        ? `https://multiembed.mov/?video_id=${i.id}&tmdb=1&s=${i.season ?? 1}&e=${i.episode ?? 1}`
        : `https://multiembed.mov/?video_id=${i.id}&tmdb=1`,
  },
];

function parseEmbedInfo(
  raw: string,
  season?: number,
  episode?: number
): EmbedInfo | null {
  try {
    const url = new URL(raw, window.location.origin);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "movie" || p === "tv");
    if (idx >= 0 && parts[idx + 1]) {
      const type = parts[idx] as "movie" | "tv";
      if (type === "tv") {
        const s = Number(parts[idx + 2]);
        const e = Number(parts[idx + 3]);
        if (s && e) return { type, id: parts[idx + 1], season: s, episode: e };
        if (season && episode) return { type, id: parts[idx + 1], season, episode };
        return null;
      }
      return { type: "movie", id: parts[idx + 1] };
    }
    const idParam =
      url.searchParams.get("id") || url.searchParams.get("video_id");
    if (idParam && /^\d+$|^tt\d+$/.test(idParam)) {
      const s = Number(
        url.searchParams.get("s") || url.searchParams.get("season")
      );
      const e = Number(
        url.searchParams.get("e") || url.searchParams.get("episode")
      );
      if (s && e) return { type: "tv", id: idParam, season: s, episode: e };
      if (season && episode)
        return { type: "tv", id: idParam, season, episode };
      return { type: "movie", id: idParam };
    }
  } catch {
    /* fall through */
  }
  return null;
}

function cleanEmbedUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (!ALLOWED_HOSTS.test(url.hostname)) return raw;
    if (url.hostname.includes("vidsrc")) {
      url.search = "";
      url.searchParams.set("autoPlay", "1");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export function VideoPlayer({
  open,
  onClose,
  embedUrl,
  title = "",
  season,
  episode,
}: {
  open: boolean;
  onClose: () => void;
  embedUrl?: string | null;
  title?: string;
  season?: number;
  episode?: number;
}) {
  const [panel, setPanel] = useState<null | "subs" | "quality" | "sources">(null);
  const [sub, setSub] = useState("en");
  const [audio, setAudio] = useState("ja");
  const [quality, setQuality] = useState("4K");
  const [tab, setTab] = useState<"sub" | "audio">("sub");
  const [started, setStarted] = useState(false);
  const [shield, setShield] = useState(false);
  const [providerIdx, setProviderIdx] = useState(0);
  const shieldArmedAt = useRef(0);
  const absorbedRef = useRef(0);

  const info = useMemo(
    () => (embedUrl ? parseEmbedInfo(embedUrl, season, episode) : null),
    [embedUrl, season, episode]
  );

  const src = useMemo(() => {
    const raw = info ? PROVIDERS[providerIdx].build(info) : embedUrl;
    return raw ? cleanEmbedUrl(raw) : null;
  }, [info, providerIdx, embedUrl]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (panel) setPanel(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, panel, onClose]);

  useEffect(() => {
    if (open) {
      setPanel(null);
      setStarted(false);
      setShield(false);
      setProviderIdx(0);
      absorbedRef.current = 0;
    }
  }, [open, embedUrl]);

  const handleStart = () => {
    setStarted(true);
    setShield(true);
    absorbedRef.current = 0;
    shieldArmedAt.current = Date.now();
  };

  const switchProvider = (idx: number) => {
    if (idx === providerIdx) {
      setPanel(null);
      return;
    }
    setProviderIdx(idx);
    setPanel(null);
    if (started) {
      setShield(true);
      absorbedRef.current = 0;
      shieldArmedAt.current = Date.now();
    }
  };

  const absorbClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.nativeEvent as NativeEvent).stopImmediatePropagation();
    absorbedRef.current += 1;
    const elapsed = Date.now() - shieldArmedAt.current;
    if (elapsed >= SHIELD_MIN_MS && absorbedRef.current >= 1) {
      setShield(false);
    }
  }, []);

  useEffect(() => {
    if (!shield) return;
    const t = setTimeout(() => {
      if (Date.now() - shieldArmedAt.current >= SHIELD_MIN_MS) setShield(false);
    }, SHIELD_MIN_MS + 150);
    return () => clearTimeout(t);
  }, [shield]);

  useEffect(() => {
    if (!open) return;
    const blocked = () => null;
    const originalOpen = window.open;
    window.open = blocked;
    const blockTopNav = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    window.addEventListener("beforeunload", blockTopNav);
    return () => {
      window.open = originalOpen;
      window.removeEventListener("beforeunload", blockTopNav);
    };
  }, [open]);

  const subLabel = languages.find((l) => l.code === sub)?.label ?? "Off";
  const episodeLabel = season && episode ? `S${season} E${episode}` : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="absolute inset-0"
          >
            {src ? (
              started ? (
                <>
                  <iframe
                    src={src}
                    referrerPolicy="no-referrer"
                    sandbox={IFRAME_SANDBOX}
                    className={cn(
                      "absolute inset-0 h-full w-full border-0 transition-opacity",
                      shield ? "pointer-events-none opacity-40" : "opacity-100"
                    )}
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    title={title || "Video Player"}
                  />
                  {shield && (
                    <div
                      onClick={absorbClick}
                      onPointerDown={absorbClick}
                      onPointerUp={(e) => e.stopPropagation()}
                      onContextMenu={(e) => e.preventDefault()}
                      className="absolute inset-0 z-20 cursor-pointer bg-black/30 backdrop-blur-[1px]"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="flex flex-col items-center gap-3">
                          <ShieldCheck className="h-8 w-8 animate-pulse text-neon-300" />
                          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/60">
                            Blocking ads…
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStart}
                  className="group absolute inset-0 grid place-items-center bg-ink-950"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_75%)] opacity-60" />
                  <span className="relative flex flex-col items-center gap-5">
                    <span className="grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-neon-400/70 group-hover:bg-neon-500/25 group-hover:shadow-[0_0_50px_rgba(124,77,255,0.45)]">
                      <Play className="ml-1 h-9 w-9 text-white" fill="currentColor" />
                    </span>
                    <span className="text-[13px] font-medium uppercase tracking-[0.28em] text-white/50 transition-colors group-hover:text-white/85">
                      Click to Play
                    </span>
                    {season && episode && (
                      <span className="text-[11px] text-neon-300/80">
                        S{season} E{episode}
                      </span>
                    )}
                  </span>
                </button>
              )
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-ink-950">
                <div className="text-center">
                  <Play className="mx-auto h-16 w-16 text-white/20" />
                  <p className="mt-4 text-white/40">No video available</p>
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent p-4 md:p-6 pointer-events-none">
              <div className="pointer-events-auto">
                {episodeLabel && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neon-300">
                    {episodeLabel}
                  </p>
                )}
                <h2 className="mt-1 font-display text-2xl text-white md:text-3xl">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-5 pt-16 md:px-7 md:pb-6 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-1.5 md:gap-3">
                <button
                  onClick={() => setPanel(panel === "subs" ? null : "subs")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[12px] font-medium transition md:px-3.5",
                    panel === "subs"
                      ? "border-neon-400/60 bg-neon-500/25 text-white neon-glow"
                      : "border-white/12 bg-white/[0.07] text-white/80 hover:bg-white/15"
                  )}
                >
                  <Subtitles className="h-[17px] w-[17px]" />
                  <span className="hidden sm:inline">{subLabel}</span>
                </button>

                <button
                  onClick={() => setPanel(panel === "quality" ? null : "quality")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[12px] font-medium transition md:px-3.5",
                    panel === "quality"
                      ? "border-neon-400/60 bg-neon-500/25 text-white neon-glow"
                      : "border-white/12 bg-white/[0.07] text-white/80 hover:bg-white/15"
                  )}
                >
                  <Settings2 className="h-[17px] w-[17px]" />
                </button>

                <button
                  onClick={() => setPanel(panel === "sources" ? null : "sources")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[12px] font-medium transition md:px-3.5",
                    panel === "sources"
                      ? "border-neon-400/60 bg-neon-500/25 text-white neon-glow"
                      : "border-white/12 bg-white/[0.07] text-white/80 hover:bg-white/15"
                  )}
                >
                  <Layers className="h-[17px] w-[17px]" />
                  <span className="hidden sm:inline">
                    {PROVIDERS[providerIdx]?.label ?? "Source"}
                  </span>
                </button>

                <button className="grid h-9 w-9 place-items-center rounded-full text-white/75 hover:bg-white/12 hover:text-white md:h-10 md:w-10">
                  <Volume2 className="h-[18px] w-[18px]" />
                </button>

                <div className="ml-auto">
                  <button className="grid h-9 w-9 place-items-center rounded-full text-white/75 hover:bg-white/12 hover:text-white md:h-10 md:w-10">
                    <Maximize2 className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {panel === "subs" && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setPanel(null)}
                    className="absolute inset-0 z-40 bg-black/45"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 22, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="absolute bottom-24 right-3 left-3 z-50 overflow-hidden rounded-[22px] glass-dark shadow-[0_30px_80px_-16px_rgba(0,0,0,0.95)] sm:left-auto sm:w-[460px] md:bottom-28 md:right-7"
                  >
                    <div className="relative border-b border-white/[0.07] px-5 pb-3 pt-4">
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-400 to-neon-600 text-white">
                            <Languages className="h-[18px] w-[18px]" />
                          </span>
                          <div>
                            <h3 className="text-[14.5px] font-semibold text-white">Subtitles & Audio</h3>
                            <p className="text-[11px] text-white/45">Multi-language support</p>
                          </div>
                        </div>
                        <button onClick={() => setPanel(null)} className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="relative mt-4 flex rounded-xl bg-white/[0.05] p-1">
                        {([["sub", "Subtitles", Type], ["audio", "Audio", AudioLines]] as const).map(([k, l, Ic]) => (
                          <button
                            key={k}
                            onClick={() => setTab(k)}
                            className="relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12.5px] font-medium"
                          >
                            {tab === k && (
                              <motion.span layoutId="subtab" transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-500/50 to-neon-600/25 ring-1 ring-neon-400/40" />
                            )}
                            <Ic className={cn("relative h-4 w-4", tab === k ? "text-white" : "text-white/45")} />
                            <span className={cn("relative", tab === k ? "text-white" : "text-white/50")}>{l}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="no-scrollbar max-h-[42vh] overflow-y-auto p-2.5 md:max-h-[320px]">
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {languages.map((l) => {
                          const selected = tab === "sub" ? sub === l.code : audio === l.code;
                          if (tab === "audio" && l.code === "off") return null;
                          return (
                            <motion.button
                              key={l.code}
                              whileHover={{ x: 3 }}
                              onClick={() => (tab === "sub" ? setSub(l.code) : setAudio(l.code))}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                selected ? "bg-neon-500/20 ring-1 ring-neon-400/40" : "hover:bg-white/[0.06]"
                              )}
                            >
                              <span className="text-[17px] leading-none">{l.flag}</span>
                              <span className="min-w-0 flex-1">
                                <span className={cn("block truncate text-[13px] font-medium", selected ? "text-white" : "text-white/80")}>
                                  {l.label}
                                </span>
                                <span className="block truncate text-[10.5px] text-white/40">{l.native}</span>
                              </span>
                              {selected ? (
                                <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }}
                                  className="grid h-5 w-5 place-items-center rounded-full bg-neon-500 text-white">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </motion.span>
                              ) : (
                                <span className="h-5 w-5 rounded-full border border-white/15 opacity-0 transition-opacity group-hover:opacity-100" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
                      <p className="text-[11px] text-white/40">
                        {tab === "sub" ? "Subtitles" : "Audio"}:{" "}
                        <span className="text-neon-300">
                          {(tab === "sub" ? languages.find((l) => l.code === sub) : languages.find((l) => l.code === audio))?.label}
                        </span>
                      </p>
                      <button onClick={() => setPanel(null)}
                        className="rounded-full bg-gradient-to-br from-neon-400 to-neon-600 px-4 py-1.5 text-[12px] font-semibold text-white neon-glow">
                        Done
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {panel === "quality" && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setPanel(null)} className="absolute inset-0 z-40" />
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    className="absolute bottom-24 right-3 z-50 w-56 rounded-2xl glass-dark p-2 shadow-2xl md:bottom-28 md:right-7"
                  >
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">Quality</p>
                    {["4K HDR", "1080p", "720p", "Auto"].map((q) => (
                      <button key={q} onClick={() => { setQuality(q); setPanel(null); }}
                        className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12.5px] transition-colors hover:bg-white/[0.07]",
                          quality === q || quality === q.split(" ")[0] ? "text-white" : "text-white/70")}>
                        {q}
                        {(quality === q || quality === q.split(" ")[0]) && <Check className="h-3.5 w-3.5 text-neon-400" strokeWidth={3} />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {panel === "sources" && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setPanel(null)} className="absolute inset-0 z-40" />
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    className="absolute bottom-24 right-3 z-50 w-60 rounded-2xl glass-dark p-2 shadow-2xl md:bottom-28 md:right-7"
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Layers className="h-3.5 w-3.5 text-neon-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Source</p>
                    </div>
                    {PROVIDERS.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => switchProvider(idx)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07]",
                          providerIdx === idx ? "bg-neon-500/15" : ""
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={cn(
                            "text-[13px] font-medium",
                            providerIdx === idx ? "text-white" : "text-white/75"
                          )}>
                            {p.label}
                          </span>
                          {p.note && (
                            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[9.5px] uppercase tracking-wider text-white/45">
                              {p.note}
                            </span>
                          )}
                        </span>
                        {providerIdx === idx ? (
                          <Check className="h-4 w-4 text-neon-400" strokeWidth={3} />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-white/15" />
                        )}
                      </button>
                    ))}
                    <p className="border-t border-white/[0.07] px-3 pb-1 pt-2.5 text-[10.5px] leading-relaxed text-white/35">
                      If the video doesn&apos;t play or shows ads, switch source.
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

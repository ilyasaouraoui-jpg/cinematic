import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Clapperboard, ExternalLink } from "lucide-react";
import { tmdbAPI } from "../api";
import { trailerLabels } from "../lib/i18n";

export function TrailerModal({
  open,
  onClose,
  title,
  tmdbId,
  mediaType = "movie",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  tmdbId: string | number;
  mediaType?: "movie" | "tv" | string;
}) {
  const [loading, setLoading] = useState(false);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const labels = trailerLabels();

  useEffect(() => {
    if (!open) {
      setVideoKey(null);
      setUnavailable(false);
      setLoading(false);
      return;
    }
    setVideoKey(null);
    setUnavailable(false);

    let cancelled = false;
    setLoading(true);

    tmdbAPI
      .videos(tmdbId, mediaType === "tv" || mediaType === "series" ? "tv" : "movie")
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.found && data.key) setVideoKey(data.key);
        else setUnavailable(true);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, tmdbId, mediaType]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title} Official Trailer`
  )}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] grid place-items-center bg-black/85 p-4 backdrop-blur-md sm:p-6"
        >
          <motion.div
            initial={{ y: 36, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl overflow-hidden rounded-[20px] bg-ink-900 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-neon-400 to-neon-600 text-white">
                  <Clapperboard className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-semibold text-white">{title}</p>
                  <p className="text-[11px] text-white/40">
                    {unavailable ? labels.unavailable : "Official Trailer"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label={labels.close}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/70 transition hover:bg-white/[0.16] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
              {loading && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-neon-400" />
                    <p className="text-[12.5px] text-white/50">{labels.loading}</p>
                  </div>
                </div>
              )}

              {!loading && videoKey && (
                <iframe
                  src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                  title={`${title} trailer`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}

              {!loading && unavailable && (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white/[0.06]">
                      <Clapperboard className="h-6 w-6 text-white/50" />
                    </span>
                    <p className="text-[15px] font-semibold text-white/90">
                      {labels.unavailable}
                    </p>
                    <p className="max-w-sm text-[12.5px] leading-relaxed text-white/45">
                      {title}
                    </p>
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-2 rounded-full bg-gradient-to-br from-neon-400 to-neon-600 px-5 py-2.5 text-[13px] font-semibold text-white neon-glow transition hover:brightness-110"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {labels.search}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

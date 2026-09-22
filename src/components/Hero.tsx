import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Plus, Info, Download, ListVideo, Star, Check } from "lucide-react";
import { heroes, type Title } from "../data";
import { cn } from "../utils/cn";

const heroBackgrounds = [
  heroes[0].image,
  heroes[1].image,
  heroes[2].image,
];

export function Hero({
  onPlay,
  onInfo,
  trending = [],
}: {
  onPlay: () => void;
  onInfo: () => void;
  trending?: Title[];
}) {
  const [i, setI] = useState(0);
  const [added, setAdded] = useState(false);

  const heroItems = trending.length > 0
    ? trending.slice(0, 6).map((t, idx) => ({
        id: t.id,
        title: t.name,
        image: (t as any).backdrop || heroBackgrounds[idx % heroBackgrounds.length],
        fontClass: "font-display tracking-[0.02em]",
        year: t.year,
        seasons: 1,
        rating: t.rating,
        score: t.score || 4.5,
        genres: t.genres.length > 0 ? t.genres : heroes[idx % heroes.length].genres,
        tagline: "",
        synopsis: t.synopsis || "Discover this trending title on our streaming platform.",
        poster: t.poster,
      }))
    : heroes.map((h) => ({ ...h, poster: "" }));

  const h = heroItems[i % heroItems.length];

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % heroItems.length), 9000);
    return () => clearInterval(t);
  }, [heroItems.length]);

  return (
    <section className="relative h-[92svh] min-h-[560px] w-full overflow-hidden md:h-[88vh] md:min-h-[620px]">
      <AnimatePresence mode="sync">
        <motion.div
          key={h.id}
          initial={{ opacity: 0, scale: 1.09 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img src={h.image} alt={h.title} className="h-full w-full object-cover object-center" />
        </motion.div>
      </AnimatePresence>

      {/* gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-transparent md:via-ink-950/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-ink-950/45" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />

      {/* content */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-12 md:pb-16 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl lg:max-w-2xl"
          >
            {h.tagline && !h.tagline.toLowerCase().includes("original") && (
              <p className="mb-3 text-[12px] font-medium text-white/70 md:mb-4">📺 {h.tagline}</p>
            )}

            <h1
              className={cn(
                "text-glow text-[13vw] leading-[0.92] text-white sm:text-6xl md:text-7xl lg:text-[86px]",
                h.fontClass
              )}
            >
              {h.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-white/70 md:mt-5 md:text-[13px]">
              <span className="rounded-md border border-white/20 px-1.5 py-[1px] text-[10.5px] font-semibold tracking-wide text-white/85">
                {h.rating}
              </span>
              <span className="font-medium text-white/85">{h.year}</span>
              <span className="text-white/25">•</span>
              <span>{h.seasons} Seasons</span>
              <span className="rounded-md border border-white/15 bg-white/5 px-1.5 py-[1px] text-[10px] font-semibold">
                HDR
              </span>
              {h.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-[3px] text-[11px] font-medium text-white/80 backdrop-blur-sm"
                >
                  {g}
                </span>
              ))}
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-300" />
                <span className="font-semibold">{h.score}</span>
              </span>
            </div>

            <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-white/65 md:text-[14.5px]">
              {h.synopsis}
            </p>

            <div className="mt-6 flex items-center gap-3 md:mt-8">
              <motion.button
                whileHover={{ scale: 1.045 }}
                whileTap={{ scale: 0.96 }}
                onClick={onPlay}
                className="flex items-center gap-2.5 rounded-full bg-gradient-to-br from-neon-400 to-neon-600 py-3 pl-4 pr-6 text-[14px] font-semibold text-white neon-glow md:py-3.5"
              >
                <Play className="h-[18px] w-[18px] fill-white" />
                Play S1 E1
              </motion.button>

              <CircleBtn onClick={() => setAdded((v) => !v)} label="My List">
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="c"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                    >
                      <Check className="h-[18px] w-[18px] text-neon-300" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="p"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                    >
                      <Plus className="h-[18px] w-[18px]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </CircleBtn>

              <CircleBtn onClick={onInfo} label="More Info">
                <Info className="h-[18px] w-[18px]" />
              </CircleBtn>

              <CircleBtn className="hidden sm:grid" label="Episodes">
                <ListVideo className="h-[18px] w-[18px]" />
              </CircleBtn>

              <CircleBtn className="hidden sm:grid" label="Download">
                <Download className="h-[18px] w-[18px]" />
              </CircleBtn>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* slide indicators */}
        <div className="mt-7 flex items-center gap-2">
          {heroItems.map((x, idx) => (
            <button key={x.id} onClick={() => setI(idx)} className="group py-2">
              <span
                className={cn(
                  "block h-[3px] rounded-full transition-all duration-500",
                  idx === i ? "w-9 bg-neon-400" : "w-4 bg-white/25 group-hover:bg-white/50"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CircleBtn({
  children,
  label,
  className,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={label}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.08] text-white/90 backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/[0.16] md:h-12 md:w-12",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

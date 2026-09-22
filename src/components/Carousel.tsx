import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Title } from "../data";
import { PosterCard } from "./PosterCard";

export function Carousel({
  title,
  items,
  onOpen,
  onPlay,
  withProgress,
}: {
  title: string;
  items: Title[];
  onOpen: (t: Title) => void;
  onPlay: () => void;
  withProgress?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="relative mt-9 md:mt-11">
      <div className="mb-3.5 flex items-end justify-between px-5 md:px-12 lg:px-16">
        <h2 className="text-[15px] font-semibold tracking-tight text-white/95 md:text-[17px]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button className="hidden items-center gap-1.5 text-[11.5px] font-medium text-white/45 transition-colors hover:text-neon-300 sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            See All
          </button>
          <div className="hidden items-center gap-1.5 md:flex">
            <Arrow dir={-1} onClick={() => scroll(-1)} />
            <Arrow dir={1} onClick={() => scroll(1)} />
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar flex gap-3.5 overflow-x-auto scroll-smooth px-5 pb-6 pt-1 md:px-12 lg:px-16"
      >
        {items.map((it, i) => (
          <PosterCard
            key={`${title}-${it.id}-${i}`}
            item={it}
            index={i}
            onOpen={onOpen}
            onPlay={onPlay}
            progress={withProgress ? 20 + ((i * 17) % 70) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      whileHover={{ scale: 1.13 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition-colors hover:border-neon-400/50 hover:bg-neon-500/15 hover:text-white"
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}

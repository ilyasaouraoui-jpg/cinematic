import { cn } from "../utils/cn";

export type PageKey =
  | "home"
  | "browse"
  | "search"
  | "mylist"
  | "trending"
  | "alerts"
  | "profile"
  | "settings";

export function Avatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-neon-600 text-[11px] font-bold text-white ring-2 ring-white/20",
        className
      )}
    >
      AK
    </span>
  );
}

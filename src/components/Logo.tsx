import { cn } from "../utils/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-[14px] bg-gradient-to-br from-neon-400 via-neon-500 to-neon-600 text-white shadow-[0_6px_22px_-4px_rgba(124,77,255,0.8)]",
        className
      )}
    >
      <span className="font-display text-[0.95em] font-black leading-none -translate-y-[1px]">S</span>
      <span className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/25" />
    </div>
  );
}

export function LogoWord() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark className="h-6 w-6 text-[15px]" />
      <span className="text-[15px] font-semibold tracking-tight text-white/95">slothui</span>
    </div>
  );
}

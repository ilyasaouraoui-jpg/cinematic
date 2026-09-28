import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Baby, User } from "lucide-react";
import type { Profile } from "../lib/profiles";

export function PinModal({
  target,
  onSuccess,
  onClose,
}: {
  target: Profile | null;
  onSuccess: (profile: Profile) => void;
  onClose: () => void;
}) {
  const [slots, setSlots] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (target) {
      setSlots(["", "", "", ""]);
      setError(false);
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [target]);

  const verify = (value: string) => {
    if (!target) return;
    if (value === target.pin) {
      onSuccess(target);
    } else {
      setError(true);
      setSlots(["", "", "", ""]);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  };

  const setDigit = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...slots];
    next[i] = digit;
    setSlots(next);
    setError(false);
    if (digit && i < 3) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) verify(next.join(""));
  };

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={
              error
                ? { opacity: 1, scale: 1, y: 0, x: [0, -9, 9, -7, 7, -4, 4, 0] }
                : { opacity: 1, scale: 1, y: 0, x: 0 }
            }
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-ink-900/95 p-6 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10"
          >
            <div
              className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${target.avatarColor} flex items-center justify-center`}
            >
              {target.isKids ? (
                <Baby className="h-7 w-7 text-white/90" />
              ) : (
                <User className="h-7 w-7 text-white/90" />
              )}
            </div>
            <h3 className="text-[16px] font-semibold text-white">
              Enter PIN for {target.name}
            </h3>
            <p className="mt-1 text-[12.5px] text-white/45">
              This profile is protected by a 4-digit PIN
            </p>

            <div className="mt-5 flex justify-center gap-3">
              {slots.map((slot, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  value={slot}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && slots[i] === "" && i > 0) {
                      inputsRef.current[i - 1]?.focus();
                    }
                    if (e.key === "Escape") onClose();
                    if (e.key === "Enter" && slots.every((d) => d !== "")) {
                      verify(slots.join(""));
                    }
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  className={`h-12 w-11 rounded-xl border bg-white/[0.05] text-center text-[18px] font-semibold text-white transition-all focus:outline-none ${
                    error
                      ? "border-red-400/70 focus:ring-2 focus:ring-red-400/30"
                      : "border-white/15 focus:border-neon-400/60 focus:ring-2 focus:ring-neon-400/25"
                  }`}
                />
              ))}
            </div>

            <p
              className={`mt-3 h-4 text-[12px] font-medium transition-opacity ${
                error ? "text-red-400 opacity-100" : "opacity-0"
              }`}
            >
              Incorrect PIN — try again
            </p>

            <div className="mt-3 flex justify-center">
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

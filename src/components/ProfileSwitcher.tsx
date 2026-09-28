import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  User,
  Baby,
  Pencil,
} from "lucide-react";
import { loadProfiles, type Profile } from "../lib/profiles";

export function ProfileSwitcher({
  activeProfile,
  onSelectProfile,
  onSettings,
  onHelpCenter,
  onSignOut,
}: {
  activeProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  onSettings: () => void;
  onHelpCenter: () => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const activatedByPointer = useRef(false);

  const [pinTarget, setPinTarget] = useState<Profile | null>(null);
  const [pinSlots, setPinSlots] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState(false);
  const pinInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const toggleOpen = () => setOpen((v) => !v);

  const requestSelect = (p: Profile) => {
    setOpen(false);
    if (p.id === activeProfile?.id) return;
    setPinSlots(["", "", "", ""]);
    setPinError(false);
    setPinTarget(p);
  };

  const verifyPin = (value: string) => {
    if (!pinTarget) return;
    if (value === pinTarget.pin) {
      onSelectProfile(pinTarget);
      setPinTarget(null);
      setPinSlots(["", "", "", ""]);
    } else {
      setPinError(true);
      setPinSlots(["", "", "", ""]);
      setTimeout(() => pinInputsRef.current[0]?.focus(), 50);
    }
  };

  const setPinDigit = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...pinSlots];
    next[i] = digit;
    setPinSlots(next);
    setPinError(false);
    if (digit && i < 3) pinInputsRef.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) verifyPin(next.join(""));
  };

  useEffect(() => {
    if (pinTarget) {
      setTimeout(() => pinInputsRef.current[0]?.focus(), 120);
    }
  }, [pinTarget]);

  useEffect(() => {
    setProfiles(loadProfiles());
  }, [activeProfile, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!activeProfile) return null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button === 0) {
            activatedByPointer.current = true;
            toggleOpen();
          }
        }}
        onClick={() => {
          if (activatedByPointer.current) {
            activatedByPointer.current = false;
            return;
          }
          toggleOpen();
        }}
        className="flex items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-white/[0.08]"
      >
        <div
          className={`h-8 w-8 rounded bg-gradient-to-br ${activeProfile.avatarColor} flex items-center justify-center shadow-md`}
        >
          {activeProfile.isKids ? (
            <Baby className="h-4 w-4 text-white/90" />
          ) : (
            <User className="h-4 w-4 text-white/90" />
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-white/60 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-[240px] overflow-hidden rounded-md bg-ink-900/95 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.08] backdrop-blur-xl"
          >
            {/* Profile list */}
            <div className="p-1.5">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => requestSelect(p)}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors ${
                    p.id === activeProfile.id
                      ? "bg-white/[0.08]"
                      : "hover:bg-white/[0.06]"
                  }`}
                >
                  <div
                    className={`relative h-8 w-8 shrink-0 rounded bg-gradient-to-br ${p.avatarColor} flex items-center justify-center transition-all ${
                      hoveredId === p.id && p.id !== activeProfile.id
                        ? "ring-2 ring-white/40"
                        : ""
                    }`}
                  >
                    {p.isKids ? (
                      <Baby className="h-4 w-4 text-white/85" />
                    ) : (
                      <User className="h-4 w-4 text-white/85" />
                    )}
                    {p.id === activeProfile.id && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900 bg-neon-400" />
                    )}
                  </div>
                  <span
                    className={`flex-1 truncate text-[13px] ${
                      p.id === activeProfile.id
                        ? "font-medium text-white"
                        : "text-white/75"
                    }`}
                  >
                    {p.name}
                  </span>
                  {hoveredId === p.id && p.id !== activeProfile.id && (
                    <Pencil className="h-3 w-3 shrink-0 text-white/40" />
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.08]" />

            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={() => {
                  onSettings();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[13px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  onHelpCenter();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[13px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Help Center
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.08]" />

            {/* Sign out */}
            <div className="p-1.5">
              <button
                onClick={() => {
                  onSignOut();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[13px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Sign out of Cinematic
              </button>
            </div>

            {/* Dedication */}
            <div className="px-4 pb-3 pt-1 text-center">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.28em] text-white/25">
                ILYAS NOVEX
              </span>
            </div>

            {/* Arrow */}
            <div className="absolute -top-2 right-3 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-ink-900/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN modal */}
      <AnimatePresence>
        {pinTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPinTarget(null)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={
                pinError
                  ? { opacity: 1, scale: 1, y: 0, x: [0, -9, 9, -7, 7, -4, 4, 0] }
                  : { opacity: 1, scale: 1, y: 0, x: 0 }
              }
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-ink-900/95 p-6 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10"
            >
              <div
                className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${pinTarget.avatarColor} flex items-center justify-center`}
              >
                {pinTarget.isKids ? (
                  <Baby className="h-7 w-7 text-white/90" />
                ) : (
                  <User className="h-7 w-7 text-white/90" />
                )}
              </div>
              <h3 className="text-[16px] font-semibold text-white">
                Enter PIN for {pinTarget.name}
              </h3>
              <p className="mt-1 text-[12.5px] text-white/45">
                This profile is protected by a 4-digit PIN
              </p>

              <div className="mt-5 flex justify-center gap-3">
                {pinSlots.map((slot, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      pinInputsRef.current[i] = el;
                    }}
                    value={slot}
                    onChange={(e) => setPinDigit(i, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && pinSlots[i] === "" && i > 0) {
                        pinInputsRef.current[i - 1]?.focus();
                      }
                      if (e.key === "Escape") setPinTarget(null);
                      if (e.key === "Enter" && pinSlots.every((d) => d !== "")) {
                        verifyPin(pinSlots.join(""));
                      }
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={1}
                    className={`h-12 w-11 rounded-xl border bg-white/[0.05] text-center text-[18px] font-semibold text-white transition-all focus:outline-none ${
                      pinError
                        ? "border-red-400/70 focus:ring-2 focus:ring-red-400/30"
                        : "border-white/15 focus:border-neon-400/60 focus:ring-2 focus:ring-neon-400/25"
                    }`}
                  />
                ))}
              </div>

              <p
                className={`mt-3 h-4 text-[12px] font-medium transition-opacity ${
                  pinError ? "text-red-400 opacity-100" : "opacity-0"
                }`}
              >
                Incorrect PIN — try again
              </p>

              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setPinTarget(null)}
                  className="rounded-xl px-5 py-2 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

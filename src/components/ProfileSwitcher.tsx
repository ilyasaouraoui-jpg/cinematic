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
  onManageProfiles,
  onAccount,
  onHelpCenter,
  onSignOut,
}: {
  activeProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  onManageProfiles: () => void;
  onAccount: () => void;
  onHelpCenter: () => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen(!open)}
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
                  onClick={() => {
                    onSelectProfile(p);
                    setOpen(false);
                  }}
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
                  onManageProfiles();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[13px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Manage Profiles
              </button>
              <button
                onClick={() => {
                  onAccount();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[13px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Account
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

            {/* Arrow */}
            <div className="absolute -top-2 right-3 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-ink-900/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

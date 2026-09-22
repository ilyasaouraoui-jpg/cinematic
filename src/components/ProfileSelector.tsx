import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Check, User, Baby, Pencil, Trash2 } from "lucide-react";
import {
  loadProfiles,
  saveProfiles,
  setActiveProfileId,
  createProfile,
  deleteProfile,
  type Profile,
  AVATAR_COLORS,
} from "../lib/profiles";

function ProfileAvatarCard({
  profile,
  onClick,
  onEdit,
  onDelete,
  canDelete,
}: {
  profile: Profile;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="group flex flex-col items-center gap-3 outline-none"
    >
      <div className="relative">
        <div
          className={`h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center shadow-lg transition-all duration-200 ${
            hovered
              ? "ring-[3px] ring-white shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              : "ring-1 ring-white/10"
          }`}
        >
          {profile.isKids ? (
            <Baby className="h-14 w-14 text-white/85" />
          ) : (
            <User className="h-14 w-14 text-white/85" />
          )}
        </div>

        {/* Edit / Delete buttons on hover */}
        <AnimatePresence>
          {hovered && (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-ink-800/90 text-white/80 shadow-lg backdrop-blur-md transition-colors hover:bg-ink-700 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </motion.button>
              {canDelete && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="absolute -left-1 -top-1 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-ink-800/90 text-red-400 shadow-lg backdrop-blur-md transition-colors hover:bg-red-900/80 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        {profile.isKids && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-blue-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
            Kids
          </span>
        )}
      </div>

      <span className="max-w-[120px] truncate text-[13px] font-medium text-white/70 transition-colors group-hover:text-white">
        {profile.name}
      </span>
    </motion.button>
  );
}

function AddProfileCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="group flex flex-col items-center gap-3 outline-none"
    >
      <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.03] flex items-center justify-center transition-all duration-200 group-hover:border-white/40 group-hover:bg-white/[0.06]">
        <Plus className="h-12 w-12 text-white/30 transition-colors group-hover:text-white/60" />
      </div>
      <span className="text-[13px] font-medium text-white/50 transition-colors group-hover:text-white/80">
        Add Profile
      </span>
    </motion.button>
  );
}

function ProfileFormModal({
  open,
  editProfile,
  onClose,
  onSave,
}: {
  open: boolean;
  editProfile: Profile | null;
  onClose: () => void;
  onSave: (name: string, color: string, isKids: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [isKids, setIsKids] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editProfile) {
        setName(editProfile.name);
        const idx = AVATAR_COLORS.indexOf(editProfile.avatarColor);
        setColorIdx(idx >= 0 ? idx : 0);
        setIsKids(editProfile.isKids);
      } else {
        setName("");
        setColorIdx(Math.floor(Math.random() * AVATAR_COLORS.length));
        setIsKids(false);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, editProfile]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-ink-900/95 shadow-2xl ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="font-display text-xl text-white">
            {editProfile ? "Edit Profile" : "Create Profile"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center shadow-lg`}
              >
                {isKids ? (
                  <Baby className="h-12 w-12 text-white/80" />
                ) : (
                  <User className="h-12 w-12 text-white/80" />
                )}
              </div>
              {name && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm whitespace-nowrap">
                  {name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {AVATAR_COLORS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setColorIdx(i)}
                  className={`relative h-9 w-9 rounded-full bg-gradient-to-br ${c} transition-transform duration-150 hover:scale-110`}
                >
                  {i === colorIdx && (
                    <span className="absolute inset-0 grid place-items-center rounded-full ring-2 ring-white ring-offset-2 ring-offset-ink-900">
                      <Check className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">
              Profile Name
            </label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim())
                  onSave(name.trim(), AVATAR_COLORS[colorIdx], isKids);
              }}
              placeholder="e.g. Ahmed"
              maxLength={24}
              className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]">
            <div>
              <span className="block text-[13.5px] font-medium text-white/90">
                Kids Profile
              </span>
              <span className="mt-0.5 block text-[11.5px] text-white/40">
                Restrict content to family-friendly genres
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsKids(!isKids)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                isKids ? "bg-neon-500" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isKids ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) onSave(name.trim(), AVATAR_COLORS[colorIdx], isKids);
            }}
            disabled={!name.trim()}
            className="rounded-xl bg-neon-600 px-5 py-2 text-[13px] font-semibold text-white shadow-lg shadow-neon-600/20 transition-all hover:bg-neon-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editProfile ? "Save Changes" : "Create Profile"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProfileSelector({
  onSelect,
}: {
  onSelect: (profile: Profile) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleSaveProfile = (name: string, color: string, isKids: boolean) => {
    if (editingProfile) {
      const updated = profiles.map((p) =>
        p.id === editingProfile.id
          ? { ...p, name, avatarColor: color, isKids }
          : p
      );
      saveProfiles(updated);
      setProfiles(updated);
      setEditingProfile(null);
    } else {
      const newProfile = createProfile(name, color, isKids);
      const updated = [...profiles, newProfile];
      saveProfiles(updated);
      setProfiles(updated);
      setShowModal(false);
      setActiveProfileId(newProfile.id);
      onSelect(newProfile);
    }
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    setProfiles(loadProfiles());
  };

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfileId(profile.id);
    onSelect(profile);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-ink-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[40vh] w-[40vh] rounded-full bg-neon-600/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[35vh] w-[35vh] rounded-full bg-aqua-400/6 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 text-center font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          Who's watching?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap items-start justify-center gap-5 sm:gap-7"
        >
          {profiles.map((profile) => (
            <ProfileAvatarCard
              key={profile.id}
              profile={profile}
              onClick={() => handleSelectProfile(profile)}
              onEdit={() => {
                setEditingProfile(profile);
                setShowModal(true);
              }}
              onDelete={() => handleDeleteProfile(profile.id)}
              canDelete={profiles.length > 1}
            />
          ))}

          <AddProfileCard onClick={() => setShowModal(true)} />
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ProfileFormModal
            open={showModal}
            editProfile={editingProfile}
            onClose={() => {
              setShowModal(false);
              setEditingProfile(null);
            }}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

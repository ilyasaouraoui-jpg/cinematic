import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Check, User, Pencil, Trash2, Lock } from "lucide-react";
import {
  loadProfiles,
  saveProfiles,
  setActiveProfileId,
  createProfile,
  deleteProfile,
  isValidPin,
  DEFAULT_PIN,
  type Profile,
  AVATAR_COLORS,
  EMOJI_AVATARS,
} from "../lib/profiles";
import { PinModal } from "./PinModal";
import { ProfileAvatar, avatarBg } from "./ProfileAvatar";

function GateTitle() {
  const lang = (
    localStorage.getItem("lang") ||
    (typeof navigator !== "undefined" ? navigator.language : "en") ||
    "en"
  ).toLowerCase();
  const isAr = lang.startsWith("ar");
  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-10 text-center font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
      lang={isAr ? "ar" : "en"}
    >
      {isAr ? "من يشاهد؟" : "Who's watching?"}
    </motion.h1>
  );
}

function getManageLabel(manage: boolean): string {
  const lang = (
    localStorage.getItem("lang") ||
    (typeof navigator !== "undefined" ? navigator.language : "en") ||
    "en"
  ).toLowerCase();
  const isAr = lang.startsWith("ar");
  if (isAr) return manage ? "تم" : "إدارة الملفات الشخصية";
  return manage ? "Done" : "Manage profiles";
}

function firstProfileCopy() {
  const lang = (
    localStorage.getItem("lang") ||
    (typeof navigator !== "undefined" ? navigator.language : "en") ||
    "en"
  ).toLowerCase();
  const isAr = lang.startsWith("ar");
  return {
    isAr,
    title: isAr ? "أنشئ ملفك الشخصي الأول" : "Create your first profile",
    subtitle: isAr
      ? "تُحفظ قوائمك ووضع الأطفال وقفل PIN في حسابك أنت — ولن يطّلع عليها أي حساب آخر."
      : "Your watchlist, kids mode and PIN locks live in this account only — no other account can see them.",
  };
}

function ProfileAvatarCard({
  profile,
  manage,
  onClick,
  onEdit,
  onDelete,
  canDelete,
}: {
  profile: Profile;
  manage: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = isValidPin(profile.pin);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      className="group flex flex-col items-center gap-2.5 outline-none"
    >
      <div className="relative">
        <div
          className={`rounded-xl transition-all duration-200 ${
            hovered || manage
              ? "ring-[3px] ring-white shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              : "ring-1 ring-white/10"
          }`}
        >
          <ProfileAvatar
            profile={profile}
            className="h-28 w-28 rounded-xl sm:h-32 sm:w-32"
            faceClass="h-[52%] w-[52%]"
            emojiClass="text-5xl sm:text-6xl"
          />
        </div>

        <AnimatePresence>
          {manage && (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label={`Edit ${profile.name}`}
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
                  aria-label={`Delete ${profile.name}`}
                  className="absolute -left-1 -top-1 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-ink-800/90 text-red-400 shadow-lg backdrop-blur-md transition-colors hover:bg-red-900/80 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <span className="max-w-[120px] truncate text-[14px] font-medium text-white/80 transition-colors group-hover:text-white">
        {profile.name}
      </span>

      <div className="flex h-4 items-center gap-1.5">
        {locked && <Lock className="h-3.5 w-3.5 text-white/45" />}
        {profile.isKids && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-300/90">
            Kids
          </span>
        )}
      </div>
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

export function ProfileFormModal({
  open,
  editProfile,
  onClose,
  onSave,
}: {
  open: boolean;
  editProfile: Profile | null;
  onClose: () => void;
  onSave: (
    name: string,
    color: string,
    isKids: boolean,
    pin: string,
    emoji: string
  ) => void;
}) {
  const [name, setName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [emoji, setEmoji] = useState("");
  const [isKids, setIsKids] = useState(false);
  const [pin, setPin] = useState(DEFAULT_PIN);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editProfile) {
        setName(editProfile.name);
        const idx = AVATAR_COLORS.indexOf(editProfile.avatarColor);
        setColorIdx(idx >= 0 ? idx : 0);
        setEmoji(editProfile.avatarEmoji ?? "");
        setIsKids(editProfile.isKids);
        setPin(isValidPin(editProfile.pin) ? editProfile.pin : "");
      } else {
        setName("");
        setColorIdx(Math.floor(Math.random() * AVATAR_COLORS.length));
        setEmoji("");
        setIsKids(false);
        setPin(DEFAULT_PIN);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, editProfile]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    const finalPin = pin.trim() === "" ? "" : isValidPin(pin) ? pin : DEFAULT_PIN;
    onSave(name.trim(), AVATAR_COLORS[colorIdx], isKids, finalPin, emoji);
  };

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
              <ProfileAvatar
                profile={{
                  avatarColor: AVATAR_COLORS[colorIdx],
                  avatarEmoji: emoji,
                  isKids,
                }}
                className="h-24 w-24 rounded-xl"
                faceClass="h-[52%] w-[52%]"
                emojiClass="text-5xl"
              />
              {name && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm whitespace-nowrap">
                  {name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setEmoji("")}
                title="Default icon"
                className={`relative grid h-9 w-9 place-items-center rounded-full bg-white/[0.07] transition-transform duration-150 hover:scale-110 ${
                  emoji === "" ? "ring-2 ring-neon-400" : ""
                }`}
              >
                <User className="h-4 w-4 text-white/70" />
              </button>
              {EMOJI_AVATARS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`relative grid h-9 w-9 place-items-center rounded-full bg-white/[0.07] text-[17px] transition-transform duration-150 hover:scale-110 ${
                    emoji === e ? "ring-2 ring-neon-400" : ""
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {AVATAR_COLORS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setColorIdx(i)}
                  aria-label={`Avatar color ${i + 1}`}
                  className={`relative h-9 w-9 rounded-lg ${avatarBg(
                    c
                  )} transition-transform duration-150 hover:scale-110`}
                >
                  {i === colorIdx && (
                    <span className="absolute inset-0 grid place-items-center rounded-lg ring-2 ring-white ring-offset-2 ring-offset-ink-900">
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
                if (e.key === "Enter" && name.trim()) submit();
              }}
              placeholder="e.g. Ahmed"
              maxLength={24}
              className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">
              Profile PIN{" "}
              <span className="font-normal text-white/35">(optional)</span>
            </label>
            <input
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              inputMode="numeric"
              placeholder="Leave empty to disable"
              maxLength={4}
              className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-[14px] tracking-[0.6em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:border-neon-400/50 focus:outline-none focus:ring-2 focus:ring-neon-400/20"
            />
            <span className="mt-1 block text-[11px] text-white/35">
              Asked when switching to this profile
            </span>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]">
            <div>
              <span className="block text-[13.5px] font-medium text-white/90">
                Kids Profile
              </span>
              <span className="mt-0.5 block text-[11.5px] text-white/40">
                Restrict content to Animation, Family & Documentaries
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
            onClick={submit}
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
  const [pinTarget, setPinTarget] = useState<Profile | null>(null);
  const [manage, setManage] = useState(false);

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const openAddProfile = () => {
    setEditingProfile(null);
    setShowModal(true);
  };

  const handleSaveProfile = (
    name: string,
    color: string,
    isKids: boolean,
    pin: string,
    emoji: string
  ) => {
    if (editingProfile) {
      const updated = profiles.map((p) =>
        p.id === editingProfile.id
          ? { ...p, name, avatarColor: color, isKids, pin, avatarEmoji: emoji }
          : p
      );
      saveProfiles(updated);
      setProfiles(updated);
      setEditingProfile(null);
    } else {
      const newProfile = createProfile(name, color, isKids, pin, emoji);
      const updated = [...profiles, newProfile];
      saveProfiles(updated);
      setProfiles(updated);
      setShowModal(false);
    }
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    setProfiles(loadProfiles());
  };

  const requestSelect = (profile: Profile) => {
    if (manage) {
      setEditingProfile(profile);
      setShowModal(true);
      return;
    }
    if (isValidPin(profile.pin)) {
      setPinTarget(profile);
      return;
    }
    setActiveProfileId(profile.id);
    onSelect(profile);
  };

  const isEmpty = profiles.length === 0;
  const copy = firstProfileCopy();

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#141414]">
      <div className="relative z-10 w-full max-w-4xl px-4">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <h1
              lang={copy.isAr ? "ar" : "en"}
              className="mb-4 text-center font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              {copy.title}
            </h1>
            <p className="mb-10 max-w-lg text-[14px] leading-relaxed text-white/50">
              {copy.subtitle}
            </p>
            <AddProfileCard onClick={openAddProfile} />
          </motion.div>
        ) : (
          <>
            <GateTitle />

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
                  manage={manage}
                  onClick={() => requestSelect(profile)}
                  onEdit={() => {
                    setEditingProfile(profile);
                    setShowModal(true);
                  }}
                  onDelete={() => handleDeleteProfile(profile.id)}
                  canDelete={profiles.length > 1}
                />
              ))}

              <AddProfileCard onClick={openAddProfile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-10 flex justify-center"
            >
              <button
                onClick={() => setManage((m) => !m)}
                className={`rounded-md border px-6 py-2 text-[13px] font-medium transition-colors ${
                  manage
                    ? "border-neon-400/70 bg-neon-500/15 text-neon-300 hover:bg-neon-500/25"
                    : "border-white/35 text-white/75 hover:border-white/60 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {getManageLabel(manage)}
              </button>
            </motion.div>
          </>
        )}
      </div>

      <PinModal
        target={pinTarget}
        onClose={() => setPinTarget(null)}
        onSuccess={(p) => {
          setActiveProfileId(p.id);
          setPinTarget(null);
          onSelect(p);
        }}
      />

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

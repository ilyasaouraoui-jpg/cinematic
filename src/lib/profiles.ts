export interface Profile {
  id: string;
  name: string;
  avatarColor: string;
  isKids: boolean;
  createdAt: number;
  pin: string;
  avatarEmoji?: string;
}

export const DEFAULT_PIN = "0000";

export function isValidPin(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export const AVATAR_COLORS = [
  "from-amber-400 to-rose-500",
  "from-neon-400 to-aqua-400",
  "from-emerald-400 to-teal-500",
  "from-slate-400 to-slate-600",
  "from-violet-400 to-fuchsia-500",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-pink-400 to-rose-600",
];

const PROFILES_KEY = "profiles";
const ACTIVE_PROFILE_KEY = "activeProfileId";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const list: Profile[] = raw ? JSON.parse(raw) : [];
    let needsMigration = false;
    const migrated = list.map((p) => {
      if (p.pin === undefined || p.pin === null) {
        needsMigration = true;
        return { ...p, pin: DEFAULT_PIN };
      }
      return p;
    });
    if (needsMigration) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function clearActiveProfileId(): void {
  localStorage.removeItem(ACTIVE_PROFILE_KEY);
}

export const EMOJI_AVATARS = [
  "😀",
  "😎",
  "🐱",
  "🐶",
  "🦊",
  "🐼",
  "🚀",
  "🎮",
  "🎬",
  "⭐",
  "🌈",
  "🤖",
];

export function ensureDefaultProfiles(): Profile[] {
  let list = loadProfiles();
  if (list.length === 0) {
    const normal = createProfile("Normal", AVATAR_COLORS[1], false, DEFAULT_PIN);
    const kids = createProfile("Kids", AVATAR_COLORS[6], true, DEFAULT_PIN);
    list = [normal, kids];
    saveProfiles(list);
  }
  return list;
}

export function createProfile(
  name: string,
  avatarColor: string,
  isKids: boolean,
  pin: string = DEFAULT_PIN,
  avatarEmoji?: string
): Profile {
  return {
    id: generateId(),
    name,
    avatarColor,
    isKids,
    createdAt: Date.now(),
    pin: isValidPin(pin) ? pin : pin === "" ? "" : DEFAULT_PIN,
    avatarEmoji,
  };
}

export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter((p) => p.id !== id);
  saveProfiles(profiles);
  localStorage.removeItem(`watchlist_${id}`);
  if (getActiveProfileId() === id) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

const WATCHLIST_KEY_PREFIX = "watchlist_";

export function loadProfileWatchlist(profileId: string): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY_PREFIX + profileId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProfileWatchlist(profileId: string, mediaIds: string[]): void {
  localStorage.setItem(WATCHLIST_KEY_PREFIX + profileId, JSON.stringify(mediaIds));
}

export function addToProfileWatchlist(profileId: string, mediaId: string): void {
  const current = loadProfileWatchlist(profileId);
  if (!current.includes(mediaId)) {
    saveProfileWatchlist(profileId, [...current, mediaId]);
  }
}

export function removeFromProfileWatchlist(profileId: string, mediaId: string): void {
  const current = loadProfileWatchlist(profileId);
  saveProfileWatchlist(profileId, current.filter((id) => id !== mediaId));
}

export function toggleInProfileWatchlist(profileId: string, mediaId: string): boolean {
  const current = loadProfileWatchlist(profileId);
  if (current.includes(mediaId)) {
    saveProfileWatchlist(profileId, current.filter((id) => id !== mediaId));
    return false;
  }
  saveProfileWatchlist(profileId, [...current, mediaId]);
  return true;
}

export const KIDS_GENRE_IDS = [16, 10751, 99];
export const KIDS_GENRE_PARAM = KIDS_GENRE_IDS.join(",");

const BLOCKED_GENRE_IDS = [27, 53, 80, 10752];
const SAFE_GENRE_NAMES = ["Animation", "Family", "Documentary"];
const BLOCKED_GENRE_NAMES = ["Horror", "Thriller", "Crime", "War"];

export interface KidsSafeable {
  genre_ids?: number[];
  genres?: string[];
  adult?: boolean;
}

export function isKidsSafe(item: KidsSafeable): boolean {
  if (item.adult) return false;
  const ids = item.genre_ids ?? [];
  const names = item.genres ?? [];
  if (ids.some((id) => BLOCKED_GENRE_IDS.includes(id))) return false;
  if (names.some((n) => BLOCKED_GENRE_NAMES.includes(n))) return false;
  return (
    ids.some((id) => KIDS_GENRE_IDS.includes(id)) ||
    names.some((n) => SAFE_GENRE_NAMES.includes(n))
  );
}

export function filterKids<T extends KidsSafeable>(items: T[]): T[] {
  return items.filter(isKidsSafe);
}

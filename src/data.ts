import { IMG } from "./assets";

export type Title = {
  id: string;
  name: string;
  poster: string;
  backdrop?: string;
  year: number;
  seasons?: number;
  rating: string;
  score: number;
  genres: string[];
  badge?: "S" | "ORIGINAL" | "NEW" | "4K";
  kind: "anime" | "movie" | "series";
  synopsis: string;
  media_type?: string;
};

export type HeroItem = {
  id: string;
  title: string;
  image: string;
  fontClass: string;
  year: number;
  seasons: number;
  rating: string;
  score: number;
  genres: string[];
  synopsis: string;
  tagline: string;
};

export const heroes: HeroItem[] = [
  {
    id: "h1",
    title: "Houses & Dragons",
    image: IMG.heroDragons,
    fontClass: "font-display tracking-[0.02em]",
    year: 2029,
    seasons: 3,
    rating: "TV-MA",
    score: 4.9,
    genres: ["Fantasy", "Drama", "Sci-Fi"],
    tagline: "",
    synopsis:
      "Two centuries before the fall of the old realm, the dragon-riding dynasty is torn apart by ambition. When the crown passes to an unexpected heir, a war of succession threatens to burn the seven houses to ash.",
  },
  {
    id: "h2",
    title: "Demonic Slash",
    image: IMG.heroDemonic,
    fontClass: "font-gothic tracking-normal",
    year: 2028,
    seasons: 82,
    rating: "TV-14",
    score: 4.8,
    genres: ["Cartoon", "Action", "Supernatural"],
    tagline: "",
    synopsis:
      "When a small, unsuspecting town becomes the hunting ground for a malevolent entity, a group of unlikely heroes must rise — The Demonic Slash Group.",
  },
  {
    id: "h3",
    title: "Rise of X",
    image: IMG.heroRise,
    fontClass: "font-display tracking-[0.06em]",
    year: 2028,
    seasons: 2,
    rating: "TV-MA",
    score: 4.7,
    genres: ["Sci-Fi", "Adventure", "Epic"],
    tagline: "#1 in TV shows today",
    synopsis:
      "A forgotten soldier awakens on the edge of a dying nebula carrying the last weapon of a vanished civilisation — and every empire in the galaxy wants it.",
  },
];

const P = (n: number) => IMG.posters[n - 1];

export const library: Title[] = [
  {
    id: "t1", name: "The Last Dusk", poster: P(1), year: 2027, seasons: 2, rating: "TV-MA", score: 4.8,
    genres: ["Drama", "Survival"], badge: "S", kind: "series",
    synopsis: "Twenty years after the collapse, a smuggler escorts a girl who may hold the cure across a ruined continent.",
  },
  {
    id: "t2", name: "Dune Runner", poster: P(2), year: 2026, rating: "PG-13", score: 4.6,
    genres: ["Sci-Fi", "Western"], badge: "4K", kind: "movie",
    synopsis: "A lone bounty hunter crosses the twin-sun deserts to deliver a cargo that could ignite a system-wide war.",
  },
  {
    id: "t3", name: "Hollow Crown", poster: P(3), year: 2029, seasons: 1, rating: "TV-14", score: 4.9,
    genres: ["Anime", "Magic"], badge: "ORIGINAL", kind: "anime",
    synopsis: "A cursed witch bargains with the moon to save her village, but every spell costs her a memory.",
  },
  {
    id: "t4", name: "Neon Requiem", poster: P(4), year: 2028, seasons: 3, rating: "TV-MA", score: 4.7,
    genres: ["Cyberpunk", "Thriller"], badge: "S", kind: "series",
    synopsis: "In a rain-drenched megacity, a memory broker discovers a recording that proves she was murdered last year.",
  },
  {
    id: "t5", name: "Winterhold", poster: P(5), year: 2025, seasons: 4, rating: "TV-MA", score: 4.5,
    genres: ["Fantasy", "War"], badge: "NEW", kind: "series",
    synopsis: "Beyond the frozen wall, an exiled heir raises an army of ravens and rebels against the crown that burned her name.",
  },
  {
    id: "t6", name: "Crimson Petal", poster: P(6), year: 2029, seasons: 2, rating: "TV-14", score: 4.9,
    genres: ["Anime", "Action"], badge: "ORIGINAL", kind: "anime",
    synopsis: "A wandering swordsman sworn to never kill again must break his oath to protect the last blossom shrine.",
  },
  {
    id: "t7", name: "Iron Dawn", poster: P(7), year: 2027, seasons: 5, rating: "TV-PG", score: 4.4,
    genres: ["Mecha", "Anime"], badge: "4K", kind: "anime",
    synopsis: "Teen pilots bond with ancient titans to hold the line against something crawling out of the sea.",
  },
  {
    id: "t8", name: "Ashfall", poster: P(1), year: 2024, rating: "R", score: 4.2,
    genres: ["Thriller"], kind: "movie",
    synopsis: "A volcanologist has nine hours to evacuate a city that refuses to believe her.",
  },
  {
    id: "t9", name: "Solstice Gate", poster: P(5), year: 2026, seasons: 2, rating: "TV-14", score: 4.3,
    genres: ["Fantasy"], badge: "S", kind: "series",
    synopsis: "Every solstice a door opens in the mountain. This year, something came back through it.",
  },
  {
    id: "t10", name: "Violet Static", poster: P(4), year: 2029, rating: "TV-MA", score: 4.6,
    genres: ["Cyberpunk"], badge: "NEW", kind: "movie",
    synopsis: "An AI street preacher begins broadcasting prophecies that keep coming true.",
  },
  {
    id: "t11", name: "Blossom Oath", poster: P(6), year: 2028, seasons: 1, rating: "TV-14", score: 4.8,
    genres: ["Anime", "Romance"], kind: "anime",
    synopsis: "Two rival calligraphers fall for each other across a hundred handwritten letters.",
  },
  {
    id: "t12", name: "Titan Protocol", poster: P(7), year: 2025, seasons: 3, rating: "TV-PG", score: 4.1,
    genres: ["Mecha"], badge: "ORIGINAL", kind: "anime",
    synopsis: "The last mech factory on earth activates a protocol nobody authorised.",
  },
];

const pick = (ids: string[]) => ids.map((id) => library.find((t) => t.id === id)!).filter(Boolean);

export const rows: { title: string; items: Title[] }[] = [
  { title: "More Like This", items: pick(["t1", "t2", "t6", "t5", "t3", "t4", "t7", "t9"]) },
  { title: "Popular on slothUI", items: pick(["t4", "t7", "t10", "t1", "t12", "t6", "t2", "t11"]) },
  { title: "Anime Originals", items: pick(["t3", "t6", "t7", "t11", "t12", "t4", "t9", "t5"]) },
  { title: "Continue Watching", items: pick(["t5", "t9", "t8", "t2", "t10", "t1", "t3", "t6"]) },
];

export type Episode = { n: number; title: string; still: string; dur: string; desc: string };

export const episodes: Episode[] = [
  { n: 1, title: "The Town That Sleeps", still: P(3), dur: "24m", desc: "A quiet town wakes to find the forest has moved closer overnight." },
  { n: 2, title: "Blade of Embers", still: P(6), dur: "24m", desc: "Rin forges her first ember blade under the watch of the old smith." },
  { n: 3, title: "Demon Resurrected", still: P(4), dur: "26m", desc: "An old enemy returns wearing a familiar face." },
  { n: 4, title: "Crimson Pact", still: P(5), dur: "25m", desc: "The group signs a pact none of them fully understand." },
  { n: 5, title: "Where Light Fails", still: P(1), dur: "27m", desc: "Beneath the shrine, the truth of the first slash is revealed." },
];

export const languages = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "es", label: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "ja", label: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ko", label: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "pt", label: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "off", label: "Off", native: "No subtitles", flag: "🚫" },
];

const byId = (id: string) => library.find((t) => t.id === id)!;

export const myList = pick(["t3", "t6", "t4", "t1", "t5", "t7", "t10", "t9"]);

export const trending: { item: Title; delta: number | "new" }[] = [
  { item: byId("t3"), delta: "new" },
  { item: byId("t6"), delta: 3 },
  { item: byId("t4"), delta: 1 },
  { item: byId("t1"), delta: 0 },
  { item: byId("t7"), delta: 2 },
  { item: byId("t5"), delta: -1 },
  { item: byId("t10"), delta: 4 },
  { item: byId("t2"), delta: 0 },
  { item: byId("t11"), delta: -2 },
  { item: byId("t12"), delta: 1 },
];

export type Alert = {
  id: string;
  kind: "episode" | "season" | "trend" | "match" | "quality";
  title: string;
  show: string;
  desc: string;
  time: string;
  poster: string;
  unread: boolean;
};

export const initialAlerts: Alert[] = [
  { id: "a1", kind: "episode", title: "New episode available", show: "Demonic Slash", desc: "S1 · E5 — Where Light Fails just dropped.", time: "2h ago", poster: P(3), unread: true },
  { id: "a2", kind: "season", title: "New season out now", show: "Hollow Crown", desc: "Season 2 premieres exclusively on slothui.", time: "8h ago", poster: P(5), unread: true },
  { id: "a3", kind: "trend", title: "Trending #1 in your region", show: "Crimson Petal", desc: "Watched 128K times this week.", time: "1d ago", poster: P(6), unread: false },
  { id: "a4", kind: "episode", title: "New episode available", show: "Neon Requiem", desc: "S3 · E8 — Blackout Protocol.", time: "2d ago", poster: P(4), unread: false },
  { id: "a5", kind: "match", title: "Because you watched The Last Dusk", show: "Violet Static", desc: "96% match · a cyberpunk thriller.", time: "3d ago", poster: P(4), unread: false },
  { id: "a6", kind: "quality", title: "Now in 4K Dolby Vision", show: "Dune Runner", desc: "Upgraded to 4K HDR with Dolby Atmos.", time: "5d ago", poster: P(2), unread: false },
];

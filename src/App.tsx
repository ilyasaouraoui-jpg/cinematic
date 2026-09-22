import { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "./components/TopBar";
import { Hero } from "./components/Hero";
import { Carousel } from "./components/Carousel";
import { VideoPlayer } from "./components/VideoPlayer";
import { DetailModal } from "./components/DetailModal";
import { AuthPage } from "./components/AuthPage";
import { ProfileSelector } from "./components/ProfileSelector";
import { SearchPage, ProfilePage, SettingsPage } from "./components/Pages";
import { MyListPage, TrendingPage, AlertsPage } from "./components/ListPages";
import { TitlePage } from "./components/TitlePage";
import { AdvancedBrowsePage } from "./components/AdvancedBrowsePage";
import { rows, type Title } from "./data";
import { tmdbAPI, type TMDBTitle, tmdbToTitle } from "./api";
import {
  loadProfiles,
  getActiveProfileId,
  setActiveProfileId,
  type Profile,
} from "./lib/profiles";
import { WatchlistProvider } from "./context/WatchlistContext";

export interface PlayerState {
  open: boolean;
  embedUrl: string | null;
  title: string;
  season?: number;
  episode?: number;
}

function HomePage({
  openDetail,
  trendingItems,
}: {
  openDetail: (t: Title) => void;
  trendingItems: Title[];
}) {
  const play = () => {
    if (trendingItems.length > 0) openDetail(trendingItems[0]);
  };

  const homeRows =
    trendingItems.length > 0
      ? [
          { title: "Trending Now", items: trendingItems.slice(0, 20) },
          {
            title: "Popular Movies",
            items: trendingItems
              .filter((i) => i.kind === "movie")
              .slice(0, 20),
          },
          {
            title: "Anime & Series",
            items: trendingItems
              .filter((i) => i.kind === "series")
              .slice(0, 20),
          },
          { title: "More Like This", items: trendingItems.slice(10, 30) },
        ]
      : rows;

  return (
    <>
      <Hero
        onPlay={play}
        onInfo={() => openDetail(homeRows[0].items[0])}
        trending={trendingItems}
      />
      <div className="relative z-10 -mt-6 pb-16">
        {homeRows.map((r) => (
          <Carousel
            key={r.title}
            title={r.title}
            items={r.items}
            onOpen={openDetail}
            onPlay={play}
          />
        ))}
        <Footer />
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-14 border-t border-white/[0.06] px-5 py-10 text-[12px] text-white/35 md:px-12 lg:px-16">
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        {[
          "Audio & Subtitles",
          "Media Centre",
          "Privacy",
          "Contact Us",
          "Legal Notices",
          "Cookie Preferences",
        ].map((l) => (
          <button
            key={l}
            className="transition-colors hover:text-white/70"
          >
            {l}
          </button>
        ))}
      </div>
      <p className="mt-6 text-white/25">
        &copy; 2026 Cinematic Streaming Platform. All rights reserved.
      </p>
    </footer>
  );
}

export function App() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    token: string;
  } | null>(null);
  const [authed, setAuthed] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profileSelected, setProfileSelected] = useState(false);
  const [detail, setDetail] = useState<Title | null>(null);
  const [searchSeed, setSearchSeed] = useState("");
  const [trendingItems, setTrendingItems] = useState<Title[]>([]);
  const [searchResults, setSearchResults] = useState<Title[]>([]);
  const [detailEmbedUrl, setDetailEmbedUrl] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    open: false,
    embedUrl: null,
    title: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setAuthed(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (authed && !profileSelected) {
      const profiles = loadProfiles();
      if (profiles.length === 0) return;
      const savedId = getActiveProfileId();
      const found = savedId ? profiles.find((p) => p.id === savedId) : null;
      if (found) {
        setActiveProfile(found);
        setProfileSelected(true);
      }
    }
  }, [authed, profileSelected]);

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile);
    setProfileSelected(true);
  };

  const handleSwitchProfile = (profile: Profile) => {
    setActiveProfile(profile);
    setActiveProfileId(profile.id);
  };

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await tmdbAPI.trending();
      if (data.results) {
        const mapped = data.results.map((m: TMDBTitle) => {
          const t = tmdbToTitle(m);
          return {
            id: String(m.tmdb_id),
            name: t.name,
            poster: t.poster,
            backdrop: t.backdrop,
            year: t.year,
            rating: "PG-13",
            score: t.score,
            genres: t.genres,
            kind: t.kind,
            synopsis: t.synopsis,
            media_type: m.media_type,
            badge: t.badge,
          } as Title & { media_type: string };
        });
        setTrendingItems(mapped);
      }
    } catch (err) {
      console.error("[Home] Failed to fetch trending:", err);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchTrending();
  }, [authed, fetchTrending]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow =
      playerState.open || detail ? "hidden" : "";
  }, [playerState.open, detail]);

  const handleAuth = (userData: {
    name: string;
    email: string;
    token: string;
  }) => {
    setUser(userData);
    setAuthed(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  if (!authed) return <AuthPage onAuth={handleAuth} />;

  if (!profileSelected) {
    return <ProfileSelector onSelect={handleProfileSelect} />;
  }

  const openDetail = (t: Title) => {
    const tmdbId = (t as any).id;
    const mediaType =
      (t as any).media_type || (t.kind === "series" ? "tv" : "movie");
    setDetail({ ...t, id: String(tmdbId) });
    setDetailEmbedUrl(null);
    tmdbAPI
      .details(tmdbId, mediaType)
      .then(({ data }) => {
        if (data.embed_url) setDetailEmbedUrl(data.embed_url);
      })
      .catch(() => {});
  };

  const openPlayer = (
    embedUrl: string,
    title: string,
    season?: number,
    episode?: number
  ) => {
    setDetail(null);
    setPlayerState({ open: true, embedUrl, title, season, episode });
  };

  const play = () => {
    if (detail && detailEmbedUrl) {
      openPlayer(detailEmbedUrl, detail.name);
    } else if (detail) {
      const mediaType =
        (detail as any).media_type ||
        (detail.kind === "series" ? "tv" : "movie");
      tmdbAPI
        .details(detail.id, mediaType)
        .then(({ data }) => {
          if (data.embed_url) openPlayer(data.embed_url, detail.name);
        })
        .catch(() => {});
    }
  };

  const goSearch = (q: string) => {
    setSearchSeed(q);
    navigate("/search");
  };

  const openTitlePage = (t: Title) => {
    const mediaType =
      (t as any).media_type || (t.kind === "series" ? "tv" : "movie");
    navigate(`/title/${mediaType}/${t.id}`);
  };

  return (
    <WatchlistProvider profileId={activeProfile?.id || null}>
      <div className="relative min-h-svh bg-ink-950">
        <div className="pointer-events-none fixed left-1/4 top-0 -z-0 h-[50vh] w-[50vh] rounded-full bg-neon-600/12 blur-[140px]" />
        <TopBar
          onOpen={openDetail}
          onGoSearch={goSearch}
          searchResults={searchResults}
          user={user}
          activeProfile={activeProfile}
          onSwitchProfile={handleSwitchProfile}
          onLogout={() => {
            setUser(null);
            setAuthed(false);
            setProfileSelected(false);
            navigate("/");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }}
        />
        <main className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      openDetail={openTitlePage}
                      trendingItems={trendingItems}
                    />
                  }
                />
                <Route
                  path="/browse"
                  element={
                    <AdvancedBrowsePage
                      onOpen={openTitlePage}
                      onPlay={play}
                    />
                  }
                />
                <Route
                  path="/search"
                  element={
                    <SearchPage
                      key={searchSeed}
                      initial={searchSeed}
                      onOpen={openTitlePage}
                      onPlay={play}
                      onSearchResults={setSearchResults}
                    />
                  }
                />
                <Route
                  path="/mylist"
                  element={
                    <MyListPage
                      onOpen={openTitlePage}
                      onPlay={play}
                    />
                  }
                />
                <Route
                  path="/trending"
                  element={
                    <TrendingPage
                      onOpen={openTitlePage}
                      onPlay={play}
                      trendingItems={trendingItems}
                    />
                  }
                />
                <Route
                  path="/alerts"
                  element={<AlertsPage onOpen={openTitlePage} />}
                />
                <Route
                  path="/profile"
                  element={
                    <ProfilePage
                      onOpen={openTitlePage}
                      onPlay={play}
                      user={user}
                      onLogout={() => {
                        setUser(null);
                        setAuthed(false);
                        setProfileSelected(false);
                        navigate("/");
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                      }}
                    />
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/title/:type/:id"
                  element={
                    <TitlePage
                      onPlayEmbed={(url, title, season, episode) =>
                        openPlayer(url, title, season, episode)
                      }
                      onOpen={openTitlePage}
                    />
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <DetailModal
          item={detail}
          onClose={() => setDetail(null)}
          onPlay={play}
          embedUrl={detailEmbedUrl}
          onPlayEmbed={(url, title, season, episode) =>
            openPlayer(url, title || "", season, episode)
          }
        />
        <VideoPlayer
          open={playerState.open}
          onClose={() =>
            setPlayerState((s) => ({ ...s, open: false }))
          }
          embedUrl={playerState.embedUrl}
          title={playerState.title}
          season={playerState.season}
          episode={playerState.episode}
        />
      </div>
    </WatchlistProvider>
  );
}

export default App;

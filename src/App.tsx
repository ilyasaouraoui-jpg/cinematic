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
  ensureDefaultProfiles,
  getActiveProfileId,
  setActiveProfileId,
  clearActiveProfileId,
  type Profile,
} from "./lib/profiles";
import { WatchlistProvider, useWatchlist, type WatchlistItem } from "./context/WatchlistContext";
import { filterKids, KIDS_GENRE_PARAM } from "./lib/kidsFilter";

export interface PlayerState {
  open: boolean;
  embedUrl: string | null;
  title: string;
  season?: number;
  episode?: number;
}

function AuthContinuation({
  ready,
  pendingSave,
  pendingNav,
  onConsume,
}: {
  ready: boolean;
  pendingSave: WatchlistItem | null;
  pendingNav: string | null;
  onConsume: () => void;
}) {
  const { add } = useWatchlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (pendingSave) {
      add(pendingSave);
      onConsume();
      return;
    }
    if (pendingNav) {
      navigate(pendingNav);
      onConsume();
    }
  }, [ready, pendingSave, pendingNav, add, navigate, onConsume]);

  return null;
}

function HomePage({
  openDetail,
  trendingItems,
  isKids = false,
}: {
  openDetail: (t: Title) => void;
  trendingItems: Title[];
  isKids?: boolean;
}) {
  const { has, toggle } = useWatchlist();

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
      : isKids
        ? []
        : rows;

  return (
    <>
      <Hero
        onPlay={play}
        onInfo={() => {
          const t = homeRows[0]?.items?.[0];
          if (t) openDetail(t);
        }}
        trending={trendingItems}
        isKids={isKids}
        isSaved={(t) => has(t.id)}
        onToggleSave={toggle}
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
  const [authed, setAuthed] = useState(() => {
    try {
      return !!(
        localStorage.getItem("token") && localStorage.getItem("user")
      );
    } catch {
      return false;
    }
  });
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profileSelected, setProfileSelected] = useState(false);
  const [forceGate, setForceGate] = useState(false);
  const [detail, setDetail] = useState<Title | null>(null);
  const [searchSeed, setSearchSeed] = useState("");
  const [trendingItems, setTrendingItems] = useState<Title[]>([]);
  const [searchResults, setSearchResults] = useState<Title[]>([]);
  const [detailEmbedUrl, setDetailEmbedUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingSave, setPendingSave] = useState<WatchlistItem | null>(null);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
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
    if (authed && !profileSelected && !forceGate) {
      const list = ensureDefaultProfiles();
      if (list.length === 0) return;
      const savedId = getActiveProfileId();
      const found = savedId ? list.find((p) => p.id === savedId) : null;
      const pick = found || list[0];
      setActiveProfile(pick);
      setProfileSelected(true);
      setActiveProfileId(pick.id);
    }
  }, [authed, profileSelected, forceGate]);

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile);
    setProfileSelected(true);
    setForceGate(false);
    setActiveProfileId(profile.id);
    navigate("/", { replace: true });
  };

  const handleSwitchProfile = (profile: Profile) => {
    setActiveProfile(profile);
    setActiveProfileId(profile.id);
  };

  const requireAuth = useCallback((item?: WatchlistItem) => {
    setPendingSave(item ?? null);
    setShowAuth(true);
  }, []);

  const cancelAuth = useCallback(() => {
    setShowAuth(false);
    setPendingSave(null);
    setPendingNav(null);
  }, []);

  const consumePending = useCallback(() => {
    setPendingSave(null);
    setPendingNav(null);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setAuthed(false);
    setProfileSelected(false);
    setForceGate(false);
    setActiveProfile(null);
    navigate("/");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === "/mylist" && !authed) {
      setPendingNav("/mylist");
      setShowAuth(true);
      navigate("/", { replace: true });
    }
  }, [location.pathname, authed, navigate]);

  useEffect(() => {
    if (
      authed &&
      !profileSelected &&
      forceGate &&
      location.pathname !== "/profiles"
    ) {
      navigate("/profiles", { replace: true });
    }
  }, [authed, profileSelected, forceGate, location.pathname, navigate]);

  const isKids = !!activeProfile?.isKids;
  const visibleTrending = isKids ? filterKids(trendingItems) : trendingItems;

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = isKids
        ? await tmdbAPI.discover({
            genre: KIDS_GENRE_PARAM,
            sort: "popularity.desc",
          })
        : await tmdbAPI.trending();
      if (data.results) {
        const source = isKids ? filterKids(data.results) : data.results;
        const mapped = source.map((m: TMDBTitle) => {
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
            genre_ids: m.genre_ids,
          } as Title & { media_type: string; genre_ids: number[] };
        });
        setTrendingItems(mapped);
      }
    } catch (err) {
      console.error("[Home] Failed to fetch trending:", err);
    }
  }, [isKids]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);
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
    setProfileSelected(false);
    setForceGate(true);
    setActiveProfile(null);
    clearActiveProfileId();
    localStorage.setItem("user", JSON.stringify(userData));
  };

  if (authed && !profileSelected && forceGate) {
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
    <WatchlistProvider
      profileId={activeProfile?.id || null}
      isAuthed={authed}
      onRequireAuth={requireAuth}
    >
      <div className="relative min-h-svh bg-ink-950">
        <div className="pointer-events-none fixed left-1/4 top-0 -z-0 h-[50vh] w-[50vh] rounded-full bg-neon-600/12 blur-[140px]" />
        <TopBar
          onOpen={openDetail}
          onGoSearch={goSearch}
          searchResults={searchResults}
          user={user}
          authed={authed}
          onSignIn={() => setShowAuth(true)}
          activeProfile={activeProfile}
          onSwitchProfile={handleSwitchProfile}
          onLogout={handleLogout}
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
                      trendingItems={visibleTrending}
                      isKids={isKids}
                    />
                  }
                />
                <Route
                  path="/browse"
                  element={
                    <AdvancedBrowsePage
                      onOpen={openTitlePage}
                      onPlay={play}
                      isKids={isKids}
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
                      isKids={isKids}
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
                      trendingItems={visibleTrending}
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
                      onLogout={handleLogout}
                    />
                  }
                />
                <Route
                  path="/profiles"
                  element={
                    <ProfileSelector
                      onSelect={(p) => {
                        handleSwitchProfile(p);
                        navigate("/", { replace: true });
                      }}
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      activeProfile={activeProfile}
                      onSwitchProfile={handleSwitchProfile}
                    />
                  }
                />
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

        <AuthContinuation
          ready={authed && profileSelected}
          pendingSave={pendingSave}
          pendingNav={pendingNav}
          onConsume={consumePending}
        />

        {showAuth && !authed && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950">
            <AuthPage onAuth={handleAuth} />
            <button
              onClick={cancelAuth}
              aria-label="Close"
              className="fixed right-4 top-4 z-[10000] grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white/70 ring-1 ring-white/15 transition hover:bg-black/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </WatchlistProvider>
  );
}

export default App;

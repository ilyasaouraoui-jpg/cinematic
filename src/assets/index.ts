const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const IMG = {
  heroDragons: px(36689843, 1600, 900),
  heroDemonic: px(10385384, 1600, 900),
  heroRise: px(3986695, 1600, 900),
  posters: [
    px(28309988, 600, 900), // p1 — The Last Dusk (overgrown ruins)
    px(27332120, 600, 900), // p2 — Dune Runner (desert sunset)
    px(34491690, 600, 900), // p3 — Hollow Crown (candle witch)
    px(11213204, 600, 900), // p4 — Neon Requiem (neon rain)
    px(18714731, 600, 900), // p5 — Winterhold (aurora peaks)
    px(38480954, 600, 900), // p6 — Crimson Petal (samurai twilight)
    px(8294557, 600, 900),  // p7 — Iron Dawn (robot)
  ],
};

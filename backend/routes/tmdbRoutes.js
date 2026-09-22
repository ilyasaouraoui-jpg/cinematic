const express = require("express");
const router = express.Router();
const {
  getTrending,
  searchMulti,
  getDetails,
  getDiscover,
  getGenres,
  getSeasons,
  getEpisodeEmbed,
  getSimilar,
  getPopular,
} = require("../controllers/tmdbController");

router.get("/trending/:time_window", getTrending);
router.get("/search", searchMulti);
router.get("/details/:id", getDetails);
router.get("/seasons/:id", getSeasons);
router.get("/embed/:tmdbId/season/:season/episode/:episode", getEpisodeEmbed);
router.get("/discover", getDiscover);
router.get("/popular/:media_type", getPopular);
router.get("/genres", getGenres);
router.get("/similar/:id", getSimilar);

module.exports = router;

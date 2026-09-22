const User = require("../models/User");

const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const { mediaId, mediaType, title, posterPath } = req.body;

    if (!mediaId || !mediaType) {
      return res.status(400).json({ message: "mediaId and mediaType are required" });
    }

    if (!["movie", "tv"].includes(mediaType)) {
      return res.status(400).json({ message: "mediaType must be 'movie' or 'tv'" });
    }

    const user = await User.findById(req.user._id);

    const alreadyExists = user.watchlist.some(
      (item) => item.mediaId === mediaId && item.mediaType === mediaType
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Item already in watchlist" });
    }

    user.watchlist.push({ mediaId, mediaType, title, posterPath });
    await user.save();

    res.status(201).json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;

    const user = await User.findById(req.user._id);

    const initialLength = user.watchlist.length;
    user.watchlist = user.watchlist.filter(
      (item) => !(item.mediaId === Number(mediaId) && item.mediaType === mediaType)
    );

    if (user.watchlist.length === initialLength) {
      return res.status(404).json({ message: "Item not found in watchlist" });
    }

    await user.save();
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };

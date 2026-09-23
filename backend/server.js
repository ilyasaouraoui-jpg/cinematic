const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const dbReady = () => connectDB().catch((err) => {
  console.error("DB connection failed:", err.message);
  throw err;
});

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", async (req, res, next) => {
  try { await dbReady(); next(); } catch (e) { next(e); }
}, require("./routes/authRoutes"));
app.use("/api/tmdb", require("./routes/tmdbRoutes"));
app.use("/api/watchlist", async (req, res, next) => {
  try { await dbReady(); next(); } catch (e) { next(e); }
}, require("./routes/watchlistRoutes"));

const clientBuild = path.join(__dirname, "public");
app.use(express.static(clientBuild));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

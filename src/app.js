require("dotenv").config();
const express = require("express");
const path = require("path");
const apiRoutes = require("./routes/api");
const uiRoutes = require("./routes/ui");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// API Routes
app.use("/api", apiRoutes);

// Health Check (Explicitly requested in root or api? Prompt says GET /api/healthz)
// apiRoutes handles /api, so inside api.js we should have /healthz or mount it here.
// I'll add it to api.js or here.
// The prompt says GET /api/healthz.
// If I mount apiRoutes at /api, and api.js has /healthz, it works.
// Let's create `src/routes/health.js` or just add to `api.js`.
// I'll add a simple handler here or ensure `api.js` has it.
// I didn't put healthz in api.js. I'll add it here.
app.get("/api/healthz", (req, res) => {
  // Check persistence?
  const storage = require('./services/storage');
  storage.isHealthy().then(healthy => {
    if (healthy) res.json({ ok: true });
    else res.status(503).json({ ok: false, error: "Persistence Unavailable" });
  });
});

// UI Routes
app.use("/", uiRoutes);

// Home Page
app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

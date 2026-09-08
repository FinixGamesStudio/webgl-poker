const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4111;

const ROOT = __dirname;
const POKER_DIR = path.join(ROOT, "poker");
const BLITZ_DIR = path.join(ROOT, "21Bliz", "dist");

const setBuildHeaders = (res, filePath) => {
    console.log("filePath:: ", filePath);
    
    if (filePath.endsWith(".js") || filePath.endsWith(".js.gz")) {
        res.setHeader("Content-Type", "application/javascript");
    }

    if (filePath.endsWith(".wasm") || filePath.endsWith(".wasm.gz")) {
        res.setHeader("Content-Type", "application/wasm");
    }

    if (filePath.endsWith(".data") || filePath.endsWith(".data.gz")) {
        res.setHeader("Content-Type", "application/octet-stream");
    }

    if (filePath.endsWith(".gz")) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
};

// Each game keeps its own asset root, so both builds can run on one port.
app.use("/poker", express.static(POKER_DIR, { setHeaders: setBuildHeaders }));
app.use(["/21bliz", "/21Bliz"], express.static(BLITZ_DIR, { setHeaders: setBuildHeaders }));
// The existing Vite bundle emits root-relative preload URLs such as /assets/*.js.
app.use("/assets", express.static(path.join(BLITZ_DIR, "assets"), { setHeaders: setBuildHeaders }));

app.get(["/poker", "/poker/"], (req, res) => {
    res.sendFile(path.join(POKER_DIR, "index.html"));
});

app.get(["/21bliz", "/21bliz/", "/21Bliz", "/21Bliz/"], (req, res) => {
    res.sendFile(path.join(BLITZ_DIR, "index.html"));
});

app.get("/", (req, res) => {
    res.type("html").send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Game Builds</title></head>
<body>
  <h1>Game Builds</h1>
  <ul>
    <li><a href="/poker/">Poker (Unity WebGL)</a></li>
    <li><a href="/21bliz/">21 Blitz (React)</a></li>
  </ul>
</body>
</html>`);
});

app.use((req, res) => res.status(404).send("Game not found"));

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("========================================");
    console.log(" Game Build Server Started");
    console.log("========================================");
    console.log(` Local:   http://localhost:${PORT}`);
    console.log(` Network: http://YOUR-PC-IP:${PORT}`);
    console.log(` Poker:   http://localhost:${PORT}/poker/`);
    console.log(` 21 Blitz:http://localhost:${PORT}/21bliz/`);
    console.log("========================================");
    console.log("");
});
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = __dirname;

// --------------------------------------------------
// Unity WebGL compressed files
// --------------------------------------------------

app.use((req, res, next) => {
    const requestedPath = decodeURIComponent(req.path);
    const filePath = path.join(ROOT, requestedPath);

    // Prevent paths from escaping the project directory
    if (!filePath.startsWith(ROOT)) {
        return res.status(403).send("Forbidden");
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return next();
    }

    if (filePath.endsWith(".js.gz")) {
        res.setHeader("Content-Type", "application/javascript");
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

        return res.sendFile(filePath);
    }

    if (filePath.endsWith(".wasm.gz")) {
        res.setHeader("Content-Type", "application/wasm");
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

        return res.sendFile(filePath);
    }

    if (filePath.endsWith(".data.gz")) {
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

        return res.sendFile(filePath);
    }

    next();
});

// --------------------------------------------------
// Normal static files
// --------------------------------------------------

app.use(
    express.static(ROOT, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".js")) {
                res.setHeader("Content-Type", "application/javascript");
            }

            if (filePath.endsWith(".wasm")) {
                res.setHeader("Content-Type", "application/wasm");
            }

            if (filePath.endsWith(".data")) {
                res.setHeader("Content-Type", "application/octet-stream");
            }
        }
    })
);

// --------------------------------------------------
// Unity index.html fallback
// --------------------------------------------------

app.use((req, res) => {
    const indexPath = path.join(ROOT, "index.html");

    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("index.html not found");
    }
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("========================================");
    console.log(" Unity WebGL Server Started");
    console.log("========================================");
    console.log(` Local:   http://localhost:${PORT}`);
    console.log(` Network: http://YOUR-PC-IP:${PORT}`);
    console.log("========================================");
    console.log("");
});
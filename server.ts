import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup
  const db = new Database("emotions.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS emotion_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      emotion TEXT NOT NULL,
      confidence REAL NOT NULL,
      source TEXT NOT NULL, -- 'webcam' or 'upload'
      notes TEXT
    )
  `);

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    try {
      const logs = db.prepare("SELECT * FROM emotion_logs ORDER BY timestamp DESC LIMIT 100").all();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/logs", (req, res) => {
    const { emotion, confidence, source, notes } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO emotion_logs (emotion, confidence, source, notes) VALUES (?, ?, ?, ?)");
      const info = stmt.run(emotion, confidence, source, notes || "");
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to save log" });
    }
  });

  app.delete("/api/logs/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM emotion_logs WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete log" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

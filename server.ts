import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- DB (use absolute path so it won't break on different working directories) ---
const DB_PATH = process.env.DB_PATH ? process.env.DB_PATH : path.join(__dirname, "training.db");
const db = new Database(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS trainees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS schedule_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dayOfWeek INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weekly_trainees (
    slotId INTEGER NOT NULL,
    traineeId INTEGER NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    PRIMARY KEY (slotId, traineeId, date),
    FOREIGN KEY (slotId) REFERENCES schedule_slots(id) ON DELETE CASCADE,
    FOREIGN KEY (traineeId) REFERENCES trainees(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    traineeId INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid'
    paymentType TEXT, -- 'cash', 'link'
    amount_agorot INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (traineeId) REFERENCES trainees(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: Add amount_agorot column to debts if it doesn't exist
try {
  db.prepare("ALTER TABLE debts ADD COLUMN amount_agorot INTEGER DEFAULT 0").run();
} catch {}

// Data Migration: If old 'amount' column exists, migrate to amount_agorot
try {
  const cols = db.prepare("PRAGMA table_info(debts)").all() as any[];
  const hasAmount = cols.some((c) => c.name === "amount");
  if (hasAmount) {
    db.prepare(
      "UPDATE debts SET amount_agorot = CAST(amount * 100 AS INTEGER) WHERE amount_agorot = 0 AND amount > 0"
    ).run();
  }
} catch (e) {
  console.error("Migration error:", e);
}

// Seed default slots if empty
const slotCount = db.prepare("SELECT COUNT(*) as count FROM schedule_slots").get() as { count: number };
if (slotCount.count === 0) {
  const insertSlot = db.prepare("INSERT INTO schedule_slots (dayOfWeek, startTime, endTime) VALUES (?, ?, ?)");
  for (let day = 0; day < 7; day++) {
    insertSlot.run(day, "16:00", "17:00");
    insertSlot.run(day, "17:00", "18:00");
  }
}

// --- small helpers ---
const isYYYYMMDD = (s: any) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const toInt = (v: any) => {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : NaN;
};

async function startServer() {
  const app = express();

  // CORS (safe default: allow all in dev, restrict in prod via env)
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) : true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));

  // --- Auth config ---
  // If you have .env:
  // ADMIN_PASSWORD=2468
  // AUTH_TOKEN=some-random-string
  const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "2468");
  const AUTH_TOKEN = String(process.env.AUTH_TOKEN || "elita-secret-token-123");

  // Optional debug (you can delete this line later)
  console.log("[AUTH] ADMIN_PASSWORD loaded? =", ADMIN_PASSWORD ? "YES" : "NO");

  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${AUTH_TOKEN}`) return next();
    return res.status(401).json({ error: "Unauthorized" });
  };

  // Public Routes
  app.post("/api/login", (req, res) => {
    const password = String(req.body?.password || "");
    if (password === ADMIN_PASSWORD) {
      return res.json({ token: AUTH_TOKEN });
    }
    return res.status(401).json({ error: "סיסמה שגויה" });
  });

  // Protected Routes (everything under /api except /api/login)
  app.use("/api", (req, res, next) => {
    if (req.path === "/login") return next();
    return authMiddleware(req, res, next);
  });

  // --- API Routes ---

  // Trainees
  app.get("/api/trainees", (_req, res) => {
    const trainees = db.prepare("SELECT * FROM trainees ORDER BY firstName, lastName").all();
    res.json(trainees);
  });

  app.post("/api/trainees", (req, res) => {
    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();
    const phone = req.body?.phone != null ? String(req.body.phone).trim() : null;
    const notes = req.body?.notes != null ? String(req.body.notes).trim() : null;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "חסרים firstName/lastName" });
    }

    const result = db
      .prepare("INSERT INTO trainees (firstName, lastName, phone, notes) VALUES (?, ?, ?, ?)")
      .run(firstName, lastName, phone, notes);

    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/trainees/:id", (req, res) => {
    const id = toInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID לא תקין" });

    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();
    const phone = req.body?.phone != null ? String(req.body.phone).trim() : null;
    const notes = req.body?.notes != null ? String(req.body.notes).trim() : null;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "חסרים firstName/lastName" });
    }

    db.prepare("UPDATE trainees SET firstName = ?, lastName = ?, phone = ?, notes = ? WHERE id = ?").run(
      firstName,
      lastName,
      phone,
      notes,
      id
    );

    res.json({ success: true });
  });

  app.delete("/api/trainees/:id", (req, res) => {
    const id = toInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID לא תקין" });

    db.prepare("DELETE FROM trainees WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Schedule Slots
  app.get("/api/slots", (_req, res) => {
    const slots = db.prepare("SELECT * FROM schedule_slots ORDER BY dayOfWeek, startTime").all();
    res.json(slots);
  });

  app.post("/api/slots", (req, res) => {
    const dayOfWeek = toInt(req.body?.dayOfWeek);
    const startTime = String(req.body?.startTime || "").trim();
    const endTime = String(req.body?.endTime || "").trim();

    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) return res.status(400).json({ error: "dayOfWeek לא תקין" });
    if (!startTime || !endTime) return res.status(400).json({ error: "startTime/endTime חסרים" });

    const result = db
      .prepare("INSERT INTO schedule_slots (dayOfWeek, startTime, endTime) VALUES (?, ?, ?)")
      .run(dayOfWeek, startTime, endTime);

    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/slots/:id", (req, res) => {
    const id = toInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID לא תקין" });

    try {
      db.exec("PRAGMA foreign_keys = ON;");
      const result = db.prepare("DELETE FROM schedule_slots WHERE id = ?").run(id);

      const updatedSlots = db.prepare("SELECT * FROM schedule_slots ORDER BY dayOfWeek, startTime").all();
      res.json({ success: true, deleted: result.changes, slots: updatedSlots });
    } catch (e: any) {
      console.error(`[SERVER] Delete error for slot ${id}:`, e);
      res.status(500).json({ error: `שגיאת שרת: ${e.message}` });
    }
  });

  // Weekly Assignments
  app.get("/api/weekly", (req, res) => {
    const startDate = req.query?.startDate;
    const endDate = req.query?.endDate;

    if (!isYYYYMMDD(startDate) || !isYYYYMMDD(endDate)) {
      return res.status(400).json({ error: "Missing or invalid dates" });
    }

    const assignments = db
      .prepare(
        `
        SELECT wt.*, t.firstName, t.lastName 
        FROM weekly_trainees wt
        JOIN trainees t ON wt.traineeId = t.id
        WHERE wt.date >= ? AND wt.date <= ?
      `
      )
      .all(startDate, endDate);

    res.json(assignments);
  });

  app.post("/api/weekly", (req, res) => {
    const slotId = toInt(req.body?.slotId);
    const traineeId = toInt(req.body?.traineeId);
    const date = req.body?.date;

    if (isNaN(slotId) || isNaN(traineeId) || !isYYYYMMDD(date)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    try {
      db.prepare("INSERT INTO weekly_trainees (slotId, traineeId, date) VALUES (?, ?, ?)").run(slotId, traineeId, date);
      res.json({ success: true });
    } catch {
      res.status(400).json({ error: "Already exists or invalid data" });
    }
  });

  app.delete("/api/weekly", (req, res) => {
    const slotId = toInt(req.body?.slotId);
    const traineeId = toInt(req.body?.traineeId);
    const date = req.body?.date;

    if (isNaN(slotId) || isNaN(traineeId) || !isYYYYMMDD(date)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    db.prepare("DELETE FROM weekly_trainees WHERE slotId = ? AND traineeId = ? AND date = ?").run(slotId, traineeId, date);
    res.json({ success: true });
  });

  app.post("/api/weekly/slot/cancel", (req, res) => {
    const slotId = toInt(req.body?.slotId);
    const date = req.body?.date;

    if (isNaN(slotId) || !isYYYYMMDD(date)) {
      return res.status(400).json({ error: "נתונים לא תקינים (חסר slotId או date)" });
    }

    try {
      const result = db.prepare("DELETE FROM weekly_trainees WHERE slotId = ? AND date = ?").run(slotId, date);
      res.json({ success: true, removed: result.changes });
    } catch (e: any) {
      console.error("[SERVER] Cancel session error:", e);
      res.status(500).json({ error: `שגיאת שרת בביטול אימון: ${e.message}` });
    }
  });

  // Debts / Payments
  app.get("/api/debts", (_req, res) => {
    const debts = db
      .prepare(
        `
        SELECT d.*, t.firstName, t.lastName, t.phone, d.amount_agorot / 100.0 as amount
        FROM debts d
        JOIN trainees t ON d.traineeId = t.id
        ORDER BY d.date DESC
      `
      )
      .all();
    res.json(debts);
  });

  app.post("/api/debts", (req, res) => {
    const traineeId = toInt(req.body?.traineeId);
    const date = req.body?.date;
    const notes = req.body?.notes != null ? String(req.body.notes).trim() : null;
    const status = req.body?.status != null ? String(req.body.status).trim() : "unpaid";
    const paymentType = req.body?.paymentType != null ? String(req.body.paymentType).trim() : null;

    const finalDate = isYYYYMMDD(date) ? date : new Date().toISOString().slice(0, 10);

    const amount = req.body?.amount;
    const amountNum = typeof amount === "number" ? amount : parseFloat(String(amount ?? "0"));
    const amountAgorot = Number.isFinite(amountNum) ? Math.round(amountNum * 100) : 0;

    if (isNaN(traineeId)) return res.status(400).json({ error: "traineeId לא תקין" });

    const result = db
      .prepare("INSERT INTO debts (traineeId, date, notes, status, paymentType, amount_agorot) VALUES (?, ?, ?, ?, ?, ?)")
      .run(traineeId, finalDate, notes, status, paymentType, amountAgorot);

    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/debts/:id", (req, res) => {
    const id = toInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID לא תקין" });

    const existing = db.prepare("SELECT * FROM debts WHERE id = ?").get(id) as any;
    if (!existing) return res.status(404).json({ error: "Not found" });

    const status = req.body?.status;
    const paymentType = req.body?.paymentType;
    const notes = req.body?.notes;
    const date = req.body?.date;
    const amount = req.body?.amount;

    const amountAgorot =
      amount !== undefined
        ? Math.round((typeof amount === "number" ? amount : parseFloat(String(amount))) * 100)
        : existing.amount_agorot;

    db.prepare("UPDATE debts SET status = ?, paymentType = ?, notes = ?, date = ?, amount_agorot = ? WHERE id = ?").run(
      status !== undefined ? status : existing.status,
      paymentType !== undefined ? paymentType : existing.paymentType,
      notes !== undefined ? notes : existing.notes,
      date !== undefined ? date : existing.date,
      Number.isFinite(amountAgorot) ? amountAgorot : existing.amount_agorot,
      id
    );

    res.json({ success: true });
  });

  app.delete("/api/debts/:id", (req, res) => {
    const id = toInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID לא תקין" });

    db.prepare("DELETE FROM debts WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/debts/bulk-update", (req, res) => {
    const { ids, status, paymentType, notes, date, amount } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids missing" });
    }

    const amountNum = amount !== undefined ? (typeof amount === "number" ? amount : parseFloat(String(amount))) : NaN;
    const amountAgorot = amount !== undefined && Number.isFinite(amountNum) ? Math.round(amountNum * 100) : null;

    const stmt = db.prepare(`
      UPDATE debts
      SET 
        status = COALESCE(?, status),
        paymentType = COALESCE(?, paymentType),
        notes = COALESCE(?, notes),
        date = COALESCE(?, date),
        amount_agorot = COALESCE(?, amount_agorot)
      WHERE id = ?
    `);

    const tx = db.transaction(() => {
      for (const rawId of ids) {
        const id = toInt(rawId);
        if (!isNaN(id)) {
          stmt.run(status ?? null, paymentType ?? null, notes ?? null, date ?? null, amountAgorot, id);
        }
      }
    });

    tx();
    res.json({ success: true, count: ids.length });
  });

  // Reset Logic Trigger
  app.post("/api/reset-check", (req, res) => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const day = israelTime.getDay(); // 0=Sun, 6=Sat
    const isForce = req.body?.force === true;

    const todayStr = israelTime.toISOString().slice(0, 10);

    if (day === 6 || isForce) {
      const lastReset = db.prepare("SELECT value FROM config WHERE key = 'last_reset_date'").get() as { value: string } | undefined;

      if (isForce || !lastReset || lastReset.value !== todayStr) {
        const weekly = db.prepare("SELECT * FROM weekly_trainees").all() as any[];

        if (weekly.length === 0 && !isForce) {
          return res.json({ resetPerformed: false, message: "No activity to reset" });
        }

        // 120₪ default = 12000 agorot
        const insertDebt = db.prepare("INSERT INTO debts (traineeId, date, amount_agorot) VALUES (?, ?, 12000)");
        const deleteWeekly = db.prepare("DELETE FROM weekly_trainees");

        const transaction = db.transaction(() => {
          for (const item of weekly) {
            insertDebt.run(item.traineeId, item.date);
          }
          deleteWeekly.run();
          db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('last_reset_date', ?)").run(todayStr);
        });

        transaction();
        return res.json({ resetPerformed: true, count: weekly.length });
      }
    }

    res.json({ resetPerformed: false });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`DB: ${DB_PATH}`);
  });
}

startServer();
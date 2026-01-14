import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'danshboard.db');

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
function initializeDatabase() {
  db.exec(`
    -- Streaks table
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current_count INTEGER DEFAULT 0,
      best_count INTEGER DEFAULT 0,
      last_check_in DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Accomplishments table
    CREATE TABLE IF NOT EXISTS accomplishments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      points INTEGER DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Daily check-ins table
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      mood INTEGER CHECK(mood >= 1 AND mood <= 5),
      energy INTEGER CHECK(energy >= 1 AND energy <= 5),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Milestones table for celebrations
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      streak_id INTEGER,
      milestone_count INTEGER NOT NULL,
      achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (streak_id) REFERENCES streaks(id) ON DELETE CASCADE
    );
  `);

  // Create default streak if none exists
  const streakCount = db.prepare('SELECT COUNT(*) as count FROM streaks').get() as { count: number };
  if (streakCount.count === 0) {
    db.prepare(`
      INSERT INTO streaks (name, current_count, best_count)
      VALUES ('Daily Check-in', 0, 0)
    `).run();
  }
}

// Initialize on import
initializeDatabase();

export { db };

// Export typed query helpers
export const queries = {
  // Streaks
  getStreaks: db.prepare('SELECT * FROM streaks ORDER BY created_at DESC'),
  getStreak: db.prepare('SELECT * FROM streaks WHERE id = ?'),
  updateStreak: db.prepare(`
    UPDATE streaks
    SET current_count = ?, best_count = ?, last_check_in = ?
    WHERE id = ?
  `),

  // Accomplishments
  getAccomplishments: db.prepare(`
    SELECT * FROM accomplishments
    ORDER BY completed_at DESC
    LIMIT ?
  `),
  addAccomplishment: db.prepare(`
    INSERT INTO accomplishments (title, description, category, points)
    VALUES (?, ?, ?, ?)
  `),
  getTodayAccomplishments: db.prepare(`
    SELECT * FROM accomplishments
    WHERE DATE(completed_at) = DATE('now')
    ORDER BY completed_at DESC
  `),

  // Daily check-ins
  getTodayCheckIn: db.prepare(`
    SELECT * FROM daily_checkins
    WHERE date = DATE('now')
  `),
  addCheckIn: db.prepare(`
    INSERT INTO daily_checkins (date, mood, energy, notes)
    VALUES (DATE('now'), ?, ?, ?)
  `),
  getRecentCheckIns: db.prepare(`
    SELECT * FROM daily_checkins
    ORDER BY date DESC
    LIMIT ?
  `),

  // Milestones
  addMilestone: db.prepare(`
    INSERT INTO milestones (streak_id, milestone_count)
    VALUES (?, ?)
  `),
  getMilestones: db.prepare(`
    SELECT m.*, s.name as streak_name
    FROM milestones m
    JOIN streaks s ON m.streak_id = s.id
    ORDER BY achieved_at DESC
    LIMIT ?
  `),
};

export default db;

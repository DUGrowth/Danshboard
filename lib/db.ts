import { sql } from '@vercel/postgres';

// Database initialization function
export async function initializeDatabase() {
  try {
    // Create streaks table
    await sql`
      CREATE TABLE IF NOT EXISTS streaks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        current_count INTEGER DEFAULT 0,
        best_count INTEGER DEFAULT 0,
        last_check_in DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create accomplishments table
    await sql`
      CREATE TABLE IF NOT EXISTS accomplishments (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        points INTEGER DEFAULT 1,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create daily_checkins table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        mood INTEGER CHECK(mood >= 1 AND mood <= 5),
        energy INTEGER CHECK(energy >= 1 AND energy <= 5),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create milestones table
    await sql`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        streak_id INTEGER REFERENCES streaks(id) ON DELETE CASCADE,
        milestone_count INTEGER NOT NULL,
        achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create default streak if none exists
    const { rows } = await sql`SELECT COUNT(*) as count FROM streaks`;
    if (rows[0].count === '0') {
      await sql`
        INSERT INTO streaks (name, current_count, best_count)
        VALUES ('Daily Check-in', 0, 0)
      `;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Query functions
export const queries = {
  // Streaks
  async getStreaks() {
    const { rows } = await sql`SELECT * FROM streaks ORDER BY created_at DESC`;
    return rows;
  },

  async getStreak(id: number) {
    const { rows } = await sql`SELECT * FROM streaks WHERE id = ${id}`;
    return rows[0] || null;
  },

  async updateStreak(currentCount: number, bestCount: number, lastCheckIn: string, id: number) {
    await sql`
      UPDATE streaks
      SET current_count = ${currentCount},
          best_count = ${bestCount},
          last_check_in = ${lastCheckIn}
      WHERE id = ${id}
    `;
  },

  // Accomplishments
  async getAccomplishments(limit: number) {
    const { rows } = await sql`
      SELECT * FROM accomplishments
      ORDER BY completed_at DESC
      LIMIT ${limit}
    `;
    return rows;
  },

  async addAccomplishment(title: string, description: string | null, category: string, points: number) {
    const { rows } = await sql`
      INSERT INTO accomplishments (title, description, category, points)
      VALUES (${title}, ${description}, ${category}, ${points})
      RETURNING id
    `;
    return rows[0];
  },

  async getTodayAccomplishments() {
    const { rows } = await sql`
      SELECT * FROM accomplishments
      WHERE DATE(completed_at) = CURRENT_DATE
      ORDER BY completed_at DESC
    `;
    return rows;
  },

  // Daily check-ins
  async getTodayCheckIn() {
    const { rows } = await sql`
      SELECT * FROM daily_checkins
      WHERE date = CURRENT_DATE
    `;
    return rows[0] || null;
  },

  async addCheckIn(mood: number, energy: number, notes: string | null) {
    await sql`
      INSERT INTO daily_checkins (date, mood, energy, notes)
      VALUES (CURRENT_DATE, ${mood}, ${energy}, ${notes})
    `;
  },

  async getRecentCheckIns(limit: number) {
    const { rows } = await sql`
      SELECT * FROM daily_checkins
      ORDER BY date DESC
      LIMIT ${limit}
    `;
    return rows;
  },

  // Milestones
  async addMilestone(streakId: number, milestoneCount: number) {
    await sql`
      INSERT INTO milestones (streak_id, milestone_count)
      VALUES (${streakId}, ${milestoneCount})
    `;
  },

  async getMilestones(limit: number) {
    const { rows } = await sql`
      SELECT m.*, s.name as streak_name
      FROM milestones m
      JOIN streaks s ON m.streak_id = s.id
      ORDER BY achieved_at DESC
      LIMIT ${limit}
    `;
    return rows;
  },
};

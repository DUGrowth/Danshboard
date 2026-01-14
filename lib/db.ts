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

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        estimated_time INTEGER NOT NULL,
        project TEXT,
        context TEXT DEFAULT 'personal',
        mood_preference TEXT DEFAULT 'any',
        times_skipped INTEGER DEFAULT 0,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_skipped TIMESTAMP,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create water_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS water_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        glasses_count INTEGER DEFAULT 1,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create water_goals table
    await sql`
      CREATE TABLE IF NOT EXISTS water_goals (
        id SERIAL PRIMARY KEY,
        daily_target INTEGER NOT NULL DEFAULT 8,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create stoic_quotes table
    await sql`
      CREATE TABLE IF NOT EXISTS stoic_quotes (
        id SERIAL PRIMARY KEY,
        quote_text TEXT NOT NULL,
        author TEXT NOT NULL,
        tags TEXT NOT NULL,
        times_shown INTEGER DEFAULT 0,
        times_favorited INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create mood_checkins table
    await sql`
      CREATE TABLE IF NOT EXISTS mood_checkins (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mood TEXT NOT NULL,
        energy_level INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Create default water goal if none exists
    const waterGoalRows = await sql`SELECT COUNT(*) as count FROM water_goals`;
    if (waterGoalRows.rows[0].count === '0') {
      await sql`INSERT INTO water_goals (daily_target) VALUES (8)`;
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

  // Tasks
  async getTasks(filters: { status?: string; estimatedTime?: number; context?: string }) {
    let query = `SELECT * FROM tasks WHERE 1=1`;
    const params: any[] = [];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }
    if (filters.estimatedTime) {
      params.push(filters.estimatedTime);
      query += ` AND estimated_time <= $${params.length}`;
    }
    if (filters.context) {
      params.push(filters.context);
      query += ` AND context = $${params.length}`;
    }

    query += ` ORDER BY times_skipped ASC, date_added ASC`;

    const { rows } = await sql.query(query, params);
    return rows;
  },

  async addTask(description: string, estimatedTime: number, project?: string, context?: string, moodPreference?: string) {
    const { rows } = await sql`
      INSERT INTO tasks (description, estimated_time, project, context, mood_preference)
      VALUES (${description}, ${estimatedTime}, ${project || null}, ${context || 'personal'}, ${moodPreference || 'any'})
      RETURNING *
    `;
    return rows[0];
  },

  async skipTask(id: number) {
    const { rows } = await sql`
      UPDATE tasks
      SET times_skipped = times_skipped + 1,
          last_skipped = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async completeTask(id: number) {
    const { rows } = await sql`
      UPDATE tasks
      SET status = 'completed'
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  // Water tracking
  async getTodayWaterLogs() {
    const { rows } = await sql`
      SELECT * FROM water_logs
      WHERE date = CURRENT_DATE
      ORDER BY timestamp DESC
    `;
    return rows;
  },

  async addWaterLog(glassesCount: number = 1) {
    const { rows } = await sql`
      INSERT INTO water_logs (glasses_count, date)
      VALUES (${glassesCount}, CURRENT_DATE)
      RETURNING *
    `;
    return rows[0];
  },

  async getWaterGoal() {
    const { rows } = await sql`SELECT * FROM water_goals ORDER BY id DESC LIMIT 1`;
    return rows[0] || { daily_target: 8 };
  },

  // Stoic quotes
  async getRandomQuote(tags?: string[]) {
    if (tags && tags.length > 0) {
      const tagConditions = tags.map(tag => `tags LIKE '%${tag}%'`).join(' OR ');
      const { rows } = await sql.query(`
        SELECT * FROM stoic_quotes
        WHERE ${tagConditions}
        ORDER BY times_shown ASC, RANDOM()
        LIMIT 1
      `);
      return rows[0] || null;
    }

    const { rows } = await sql`
      SELECT * FROM stoic_quotes
      ORDER BY times_shown ASC, RANDOM()
      LIMIT 1
    `;
    return rows[0] || null;
  },

  async incrementQuoteShown(id: number) {
    await sql`
      UPDATE stoic_quotes
      SET times_shown = times_shown + 1
      WHERE id = ${id}
    `;
  },

  async favoriteQuote(id: number) {
    await sql`
      UPDATE stoic_quotes
      SET times_favorited = times_favorited + 1
      WHERE id = ${id}
    `;
  },

  // Mood check-ins
  async addMoodCheckIn(mood: string, energyLevel?: number, notes?: string) {
    const { rows } = await sql`
      INSERT INTO mood_checkins (mood, energy_level, notes)
      VALUES (${mood}, ${energyLevel || null}, ${notes || null})
      RETURNING *
    `;
    return rows[0];
  },

  async getRecentMoodCheckIns(limit: number = 10) {
    const { rows } = await sql`
      SELECT * FROM mood_checkins
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
    return rows;
  },
};

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

    // Create abandoned_projects table (Phase 2)
    await sql`
      CREATE TABLE IF NOT EXISTS abandoned_projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        original_start_date DATE,
        last_touched_date DATE,
        days_abandoned INTEGER DEFAULT 0,
        revival_attempts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'abandoned',
        tags TEXT,
        notes TEXT,
        energy_required TEXT DEFAULT 'medium',
        completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create hourly_logs table (Phase 2)
    await sql`
      CREATE TABLE IF NOT EXISTS hourly_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hour_block INTEGER NOT NULL,
        accomplishment TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        energy_level INTEGER,
        mood_tag TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create buddy_checkins table (Phase 2)
    await sql`
      CREATE TABLE IF NOT EXISTS buddy_checkins (
        id SERIAL PRIMARY KEY,
        scheduled_time TIMESTAMP NOT NULL,
        check_in_type TEXT NOT NULL,
        message TEXT NOT NULL,
        user_response TEXT,
        responded_at TIMESTAMP,
        streak_count INTEGER DEFAULT 0,
        missed_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create microbreaks table (Phase 3)
    await sql`
      CREATE TABLE IF NOT EXISTS microbreaks (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        duration_minutes INTEGER NOT NULL,
        break_type TEXT NOT NULL,
        game_played TEXT,
        game_score INTEGER,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create device_messages table (Phase 3)
    await sql`
      CREATE TABLE IF NOT EXISTS device_messages (
        id SERIAL PRIMARY KEY,
        message_text TEXT NOT NULL,
        sender_device TEXT NOT NULL,
        recipient_device TEXT,
        priority TEXT DEFAULT 'normal',
        category TEXT DEFAULT 'general',
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create ocr_notes table (Phase 3)
    await sql`
      CREATE TABLE IF NOT EXISTS ocr_notes (
        id SERIAL PRIMARY KEY,
        original_filename TEXT NOT NULL,
        image_url TEXT,
        extracted_text TEXT,
        confidence_score REAL,
        tags TEXT,
        category TEXT DEFAULT 'general',
        is_processed BOOLEAN DEFAULT false,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create routine_completions table (Daily Routine Manager)
    await sql`
      CREATE TABLE IF NOT EXISTS routine_completions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        routine_type TEXT NOT NULL,
        task_id TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        skipped BOOLEAN DEFAULT FALSE,
        skip_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_routine_completions_date ON routine_completions(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_routine_completions_type ON routine_completions(routine_type)`;

    // Create routine_config table (Daily Routine Manager)
    await sql`
      CREATE TABLE IF NOT EXISTS routine_config (
        id SERIAL PRIMARY KEY,
        routine_type TEXT NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT TRUE,
        notification_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create morning_checkins table (Daily Routine Manager)
    await sql`
      CREATE TABLE IF NOT EXISTS morning_checkins (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        checkin_time TIMESTAMP NOT NULL,
        phone_outside_bedroom BOOLEAN,
        actual_bedtime TEXT,
        actual_lights_out TEXT,
        sleep_quality INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_morning_checkins_date ON morning_checkins(date)`;

    // Create routine_streaks table (Daily Routine Manager)
    await sql`
      CREATE TABLE IF NOT EXISTS routine_streaks (
        id SERIAL PRIMARY KEY,
        streak_type TEXT NOT NULL UNIQUE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_completion_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create notification_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id TEXT DEFAULT 'default',
        notification_type TEXT NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        custom_time TEXT,
        interval_minutes INTEGER,
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, notification_type)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notif_prefs_type ON notification_preferences(notification_type)`;

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

  // Abandoned Projects (Phase 2)
  async getAbandonedProjects(status?: string) {
    const { rows } = status
      ? await sql`SELECT * FROM abandoned_projects WHERE status = ${status} ORDER BY days_abandoned DESC`
      : await sql`SELECT * FROM abandoned_projects ORDER BY days_abandoned DESC`;
    return rows;
  },

  async addAbandonedProject(
    name: string,
    description?: string,
    originalStartDate?: string,
    tags?: string[],
    energyRequired?: string,
    completionPercentage?: number
  ) {
    const { rows } = await sql`
      INSERT INTO abandoned_projects (
        name, description, original_start_date, last_touched_date,
        tags, energy_required, completion_percentage
      )
      VALUES (
        ${name},
        ${description || null},
        ${originalStartDate || null},
        ${originalStartDate || null},
        ${tags ? JSON.stringify(tags) : null},
        ${energyRequired || 'medium'},
        ${completionPercentage || 0}
      )
      RETURNING *
    `;
    return rows[0];
  },

  async reviveProject(id: number) {
    const { rows } = await sql`
      UPDATE abandoned_projects
      SET status = 'active',
          revival_attempts = revival_attempts + 1,
          last_touched_date = CURRENT_DATE,
          days_abandoned = 0
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async updateProjectProgress(id: number, completionPercentage: number) {
    const { rows } = await sql`
      UPDATE abandoned_projects
      SET completion_percentage = ${completionPercentage},
          last_touched_date = CURRENT_DATE,
          days_abandoned = 0
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async calculateAbandonedDays() {
    await sql`
      UPDATE abandoned_projects
      SET days_abandoned = CURRENT_DATE - last_touched_date
      WHERE status = 'abandoned'
    `;
  },

  // Hourly Logs (Phase 2)
  async getTodayHourlyLogs() {
    const { rows } = await sql`
      SELECT * FROM hourly_logs
      WHERE date = CURRENT_DATE
      ORDER BY hour_block ASC
    `;
    return rows;
  },

  async addHourlyLog(hourBlock: number, accomplishment: string, category?: string, energyLevel?: number, moodTag?: string) {
    const { rows } = await sql`
      INSERT INTO hourly_logs (hour_block, accomplishment, category, energy_level, mood_tag, date)
      VALUES (${hourBlock}, ${accomplishment}, ${category || 'general'}, ${energyLevel || null}, ${moodTag || null}, CURRENT_DATE)
      RETURNING *
    `;
    return rows[0];
  },

  async getHourlyLogStats(days: number = 7) {
    const { rows } = await sql`
      SELECT
        hour_block,
        COUNT(*) as log_count,
        ROUND(AVG(energy_level), 1) as avg_energy
      FROM hourly_logs
      WHERE date >= CURRENT_DATE - ${days}
      GROUP BY hour_block
      ORDER BY hour_block ASC
    `;
    return rows;
  },

  // Accountability Buddy (Phase 2)
  async getPendingBuddyCheckins() {
    const { rows } = await sql`
      SELECT * FROM buddy_checkins
      WHERE status = 'pending'
      ORDER BY scheduled_time ASC
    `;
    return rows;
  },

  async createBuddyCheckin(scheduledTime: string, checkInType: string, message: string) {
    const { rows } = await sql`
      INSERT INTO buddy_checkins (scheduled_time, check_in_type, message)
      VALUES (${scheduledTime}, ${checkInType}, ${message})
      RETURNING *
    `;
    return rows[0];
  },

  async respondToBuddyCheckin(id: number, response: string) {
    const { rows } = await sql`
      UPDATE buddy_checkins
      SET user_response = ${response},
          responded_at = CURRENT_TIMESTAMP,
          status = 'completed',
          streak_count = streak_count + 1
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async missedBuddyCheckin(id: number) {
    const { rows } = await sql`
      UPDATE buddy_checkins
      SET status = 'missed',
          missed_count = missed_count + 1,
          streak_count = 0
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async getBuddyStats() {
    const { rows } = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'missed') as missed,
        MAX(streak_count) as best_streak,
        AVG(EXTRACT(EPOCH FROM (responded_at - scheduled_time))/60) as avg_response_minutes
      FROM buddy_checkins
    `;
    return rows[0];
  },

  // Microbreaks (Phase 3)
  async getActiveBreak() {
    const { rows } = await sql`
      SELECT * FROM microbreaks
      WHERE status = 'active'
      ORDER BY started_at DESC
      LIMIT 1
    `;
    return rows[0] || null;
  },

  async startMicrobreak(durationMinutes: number, breakType: string) {
    const { rows } = await sql`
      INSERT INTO microbreaks (started_at, duration_minutes, break_type)
      VALUES (CURRENT_TIMESTAMP, ${durationMinutes}, ${breakType})
      RETURNING *
    `;
    return rows[0];
  },

  async completeMicrobreak(id: number, gamePlayed?: string, gameScore?: number, notes?: string) {
    const { rows } = await sql`
      UPDATE microbreaks
      SET completed_at = CURRENT_TIMESTAMP,
          status = 'completed',
          game_played = ${gamePlayed || null},
          game_score = ${gameScore || null},
          notes = ${notes || null}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async getMicrobreakStats(days: number = 7) {
    const { rows } = await sql`
      SELECT
        COUNT(*) as total_breaks,
        AVG(duration_minutes) as avg_duration,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE game_played IS NOT NULL) as games_played
      FROM microbreaks
      WHERE created_at >= CURRENT_DATE - ${days}
    `;
    return rows[0];
  },

  async getRecentBreaks(limit: number = 10) {
    const { rows } = await sql`
      SELECT * FROM microbreaks
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  },

  // Device Messages (Phase 3)
  async getUnreadMessages(device?: string) {
    const { rows } = device
      ? await sql`
          SELECT * FROM device_messages
          WHERE is_read = false
          AND (recipient_device = ${device} OR recipient_device IS NULL)
          AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT * FROM device_messages
          WHERE is_read = false
          AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
          ORDER BY created_at DESC
        `;
    return rows;
  },

  async sendDeviceMessage(
    messageText: string,
    senderDevice: string,
    recipientDevice?: string,
    priority?: string,
    category?: string,
    expiresIn?: number
  ) {
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 60000).toISOString()
      : null;

    const { rows } = await sql`
      INSERT INTO device_messages (
        message_text, sender_device, recipient_device, priority, category, expires_at
      )
      VALUES (
        ${messageText},
        ${senderDevice},
        ${recipientDevice || null},
        ${priority || 'normal'},
        ${category || 'general'},
        ${expiresAt}
      )
      RETURNING *
    `;
    return rows[0];
  },

  async markMessageRead(id: number) {
    const { rows } = await sql`
      UPDATE device_messages
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async deleteExpiredMessages() {
    await sql`
      DELETE FROM device_messages
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
    `;
  },

  async getRecentMessages(limit: number = 20) {
    const { rows } = await sql`
      SELECT * FROM device_messages
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  },

  // OCR Notes (Phase 3)
  async addOcrNote(filename: string, imageUrl?: string) {
    const { rows } = await sql`
      INSERT INTO ocr_notes (original_filename, image_url)
      VALUES (${filename}, ${imageUrl || null})
      RETURNING *
    `;
    return rows[0];
  },

  async updateOcrNote(id: number, extractedText: string, confidenceScore?: number) {
    const { rows } = await sql`
      UPDATE ocr_notes
      SET extracted_text = ${extractedText},
          confidence_score = ${confidenceScore || null},
          is_processed = true,
          processed_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async getOcrNotes(category?: string) {
    const { rows } = category
      ? await sql`SELECT * FROM ocr_notes WHERE category = ${category} ORDER BY created_at DESC`
      : await sql`SELECT * FROM ocr_notes ORDER BY created_at DESC`;
    return rows;
  },

  async deleteOcrNote(id: number) {
    await sql`DELETE FROM ocr_notes WHERE id = ${id}`;
  },

  async updateOcrNoteCategory(id: number, category: string, tags?: string[]) {
    const { rows } = await sql`
      UPDATE ocr_notes
      SET category = ${category},
          tags = ${tags ? JSON.stringify(tags) : null}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  // Daily Routine Manager
  async getRoutineCompletions(routineType: string, date: string) {
    const { rows } = await sql`
      SELECT * FROM routine_completions
      WHERE routine_type = ${routineType} AND date = ${date}
      ORDER BY created_at ASC
    `;
    return rows;
  },

  async insertRoutineCompletion(completion: {
    date: string;
    routine_type: string;
    task_id: string;
    completed: boolean;
    skipped: boolean;
    skip_reason?: string;
    notes?: string;
    completed_at: string;
  }) {
    const { rows } = await sql`
      INSERT INTO routine_completions (
        date, routine_type, task_id, completed, skipped, skip_reason, notes, completed_at
      )
      VALUES (
        ${completion.date},
        ${completion.routine_type},
        ${completion.task_id},
        ${completion.completed},
        ${completion.skipped},
        ${completion.skip_reason || null},
        ${completion.notes || null},
        ${completion.completed_at}
      )
      RETURNING *
    `;
    return rows[0];
  },

  async getMorningCheckin(date: string) {
    const { rows } = await sql`
      SELECT * FROM morning_checkins
      WHERE date = ${date}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return rows[0] || null;
  },

  async insertMorningCheckin(checkin: {
    date: string;
    checkin_time: string;
    phone_outside_bedroom: boolean;
    actual_bedtime: string;
    actual_lights_out: string;
    sleep_quality: number;
    notes?: string;
  }) {
    const { rows } = await sql`
      INSERT INTO morning_checkins (
        date, checkin_time, phone_outside_bedroom, actual_bedtime,
        actual_lights_out, sleep_quality, notes
      )
      VALUES (
        ${checkin.date},
        ${checkin.checkin_time},
        ${checkin.phone_outside_bedroom},
        ${checkin.actual_bedtime},
        ${checkin.actual_lights_out},
        ${checkin.sleep_quality},
        ${checkin.notes || null}
      )
      RETURNING *
    `;
    return rows[0];
  },

  async getRoutineStreak(streakType: string) {
    const { rows } = await sql`
      SELECT * FROM routine_streaks
      WHERE streak_type = ${streakType}
    `;
    return rows[0] || null;
  },

  async getAllRoutineStreaks() {
    const { rows } = await sql`
      SELECT * FROM routine_streaks
      ORDER BY current_streak DESC
    `;
    return rows;
  },

  async incrementRoutineStreak(streakType: string, date: string) {
    const streak = await this.getRoutineStreak(streakType);

    if (!streak) {
      // Create new streak
      const { rows } = await sql`
        INSERT INTO routine_streaks (streak_type, current_streak, longest_streak, last_completion_date)
        VALUES (${streakType}, 1, 1, ${date})
        RETURNING *
      `;
      return rows[0];
    }

    const newStreak = streak.current_streak + 1;
    const newLongest = Math.max(newStreak, streak.longest_streak);

    const { rows } = await sql`
      UPDATE routine_streaks
      SET current_streak = ${newStreak},
          longest_streak = ${newLongest},
          last_completion_date = ${date},
          updated_at = CURRENT_TIMESTAMP
      WHERE streak_type = ${streakType}
      RETURNING *
    `;
    return rows[0];
  },

  async breakRoutineStreak(streakType: string) {
    const { rows } = await sql`
      UPDATE routine_streaks
      SET current_streak = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE streak_type = ${streakType}
      RETURNING *
    `;
    return rows[0];
  },

  // Notification Preferences
  async getAllNotificationPreferences(userId: string = 'default') {
    const { rows } = await sql`
      SELECT * FROM notification_preferences
      WHERE user_id = ${userId}
      ORDER BY notification_type
    `;
    return rows;
  },

  async getNotificationPreference(userId: string = 'default', notificationType: string) {
    const { rows } = await sql`
      SELECT * FROM notification_preferences
      WHERE user_id = ${userId} AND notification_type = ${notificationType}
    `;
    return rows[0] || null;
  },

  async upsertNotificationPreference(
    userId: string = 'default',
    notificationType: string,
    enabled: boolean,
    customTime?: string,
    intervalMinutes?: number,
    settings?: any
  ) {
    const { rows } = await sql`
      INSERT INTO notification_preferences (
        user_id, notification_type, enabled, custom_time, interval_minutes, settings, updated_at
      )
      VALUES (${userId}, ${notificationType}, ${enabled}, ${customTime || null}, ${intervalMinutes || null}, ${JSON.stringify(settings || {})}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, notification_type)
      DO UPDATE SET
        enabled = ${enabled},
        custom_time = ${customTime || null},
        interval_minutes = ${intervalMinutes || null},
        settings = ${JSON.stringify(settings || {})},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return rows[0];
  },

  async deleteNotificationPreference(userId: string = 'default', notificationType: string) {
    const { rows } = await sql`
      DELETE FROM notification_preferences
      WHERE user_id = ${userId} AND notification_type = ${notificationType}
      RETURNING *
    `;
    return rows[0];
  },
};

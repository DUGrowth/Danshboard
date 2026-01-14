import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

// This route initializes the database tables
// Visit /api/init after deploying to set up your database
export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({
      message: 'Database initialized successfully!',
      tables: ['streaks', 'accomplishments', 'daily_checkins', 'milestones']
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

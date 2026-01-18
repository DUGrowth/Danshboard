import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const streaks = await queries.getAllRoutineStreaks();

    return NextResponse.json({ streaks });
  } catch (error) {
    console.error('Error fetching routine streaks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streaks' },
      { status: 500 }
    );
  }
}

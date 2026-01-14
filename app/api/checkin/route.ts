import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const checkIn = queries.getTodayCheckIn.get();
    return NextResponse.json(checkIn || null);
  } catch (error) {
    console.error('Error fetching check-in:', error);
    return NextResponse.json({ error: 'Failed to fetch check-in' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { mood, energy, notes } = await request.json();

    if (!mood || !energy) {
      return NextResponse.json(
        { error: 'Mood and energy are required' },
        { status: 400 }
      );
    }

    // Check if already checked in today
    const existing = queries.getTodayCheckIn.get();
    if (existing) {
      return NextResponse.json(
        { error: 'Already checked in today', checkIn: existing },
        { status: 400 }
      );
    }

    queries.addCheckIn.run(mood, energy, notes || null);

    return NextResponse.json({
      message: 'Daily check-in recorded!',
    });
  } catch (error) {
    console.error('Error adding check-in:', error);
    return NextResponse.json({ error: 'Failed to add check-in' }, { status: 500 });
  }
}

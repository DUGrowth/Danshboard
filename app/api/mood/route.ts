import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const recentMoods = await queries.getRecentMoodCheckIns(10);
    return NextResponse.json(recentMoods);
  } catch (error) {
    console.error('Error fetching mood check-ins:', error);
    return NextResponse.json({ error: 'Failed to fetch mood check-ins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { mood, energyLevel, notes } = await request.json();

    if (!mood) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
    }

    const checkIn = await queries.addMoodCheckIn(mood, energyLevel, notes);

    return NextResponse.json({
      checkIn,
      message: 'Mood check-in recorded!'
    });
  } catch (error) {
    console.error('Error adding mood check-in:', error);
    return NextResponse.json({ error: 'Failed to add mood check-in' }, { status: 500 });
  }
}

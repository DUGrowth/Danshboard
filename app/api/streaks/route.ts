import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';
import { startOfDay, parseISO, differenceInDays } from 'date-fns';

export async function GET() {
  try {
    const streaks = await queries.getStreaks();
    return NextResponse.json(streaks);
  } catch (error) {
    console.error('Error fetching streaks:', error);
    return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { streakId } = await request.json();

    const streak = await queries.getStreak(streakId);
    if (!streak) {
      return NextResponse.json({ error: 'Streak not found' }, { status: 404 });
    }

    const today = startOfDay(new Date()).toISOString().split('T')[0];
    const lastCheckIn = streak.last_check_in ? startOfDay(parseISO(streak.last_check_in)) : null;
    const todayStart = startOfDay(new Date());

    let newCount = streak.current_count;
    let celebration = false;
    let milestone = null;

    // Check if already checked in today
    if (lastCheckIn && differenceInDays(todayStart, lastCheckIn) === 0) {
      return NextResponse.json({
        message: 'Already checked in today',
        streak,
        alreadyCheckedIn: true,
      });
    }

    // Check if streak continues or resets
    if (lastCheckIn && differenceInDays(todayStart, lastCheckIn) === 1) {
      // Streak continues!
      newCount = streak.current_count + 1;
    } else if (lastCheckIn && differenceInDays(todayStart, lastCheckIn) > 1) {
      // Streak broken, reset to 1
      newCount = 1;
    } else {
      // First check-in
      newCount = 1;
    }

    const newBest = Math.max(newCount, streak.best_count);

    // Update streak
    await queries.updateStreak(newCount, newBest, today, streakId);

    // Check for milestone celebrations
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
    if (milestones.includes(newCount)) {
      celebration = true;
      milestone = newCount;
      await queries.addMilestone(streakId, newCount);
    }

    const updatedStreak = await queries.getStreak(streakId);

    return NextResponse.json({
      streak: updatedStreak,
      celebration,
      milestone,
      message: celebration
        ? `🎉 ${milestone} day milestone achieved!`
        : `Streak updated to ${newCount} days!`,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}

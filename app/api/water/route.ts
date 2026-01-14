import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const [logs, goal] = await Promise.all([
      queries.getTodayWaterLogs(),
      queries.getWaterGoal()
    ]);

    const totalGlasses = logs.reduce((sum: number, log: any) => sum + log.glasses_count, 0);

    return NextResponse.json({
      logs,
      totalGlasses,
      goal: goal.daily_target,
      percentComplete: Math.min(100, Math.round((totalGlasses / goal.daily_target) * 100))
    });
  } catch (error) {
    console.error('Error fetching water data:', error);
    return NextResponse.json({ error: 'Failed to fetch water data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { glassesCount = 1 } = await request.json();

    const log = await queries.addWaterLog(glassesCount);

    // Get updated stats
    const [logs, goal] = await Promise.all([
      queries.getTodayWaterLogs(),
      queries.getWaterGoal()
    ]);

    const totalGlasses = logs.reduce((sum: number, log: any) => sum + log.glasses_count, 0);
    const percentComplete = Math.min(100, Math.round((totalGlasses / goal.daily_target) * 100));

    return NextResponse.json({
      log,
      totalGlasses,
      goal: goal.daily_target,
      percentComplete,
      message: percentComplete >= 100 ? '🎉 Daily water goal reached!' : 'Water logged!'
    });
  } catch (error) {
    console.error('Error logging water:', error);
    return NextResponse.json({ error: 'Failed to log water' }, { status: 500 });
  }
}

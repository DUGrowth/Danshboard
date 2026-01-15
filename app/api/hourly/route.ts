import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const logs = await queries.getTodayHourlyLogs();

    // Calculate current hour block
    const currentHour = new Date().getHours();
    const loggedHours = logs.map(log => log.hour_block);
    const missingHours = [];

    // Find missing hours (only for past hours today)
    for (let hour = 0; hour <= currentHour; hour++) {
      if (!loggedHours.includes(hour)) {
        missingHours.push(hour);
      }
    }

    return NextResponse.json({
      logs,
      missingHours,
      currentHour,
      totalLogged: logs.length
    });
  } catch (error) {
    console.error('Error fetching hourly logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hourly logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hourBlock, accomplishment, category, energyLevel, moodTag } = body;

    if (hourBlock === undefined || !accomplishment) {
      return NextResponse.json(
        { error: 'Hour block and accomplishment are required' },
        { status: 400 }
      );
    }

    const log = await queries.addHourlyLog(
      hourBlock,
      accomplishment,
      category,
      energyLevel,
      moodTag
    );

    // Check if this completes a streak
    const todayLogs = await queries.getTodayHourlyLogs();
    const shouldCelebrate = todayLogs.length % 3 === 0; // Celebrate every 3 logs

    return NextResponse.json({
      log,
      shouldCelebrate,
      message: shouldCelebrate
        ? `🎉 ${todayLogs.length} hours logged today! You&apos;re on fire!`
        : '✅ Hour logged successfully!'
    });
  } catch (error) {
    console.error('Error adding hourly log:', error);
    return NextResponse.json(
      { error: 'Failed to add hourly log' },
      { status: 500 }
    );
  }
}

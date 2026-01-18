import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      taskId,
      routineType,
      date,
      completed = true,
      skipped = false,
      skipReason,
      notes
    } = body;

    if (!taskId || !routineType || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const completion = await queries.insertRoutineCompletion({
      date,
      routine_type: routineType,
      task_id: taskId,
      completed,
      skipped,
      skip_reason: skipReason,
      notes,
      completed_at: new Date().toISOString()
    });

    // Update streaks if applicable
    if (completed && !skipped) {
      const streakMap: Record<string, string> = {
        'evening_stop_working': 'stopped_work_by_9pm',
        'evening_lights_out': 'in_bed_by_10pm',
        'morning_wake_up': 'woke_up_on_time',
        'morning_gym': 'morning_exercise',
        'morning_quick_movement': 'morning_movement'
      };

      const streakType = streakMap[taskId];
      if (streakType) {
        await queries.incrementRoutineStreak(streakType, date);
      }
    }

    return NextResponse.json({ success: true, completion });
  } catch (error) {
    console.error('Error recording routine completion:', error);
    return NextResponse.json(
      { error: 'Failed to record completion' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date');

    if (!type || !date) {
      return NextResponse.json(
        { error: 'Missing type or date parameter' },
        { status: 400 }
      );
    }

    const completions = await queries.getRoutineCompletions(type, date);
    const completedTaskIds = completions
      .filter(c => c.completed && !c.skipped)
      .map(c => c.task_id);

    return NextResponse.json({ completedTaskIds, completions });
  } catch (error) {
    console.error('Error fetching completions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completions' },
      { status: 500 }
    );
  }
}

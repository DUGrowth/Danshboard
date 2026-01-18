import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      phoneOutsideBedroom,
      actualBedtime,
      actualLightsOut,
      sleepQuality,
      stoppedWorkBy9pm,
      notes
    } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Insert morning check-in
    const checkin = await queries.insertMorningCheckin({
      date,
      checkin_time: new Date().toISOString(),
      phone_outside_bedroom: phoneOutsideBedroom,
      actual_bedtime: actualBedtime,
      actual_lights_out: actualLightsOut,
      sleep_quality: sleepQuality,
      notes
    });

    // Update streaks based on check-in responses
    if (phoneOutsideBedroom) {
      await queries.incrementRoutineStreak('phone_outside_bedroom', date);
    } else {
      await queries.breakRoutineStreak('phone_outside_bedroom');
    }

    if (stoppedWorkBy9pm) {
      await queries.incrementRoutineStreak('stopped_work_by_9pm', date);
    } else {
      await queries.breakRoutineStreak('stopped_work_by_9pm');
    }

    // Check if actually in bed by 10pm
    const bedtimeDate = new Date(`${date}T${actualBedtime}`);
    const targetBedtime = new Date(`${date}T22:00:00`);

    if (bedtimeDate <= targetBedtime) {
      await queries.incrementRoutineStreak('in_bed_by_10pm', date);
    } else {
      await queries.breakRoutineStreak('in_bed_by_10pm');
    }

    return NextResponse.json({ success: true, checkin });
  } catch (error) {
    console.error('Error recording morning check-in:', error);
    return NextResponse.json(
      { error: 'Failed to record check-in' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Missing date parameter' },
        { status: 400 }
      );
    }

    const checkin = await queries.getMorningCheckin(date);
    return NextResponse.json({ checkin });
  } catch (error) {
    console.error('Error fetching morning check-in:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in' },
      { status: 500 }
    );
  }
}

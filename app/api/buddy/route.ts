import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const pending = await queries.getPendingBuddyCheckins();

    // Check for overdue check-ins (more than 2 hours past scheduled time)
    const now = new Date();
    const overdue = pending.filter(checkin => {
      const scheduled = new Date(checkin.scheduled_time);
      const hoursPast = (now.getTime() - scheduled.getTime()) / (1000 * 60 * 60);
      return hoursPast > 2;
    });

    // Auto-mark severely overdue as missed (more than 8 hours)
    for (const checkin of overdue) {
      const scheduled = new Date(checkin.scheduled_time);
      const hoursPast = (now.getTime() - scheduled.getTime()) / (1000 * 60 * 60);
      if (hoursPast > 8) {
        await queries.missedBuddyCheckin(checkin.id);
      }
    }

    // Refresh pending list after auto-missing
    const currentPending = await queries.getPendingBuddyCheckins();

    return NextResponse.json({
      pending: currentPending,
      overdueCount: overdue.length
    });
  } catch (error) {
    console.error('Error fetching buddy check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buddy check-ins' },
      { status: 500 }
    );
  }
}

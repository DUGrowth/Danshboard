import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, response } = body;

    if (!id || !response) {
      return NextResponse.json(
        { error: 'Check-in ID and response are required' },
        { status: 400 }
      );
    }

    const checkin = await queries.respondToBuddyCheckin(id, response);

    // Celebrate streak milestones
    const streak = checkin.streak_count;
    let celebration = '';

    if (streak === 5) {
      celebration = '🔥 5-day streak! You&apos;re building momentum!';
    } else if (streak === 10) {
      celebration = '⭐ 10-day streak! This is becoming a habit!';
    } else if (streak === 30) {
      celebration = '🏆 30-day streak! You&apos;re unstoppable!';
    } else if (streak % 7 === 0) {
      celebration = `💪 ${streak}-day streak! A whole week!`;
    } else {
      celebration = '✅ Check-in complete! Keep it going!';
    }

    return NextResponse.json({
      checkin,
      message: celebration,
      shouldCelebrate: [5, 10, 30].includes(streak) || streak % 7 === 0
    });
  } catch (error) {
    console.error('Error responding to buddy check-in:', error);
    return NextResponse.json(
      { error: 'Failed to respond to buddy check-in' },
      { status: 500 }
    );
  }
}

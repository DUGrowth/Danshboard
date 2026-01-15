import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, gamePlayed, gameScore, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Break ID is required' },
        { status: 400 }
      );
    }

    const microbreak = await queries.completeMicrobreak(id, gamePlayed, gameScore, notes);

    // Determine celebration message based on game score
    let message = '✅ Break completed! Hope you feel refreshed!';

    if (gamePlayed) {
      if (gameScore >= 90) {
        message = '🏆 Amazing score! You crushed that break game!';
      } else if (gameScore >= 70) {
        message = '🌟 Great job! Break complete with style!';
      } else if (gameScore >= 50) {
        message = '👍 Nice work! Break completed!';
      } else {
        message = '💪 Break done! Every break counts!';
      }
    }

    return NextResponse.json({
      microbreak,
      message,
      shouldCelebrate: (gameScore && gameScore >= 80) || false
    });
  } catch (error) {
    console.error('Error completing microbreak:', error);
    return NextResponse.json(
      { error: 'Failed to complete microbreak' },
      { status: 500 }
    );
  }
}

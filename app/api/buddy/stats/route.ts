import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const stats = await queries.getBuddyStats();

    // Calculate response rate
    const total = parseInt(stats.completed || 0) + parseInt(stats.missed || 0);
    const responseRate = total > 0 ? ((stats.completed / total) * 100).toFixed(1) : '0';

    // Determine encouragement message
    let message = '';
    if (parseFloat(responseRate) >= 90) {
      message = '🌟 Amazing consistency! You&apos;re crushing it!';
    } else if (parseFloat(responseRate) >= 75) {
      message = '💪 Great job staying accountable!';
    } else if (parseFloat(responseRate) >= 50) {
      message = '📈 You&apos;re making progress! Keep going!';
    } else {
      message = '🎯 Every check-in counts. You got this!';
    }

    return NextResponse.json({
      stats: {
        ...stats,
        responseRate: parseFloat(responseRate),
        totalCheckins: total
      },
      message
    });
  } catch (error) {
    console.error('Error fetching buddy stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buddy stats' },
      { status: 500 }
    );
  }
}

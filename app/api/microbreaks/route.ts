import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const activeBreak = await queries.getActiveBreak();
    const stats = await queries.getMicrobreakStats(7);
    const recentBreaks = await queries.getRecentBreaks(5);

    return NextResponse.json({
      activeBreak,
      stats,
      recentBreaks
    });
  } catch (error) {
    console.error('Error fetching microbreaks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch microbreaks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration, breakType } = body;

    if (!duration || !breakType) {
      return NextResponse.json(
        { error: 'Duration and break type are required' },
        { status: 400 }
      );
    }

    const microbreak = await queries.startMicrobreak(duration, breakType);

    return NextResponse.json({
      microbreak,
      message: `⏰ ${duration}-minute break started! Time to recharge!`
    });
  } catch (error) {
    console.error('Error starting microbreak:', error);
    return NextResponse.json(
      { error: 'Failed to start microbreak' },
      { status: 500 }
    );
  }
}

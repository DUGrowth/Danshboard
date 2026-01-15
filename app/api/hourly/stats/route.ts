import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const stats = await queries.getHourlyLogStats(days);

    // Determine most productive hours
    const sortedByCount = [...stats].sort((a, b) => b.log_count - a.log_count);
    const mostProductiveHours = sortedByCount.slice(0, 3);

    // Determine highest energy hours
    const sortedByEnergy = [...stats]
      .filter(s => s.avg_energy)
      .sort((a, b) => b.avg_energy - a.avg_energy);
    const highEnergyHours = sortedByEnergy.slice(0, 3);

    return NextResponse.json({
      stats,
      insights: {
        mostProductiveHours: mostProductiveHours.map(h => ({
          hour: h.hour_block,
          count: h.log_count
        })),
        highEnergyHours: highEnergyHours.map(h => ({
          hour: h.hour_block,
          avgEnergy: h.avg_energy
        })),
        totalLogs: stats.reduce((sum, s) => sum + parseInt(s.log_count), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching hourly stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hourly stats' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const accomplishments = queries.getTodayAccomplishments.all();
    return NextResponse.json(accomplishments);
  } catch (error) {
    console.error('Error fetching today accomplishments:', error);
    return NextResponse.json({ error: 'Failed to fetch accomplishments' }, { status: 500 });
  }
}

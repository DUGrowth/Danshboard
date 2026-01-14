import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const accomplishments = await queries.getAccomplishments(50);
    return NextResponse.json(accomplishments);
  } catch (error) {
    console.error('Error fetching accomplishments:', error);
    return NextResponse.json({ error: 'Failed to fetch accomplishments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, category, points } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await queries.addAccomplishment(
      title,
      description || null,
      category || 'general',
      points || 1
    );

    return NextResponse.json({
      id: result.id,
      message: 'Accomplishment logged!',
    });
  } catch (error) {
    console.error('Error adding accomplishment:', error);
    return NextResponse.json({ error: 'Failed to add accomplishment' }, { status: 500 });
  }
}

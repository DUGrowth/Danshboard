import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const estimatedTime = searchParams.get('estimatedTime');
    const context = searchParams.get('context');

    const filters: any = { status };
    if (estimatedTime) filters.estimatedTime = parseInt(estimatedTime);
    if (context) filters.context = context;

    const tasks = await queries.getTasks(filters);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { description, estimatedTime, project, context, moodPreference } = await request.json();

    if (!description || !estimatedTime) {
      return NextResponse.json(
        { error: 'Description and estimated time are required' },
        { status: 400 }
      );
    }

    const task = await queries.addTask(description, estimatedTime, project, context, moodPreference);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error adding task:', error);
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
  }
}

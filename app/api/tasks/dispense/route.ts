import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

// Get one task based on time available and current context
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeAvailable = parseInt(searchParams.get('timeAvailable') || '30');
    const context = searchParams.get('context');
    const mood = searchParams.get('mood');

    const filters: any = {
      status: 'active',
      estimatedTime: timeAvailable
    };

    if (context) filters.context = context;

    const tasks = await queries.getTasks(filters);

    // Filter by mood if provided
    let filteredTasks = tasks;
    if (mood && mood !== 'any') {
      filteredTasks = tasks.filter((task: any) =>
        task.mood_preference === 'any' || task.mood_preference === mood
      );
    }

    // If no matching tasks, return null
    if (filteredTasks.length === 0) {
      return NextResponse.json(null);
    }

    // Return the first task (already sorted by skips and date in the query)
    return NextResponse.json(filteredTasks[0]);
  } catch (error) {
    console.error('Error dispensing task:', error);
    return NextResponse.json({ error: 'Failed to dispense task' }, { status: 500 });
  }
}

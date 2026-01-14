import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await queries.skipTask(taskId);

    return NextResponse.json({
      task,
      message: task.times_skipped >= 3
        ? 'You\'ve skipped this task 3 times. Consider archiving it?'
        : 'Task skipped'
    });
  } catch (error) {
    console.error('Error skipping task:', error);
    return NextResponse.json({ error: 'Failed to skip task' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { taskId, title } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Mark task as completed
    const task = await queries.completeTask(taskId);

    // Auto-log as accomplishment
    if (task) {
      await queries.addAccomplishment(
        title || task.description,
        null,
        'task',
        1
      );
    }

    return NextResponse.json({
      task,
      message: 'Task completed and logged as accomplishment!'
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}

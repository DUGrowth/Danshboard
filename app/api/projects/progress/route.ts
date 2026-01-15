import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completionPercentage } = body;

    if (!id || completionPercentage === undefined) {
      return NextResponse.json(
        { error: 'Project ID and completion percentage are required' },
        { status: 400 }
      );
    }

    if (completionPercentage < 0 || completionPercentage > 100) {
      return NextResponse.json(
        { error: 'Completion percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const project = await queries.updateProjectProgress(id, completionPercentage);

    // Celebrate milestones
    const celebration = completionPercentage === 100
      ? '🎊 PROJECT COMPLETE! Amazing work!'
      : completionPercentage >= 75
      ? '🔥 Almost there! Keep pushing!'
      : completionPercentage >= 50
      ? '💪 Halfway done! Momentum building!'
      : completionPercentage >= 25
      ? '✨ Great progress! Keep it up!'
      : '🌟 Nice start! Every step counts!';

    return NextResponse.json({
      project,
      message: celebration,
      shouldCelebrate: [25, 50, 75, 100].includes(completionPercentage)
    });
  } catch (error) {
    console.error('Error updating project progress:', error);
    return NextResponse.json(
      { error: 'Failed to update project progress' },
      { status: 500 }
    );
  }
}

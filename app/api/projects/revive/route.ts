import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await queries.reviveProject(id);

    return NextResponse.json({
      project,
      message: '🎉 Project revived! Let&apos;s get this done!'
    });
  } catch (error) {
    console.error('Error reviving project:', error);
    return NextResponse.json(
      { error: 'Failed to revive project' },
      { status: 500 }
    );
  }
}

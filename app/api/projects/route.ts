import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    // Calculate days abandoned before fetching
    await queries.calculateAbandonedDays();

    const projects = await queries.getAbandonedProjects(status);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      originalStartDate,
      tags,
      energyRequired,
      completionPercentage
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await queries.addAbandonedProject(
      name,
      description,
      originalStartDate,
      tags,
      energyRequired,
      completionPercentage
    );

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { error: 'Failed to add project' },
      { status: 500 }
    );
  }
}

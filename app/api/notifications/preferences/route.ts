import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = 'default'; // For now, single user
    const preferences = await queries.getAllNotificationPreferences(userId);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      notification_type,
      enabled,
      custom_time,
      interval_minutes,
      settings
    } = body;

    if (!notification_type) {
      return NextResponse.json(
        { error: 'notification_type is required' },
        { status: 400 }
      );
    }

    const userId = 'default';
    const preference = await queries.upsertNotificationPreference(
      userId,
      notification_type,
      enabled !== undefined ? enabled : true,
      custom_time,
      interval_minutes,
      settings
    );

    return NextResponse.json({ preference });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preference' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationType = searchParams.get('type');

    if (!notificationType) {
      return NextResponse.json(
        { error: 'notification type is required' },
        { status: 400 }
      );
    }

    const userId = 'default';
    const deleted = await queries.deleteNotificationPreference(userId, notificationType);

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error('Error deleting notification preference:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification preference' },
      { status: 500 }
    );
  }
}

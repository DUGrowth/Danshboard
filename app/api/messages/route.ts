import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const device = searchParams.get('device') || undefined;
    const showAll = searchParams.get('all') === 'true';

    // Clean up expired messages
    await queries.deleteExpiredMessages();

    const messages = showAll
      ? await queries.getRecentMessages(50)
      : await queries.getUnreadMessages(device);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messageText,
      senderDevice,
      recipientDevice,
      priority,
      category,
      expiresIn
    } = body;

    if (!messageText || !senderDevice) {
      return NextResponse.json(
        { error: 'Message text and sender device are required' },
        { status: 400 }
      );
    }

    const message = await queries.sendDeviceMessage(
      messageText,
      senderDevice,
      recipientDevice,
      priority,
      category,
      expiresIn
    );

    return NextResponse.json({
      message,
      notification: `📨 Message sent${recipientDevice ? ` to ${recipientDevice}` : ''}!`
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

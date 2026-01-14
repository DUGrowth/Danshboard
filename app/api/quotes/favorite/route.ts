import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { quoteId } = await request.json();

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    await queries.favoriteQuote(quoteId);

    return NextResponse.json({ message: 'Quote favorited!' });
  } catch (error) {
    console.error('Error favoriting quote:', error);
    return NextResponse.json({ error: 'Failed to favorite quote' }, { status: 500 });
  }
}

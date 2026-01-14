import { NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;

    const quote = await queries.getRandomQuote(tags);

    if (quote) {
      // Increment shown count
      await queries.incrementQuoteShown(quote.id);
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

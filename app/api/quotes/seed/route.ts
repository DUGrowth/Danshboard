import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { STOIC_QUOTES } from '@/lib/seed-quotes';

export async function POST() {
  try {
    // Check if quotes already exist
    const { rows } = await sql`SELECT COUNT(*) as count FROM stoic_quotes`;
    if (rows[0].count > 0) {
      return NextResponse.json({
        message: 'Quotes already seeded',
        count: rows[0].count
      });
    }

    // Insert all quotes
    for (const quote of STOIC_QUOTES) {
      await sql`
        INSERT INTO stoic_quotes (quote_text, author, tags)
        VALUES (${quote.quote_text}, ${quote.author}, ${quote.tags})
      `;
    }

    return NextResponse.json({
      message: 'Successfully seeded quotes!',
      count: STOIC_QUOTES.length
    });
  } catch (error) {
    console.error('Error seeding quotes:', error);
    return NextResponse.json({ error: 'Failed to seed quotes' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const notes = await queries.getOcrNotes(category);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching OCR notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OCR notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, imageUrl, extractedText, category } = body;

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Create initial note record
    let note = await queries.addOcrNote(filename, imageUrl);

    // If extracted text is provided (simulating OCR processing), update the note
    if (extractedText) {
      // Simple confidence score based on text length (mock implementation)
      const confidence = Math.min(95, 70 + (extractedText.length / 10));

      note = await queries.updateOcrNote(note.id, extractedText, confidence);

      if (category) {
        note = await queries.updateOcrNoteCategory(note.id, category);
      }
    }

    return NextResponse.json({
      note,
      message: extractedText
        ? '✅ Note processed and text extracted!'
        : '📝 Note uploaded! Processing...'
    });
  } catch (error) {
    console.error('Error processing OCR note:', error);
    return NextResponse.json(
      { error: 'Failed to process OCR note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    await queries.deleteOcrNote(parseInt(id));

    return NextResponse.json({
      message: '🗑️ Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting OCR note:', error);
    return NextResponse.json(
      { error: 'Failed to delete OCR note' },
      { status: 500 }
    );
  }
}

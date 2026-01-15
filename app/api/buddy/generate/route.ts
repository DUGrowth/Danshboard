import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

// Smart check-in messages based on time and context
const CHECK_IN_TEMPLATES = {
  morning: [
    "Good morning! ☀️ What&apos;s your top priority today?",
    "Rise and shine! 🌅 What are you tackling first today?",
    "Hey there! 👋 Ready to make today count? What&apos;s the plan?",
    "Morning! ☕ What&apos;s one thing you want to accomplish today?"
  ],
  midday: [
    "How&apos;s it going? 🎯 Making progress on your goals?",
    "Midday check! 💪 What have you accomplished so far?",
    "Hey! 👊 Taking breaks? Staying hydrated?",
    "Quick check-in! ⚡ How&apos;s your energy? Need a boost?"
  ],
  afternoon: [
    "Afternoon energy check! ⚡ How are you holding up?",
    "Hey! 🌤️ Crushing your afternoon tasks?",
    "Time check! 📍 Are you on track with your day?",
    "Afternoon vibes! 🎨 What&apos;s left on your list?"
  ],
  evening: [
    "Evening reflection time! 🌙 What did you accomplish today?",
    "Winding down? 🌆 Let&apos;s celebrate today&apos;s wins!",
    "End of day! ✨ What are you proud of today?",
    "Evening check! 🌃 Did you make progress on your goals?"
  ],
  motivational: [
    "Remember: Progress > Perfection! 💫 How are you doing?",
    "You&apos;re doing better than you think! 🌟 Keep going!",
    "Small steps still move you forward! 🚶 What&apos;s your next step?",
    "You got this! 💪 What&apos;s one win from today?"
  ]
};

function getCheckInType(hour: number): string {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'motivational';
}

function getRandomMessage(type: string): string {
  const templates = CHECK_IN_TEMPLATES[type as keyof typeof CHECK_IN_TEMPLATES] || CHECK_IN_TEMPLATES.motivational;
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduledTime } = body;

    // If no scheduled time provided, schedule for next appropriate time
    let checkInTime: Date;
    if (scheduledTime) {
      checkInTime = new Date(scheduledTime);
    } else {
      checkInTime = new Date();
      const currentHour = checkInTime.getHours();

      // Schedule next check-in based on current time
      if (currentHour < 9) {
        checkInTime.setHours(9, 0, 0, 0); // Morning check-in at 9am
      } else if (currentHour < 13) {
        checkInTime.setHours(13, 0, 0, 0); // Midday at 1pm
      } else if (currentHour < 17) {
        checkInTime.setHours(17, 0, 0, 0); // Afternoon at 5pm
      } else {
        checkInTime.setHours(20, 0, 0, 0); // Evening at 8pm
      }
    }

    const checkInType = getCheckInType(checkInTime.getHours());
    const message = getRandomMessage(checkInType);

    const checkin = await queries.createBuddyCheckin(
      checkInTime.toISOString(),
      checkInType,
      message
    );

    return NextResponse.json({
      checkin,
      message: '✅ Check-in scheduled!'
    });
  } catch (error) {
    console.error('Error generating buddy check-in:', error);
    return NextResponse.json(
      { error: 'Failed to generate buddy check-in' },
      { status: 500 }
    );
  }
}

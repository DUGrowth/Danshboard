export interface RoutineTask {
  id: string;
  timeBlock: string;
  timeBlockEnd?: string;
  description: string;
  emoji: string;
  requiresVerification?: boolean;
  verificationQuestion?: string;
  estimatedMinutes: number;
  category: 'preparation' | 'hygiene' | 'activity' | 'wind-down' | 'sleep';
}

export interface Routine {
  type: 'evening' | 'morning_no_kids' | 'morning_with_kids';
  name: string;
  description: string;
  tasks: RoutineTask[];
  startTime: string;
  endTime: string;
}

export const EVENING_ROUTINE: Routine = {
  type: 'evening',
  name: 'Evening Wind-Down',
  description: 'Same every night - prepare for quality sleep',
  startTime: '21:00',
  endTime: '22:00',
  tasks: [
    {
      id: 'evening_stop_working',
      timeBlock: '21:00',
      description: 'STOP WORKING - Close laptop, no exceptions',
      emoji: '🛑',
      estimatedMinutes: 0,
      category: 'preparation',
      requiresVerification: true,
      verificationQuestion: 'Did you stop working by 9:00 PM last night?'
    },
    {
      id: 'evening_quick_tidy',
      timeBlock: '21:00',
      timeBlockEnd: '21:15',
      description: 'Quick tidy - dishes, clothes, reset spaces',
      emoji: '🧹',
      estimatedMinutes: 15,
      category: 'preparation'
    },
    {
      id: 'evening_prep_tomorrow',
      timeBlock: '21:15',
      timeBlockEnd: '21:30',
      description: 'Prep tomorrow - calendar, bags, clothes, kids stuff',
      emoji: '📋',
      estimatedMinutes: 15,
      category: 'preparation'
    },
    {
      id: 'evening_shower',
      timeBlock: '21:30',
      timeBlockEnd: '21:45',
      description: 'Shower or bath - wind down signal',
      emoji: '🚿',
      estimatedMinutes: 15,
      category: 'hygiene'
    },
    {
      id: 'evening_no_screens',
      timeBlock: '21:45',
      timeBlockEnd: '22:00',
      description: 'No screens - read, podcast, anything but phone/laptop',
      emoji: '📖',
      estimatedMinutes: 15,
      category: 'wind-down',
      requiresVerification: true,
      verificationQuestion: 'Did you charge your phone outside the bedroom last night?'
    },
    {
      id: 'evening_lights_out',
      timeBlock: '22:00',
      description: 'IN BED, LIGHTS OFF - 8 hours sleep',
      emoji: '😴',
      estimatedMinutes: 0,
      category: 'sleep',
      requiresVerification: true,
      verificationQuestion: 'What time did you actually turn the lights off?'
    }
  ]
};

export const MORNING_NO_KIDS_ROUTINE: Routine = {
  type: 'morning_no_kids',
  name: 'Morning Routine - Gym Day',
  description: 'For days without kids - prioritize exercise',
  startTime: '05:30',
  endTime: '08:30',
  tasks: [
    {
      id: 'morning_wake_up',
      timeBlock: '05:30',
      description: 'WAKE UP - No snooze, phone across room',
      emoji: '⏰',
      estimatedMinutes: 0,
      category: 'activity'
    },
    {
      id: 'morning_hydrate_stretch',
      timeBlock: '05:30',
      timeBlockEnd: '05:45',
      description: 'Hydrate and stretch - water + 10 min movement',
      emoji: '💧',
      estimatedMinutes: 15,
      category: 'activity'
    },
    {
      id: 'morning_gym_clothes',
      timeBlock: '05:45',
      timeBlockEnd: '06:00',
      description: 'Get dressed in gym clothes - laid out night before',
      emoji: '👟',
      estimatedMinutes: 15,
      category: 'preparation'
    },
    {
      id: 'morning_gym',
      timeBlock: '06:00',
      timeBlockEnd: '07:00',
      description: 'GYM SESSION - Full workout, critical for ADHD focus',
      emoji: '💪',
      estimatedMinutes: 60,
      category: 'activity'
    },
    {
      id: 'morning_walk',
      timeBlock: '07:00',
      timeBlockEnd: '07:30',
      description: '20-30 min walk - Fresh air, clear head',
      emoji: '🚶',
      estimatedMinutes: 30,
      category: 'activity'
    },
    {
      id: 'morning_shower',
      timeBlock: '07:30',
      timeBlockEnd: '07:45',
      description: 'Shower and get dressed for work',
      emoji: '🚿',
      estimatedMinutes: 15,
      category: 'hygiene'
    },
    {
      id: 'morning_breakfast',
      timeBlock: '07:45',
      timeBlockEnd: '08:15',
      description: 'Breakfast and medication - sit, eat properly, no phone',
      emoji: '🍳',
      estimatedMinutes: 30,
      category: 'preparation'
    },
    {
      id: 'morning_daily_check',
      timeBlock: '08:15',
      timeBlockEnd: '08:30',
      description: 'Daily check - calendar, weather, pickups, pack',
      emoji: '✅',
      estimatedMinutes: 15,
      category: 'preparation'
    }
  ]
};

export const MORNING_WITH_KIDS_ROUTINE: Routine = {
  type: 'morning_with_kids',
  name: 'Morning Routine - Kid Day',
  description: 'For school run days - quick movement then kids',
  startTime: '06:00',
  endTime: '08:30',
  tasks: [
    {
      id: 'morning_wake_up',
      timeBlock: '06:00',
      description: 'WAKE UP - No snooze, phone across room',
      emoji: '⏰',
      estimatedMinutes: 0,
      category: 'activity'
    },
    {
      id: 'morning_quick_movement',
      timeBlock: '06:00',
      timeBlockEnd: '06:15',
      description: 'Hydrate and quick movement - water + 10 min walk/workout',
      emoji: '🏃',
      estimatedMinutes: 15,
      category: 'activity'
    },
    {
      id: 'morning_shower',
      timeBlock: '06:15',
      timeBlockEnd: '06:30',
      description: 'Shower and get dressed - clothes laid out',
      emoji: '🚿',
      estimatedMinutes: 15,
      category: 'hygiene'
    },
    {
      id: 'morning_breakfast',
      timeBlock: '06:30',
      timeBlockEnd: '07:00',
      description: 'Breakfast and medication - eat before kid chaos',
      emoji: '🍳',
      estimatedMinutes: 30,
      category: 'preparation'
    },
    {
      id: 'morning_daily_check',
      timeBlock: '07:00',
      timeBlockEnd: '07:15',
      description: 'Daily check - calendar, weather, pickups, pack',
      emoji: '✅',
      estimatedMinutes: 15,
      category: 'preparation'
    },
    {
      id: 'morning_kids_ready',
      timeBlock: '07:15',
      timeBlockEnd: '07:45',
      description: 'Wake kids, get them ready - breakfast, dressed, bags',
      emoji: '👶',
      estimatedMinutes: 30,
      category: 'preparation'
    },
    {
      id: 'morning_school_run',
      timeBlock: '07:45',
      timeBlockEnd: '08:15',
      description: 'School run (if doing morning dropoff)',
      emoji: '🚗',
      estimatedMinutes: 30,
      category: 'activity'
    },
    {
      id: 'morning_buffer',
      timeBlock: '08:15',
      timeBlockEnd: '08:30',
      description: 'Buffer time - handle chaos, transition to work',
      emoji: '⏱️',
      estimatedMinutes: 15,
      category: 'preparation'
    }
  ]
};

export const ALL_ROUTINES = [
  EVENING_ROUTINE,
  MORNING_NO_KIDS_ROUTINE,
  MORNING_WITH_KIDS_ROUTINE
];

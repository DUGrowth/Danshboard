import { EVENING_ROUTINE, MORNING_NO_KIDS_ROUTINE, MORNING_WITH_KIDS_ROUTINE } from './definitions';
import type { Routine, RoutineTask } from './definitions';

export function getCurrentRoutine(
  currentTime: Date,
  hasKidsToday: boolean
): Routine | null {
  const hour = currentTime.getHours();

  // Evening routine: 9pm to 6am (wraps midnight)
  if (hour >= 21 || hour < 6) {
    return EVENING_ROUTINE;
  }

  // Morning routine: 5:30am/6am to 8:30am
  if (hour >= 5 && hour < 9) {
    return hasKidsToday ? MORNING_WITH_KIDS_ROUTINE : MORNING_NO_KIDS_ROUTINE;
  }

  // No routine during work hours (9am-9pm)
  return null;
}

export function getCurrentTask(routine: Routine, currentTime: Date): (RoutineTask & { isOverdue?: boolean }) | null {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  for (const task of routine.tasks) {
    const [taskHour, taskMinute] = task.timeBlock.split(':').map(Number);
    const taskStart = taskHour * 60 + taskMinute;

    let taskEnd = taskStart + task.estimatedMinutes;
    if (task.timeBlockEnd) {
      const [endHour, endMinute] = task.timeBlockEnd.split(':').map(Number);
      taskEnd = endHour * 60 + endMinute;
    }

    if (currentMinutes >= taskStart && currentMinutes < taskEnd) {
      return task;
    }

    // If we&apos;re past this task, check if we should show it as "should have done"
    if (currentMinutes >= taskEnd && currentMinutes < taskEnd + 15) {
      return { ...task, isOverdue: true };
    }
  }

  // If after all tasks, show "complete" state
  return null;
}

export function getUpcomingTasks(routine: Routine, currentTime: Date, count: number = 2): RoutineTask[] {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  return routine.tasks
    .filter(task => {
      const [taskHour, taskMinute] = task.timeBlock.split(':').map(Number);
      const taskStart = taskHour * 60 + taskMinute;
      return taskStart > currentMinutes;
    })
    .slice(0, count);
}

export function checkCalendarForKids(date: Date): boolean {
  // Simplified version - check day of week
  // Default to kid routine on Tue/Thu + weekends
  const day = date.getDay();

  // Tuesday (2), Thursday (4), Saturday (6), Sunday (0)
  const hasKids = day === 2 || day === 4 || day === 0 || day === 6;

  return hasKids;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

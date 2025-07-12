import { Task, CalendarEvent, SchedulePlan, TimeSlot } from '@/types';

/**
 * Generate a schedule plan from tasks and calendar events
 * TODO: Replace with actual AI scheduling logic
 */
export const generateSchedule = (tasks: Task[], events: CalendarEvent[]): SchedulePlan => {
  // Filter out completed tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Sort tasks by priority (high -> medium -> low) and duration
  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
    
    if (priorityDiff !== 0) return priorityDiff;
    return a.duration - b.duration; // Shorter tasks first within same priority
  });

  // Get today's date boundaries
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0); // 8 AM
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0); // 6 PM

  // Create time slots array
  const timeSlots: TimeSlot[] = [];
  
  // Add existing calendar events as fixed slots
  const todaysEvents = events.filter(event => 
    event.start >= startOfDay && event.start <= endOfDay
  );

  todaysEvents.forEach(event => {
    timeSlots.push({
      id: `event-${event.id}`,
      start: event.start,
      end: event.end,
      type: 'event',
      title: event.title,
      eventId: event.id,
    });
  });

  // Sort events by start time
  timeSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Schedule tasks in available time slots
  const scheduledTaskIds = new Set<string>();
  let currentTime = new Date(startOfDay);

  for (const task of sortedTasks) {
    // Find next available slot that can fit this task
    const taskDurationMs = task.duration * 60 * 1000;
    let slotFound = false;

    // Check if we can fit the task before the first event
    if (timeSlots.length > 0) {
      const firstEvent = timeSlots[0];
      const availableTime = firstEvent.start.getTime() - currentTime.getTime();
      
      if (availableTime >= taskDurationMs) {
        const taskEnd = new Date(currentTime.getTime() + taskDurationMs);
        timeSlots.unshift({
          id: `task-${task.id}`,
          start: new Date(currentTime),
          end: taskEnd,
          type: 'task',
          title: task.title,
          taskId: task.id,
        });
        scheduledTaskIds.add(task.id);
        slotFound = true;
      }
    }

    if (!slotFound) {
      // Look for gaps between events
      for (let i = 0; i < timeSlots.length - 1; i++) {
        const currentSlot = timeSlots[i];
        const nextSlot = timeSlots[i + 1];
        const gapDuration = nextSlot.start.getTime() - currentSlot.end.getTime();

        if (gapDuration >= taskDurationMs) {
          const taskStart = new Date(currentSlot.end);
          const taskEnd = new Date(taskStart.getTime() + taskDurationMs);
          
          timeSlots.splice(i + 1, 0, {
            id: `task-${task.id}`,
            start: taskStart,
            end: taskEnd,
            type: 'task',
            title: task.title,
            taskId: task.id,
          });
          scheduledTaskIds.add(task.id);
          slotFound = true;
          break;
        }
      }
    }

    if (!slotFound && timeSlots.length > 0) {
      // Try to schedule after the last event
      const lastSlot = timeSlots[timeSlots.length - 1];
      const taskStart = new Date(lastSlot.end);
      const taskEnd = new Date(taskStart.getTime() + taskDurationMs);

      if (taskEnd <= endOfDay) {
        timeSlots.push({
          id: `task-${task.id}`,
          start: taskStart,
          end: taskEnd,
          type: 'task',
          title: task.title,
          taskId: task.id,
        });
        scheduledTaskIds.add(task.id);
        slotFound = true;
      }
    }

    if (!slotFound && timeSlots.length === 0) {
      // No events, schedule from start of day
      const taskEnd = new Date(currentTime.getTime() + taskDurationMs);
      if (taskEnd <= endOfDay) {
        timeSlots.push({
          id: `task-${task.id}`,
          start: new Date(currentTime),
          end: taskEnd,
          type: 'task',
          title: task.title,
          taskId: task.id,
        });
        scheduledTaskIds.add(task.id);
      }
    }
  }

  // Add break times between long work sessions
  const enhancedTimeSlots = addBreakTimes(timeSlots);

  // Sort final schedule by start time
  enhancedTimeSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Calculate unscheduled tasks
  const unscheduledTasks = incompleteTasks.filter(task => !scheduledTaskIds.has(task.id));

  // Calculate total scheduled duration
  const totalDuration = enhancedTimeSlots.reduce((total, slot) => {
    const duration = slot.end.getTime() - slot.start.getTime();
    return total + duration;
  }, 0);

  return {
    timeSlots: enhancedTimeSlots,
    totalDuration: Math.round(totalDuration / (1000 * 60)), // Convert to minutes
    unscheduledTasks,
  };
};

/**
 * Add break times between long work sessions
 */
const addBreakTimes = (timeSlots: TimeSlot[]): TimeSlot[] => {
  const enhanced: TimeSlot[] = [];
  
  for (let i = 0; i < timeSlots.length; i++) {
    enhanced.push(timeSlots[i]);
    
    // Add break after long work sessions (> 60 minutes)
    const currentSlot = timeSlots[i];
    const nextSlot = timeSlots[i + 1];
    
    if (currentSlot.type === 'task' && nextSlot) {
      const sessionDuration = currentSlot.end.getTime() - currentSlot.start.getTime();
      const breakNeeded = sessionDuration > 60 * 60 * 1000; // > 60 minutes
      const gapTime = nextSlot.start.getTime() - currentSlot.end.getTime();
      const hasTimeForBreak = gapTime >= 15 * 60 * 1000; // >= 15 minutes gap
      
      if (breakNeeded && hasTimeForBreak) {
        const breakEnd = new Date(Math.min(
          currentSlot.end.getTime() + 15 * 60 * 1000, // 15 minute break
          nextSlot.start.getTime()
        ));
        
        enhanced.push({
          id: `break-${currentSlot.id}`,
          start: new Date(currentSlot.end),
          end: breakEnd,
          type: 'break',
          title: 'Break',
        });
      }
    }
  }
  
  return enhanced;
};
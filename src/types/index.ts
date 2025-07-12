export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

export interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  type: 'task' | 'event' | 'break';
  title: string;
  taskId?: string;
  eventId?: string;
}

export interface SchedulePlan {
  timeSlots: TimeSlot[];
  totalDuration: number;
  unscheduledTasks: Task[];
}
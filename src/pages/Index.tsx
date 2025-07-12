import React, { useState } from 'react';
import { TaskInput } from '@/components/TaskInput';
import { TaskList } from '@/components/TaskList';
import { CalendarEvents } from '@/components/CalendarEvents';
import { PlanButton } from '@/components/PlanButton';
import { ScheduleView } from '@/components/ScheduleView';
import { Task, CalendarEvent, SchedulePlan } from '@/types';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SchedulePlan | null>(null);

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
    // Invalidate current plan when tasks change
    setCurrentPlan(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    // Invalidate current plan when tasks change
    setCurrentPlan(null);
  };

  const handleEventsUpdate = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    // Invalidate current plan when events change
    setCurrentPlan(null);
  };

  const handlePlanGenerated = (plan: SchedulePlan) => {
    setCurrentPlan(plan);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold mb-2">AI Daily Planner</h1>
          <p className="text-muted-foreground">
            Organize your tasks around your calendar with AI-powered scheduling
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TaskInput onAddTask={handleAddTask} />
            <TaskList 
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CalendarEvents 
              events={events}
              onEventsUpdate={handleEventsUpdate}
            />
            <PlanButton
              tasks={tasks}
              events={events}
              onPlanGenerated={handlePlanGenerated}
            />
          </div>
        </div>

        {/* Schedule View - Full Width */}
        <ScheduleView plan={currentPlan} />
      </div>
    </div>
  );
};

export default Index;

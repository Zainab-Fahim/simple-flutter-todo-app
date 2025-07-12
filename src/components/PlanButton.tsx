import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Task, CalendarEvent, SchedulePlan } from '@/types';

interface PlanButtonProps {
  tasks: Task[];
  events: CalendarEvent[];
  onPlanGenerated: (plan: SchedulePlan) => void;
  disabled?: boolean;
}

export const PlanButton: React.FC<PlanButtonProps> = ({
  tasks,
  events,
  onPlanGenerated,
  disabled = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    if (tasks.length === 0) return;

    setIsGenerating(true);
    
    try {
      // TODO: Replace with actual AI integration
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Import and use the placeholder scheduler
      const { generateSchedule } = await import('@/utils/scheduler');
      const plan = generateSchedule(tasks, events);
      
      onPlanGenerated(plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      // TODO: Show error toast to user
    } finally {
      setIsGenerating(false);
    }
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const canGenerate = incompleteTasks.length > 0 && !disabled;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div>
            <h3 className="font-semibold mb-2">AI-Powered Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Let AI organize your {incompleteTasks.length} pending tasks around your calendar events
            </p>
          </div>
          
          <Button
            onClick={handleGeneratePlan}
            disabled={!canGenerate || isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Plan My Day
              </>
            )}
          </Button>

          {incompleteTasks.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add some tasks to generate a schedule
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
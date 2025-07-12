import React from 'react';
import { Clock, Calendar, CheckCircle2, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchedulePlan, TimeSlot } from '@/types';
import { format } from 'date-fns';

interface ScheduleViewProps {
  plan: SchedulePlan | null;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ plan }) => {
  const getSlotIcon = (type: TimeSlot['type']) => {
    switch (type) {
      case 'task': return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'event': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'break': return <Coffee className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSlotColor = (type: TimeSlot['type']) => {
    switch (type) {
      case 'task': return 'bg-primary/10 border-primary/20';
      case 'event': return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800';
      case 'break': return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800';
      default: return 'bg-card border-border';
    }
  };

  const formatTimeRange = (start: Date, end: Date) => {
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const getDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return `${diffMinutes}m`;
  };

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Generate a plan to see your optimized schedule
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <Badge variant="secondary">
            {plan.timeSlots.length} blocks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.timeSlots.map((slot) => (
          <div
            key={slot.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${getSlotColor(slot.type)}`}
          >
            {getSlotIcon(slot.type)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{slot.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {slot.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatTimeRange(slot.start, slot.end)}</span>
                <span>•</span>
                <span>{getDuration(slot.start, slot.end)}</span>
              </div>
            </div>
          </div>
        ))}

        {plan.unscheduledTasks.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Unscheduled Tasks ({plan.unscheduledTasks.length})
            </h4>
            <div className="space-y-2">
              {plan.unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{task.title}</span>
                  <span>({task.duration}m)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
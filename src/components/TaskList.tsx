import React from 'react';
import { CheckCircle2, Circle, Clock, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="h-3 w-3 text-destructive" />;
      case 'medium': return <Flag className="h-3 w-3 text-primary" />;
      case 'low': return <Flag className="h-3 w-3 text-muted-foreground" />;
      default: return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No tasks yet. Add your first task above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              task.completed ? 'bg-muted/50' : 'bg-card'
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleComplete(task.id)}
              className="h-auto p-0"
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h3>
                {task.priority && getPriorityIcon(task.priority)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.duration} min</span>
                {task.priority && (
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTask(task.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              ×
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
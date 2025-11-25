import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/api';
import { CheckSquare, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning text-white',
  high: 'bg-destructive text-white',
};

const statusColors = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary text-primary-foreground',
  completed: 'bg-success text-white',
};

export const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <Link to={`/tasks/${task.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-hover)]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {task.title}
                </h3>
              </div>
            </div>
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {task.description}
          </p>

          <div className="flex items-center justify-between">
            <Badge className={statusColors[task.status]}>
              {task.status.replace('_', ' ')}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

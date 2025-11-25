import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/api';
import { Briefcase, Clock } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

const statusColors = {
  open: 'bg-success text-white',
  in_progress: 'bg-warning text-white',
  completed: 'bg-muted text-muted-foreground',
};

export const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-hover)]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-muted-foreground">{job.category}</p>
              </div>
            </div>
            <Badge className={statusColors[job.status]}>
              {job.status.replace('_', ' ')}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {job.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ${job.budget.toLocaleString()}
            </span>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(job.createdAt).toLocaleDateString()}
            </div>
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

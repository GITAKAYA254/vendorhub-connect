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
  open: 'bg-success/20 text-success border-success/30',
  in_progress: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-muted text-muted-foreground',
};

export const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="group overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] border-primary/10 bg-secondary/30 backdrop-blur-sm hover:border-primary/40 rounded-[2rem] relative">
        {/* Hover decorative element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                <Briefcase className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="text-xl font-black line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                  {job.title}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-black">{job.category}</span>
              </div>
            </div>
          </div>

          <p className="text-base text-muted-foreground line-clamp-3 mb-8 leading-relaxed italic">
            "{job.description}"
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-primary/5">
            <div>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Valuation</span>
              <span className="text-2xl font-black text-primary tracking-tighter">
                KS {job.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <Badge className={`uppercase text-[10px] font-black tracking-tighter mb-2 ${statusColors[job.status]}`} variant="outline">
                {job.status.replace('_', ' ')}
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground font-medium justify-end">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0">
          <Button className="w-full font-black uppercase tracking-[0.2em] h-14 border-primary/20 hover:border-primary hover:text-primary-foreground hover:bg-primary transition-all duration-500 rounded-xl" variant="outline">
            Review Mandate
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

import { useState, useEffect } from 'react';
import { JobCard } from '@/components/JobCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { api, Job } from '@/lib/api';
import { Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    const result = await api.getJobs();
    if (result.data?.jobs) {
      setJobs(result.data.jobs);
    }
    setIsLoading(false);
  };

  const filteredJobs = jobs.filter((job) =>
    filterStatus === 'all' ? true : job.status === filterStatus
  );

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
        <div>
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-bold">
            Work
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight uppercase">Jobs</h1>
          <p className="text-muted-foreground text-lg">Find project work and long-term roles.</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={filterStatus === 'all' ? 'Be the first to post a job!' : `No ${filterStatus.replace('_', ' ')} jobs available.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Jobs;

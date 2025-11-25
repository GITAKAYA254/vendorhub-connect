import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { api, Job } from '@/lib/api';
import { Briefcase, ArrowLeft, Store, Clock, DollarSign } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await api.getJob(id);
    if (result.data) {
      setJob(result.data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <Link to="/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/jobs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Badge className="mb-3">{job.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-1" />
                <span className="text-2xl font-bold text-primary">${job.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <Badge variant={
                job.status === 'open' ? 'default' : 
                job.status === 'in_progress' ? 'secondary' : 
                'outline'
              }>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              Apply for this Job
            </Button>
            <Link to={`/vendor/${job.vendorId}`}>
              <Button variant="outline" size="lg">
                <Store className="mr-2 h-5 w-5" />
                View Vendor
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { api, Task } from '@/lib/api';
import { CheckSquare, ArrowLeft, Store, Calendar } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await api.getTask(id);
    if (result.data) {
      setTask(result.data);
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

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CheckSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
            <Link to="/tasks">
              <Button>Back to Tasks</Button>
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
        <Link to="/tasks">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{task.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant={
                task.priority === 'high' ? 'destructive' : 
                task.priority === 'medium' ? 'default' : 
                'secondary'
              }>
                {task.priority} priority
              </Badge>
              <Badge variant="outline">
                {task.status.replace('_', ' ')}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              Complete this Task
            </Button>
            <Link to={`/vendor/${task.vendorId}`}>
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

export default TaskDetail;

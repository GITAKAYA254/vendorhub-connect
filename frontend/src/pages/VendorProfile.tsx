import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { JobCard } from '@/components/JobCard';
import { TaskCard } from '@/components/TaskCard';
import { api, Vendor, Product, Job, Task } from '@/lib/api';
import { Store, Package, Briefcase, CheckSquare } from 'lucide-react';

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  const fetchVendorData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    const [vendorRes, productsRes, jobsRes, tasksRes] = await Promise.all([
      api.getVendor(id),
      api.getProducts({ vendorId: id }),
      api.getJobs({ vendorId: id }),
      api.getTasks({ vendorId: id }),
    ]);

    if (vendorRes.data) setVendor(vendorRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    if (jobsRes.data) setJobs(jobsRes.data);
    if (tasksRes.data) setTasks(tasksRes.data);
    
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
      </div>
    );
  }

  return (
    <>
      {/* Vendor Header */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-12 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-6">
              {vendor.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="h-24 w-24 rounded-full border-4 border-background"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center">
                  <Store className="h-12 w-12 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{vendor.name}</h1>
                <p className="text-muted-foreground">{vendor.description}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since {new Date(vendor.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">
                <Package className="mr-2 h-4 w-4" />
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobs ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="mr-2 h-4 w-4" />
                Tasks ({tasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No products"
                  description="This vendor hasn't listed any products yet"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobs">
              {jobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs"
                  description="This vendor hasn't posted any jobs yet"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks">
              {tasks.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks"
                  description="This vendor hasn't created any tasks yet"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
    </>
  );
};

export default VendorProfile;

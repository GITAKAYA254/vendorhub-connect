import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { JobCard } from '@/components/JobCard';
import { TaskCard } from '@/components/TaskCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Briefcase, CheckSquare, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, Product, Job, Task } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [featuredTasks, setFeaturedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      const [productsRes, jobsRes, tasksRes] = await Promise.all([
        api.getProducts(),
        api.getJobs(),
        api.getTasks(),
      ]);

      if (productsRes.data) setFeaturedProducts(productsRes.data.slice(0, 4));
      if (jobsRes.data) setFeaturedJobs(jobsRes.data.slice(0, 3));
      if (tasksRes.data) setFeaturedTasks(tasksRes.data.slice(0, 3));
      setIsLoading(false);
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Your One-Stop Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover products, find jobs, and complete tasks all in one place. 
              Connect with trusted vendors and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Products</h3>
              <p className="text-muted-foreground">
                Browse thousands of products from verified vendors
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Jobs</h3>
              <p className="text-muted-foreground">
                Find freelance opportunities and project-based work
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tasks</h3>
              <p className="text-muted-foreground">
                Complete quick tasks and earn on your schedule
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                    <p className="text-muted-foreground">Handpicked items from our vendors</p>
                  </div>
                  <Link to="/products">
                    <Button variant="outline">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Jobs */}
          {featuredJobs.length > 0 && (
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Latest Jobs</h2>
                    <p className="text-muted-foreground">New opportunities posted recently</p>
                  </div>
                  <Link to="/jobs">
                    <Button variant="outline">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Tasks */}
          {featuredTasks.length > 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Available Tasks</h2>
                    <p className="text-muted-foreground">Quick tasks you can complete today</p>
                  </div>
                  <Link to="/tasks">
                    <Button variant="outline">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-6 text-primary-foreground" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of vendors already growing their business on MarketHub
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Create Vendor Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

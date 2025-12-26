import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

      if (productsRes.data?.products) setFeaturedProducts(productsRes.data.products.slice(0, 4));
      if (jobsRes.data?.jobs) setFeaturedJobs(jobsRes.data.jobs.slice(0, 3));
      if (tasksRes.data?.tasks) setFeaturedTasks(tasksRes.data.tasks.slice(0, 3));
      setIsLoading(false);
    };

    fetchFeatured();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center bg-black py-16 md:py-40 overflow-hidden">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url("/hero-bg.png")' }}
        />
        <div className="absolute inset-0 z-1 bg-gradient-to-b md:bg-gradient-to-r from-black via-black/80 md:via-black/60 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-1.5 text-xs md:text-sm font-medium bg-primary/20 text-primary border-primary/30 tracking-wider uppercase">
              The Gold Standard of Commerce
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-8xl lg:text-9xl font-black mb-6 md:mb-8 tracking-tighter leading-tight md:leading-none text-white">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                BLACK
              </span>
              <br className="sm:hidden" />
              <span className="sm:ml-2 md:ml-0">WALL STREET</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/80 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the exclusivity of BWS. Discover elite products,
              high-value opportunities, and specialized tasks in one prestigious ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link to="/products">
                <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold border-primary text-primary hover:bg-primary/5 hover:scale-105 transition-transform bg-white/5 backdrop-blur-sm w-full sm:w-auto">
                  Join as Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-card border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="group p-6 md:p-8 rounded-2xl bg-secondary/5 border border-border/50 hover:border-primary/30 transition-colors text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-tight">Products</h3>
              <p className="text-muted-foreground text-base md:text-lg">
                Curated collections from the most prestigious vendors worldwide.
              </p>
            </div>
            <div className="group p-6 md:p-8 rounded-2xl bg-secondary/5 border border-border/50 hover:border-primary/30 transition-colors text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-tight">Jobs</h3>
              <p className="text-muted-foreground text-base md:text-lg">
                High-impact freelance opportunities for top-tier professionals.
              </p>
            </div>
            <div className="group p-6 md:p-8 rounded-2xl bg-secondary/5 border border-border/50 hover:border-primary/30 transition-colors text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <CheckSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-tight">Tasks</h3>
              <p className="text-muted-foreground text-base md:text-lg">
                Strategic micro-tasks designed for efficiency and high yield.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <section className="py-24 md:py-32 bg-black relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center justify-center mb-16 text-center max-w-4xl mx-auto">
                  <Badge variant="outline" className="mb-6 border-primary/40 text-primary uppercase tracking-[0.3em] text-[10px] font-black py-1.5 px-4 bg-primary/5">
                    Marketplace
                  </Badge>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
                    Featured <span className="text-primary italic">Products</span>
                  </h2>
                  <p className="text-xl text-white/60 leading-relaxed font-medium mb-10 max-w-2xl">
                    Discover high-quality items from our trusted vendors.
                  </p>
                  <Link to="/products">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground group h-16 px-12 font-black uppercase tracking-widest text-base shadow-lg shadow-primary/10">
                      Shop All Products
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Jobs */}
          {featuredJobs.length > 0 && (
            <section className="py-24 md:py-32 bg-card relative overflow-hidden border-y border-primary/10">
              <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[120px] rounded-full" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center justify-center mb-16 text-center max-w-4xl mx-auto">
                  <Badge variant="outline" className="mb-6 border-primary/40 text-primary uppercase tracking-[0.3em] text-[10px] font-black py-1.5 px-4 bg-primary/5">
                    Opportunities
                  </Badge>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
                    Available <span className="text-primary italic">Jobs</span>
                  </h2>
                  <p className="text-xl text-white/60 leading-relaxed font-medium mb-10 max-w-2xl">
                    Find project work and long-term roles curated for you.
                  </p>
                  <Link to="/jobs">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground group h-16 px-12 font-black uppercase tracking-widest text-base shadow-lg shadow-primary/10">
                      Browse All Jobs
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {featuredJobs.map((job) => (
                    <div key={job.id} className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Tasks */}
          {featuredTasks.length > 0 && (
            <section className="py-24 md:py-32 bg-black relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center justify-center mb-16 text-center max-w-4xl mx-auto">
                  <Badge variant="outline" className="mb-6 border-primary/40 text-primary uppercase tracking-[0.3em] text-[10px] font-black py-1.5 px-4 bg-primary/5">
                    Tasks
                  </Badge>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
                    Quick <span className="text-primary italic">Tasks</span>
                  </h2>
                  <p className="text-xl text-white/60 leading-relaxed font-medium mb-10 max-w-2xl">
                    Complete immediate tasks and get paid faster.
                  </p>
                  <Link to="/tasks">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground group h-16 px-12 font-black uppercase tracking-widest text-base shadow-lg shadow-primary/10">
                      View All Tasks
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {featuredTasks.map((task) => (
                    <div key={task.id} className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black border-t border-primary/10">
        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: 'url("/cta-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-primary/10 backdrop-blur-md flex items-center justify-center mx-auto mb-8 md:mb-10 border border-primary/20">
            <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
            Grow Your Business
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the BWS network today. Start selling or finding opportunities
            on the best platform for your business.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-black bg-primary text-primary-foreground hover:scale-105 transition-all shadow-2xl shadow-primary/20 border-none w-full sm:w-auto">
              JOIN AS A VENDOR
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Index;

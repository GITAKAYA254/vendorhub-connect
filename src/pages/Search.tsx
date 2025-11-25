import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { JobCard } from '@/components/JobCard';
import { TaskCard } from '@/components/TaskCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { api, SearchResults } from '@/lib/api';
import { Search as SearchIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    const result = await api.search(query);
    if (result.data) {
      setResults(result.data);
    }
    setIsLoading(false);
  };

  const totalResults = results
    ? results.products.length + results.jobs.length + results.tasks.length
    : 0;

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Searching...' : `Found ${totalResults} results`}
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !results || totalResults === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No results found"
            description={`No results found for "${query}". Try a different search term.`}
          />
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="products">Products ({results.products.length})</TabsTrigger>
              <TabsTrigger value="jobs">Jobs ({results.jobs.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({results.tasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {results.products.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {results.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {results.jobs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Jobs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products">
              {results.products.length === 0 ? (
                <EmptyState
                  icon={SearchIcon}
                  title="No products found"
                  description="Try adjusting your search terms"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobs">
              {results.jobs.length === 0 ? (
                <EmptyState
                  icon={SearchIcon}
                  title="No jobs found"
                  description="Try adjusting your search terms"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks">
              {results.tasks.length === 0 ? (
                <EmptyState
                  icon={SearchIcon}
                  title="No tasks found"
                  description="Try adjusting your search terms"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
    </main>
  );
};

export default Search;

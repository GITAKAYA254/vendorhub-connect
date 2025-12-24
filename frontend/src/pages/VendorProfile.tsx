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
import { Star, Store, Package, Briefcase, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  const fetchVendorData = async () => {
    if (!id) return;
    setIsLoading(true);

    const [vendorRes, productsRes, jobsRes, tasksRes, reviewsRes] = await Promise.all([
      api.getVendor(id),
      api.getProducts({ vendorId: id }),
      api.getJobs({ vendorId: id }),
      api.getTasks({ vendorId: id }),
      api.getVendorReviews(id),
    ]);

    if (vendorRes.data?.vendor) setVendor(vendorRes.data.vendor);
    if (productsRes.data?.products) setProducts(productsRes.data.products);
    if (jobsRes.data?.jobs) setJobs(jobsRes.data.jobs);
    if (tasksRes.data?.tasks) setTasks(tasksRes.data.tasks);
    if (reviewsRes.data?.reviews) setReviews(reviewsRes.data.reviews);

    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    const result = await api.addVendorReview(id, {
      rating: newRating,
      comment: newComment,
    });

    setIsSubmittingReview(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Review submitted! Thank you.");
      setShowReviewForm(false);
      setNewRating(0);
      setNewComment("");

      // Refresh reviews
      const reviewsRes = await api.getVendorReviews(id);
      if (reviewsRes.data?.reviews) setReviews(reviewsRes.data.reviews);
    }
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
            <TabsTrigger value="reviews">
              <Star className="mr-2 h-4 w-4" />
              Reviews ({reviews.length})
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

          <TabsContent value="reviews">
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline">
                Write a Review
              </Button>
            </div>

            {showReviewForm && (
              <div className="bg-card border rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Add Your Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= newRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">
                      Comment
                    </label>
                    <textarea
                      id="comment"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Share your experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReview} disabled={isSubmittingReview || newRating === 0}>
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="No reviews"
                description="This vendor hasn't received any reviews yet"
              />
            ) : (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{review.reviewer?.name || 'Anonymous'}</span>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              fill={i < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
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

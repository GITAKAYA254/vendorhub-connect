import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { api, Product } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Package, ArrowLeft, Store, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ProductCard } from '@/components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await api.getProduct(id);
    if (result.data?.product) {
      setProduct(result.data.product);
      // Set initial selected image
      if (result.data.product.image) setSelectedImage(result.data.product.image);
      else if (result.data.product.images?.length) setSelectedImage(result.data.product.images[0]);
    }

    // Fetch related and reviews
    const related = await api.getRelatedProducts(id);
    if (related.data?.products) setRelatedProducts(related.data.products);

    const reviewsData = await api.getProductReviews(id);
    if (reviewsData.data?.reviews) setReviews(reviewsData.data.reviews);

    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    const result = await api.addProductReview(id, {
      rating: newRating,
      comment: newComment,
    });

    setIsSubmittingReview(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setNewRating(0);
      setNewComment("");

      // Refresh reviews
      const reviewsData = await api.getProductReviews(id);
      if (reviewsData.data?.reviews) setReviews(reviewsData.data.reviews);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast.success('Added to cart!');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <Link to="/products">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
            {selectedImage ? (
              <img
                src={api.getImageUrl(selectedImage)}
                alt={product.title || product.name || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-32 w-32 text-muted-foreground/40" />
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'
                    }`}
                >
                  <img src={api.getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-bold">
              {product.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight uppercase">
              {product.title || product.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl md:text-4xl font-black text-primary">
                KS {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-tighter ${product.stock > 0 ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
                {product.stock > 0 ? `${product.stock} In Stock` : 'Sold Out'}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-widest font-black text-muted-foreground mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              size="lg"
              className="h-14 flex-1 text-lg font-bold shadow-xl shadow-primary/20 uppercase tracking-wider"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              Buy Now
            </Button>

            <Link to={`/vendor/${product.vendorId}`} className="flex-1">
              <Button variant="outline" size="lg" className="h-14 w-full text-lg border-primary/20 hover:border-primary font-bold uppercase tracking-wider">
                <Store className="mr-3 h-5 w-5" />
                Vendor Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {/* Reviews Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
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
                  placeholder="Share your thoughts..."
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
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
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
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;

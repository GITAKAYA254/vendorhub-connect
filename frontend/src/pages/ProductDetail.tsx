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
                src={selectedImage}
                alt={product.title || product.name}
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
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-2">{product.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{product.title || product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-4">
              KS {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-muted-foreground mb-4">
              {product.stock > 0 ? (
                <span className="text-emerald-500 font-medium">
                  {product.stock} items in stock
                </span>
              ) : (
                <span className="text-destructive font-medium">Out of stock</span>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            <Link to={`/vendor/${product.vendorId}`}>
              <Button variant="outline" size="lg" className="w-full">
                <Store className="mr-2 h-5 w-5" />
                View Vendor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
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

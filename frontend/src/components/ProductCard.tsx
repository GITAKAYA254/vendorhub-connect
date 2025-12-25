import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Product } from '@/lib/api';
import { ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success('Added to cart!');
  };

  return (
    <Link to={`/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] border-primary/10 bg-secondary/30 backdrop-blur-sm hover:border-primary/40 rounded-[2rem] relative h-full flex flex-col">
        {/* Hover decorative element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="aspect-square overflow-hidden bg-muted relative">
          {product.image ? (
            <img
              src={api.getImageUrl(product.image)}
              alt={product.title || product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/60 backdrop-blur-md border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest">
              {product.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-black mb-2 line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase">
            {product.title || product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-primary/5">
            <div>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Price</span>
              <span className="text-2xl font-black text-primary tracking-tighter">
                KS {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-tighter ${product.stock > 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full font-black uppercase tracking-[0.2em] h-12 border-primary/20 hover:border-primary hover:text-primary-foreground hover:bg-primary transition-all duration-500 rounded-xl"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            variant="outline"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy Now
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

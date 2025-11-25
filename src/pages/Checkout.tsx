import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { CreditCard } from 'lucide-react';

const Checkout = () => {
  const { items, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Checkout (Placeholder)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-accent/50 border-2 border-accent rounded-lg p-6 text-center">
                <p className="text-lg font-medium mb-2">
                  This is a placeholder checkout page
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  In a production environment, this would integrate with a payment processor like Stripe or PayPal
                </p>
                
                <div className="bg-card rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Order Summary</span>
                  </div>
                  <div className="border-t pt-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm mb-1">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full">
                  Complete Order (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

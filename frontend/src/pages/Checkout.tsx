import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { CreditCard, Phone, Loader2, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { api, VendorPaymentMethod } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [vendorMethods, setVendorMethods] = useState<Partial<VendorPaymentMethod>[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const navigate = useNavigate();

  // Pick the vendor from the first item (assuming single vendor order for now)
  const vendorId = items.length > 0 ? items[0].vendorId : null;

  useEffect(() => {
    if (vendorId) {
      fetchVendorMethods();
    }
  }, [vendorId]);

  const fetchVendorMethods = async () => {
    if (!vendorId) return;
    setIsLoadingMethods(true);
    const result = await api.getVendorPaymentMethods(vendorId);
    if (result.data?.methods) {
      const active = result.data.methods.filter(m => m.isActive);
      setVendorMethods(active);
      if (active.length > 0) {
        setSelectedMethod(active[0].type || null);
      }
    }
    setIsLoadingMethods(false);
  };

  const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      const response = await api.initiatePayment({
        amount: total,
        phoneNumber,
        orderId,
        vendorId: vendorId || undefined,
        provider: 'mpesa'
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('M-Pesa STK Push sent! Please check your phone.');
        clearCart();
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (error) {
      toast.error('Payment initiation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 text-center mt-20">
        <div className="max-w-md mx-auto p-8 border rounded-2xl bg-muted/30">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6 text-sm">Add some amazing products before checking out!</p>
          <Button onClick={() => navigate('/products')} className="w-full">Browse Products</Button>
        </div>
      </main>
    );
  }

  if (isLoadingMethods) return <LoadingSpinner />;

  const isMpesaAvailable = vendorMethods.some(m => m.type === 'MPESA');

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="uppercase text-sm tracking-widest font-black">Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{item.title || item.name}</p>
                        <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-black text-primary">KS {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-6 flex justify-between font-black text-2xl">
                    <span>TOTAL</span>
                    <span className="text-primary font-black">KS {total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-bold">Secure Delivery Guaranteed</p>
                <p className="text-xs text-muted-foreground">Your items will be dispatched within 24 hours of payment verification.</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-5">
            <Card className="border-4 border-primary sticky top-24">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center gap-2 uppercase font-black italic">
                  Payment Method
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">
                  {isMpesaAvailable ? 'Pay directly to vendor via M-Pesa' : 'Selecting an available method'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!isMpesaAvailable ? (
                  <div className="p-8 text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="font-bold text-destructive">No Payment Methods Configured</p>
                    <p className="text-sm text-muted-foreground">This vendor hasn't set up their payment details yet. Please contact support.</p>
                    <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>Go Back</Button>
                  </div>
                ) : (
                  <form onSubmit={handleMpesaPayment} className="space-y-6">
                    <div className="p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl flex items-center gap-4">
                      <Smartphone className="h-8 w-8 text-[#25D366]" />
                      <div>
                        <p className="font-black text-[#25D366]">LIPA NA M-PESA</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Instant Activation</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Your Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="254712345678"
                        className="h-14 text-xl font-bold border-2 focus-visible:ring-primary"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <p className="text-[10px] text-muted-foreground font-medium">Use the format: 2547XXXXXXXX</p>
                    </div>

                    <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest italic shadow-xl shadow-primary/20" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          PROCESSING...
                        </>
                      ) : (
                        `PAY KS ${total.toLocaleString()}`
                      )}
                    </Button>

                    <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-tighter">
                      By clicking PAY, you will receive an STK Push on your phone to complete the transaction.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

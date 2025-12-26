import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, VendorPaymentMethod } from '@/lib/api';
import { Smartphone, Shield, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const DashboardPaymentSettings = () => {
    const [methods, setMethods] = useState<VendorPaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // M-Pesa Form State
    const [mpesaConfig, setMpesaConfig] = useState({
        shortCode: '',
        passkey: '',
        type: 'BG', // BG = Buy Goods, PB = Paybill
        consumerKey: '',
        consumerSecret: '',
        isActive: false,
    });

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        const result = await api.getMyPaymentMethods();
        if (result.data?.methods) {
            setMethods(result.data.methods);

            // Populate M-Pesa if exists
            const mpesa = result.data.methods.find(m => m.type === 'MPESA');
            if (mpesa) {
                setMpesaConfig({
                    shortCode: mpesa.config.shortCode || '',
                    passkey: mpesa.config.passkey || '',
                    type: mpesa.config.type || 'BG',
                    consumerKey: mpesa.config.consumerKey || '',
                    consumerSecret: mpesa.config.consumerSecret || '',
                    isActive: mpesa.isActive,
                });
            }
        }
        setIsLoading(false);
    };

    const handleSaveMpesa = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const result = await api.updatePaymentMethod({
            type: 'MPESA',
            config: {
                shortCode: mpesaConfig.shortCode,
                passkey: mpesaConfig.passkey,
                type: mpesaConfig.type,
                consumerKey: mpesaConfig.consumerKey,
                consumerSecret: mpesaConfig.consumerSecret,
            },
            isActive: mpesaConfig.isActive,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('M-Pesa settings updated!');
            fetchPaymentMethods();
        }
        setIsSaving(false);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">Payment Settings</h2>
                <p className="text-muted-foreground">Configure how you receive payments from customers</p>
            </div>

            <div className="grid gap-6">
                {/* M-Pesa Card */}
                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#25D366]/10 rounded-lg">
                                    <Smartphone className="h-6 w-6 text-[#25D366]" />
                                </div>
                                <div>
                                    <CardTitle>Lipa na M-Pesa (STK Push)</CardTitle>
                                    <CardDescription>Enable instant mobile payments via Safaricom</CardDescription>
                                </div>
                            </div>
                            <Switch
                                checked={mpesaConfig.isActive}
                                onCheckedChange={(val) => setMpesaConfig(prev => ({ ...prev, isActive: val }))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveMpesa} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mpesa-type">Account Type</Label>
                                    <Select
                                        value={mpesaConfig.type}
                                        onValueChange={(val) => setMpesaConfig(prev => ({ ...prev, type: val }))}
                                    >
                                        <SelectTrigger id="mpesa-type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BG">Buy Goods (Till Number)</SelectItem>
                                            <SelectItem value="PB">Paybill</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shortcode">Short Code / Till Number</Label>
                                    <Input
                                        id="shortcode"
                                        placeholder="e.g. 174379"
                                        value={mpesaConfig.shortCode}
                                        onChange={(e) => setMpesaConfig(prev => ({ ...prev, shortCode: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passkey">M-Pesa Online Passkey</Label>
                                <div className="relative">
                                    <Input
                                        id="passkey"
                                        type="password"
                                        placeholder="Enter your LNM Passkey"
                                        value={mpesaConfig.passkey}
                                        onChange={(e) => setMpesaConfig(prev => ({ ...prev, passkey: e.target.value }))}
                                        required
                                    />
                                    <Shield className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground/40" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Found in your Safaricom Developer Portal under 'Lipa Na M-Pesa Online'
                                </p>
                            </div>

                            <div className="pt-4 border-t border-dashed">
                                <p className="text-sm font-semibold mb-3">Custom API Credentials (Optional)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ckey">Consumer Key</Label>
                                        <Input
                                            id="ckey"
                                            placeholder="Optional"
                                            value={mpesaConfig.consumerKey}
                                            onChange={(e) => setMpesaConfig(prev => ({ ...prev, consumerKey: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="csecret">Consumer Secret</Label>
                                        <Input
                                            id="csecret"
                                            type="password"
                                            placeholder="Optional"
                                            value={mpesaConfig.consumerSecret}
                                            onChange={(e) => setMpesaConfig(prev => ({ ...prev, consumerSecret: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-2 italic">
                                    Leave these blank to use the platform's default API credentials with your shortcode.
                                </p>
                            </div>

                            <Button type="submit" className="w-full mt-6" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save M-Pesa Settings'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Coming Soon / Placeholders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Card Payments</CardTitle>
                                <CardDescription>Accept Visa/Mastercard</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" disabled className="w-full">Integrate Stripe (Soon)</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Banknote className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Cash on Delivery</CardTitle>
                                <CardDescription>Direct payment on arrival</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" disabled className="w-full">Enable (Soon)</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

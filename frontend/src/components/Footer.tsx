import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">MarketHub</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted multi-vendor marketplace for products, jobs, and tasks.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link></li>
              <li><Link to="/tasks" className="hover:text-primary transition-colors">Tasks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Vendors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-primary transition-colors">Become a Vendor</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Vendor Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MarketHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

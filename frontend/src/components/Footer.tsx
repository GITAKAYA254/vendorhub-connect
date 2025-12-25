import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter text-primary mb-3">BWS</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier ecosystem for elite commerce, strategic mandates, and high-yield execution.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[10px] text-primary mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link></li>
              <li><Link to="/tasks" className="hover:text-primary transition-colors">Tasks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[10px] text-primary mb-4">Vendors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-primary transition-colors">Become a Vendor</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[10px] text-primary mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 mt-12 pt-8 text-center text-xs text-muted-foreground uppercase tracking-widest font-medium">
          <p>&copy; {new Date().getFullYear()} BWS - Black Wall Street. All rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

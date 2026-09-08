import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Logo } from '@/components/Logo';

export function StoreHeader() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 py-4 flex items-center gap-5">
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2"><Menu className="w-5 h-5" /></button>
            <Logo />
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, packaging, categories..." className="w-full bg-neutral-100 border border-transparent focus:border-packtoday-400 focus:bg-white rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors" />
            </div>
            <nav className="hidden lg:flex items-center gap-5 ml-auto text-sm font-medium text-neutral-700">
              <Link to="/store" className="hover:text-packtoday-600">Shop All</Link>
              <Link to="/custom-packaging" className="hover:text-packtoday-600">Custom Packaging</Link>
              <Link to="/design-services" className="hover:text-packtoday-600">Design Services</Link>
            </nav>
            <div className="ml-auto lg:ml-2 flex items-center gap-3">
              <Link to="/account" className="hidden sm:block text-sm font-medium text-neutral-700 hover:text-packtoday-600">Account</Link>
              <Link to="/cart" className="relative p-2 text-neutral-800 hover:text-packtoday-600">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && <span className="absolute -right-1 -top-1 bg-packtoday-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">{itemCount}</span>}
              </Link>
            </div>
          </div>
          <div className="md:hidden relative pb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input placeholder="Search products..." className="w-full bg-neutral-100 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none" />
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t bg-white px-4 py-4 space-y-3 text-sm">
            <Link className="block" to="/store">Shop All</Link>
            <Link className="block" to="/custom-packaging">Custom Packaging</Link>
            <Link className="block" to="/design-services">Design Services</Link>
          </div>
        )}
      </header>
      <div className="bg-neutral-950 text-white text-[11px] tracking-wider uppercase">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <span>Premium B2B packaging, made simple</span>
          <span className="hidden sm:block text-packtoday-300">Minimum order: 100 units</span>
        </div>
      </div>
    </>
  );
}

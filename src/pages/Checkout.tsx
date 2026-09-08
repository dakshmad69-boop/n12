import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: profile?.business_name ?? '',
    full_name: '',
    email: user?.email ?? '',
    phone: profile?.phone ?? '',
    gst_number: profile?.gst_number ?? '',
    billing_address: profile?.billing_address ?? '',
    shipping_address: profile?.shipping_address ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    pin: profile?.pin ?? '',
    payment_method: 'Bank Transfer',
    order_notes: '',
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + shipping;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    setPlacing(true);
    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'Confirmed',
        subtotal,
        shipping,
        total,
        ...form,
      })
      .select('id')
      .single();
    if (error) {
      setPlacing(false);
      return;
    }
    if (data) {
      await supabase.from('order_items').insert(
        items.map((item) => ({
          order_id: data.id,
          product_id: null,
          product_name: item.product_name,
          variant_type: item.variant_type,
          variant_value: item.variant_value,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          customisation_option: item.customisation_option,
          artwork_url: item.artwork_url,
          artwork_status: item.artwork_status,
        }))
      );
      // Upsert profile
      await supabase.from('customer_profiles').upsert({
        id: user.id,
        business_name: form.business_name,
        gst_number: form.gst_number,
        phone: form.phone,
        billing_address: form.billing_address,
        shipping_address: form.shipping_address,
        city: form.city,
        state: form.state,
        pin: form.pin,
      });
      clearCart();
      setPlaced(orderNumber);
    }
    setPlacing(false);
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <StoreHeader />
        <main className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-packtoday-100 flex items-center justify-center">
            <Check className="w-8 h-8 text-packtoday-700" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Order placed.</h1>
          <p className="mt-3 text-neutral-600">Your order number is <span className="font-semibold text-neutral-900">{placed}</span>. We'll be in touch shortly with next steps.</p>
          <Link to="/account" className="mt-8 inline-flex items-center gap-2 bg-packtoday-500 text-white px-5 py-3 rounded-lg font-semibold">Go to my orders <ArrowRight className="w-4 h-4" /></Link>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <StoreHeader />
        <main className="max-w-xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-neutral-500">Add some products before checking out.</p>
          <Link to="/store" className="mt-6 inline-flex items-center gap-2 bg-packtoday-500 text-white px-5 py-3 rounded-lg font-semibold">Browse the store <ArrowRight className="w-4 h-4" /></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <StoreHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-packtoday-600 text-xs font-semibold tracking-widest uppercase">Checkout</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Place your order</h1>
          </div>
          {!user && (
            <Link to="/auth?redirect=/checkout" className="text-sm font-semibold text-packtoday-700 hover:text-packtoday-500">
              Sign in for faster checkout
            </Link>
          )}
        </div>
        <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Business & contact details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <CField label="Business name" value={form.business_name} onChange={(v) => set('business_name', v)} placeholder="Your business" />
                <CField label="Full name" value={form.full_name} onChange={(v) => set('full_name', v)} placeholder="Full name" required />
                <CField label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="you@business.com" required />
                <CField label="Phone" value={form.phone} onChange={(v) => set('phone', v)} placeholder="Phone number" required />
                <CField label="GST number" value={form.gst_number} onChange={(v) => set('gst_number', v)} placeholder="GST number" />
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Addresses</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <CField label="Billing address" value={form.billing_address} onChange={(v) => set('billing_address', v)} placeholder="Billing address" required />
                <CField label="Shipping address" value={form.shipping_address} onChange={(v) => set('shipping_address', v)} placeholder="Shipping address" required />
                <CField label="City" value={form.city} onChange={(v) => set('city', v)} placeholder="City" required />
                <CField label="State" value={form.state} onChange={(v) => set('state', v)} placeholder="State" required />
                <CField label="PIN" value={form.pin} onChange={(v) => set('pin', v)} placeholder="PIN code" required />
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Payment & notes</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium mb-2">Payment method</span>
                  <select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500">
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-2">Order notes (optional)</span>
                  <textarea rows={3} value={form.order_notes} onChange={(e) => set('order_notes', e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500" placeholder="Any special instructions" />
                </label>
              </div>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 h-fit">
            <h2 className="font-semibold mb-5">Order summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-neutral-500">{item.variant_value} · {item.quantity.toLocaleString()} units</p>
                  </div>
                  <p className="font-medium">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span></div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
            <button type="submit" disabled={placing} className="mt-6 w-full bg-packtoday-500 hover:bg-packtoday-600 text-white py-3.5 rounded-lg font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {placing ? 'Placing order...' : <>Place order <Lock className="w-4 h-4" /></>}
            </button>
            <p className="mt-4 text-[11px] text-neutral-500 text-center">By placing this order you agree to PackToday's terms of service.</p>
          </div>
        </form>
      </main>
    </div>
  );
}

function CField({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="block text-sm font-medium mb-2">{label}</span>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500" />
    </label>
  );
}

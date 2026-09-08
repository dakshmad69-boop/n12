import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Package, Palette, FileText, MapPin, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';
import type { Order, DesignRequest, CustomerProfile } from '@/types';

type Tab = 'dashboard' | 'orders' | 'designs' | 'quotes' | 'addresses' | 'account';

export function CustomerDashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [designs, setDesigns] = useState<DesignRequest[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [form, setForm] = useState({
    business_name: profile?.business_name ?? '',
    gst_number: profile?.gst_number ?? '',
    phone: profile?.phone ?? '',
    billing_address: profile?.billing_address ?? '',
    shipping_address: profile?.shipping_address ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    pin: profile?.pin ?? '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/account');
      return;
    }
    (async () => {
      const [ordersRes, designsRes, quotesRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('design_requests').select('*, design_versions(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('bulk_quotes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setOrders((ordersRes.data as Order[]) || []);
      setDesigns((designsRes.data as DesignRequest[]) || []);
      setQuotes(quotesRes.data || []);
      setLoading(false);
    })();
  }, [user, navigate]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('customer_profiles').upsert({ id: user.id, ...form });
    await refreshProfile();
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'designs', label: 'Design Requests', icon: Palette },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'account', label: 'Account', icon: UserIcon },
  ];

  const orderStatuses = ['Confirmed', 'Design', 'Approval', 'Production', 'Dispatch', 'Delivered'];

  return (
    <div className="min-h-screen bg-neutral-50">
      <StoreHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-packtoday-600 text-xs font-semibold tracking-widest uppercase">My account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Hello, {profile?.business_name || user.email}</h1>
          </div>
          <button onClick={async () => { await signOut(); navigate('/'); }} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-white border border-neutral-200 rounded-xl p-3 h-fit">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-packtoday-50 text-packtoday-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </aside>

          <div className="space-y-4">
            {loading ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-400">Loading...</div>
            ) : tab === 'dashboard' ? (
              <DashboardOverview orders={orders} designs={designs} quotes={quotes} setTab={setTab} />
            ) : tab === 'orders' ? (
              <OrdersList orders={orders} statuses={orderStatuses} />
            ) : tab === 'designs' ? (
              <DesignsList designs={designs} />
            ) : tab === 'quotes' ? (
              <QuotesList quotes={quotes} />
            ) : tab === 'addresses' ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="font-semibold mb-4">Saved addresses</h2>
                <div className="space-y-3">
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-sm font-medium">Billing address</p>
                    <p className="mt-1 text-sm text-neutral-500">{profile?.billing_address || 'Not set'}</p>
                  </div>
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-sm font-medium">Shipping address</p>
                    <p className="mt-1 text-sm text-neutral-500">{profile?.shipping_address || 'Not set'}</p>
                  </div>
                </div>
                <button onClick={() => setTab('account')} className="mt-4 text-sm font-semibold text-packtoday-700">Edit addresses →</button>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="font-semibold mb-5">Account details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ProfField label="Business name" value={form.business_name} onChange={(v) => setForm((p) => ({ ...p, business_name: v }))} />
                  <ProfField label="GST number" value={form.gst_number} onChange={(v) => setForm((p) => ({ ...p, gst_number: v }))} />
                  <ProfField label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
                  <ProfField label="City" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} />
                  <ProfField label="Billing address" value={form.billing_address} onChange={(v) => setForm((p) => ({ ...p, billing_address: v }))} />
                  <ProfField label="Shipping address" value={form.shipping_address} onChange={(v) => setForm((p) => ({ ...p, shipping_address: v }))} />
                  <ProfField label="State" value={form.state} onChange={(v) => setForm((p) => ({ ...p, state: v }))} />
                  <ProfField label="PIN" value={form.pin} onChange={(v) => setForm((p) => ({ ...p, pin: v }))} />
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <button type="submit" disabled={saving} className="bg-packtoday-500 hover:bg-packtoday-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  {savedMsg && <span className="text-sm text-packtoday-600 font-medium">Saved!</span>}
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview({ orders, designs, quotes, setTab }: { orders: Order[]; designs: DesignRequest[]; quotes: any[]; setTab: (t: Tab) => void }) {
  const stats = [
    { label: 'Total orders', value: orders.length, icon: Package, tab: 'orders' as Tab },
    { label: 'Design requests', value: designs.length, icon: Palette, tab: 'designs' as Tab },
    { label: 'Bulk quotes', value: quotes.length, icon: FileText, tab: 'quotes' as Tab },
  ];
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => setTab(s.tab)} className="bg-white border border-neutral-200 rounded-xl p-5 text-left hover:border-packtoday-300 transition-colors">
            <s.icon className="w-5 h-5 text-packtoday-600" />
            <p className="mt-3 text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-neutral-500">{s.label}</p>
          </button>
        ))}
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-500">No orders yet. <Link to="/store" className="text-packtoday-700 font-medium">Browse the store →</Link></p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-neutral-500">{new Date(o.created_at).toLocaleDateString()} · {o.order_items?.length || 0} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-semibold">₹{o.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersList({ orders, statuses }: { orders: Order[]; statuses: string[] }) {
  if (orders.length === 0) return <EmptyState title="No orders yet" subtitle="Your placed orders will appear here." cta="Browse the store" link="/store" />;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{o.order_number}</p>
              <p className="text-sm text-neutral-500 mt-1">{new Date(o.created_at).toLocaleDateString()} · {o.order_items?.length || 0} items</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={o.status} />
              <span className="font-semibold">₹{o.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {statuses.map((s) => (
              <span key={s} className={`text-[10px] px-2 py-1 rounded-full ${o.status === s ? 'bg-packtoday-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>{s}</span>
            ))}
          </div>
          {o.order_items && o.order_items.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
              {o.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{item.product_name} · {item.variant_value} · {item.quantity.toLocaleString()} units</span>
                  <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DesignsList({ designs }: { designs: DesignRequest[] }) {
  if (designs.length === 0) return <EmptyState title="No design requests" subtitle="Submit a design request from any product page." cta="Browse the store" link="/store" />;
  const designStatuses = ['Request Received', 'Designer Assigned', 'Design In Progress', 'Ready For Approval', 'Approved For Production'];
  return (
    <div className="space-y-3">
      {designs.map((d) => (
        <div key={d.id} className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold capitalize">{d.option_type.replace('_', ' ')}</p>
              <p className="text-sm text-neutral-500 mt-1">{d.business_name || 'No business name'} · {new Date(d.created_at).toLocaleDateString()}</p>
            </div>
            <StatusBadge status={d.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {designStatuses.map((s) => (
              <span key={s} className={`text-[10px] px-2 py-1 rounded-full ${d.status === s ? 'bg-packtoday-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>{s}</span>
            ))}
          </div>
          {d.design_versions && d.design_versions.length > 0 && (
            <p className="mt-3 text-xs text-neutral-500">{d.design_versions.length} design version(s) submitted</p>
          )}
        </div>
      ))}
    </div>
  );
}

function QuotesList({ quotes }: { quotes: any[] }) {
  if (quotes.length === 0) return <EmptyState title="No bulk quotes" subtitle="Request a bulk quote for large orders." cta="Request a quote" link="/bulk-quote" />;
  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{q.contact_name}</p>
              <p className="text-sm text-neutral-500 mt-1">{q.business_name || 'Individual'} · {new Date(q.created_at).toLocaleDateString()}</p>
            </div>
            <StatusBadge status={q.status} />
          </div>
          <div className="mt-3 text-sm text-neutral-600 space-y-1">
            {q.quantity && <p>Quantity: {q.quantity.toLocaleString()} units</p>}
            {q.delivery_location && <p>Delivery: {q.delivery_location}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle, cta, link }: { title: string; subtitle: string; cta: string; link: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
      <Link to={link} className="mt-5 inline-flex items-center gap-2 bg-packtoday-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">{cta} <ArrowRight className="w-4 h-4" /></Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Confirmed: 'bg-blue-50 text-blue-700',
    Delivered: 'bg-packtoday-50 text-packtoday-700',
    Pending: 'bg-amber-50 text-amber-700',
    'Request Received': 'bg-blue-50 text-blue-700',
    'Approved For Production': 'bg-packtoday-50 text-packtoday-700',
  };
  return <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${colors[status] || 'bg-neutral-100 text-neutral-600'}`}>{status}</span>;
}

function ProfField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="block text-sm font-medium mb-2">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500" />
    </label>
  );
}

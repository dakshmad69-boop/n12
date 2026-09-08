import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, Palette, FileText, DollarSign, Truck, Users, Settings, LogOut, Plus, Edit3, Trash2, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import type { Category, Product, Order, DesignRequest, BulkQuote } from '@/types';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'designs' | 'quotes' | 'operations' | 'customers';

export function AdminDashboard() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [designs, setDesigns] = useState<DesignRequest[]>([]);
  const [quotes, setQuotes] = useState<BulkQuote[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    (async () => {
      const [o, d, q, p, c] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        supabase.from('design_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('bulk_quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, category:categories(*)').order('display_order'),
        supabase.from('categories').select('*').order('display_order'),
      ]);
      setOrders((o.data as Order[]) || []);
      setDesigns((d.data as DesignRequest[]) || []);
      setQuotes((q.data as BulkQuote[]) || []);
      setProducts((p.data as Product[]) || []);
      setCategories((c.data as Category[]) || []);
      setLoading(false);
    })();
  }, []);

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);

  const tabs: { id: AdminTab; label: string; icon: typeof Package }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Settings },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'designs', label: 'Design', icon: Palette },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'operations', label: 'Operations', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-60 bg-neutral-950 text-neutral-300 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-neutral-800">
          <Link to="/"><Logo variant="light" /></Link>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-packtoday-500/20 text-packtoday-300' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-800">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {loading ? (
          <div className="text-neutral-400">Loading...</div>
        ) : tab === 'dashboard' ? (
          <AdminOverview orders={orders} designs={designs} quotes={quotes} revenue={revenue} />
        ) : tab === 'products' ? (
          <ProductsManager products={products} categories={categories} onAdd={() => setShowProductModal(true)} setProducts={setProducts} />
        ) : tab === 'categories' ? (
          <CategoriesManager categories={categories} setCategories={setCategories} />
        ) : tab === 'orders' ? (
          <OrdersManager orders={orders} setOrders={setOrders} />
        ) : tab === 'designs' ? (
          <DesignsManager designs={designs} setDesigns={setDesigns} />
        ) : tab === 'quotes' ? (
          <QuotesManager quotes={quotes} setQuotes={setQuotes} />
        ) : tab === 'customers' ? (
          <CustomersManager orders={orders} />
        ) : (
          <OperationsManager orders={orders} designs={designs} quotes={quotes} revenue={revenue} />
        )}
      </main>

      {showProductModal && <ProductModal categories={categories} onClose={() => setShowProductModal(false)} />}
    </div>
  );
}

function AdminOverview({ orders, designs, quotes, revenue }: { orders: Order[]; designs: DesignRequest[]; quotes: BulkQuote[]; revenue: number }) {
  const stats = [
    { label: 'Revenue', value: `₹${revenue.toFixed(2)}`, icon: DollarSign, color: 'text-packtoday-600' },
    { label: 'Orders', value: orders.length, icon: Truck, color: 'text-blue-600' },
    { label: 'Design Requests', value: designs.length, icon: Palette, color: 'text-purple-600' },
    { label: 'Pending Quotes', value: quotes.filter((q) => q.status === 'Pending').length, icon: FileText, color: 'text-amber-600' },
  ];
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <p className="mt-3 text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Recent orders</h2>
        {orders.length === 0 ? <p className="text-sm text-neutral-500">No orders yet.</p> : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div><p className="text-sm font-medium">{o.order_number}</p><p className="text-xs text-neutral-500">{new Date(o.created_at).toLocaleDateString()}</p></div>
                <span className="font-semibold">₹{Number(o.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsManager({ products, categories, onAdd, setProducts }: { products: Product[]; categories: Category[]; onAdd: () => void; setProducts: (p: Product[]) => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products ({products.length})</h1>
        <button onClick={onAdd} className="inline-flex items-center gap-2 bg-packtoday-500 hover:bg-packtoday-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Price</th><th className="text-left px-4 py-3">MOQ</th><th className="text-right px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-neutral-500">{p.category?.name || '—'}</td>
                <td className="px-4 py-3">₹{Number(p.starting_price).toFixed(2)}</td>
                <td className="px-4 py-3">{p.moq}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-neutral-400 hover:text-packtoday-600 p-1"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteProduct(p.id)} className="text-neutral-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesManager({ categories, setCategories }: { categories: Category[]; setCategories: (c: Category[]) => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    const { data } = await supabase.from('categories').insert({ name, slug, display_order: categories.length + 1 }).select('*').single();
    if (data) { setCategories([...categories, data as Category]); setName(''); setSlug(''); }
  };
  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter((c) => c.id !== id));
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Categories ({categories.length})</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-neutral-400">/{c.slug}</p></div>
              <button onClick={() => deleteCategory(c.id)} className="text-neutral-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addCategory} className="bg-white border border-neutral-200 rounded-xl p-5 h-fit">
          <h2 className="font-semibold text-sm mb-4">Add category</h2>
          <div className="space-y-3">
            <label className="block"><span className="block text-sm font-medium mb-1.5">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-packtoday-500" /></label>
            <label className="block"><span className="block text-sm font-medium mb-1.5">Slug</span><input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-packtoday-500" /></label>
            <button type="submit" className="w-full bg-packtoday-500 text-white py-2.5 rounded-lg text-sm font-semibold">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrdersManager({ orders, setOrders }: { orders: Order[]; setOrders: (o: Order[]) => void }) {
  const statuses = ['Confirmed', 'Design', 'Approval', 'Production', 'Dispatch', 'Delivered'];
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map((o) => o.id === id ? { ...o, status } : o));
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Orders ({orders.length})</h1>
      {orders.length === 0 ? <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-500">No orders yet.</div> : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.order_number}</p>
                  <p className="text-sm text-neutral-500 mt-1">{o.full_name} · {o.email} · {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <span className="font-semibold">₹{Number(o.total).toFixed(2)}</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-neutral-500">Status:</span>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-packtoday-500">
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DesignsManager({ designs, setDesigns }: { designs: DesignRequest[]; setDesigns: (d: DesignRequest[]) => void }) {
  const statuses = ['Request Received', 'Designer Assigned', 'Design In Progress', 'Ready For Approval', 'Approved For Production'];
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('design_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setDesigns(designs.map((d) => d.id === id ? { ...d, status } : d));
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Design Requests ({designs.length})</h1>
      {designs.length === 0 ? <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-500">No design requests yet.</div> : (
        <div className="space-y-3">
          {designs.map((d) => (
            <div key={d.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold capitalize">{d.option_type.replace('_', ' ')}</p>
                  <p className="text-sm text-neutral-500 mt-1">{d.business_name || 'No business'} · {new Date(d.created_at).toLocaleDateString()}</p>
                  {d.design_style && <p className="text-sm text-neutral-600 mt-2">Style: {d.design_style}</p>}
                  {d.additional_instructions && <p className="text-sm text-neutral-600 mt-1">Notes: {d.additional_instructions}</p>}
                </div>
                <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)} className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-packtoday-500">
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuotesManager({ quotes, setQuotes }: { quotes: BulkQuote[]; setQuotes: (q: BulkQuote[]) => void }) {
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bulk_quotes').update({ status }).eq('id', id);
    setQuotes(quotes.map((q) => q.id === id ? { ...q, status } : q));
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Bulk Quotes ({quotes.length})</h1>
      {quotes.length === 0 ? <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-500">No quote requests yet.</div> : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{q.contact_name}</p>
                  <p className="text-sm text-neutral-500 mt-1">{q.email} · {q.phone}</p>
                  {q.quantity && <p className="text-sm text-neutral-600 mt-2">Quantity: {q.quantity.toLocaleString()}</p>}
                  {q.delivery_location && <p className="text-sm text-neutral-600">Delivery: {q.delivery_location}</p>}
                </div>
                <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-packtoday-500">
                  {['Pending', 'Reviewed', 'Quoted', 'Approved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomersManager({ orders }: { orders: Order[] }) {
  const customers = new Map<string, { name: string; email: string; orders: number; total: number }>();
  orders.forEach((o) => {
    const key = o.email || o.user_id;
    const existing = customers.get(key);
    if (existing) { existing.orders++; existing.total += Number(o.total); }
    else customers.set(key, { name: o.full_name || o.business_name || 'Unknown', email: o.email || '', orders: 1, total: Number(o.total) });
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Customers ({customers.size})</h1>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider"><tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Orders</th><th className="text-left px-4 py-3">Total spent</th></tr></thead>
          <tbody>
            {Array.from(customers.values()).map((c, i) => (
              <tr key={i} className="border-t border-neutral-100"><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3 text-neutral-500">{c.email}</td><td className="px-4 py-3">{c.orders}</td><td className="px-4 py-3 font-semibold">₹{c.total.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OperationsManager({ orders, designs, quotes, revenue }: { orders: Order[]; designs: DesignRequest[]; quotes: BulkQuote[]; revenue: number }) {
  const inProduction = orders.filter((o) => o.status === 'Production').length;
  const inDispatch = orders.filter((o) => o.status === 'Dispatch').length;
  const pendingDesigns = designs.filter((d) => d.status === 'Request Received').length;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Operations</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total revenue', value: `₹${revenue.toFixed(2)}`, color: 'text-packtoday-600' },
          { label: 'In production', value: inProduction, color: 'text-blue-600' },
          { label: 'In dispatch', value: inDispatch, color: 'text-purple-600' },
          { label: 'Pending designs', value: pendingDesigns, color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Production pipeline</h2>
        <div className="space-y-2">
          {['Confirmed', 'Design', 'Approval', 'Production', 'Dispatch', 'Delivered'].map((stage) => {
            const count = orders.filter((o) => o.status === stage).length;
            return (
              <div key={stage} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-sm font-medium">{stage}</span>
                <span className="text-sm text-neutral-500">{count} orders</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProductModal({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', slug: '', category_id: '', sku: '', starting_price: '', moq: '100', description: '', material: '', lead_time: '7-10 business days' });
  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('products').insert({
      name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      category_id: form.category_id, sku: form.sku,
      starting_price: parseFloat(form.starting_price) || 0, moq: parseInt(form.moq) || 100,
      description: form.description, material: form.material, lead_time: form.lead_time,
      availability: 'In Stock', custom_printing: true, design_support: true,
    });
    setSaving(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Add product</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-neutral-400" /></button>
        </div>
        <form onSubmit={save} className="space-y-4">
          <MField label="Product name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <MField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated if empty" />
          <label className="block"><span className="block text-sm font-medium mb-1.5">Category</span><select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-packtoday-500" required><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <MField label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
            <MField label="Starting price (₹)" value={form.starting_price} onChange={(v) => setForm({ ...form, starting_price: v })} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MField label="MOQ" value={form.moq} onChange={(v) => setForm({ ...form, moq: v })} type="number" />
            <MField label="Lead time" value={form.lead_time} onChange={(v) => setForm({ ...form, lead_time: v })} />
          </div>
          <MField label="Material" value={form.material} onChange={(v) => setForm({ ...form, material: v })} />
          <label className="block"><span className="block text-sm font-medium mb-1.5">Description</span><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-packtoday-500" /></label>
          <button type="submit" disabled={saving} className="w-full bg-packtoday-500 text-white py-3 rounded-lg font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Add product'}</button>
        </form>
      </div>
    </div>
  );
}

function MField({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block"><span className="block text-sm font-medium mb-1.5">{label}</span><input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-packtoday-500" /></label>;
}

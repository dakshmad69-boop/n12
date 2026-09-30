import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail, Clock, Check, MessageCircle, ShoppingBag } from 'lucide-react';
import { HomeHeader } from '@/components/HomeHeader';
import { HomeFooter } from '@/components/HomeFooter';
import { whatsappUrl, WHATSAPP_DISPLAY, DEFAULT_WHATSAPP_MESSAGE } from '@/components/WhatsAppButton';

const ADDRESS = 'H/2154 Tuwariyan ki Dhani, Vimalpura, Vidhani, Jaipur, Rajasthan 302022';
const PHONE_DISPLAY = WHATSAPP_DISPLAY;
const MAP_QUERY = encodeURIComponent(ADDRESS);

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', business: '', email: '', phone: '', message: '' });

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const orderMessage = whatsappUrl(
    `Hi PackToday! I'd like to place an order.\n\nName: ${form.name || '—'}\nBusiness: ${form.business || '—'}\nPhone: ${form.phone || '—'}\n\nDetails: ${form.message || 'I need help choosing the right packaging.'}`
  );

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-packtoday-50/50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-packtoday-600 text-sm font-semibold tracking-widest uppercase mb-5">Contact us</p>
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] text-neutral-950 leading-[1.05]">
                Let's make something useful.
              </h1>
              <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
                Have a question about a product, a larger run or artwork support? Our team is ready to help you choose the right next step — or place your order directly on WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* WhatsApp CTA banner */}
        <section className="pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#25D366] p-6 sm:p-8 lg:p-10">
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -right-20 top-10 w-64 h-64 rounded-full bg-white/5" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white">Order on WhatsApp</h2>
                    <p className="mt-1 text-sm text-white/80">Fastest way to reach us. Share your requirements and we'll guide you through the order.</p>
                  </div>
                </div>
                <a
                  href={whatsappUrl(DEFAULT_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#1ebe57] px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-white/90 transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  Chat now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact info + form */}
        <section className="pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
              {/* Info column */}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Reach us directly</h2>
                <p className="mt-3 text-neutral-600 leading-relaxed">We're here to help with orders, custom designs and bulk enquiries.</p>

                <div className="mt-8 space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-packtoday-50 shrink-0">
                      <MapPin className="w-5 h-5 text-packtoday-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Visit us</p>
                      <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{ADDRESS}</p>
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-packtoday-50 shrink-0">
                      <Phone className="w-5 h-5 text-packtoday-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Call or WhatsApp</p>
                      <a href={`tel:+91${WHATSAPP_DISPLAY.replace(/\D/g, '')}`} className="mt-1 text-sm text-neutral-600 hover:text-packtoday-600 transition-colors block">{PHONE_DISPLAY}</a>
                      <a href={whatsappUrl(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1ebe57] hover:text-[#25D366] transition-colors">
                        <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-packtoday-50 shrink-0">
                      <Mail className="w-5 h-5 text-packtoday-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Email</p>
                      <a href="mailto:hello@packtoday.in" className="mt-1 text-sm text-neutral-600 hover:text-packtoday-600 transition-colors">hello@packtoday.in</a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-packtoday-50 shrink-0">
                      <Clock className="w-5 h-5 text-packtoday-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Business hours</p>
                      <p className="mt-1 text-sm text-neutral-600">Mon – Sat, 9:00 AM – 7:00 PM</p>
                      <p className="text-sm text-neutral-500">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="mt-8 rounded-2xl overflow-hidden border border-neutral-200">
                  <iframe
                    title="PackToday location"
                    src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                    width="100%"
                    height="240"
                    loading="lazy"
                    style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Form column */}
              <div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-premium">
                  {sent ? (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 mx-auto rounded-full bg-packtoday-100 flex items-center justify-center">
                        <Check className="w-7 h-7 text-packtoday-700" />
                      </div>
                      <h3 className="mt-6 text-2xl font-semibold text-neutral-950">Message sent.</h3>
                      <p className="mt-3 text-neutral-600 leading-relaxed max-w-sm mx-auto">Thanks for reaching out. Our team will get back to you shortly — usually within one business day.</p>
                      <a
                        href={whatsappUrl(DEFAULT_WHATSAPP_MESSAGE)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-5 py-3 rounded-lg font-semibold text-sm transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Continue on WhatsApp
                      </a>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Send us a message</h2>
                      <p className="mt-2 text-sm text-neutral-500">Fill in the details below and we'll get back to you.</p>

                      <form
                        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                        className="mt-6 space-y-4"
                      >
                        <div className="grid sm:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="block text-sm font-medium mb-2 text-neutral-700">Your name</span>
                            <input
                              required
                              value={form.name}
                              onChange={(e) => update('name', e.target.value)}
                              placeholder="Full name"
                              className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-sm font-medium mb-2 text-neutral-700">Business name</span>
                            <input
                              value={form.business}
                              onChange={(e) => update('business', e.target.value)}
                              placeholder="Your business"
                              className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all"
                            />
                          </label>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="block text-sm font-medium mb-2 text-neutral-700">Email</span>
                            <input
                              type="email"
                              required
                              value={form.email}
                              onChange={(e) => update('email', e.target.value)}
                              placeholder="you@business.com"
                              className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-sm font-medium mb-2 text-neutral-700">Phone</span>
                            <input
                              type="tel"
                              required
                              value={form.phone}
                              onChange={(e) => update('phone', e.target.value)}
                              placeholder="Phone number"
                              className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all"
                            />
                          </label>
                        </div>
                        <label className="block">
                          <span className="block text-sm font-medium mb-2 text-neutral-700">How can we help?</span>
                          <textarea
                            required
                            rows={4}
                            value={form.message}
                            onChange={(e) => update('message', e.target.value)}
                            placeholder="Tell us about your packaging needs, quantities, or any questions..."
                            className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-packtoday-500 focus:ring-2 focus:ring-packtoday-500/10 transition-all resize-none"
                          />
                        </label>

                        <button
                          type="submit"
                          className="w-full bg-packtoday-500 hover:bg-packtoday-600 text-white py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          Send message <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      {/* Divider */}
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-neutral-200" />
                        <span className="text-xs text-neutral-400 font-medium">or</span>
                        <div className="flex-1 h-px bg-neutral-200" />
                      </div>

                      {/* WhatsApp send */}
                      <a
                        href={orderMessage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        Send via WhatsApp instead
                      </a>
                      <p className="mt-3 text-xs text-neutral-500 text-center">Your message details will be pre-filled in WhatsApp.</p>
                    </>
                  )}
                </div>

                {/* Quick links */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link to="/store" className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-packtoday-300 hover:bg-packtoday-50/30 transition-all group">
                    <ShoppingBag className="w-5 h-5 text-packtoday-600" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Browse store</p>
                      <p className="text-xs text-neutral-500">Explore products</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto group-hover:text-packtoday-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <Link to="/bulk-quote" className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-packtoday-300 hover:bg-packtoday-50/30 transition-all group">
                    <ArrowRight className="w-5 h-5 text-packtoday-600" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Bulk quote</p>
                      <p className="text-xs text-neutral-500">Large orders</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto group-hover:text-packtoday-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

'use client';

import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { OrderTrackerModal } from '@/components/OrderTrackerModal';
import { useCartStore } from '@/store/useCartStore';
import { useState, useMemo } from 'react';
import { Search, Sparkles, Clock, Flame, Plus, Minus, Utensils } from 'lucide-react';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string | null;
}

interface MainViewProps {
  menuItems: MenuItem[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  All: '🍽️',
  Breakfast: '🥞',
  Lunch: '🍛',
  Snacks: '🍟',
  Beverages: '🥤',
};

// Fallback high-res food images per category if item.imageUrl is null
const CATEGORY_FALLBACKS: Record<string, string> = {
  Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
  Lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  Snacks: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
  Beverages: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
  Default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
};

export function MainView({ menuItems }: MainViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cart = useCartStore((state) => state.cart);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(menuItems.map((i) => i.category)))];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const getCartQuantity = (id: string) => {
    const found = cart.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-orange-500 selection:text-white">
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent py-10 sm:py-14">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 mb-4 shadow-xs">
              <Flame className="w-3.5 h-3.5" />
              <span>Campus Canteen Express Pre-Order</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Skip the Queue,{' '}
              <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 bg-clip-text text-transparent">
                Grab Fresh Meals
              </span>
            </h1>

            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Order delicious canteen favorites ahead of your lecture or break. Select your pickup slot, pick up hot & fresh, and bypass the long rush.
            </p>

            {/* Quick Highlights */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-card/80 border border-border px-3 py-1.5 rounded-lg shadow-2xs">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Pickup in 15-30 Mins</span>
              </div>
              <div className="flex items-center gap-1.5 bg-card/80 border border-border px-3 py-1.5 rounded-lg shadow-2xs">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>Cooked Fresh on Order</span>
              </div>
              <div className="flex items-center gap-1.5 bg-card/80 border border-border px-3 py-1.5 rounded-lg shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Zero Convenience Fee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Controls: Category Filter + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? menuItems.length
                  : menuItems.filter((i) => i.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-card border border-border text-foreground/80 hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <span>{CATEGORY_EMOJIS[cat] || '🍴'}</span>
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, drinks..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40 my-8">
            <Utensils className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-bold">No dishes found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try searching for something else or pick another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold hover:bg-secondary/80 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const qty = getCartQuantity(item.id);
              const imageUrl =
                item.imageUrl ||
                CATEGORY_FALLBACKS[item.category] ||
                CATEGORY_FALLBACKS.Default;

              return (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-xl hover:border-orange-500/30 transition-all duration-300"
                >
                  {/* Food Image with Category Badge */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay on Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
                        <span>{CATEGORY_EMOJIS[item.category] || '🍴'}</span>
                        <span>{item.category}</span>
                      </span>
                    </div>

                    {/* Freshly Made / Available Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        In Kitchen
                      </span>
                    </div>

                    {/* Price Tag pinned to bottom left of photo */}
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-xl font-black text-white drop-shadow-md">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Action */}
                  <div className="flex flex-col flex-1 justify-between p-4 sm:p-5">
                    <div>
                      <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Freshly prepared hot canteen meal. Ready for fast counter pickup.
                      </p>
                    </div>

                    {/* Cart Stepper / Add Button */}
                    <div className="mt-4 pt-3 border-t border-border/60">
                      {qty > 0 ? (
                        <div className="flex items-center justify-between rounded-xl bg-orange-500/10 border border-orange-500/20 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-card text-foreground shadow-xs hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            {qty} in Tray
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              imageUrl: item.imageUrl,
                            })
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-orange-500 hover:text-white shadow-2xs hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Tray</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Mobile Sticky Tray Bar (When cart is not empty and drawer is closed) */}
      {!isCartOpen && cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3.5 text-white shadow-xl shadow-orange-500/30 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white text-orange-600 text-xs font-black px-2 py-0.5">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
              <span className="font-bold text-sm">View Tray</span>
            </div>
            <span className="font-black text-sm">
              ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)} →
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 py-6 text-center text-xs text-muted-foreground mt-12">
        <div className="container mx-auto px-4">
          <p>© 2026 CampusBite • Smart Canteen Pre-Ordering Portal</p>
          <p className="mt-1 text-[11px]">
            Fast express counter pickup • Made for campus students & faculty
          </p>
        </div>
      </footer>
    </div>
  );
}
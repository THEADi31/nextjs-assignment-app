'use client';

import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/useCartStore';
import { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

interface MainViewProps {
  menuItems: MenuItem[];
}

export function MainView({ menuItems }: MainViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const addItem = useCartStore((state) => state.addItem);

  const categories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === selectedCategory);

  return (
    <>
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Today&apos;s Menu</h1>
            <p className="text-muted-foreground mt-1">
              Select items, choose your pickup slot, and bypass the queue.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-2">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="mt-2 text-xl font-black text-primary">₹{item.price}</p>
              </div>

              <button
                onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                className="mt-4 w-full rounded-lg bg-secondary py-2 text-sm font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                + Add to Order
              </button>
            </div>
          ))}
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
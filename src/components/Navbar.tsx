'use client';

import { useTheme } from 'next-themes';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavbarProps {
  onOpenCart: () => void;
}

export function Navbar({ onOpenCart }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { cart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">
            🎓 Campus PreOrder
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>
          )}

          {/* Cart Button with Zustand Store Badge */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {mounted && totalItems > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
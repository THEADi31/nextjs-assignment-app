'use client';

import { useTheme } from 'next-themes';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag, Sun, Moon, ShieldAlert, Clock } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenTracker?: () => void;
  isAdmin?: boolean;
}

const emptySubscribe = () => () => {};

export function Navbar({ onOpenCart, onOpenTracker, isAdmin = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { cart, getTotalAmount, activeOrderId } = useCartStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = getTotalAmount();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Logo size="md" href="/" />

          {/* Navigation items for desktop */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !isAdmin
                  ? 'bg-secondary text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              🍽️ Food Menu
            </Link>

            {onOpenTracker && (
              <button
                type="button"
                onClick={onOpenTracker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span>Track Order</span>
                {mounted && activeOrderId && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </button>
            )}

            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Track Order on mobile */}
          {!isAdmin && onOpenTracker && (
            <button
              type="button"
              onClick={onOpenTracker}
              className="md:hidden flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary cursor-pointer"
            >
              <Clock className="w-3 h-3 text-orange-500" />
              <span>Track</span>
              {mounted && activeOrderId && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>
          )}

          {/* Quick Admin link on mobile if not admin */}
          {!isAdmin && (
            <Link
              href="/admin"
              className="md:hidden flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
            >
              <span>Admin</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl border border-border/80 p-2 text-foreground/80 hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
              aria-label="Toggle Theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 sm:px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 transition-transform group-hover:-rotate-6" />
            <span className="hidden sm:inline">My Tray</span>

            {mounted && totalItems > 0 && (
              <span className="flex items-center gap-1.5 pl-1">
                <span className="rounded-full bg-white text-orange-600 px-1.5 py-0.2 text-xs font-black">
                  {totalItems}
                </span>
                <span className="hidden md:inline text-xs font-bold text-orange-100">
                  ₹{totalAmount}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
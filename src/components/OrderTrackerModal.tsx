'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { getOrderDetails } from '@/app/actions/orderActions';
import { useCartStore } from '@/store/useCartStore';
import {
  X,
  Search,
  Clock,
  User,
  Flame,
  PackageCheck,
  RefreshCw,
  Utensils,
  AlertCircle,
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrackedOrder {
  id: string;
  status: string;
  pickupSlot: string;
  totalAmount: number;
  user: { name: string; email: string };
  items: { id: string; name: string; quantity: number; price: number }[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string; step: number }
> = {
  PENDING: {
    label: 'Kitchen: Pending Prep',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500 animate-ping',
    step: 1,
  },
  PREPARING: {
    label: 'Kitchen: In Kitchen 🔥',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500 animate-pulse',
    step: 2,
  },
  READY: {
    label: 'Kitchen: Ready for Pickup! 🎉',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20',
    dotClass: 'bg-emerald-500 animate-ping',
    step: 3,
  },
  COMPLETED: {
    label: 'Completed & Picked Up ✅',
    badgeClass: 'bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400',
    dotClass: 'bg-slate-400',
    step: 4,
  },
  CANCELLED: {
    label: 'Order Cancelled ❌',
    badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
    dotClass: 'bg-rose-500',
    step: 0,
  },
};

export function OrderTrackerModal({ isOpen, onClose }: OrderTrackerModalProps) {
  const activeOrderId = useCartStore((s) => s.activeOrderId);
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPolling, setIsPolling] = useState(false);

  const lookupOrder = useCallback((orderId: string) => {
    if (!orderId.trim()) return;

    startTransition(async () => {
      setError(null);
      // Clean order ID: remove # prefix if student typed #
      const cleanId = orderId.trim().replace(/^#/, '');
      const res = await getOrderDetails(cleanId);
      if (res.success && res.order) {
        setOrder(res.order as TrackedOrder);
      } else {
        setError('Order not found. Please verify your Order ID.');
        setOrder(null);
      }
    });
  }, []);

  // Auto-load last active order if modal opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (activeOrderId) {
      const timer = setTimeout(() => {
        setSearchInput(activeOrderId);
        lookupOrder(activeOrderId);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeOrderId, lookupOrder]);

  // Real-time status poll every 2.5s for the currently tracked order
  useEffect(() => {
    if (!isOpen || !order?.id) return;

    const interval = setInterval(async () => {
      setIsPolling(true);
      const res = await getOrderDetails(order.id);
      if (res.success && res.order) {
        setOrder((prev) => (prev ? { ...prev, status: res.order!.status } : null));
      }
      setIsPolling(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, order?.id]);

  if (!isOpen) return null;

  const currentStatus = order?.status || 'PENDING';
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
  const currentStep = cfg.step;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Track Canteen Order</h2>
              <p className="text-xs text-muted-foreground">Live kitchen status & pickup tracker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input bar */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookupOrder(searchInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Paste Order ID (e.g. 45e6756e...)"
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isPending ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Status Display */}
        {order ? (
          <div className="mt-5 space-y-4">
            {/* Status Card */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    ORDER ID
                  </span>
                  <p className="font-mono text-base font-extrabold text-orange-600 dark:text-orange-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all ${cfg.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                    {cfg.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => lookupOrder(order.id)}
                    title="Refresh live status"
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-orange-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Step Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1.5">
                  <span className={currentStep >= 1 ? 'text-orange-600 dark:text-orange-400' : ''}>
                    1. Placed
                  </span>
                  <span className={currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : ''}>
                    2. In Kitchen
                  </span>
                  <span className={currentStep >= 3 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                    3. Ready
                  </span>
                  <span className={currentStep >= 4 ? 'text-foreground' : ''}>
                    4. Picked Up
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-border overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentStep === 1
                        ? 'w-1/4 bg-amber-500'
                        : currentStep === 2
                        ? 'w-2/4 bg-blue-500'
                        : currentStep === 3
                        ? 'w-3/4 bg-emerald-500 animate-pulse'
                        : currentStep >= 4
                        ? 'w-full bg-slate-500'
                        : 'w-0'
                    }`}
                  />
                </div>
              </div>

              {/* Status Announcements */}
              {currentStatus === 'READY' && (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-bold">
                    <PackageCheck className="w-4 h-4 text-emerald-500" />
                    <span>YOUR ORDER IS READY!</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-90">
                    Head to <strong>Counter 2 (Pre-Order Express)</strong> to pick up your tray.
                  </p>
                </div>
              )}

              {currentStatus === 'PREPARING' && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-2.5 text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Flame className="w-3.5 h-3.5 text-blue-500" />
                    <span>In Kitchen: Chefs are currently preparing your food!</span>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-1 text-xs pt-1 border-t border-border/80">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> Pickup Slot:
                  </span>
                  <span className="font-bold text-foreground">{order.pickupSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-orange-500" /> Student:
                  </span>
                  <span className="font-medium text-foreground">
                    {order.user.name} ({order.user.email})
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="pt-2 border-t border-border/80">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  ITEMS
                </span>
                <div className="space-y-1">
                  {order.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-xs font-medium">
                      <span>
                        {i.name} <span className="text-muted-foreground">× {i.quantity}</span>
                      </span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-orange-600 dark:text-orange-400 font-black text-base">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          !error && (
            <div className="py-10 text-center text-muted-foreground text-xs">
              <Clock className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p>Enter an Order ID above to track kitchen status in real time.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

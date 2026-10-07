'use client';

import { updateOrderStatus } from '@/app/actions/orderActions';
import { useState, useTransition, useMemo } from 'react';
import {
  Clock,
  User,
  Search,
  AlertCircle,
  TrendingUp,
  PackageCheck,
  Utensils,
  Hourglass,
  Flame,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItem: {
    name: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  pickupSlot: string;
  totalAmount: number;
  createdAt: Date;
  user: { name: string; email: string };
  items: OrderItem[];
}

const STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PENDING: {
    label: 'Pending Prep',
    badgeClass:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-500',
  },
  PREPARING: {
    label: 'In Kitchen',
    badgeClass:
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  READY: {
    label: 'Ready for Pickup',
    badgeClass:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass:
      'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass:
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-500',
  },
};

function formatOrderTime(dateInput: Date | string) {
  const d = new Date(dateInput);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function AdminOrderTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  // Metrics summary
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const preparing = orders.filter((o) => o.status === 'PREPARING').length;
    const ready = orders.filter((o) => o.status === 'READY').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { totalOrders, pending, preparing, ready, totalRevenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = filter === 'ALL' || order.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        order.id.toLowerCase().includes(q) ||
        order.user.name.toLowerCase().includes(q) ||
        order.user.email.toLowerCase().includes(q) ||
        order.items.some((i) => i.menuItem.name.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  const handleStatusChange = (orderId: string, status: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold">Total Orders</span>
            <Utensils className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{metrics.totalOrders}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-xs font-semibold">Pending Prep</span>
            <Hourglass className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics.pending}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <span className="text-xs font-semibold">In Kitchen</span>
            <Flame className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {metrics.preparing}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-semibold">Ready for Pickup</span>
            <PackageCheck className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.ready}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold">Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
            ₹{metrics.totalRevenue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['ALL', ...STATUSES].map((s) => {
            const count =
              s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length;
            const isSelected = filter === s;

            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-card border border-border text-foreground/80 hover:bg-secondary hover:text-foreground'
                }`}
              >
                <span>{s === 'ALL' ? 'All Orders' : STATUS_CONFIG[s]?.label || s}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, student, dish..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-10 w-10 opacity-40 mb-2" />
            <p className="font-semibold text-sm">No orders found matching the filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Order ID & Customer details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-black bg-secondary px-2 py-0.5 rounded-md text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${config.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                        {config.label}
                      </span>

                      <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                        {formatOrderTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-foreground font-semibold">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        {order.user.name}
                      </span>
                      <span>({order.user.email})</span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Slot: {order.pickupSlot}
                      </span>
                    </div>

                    {/* Ordered Items Summary */}
                    <div className="mt-2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.map((i) => (
                          <span
                            key={i.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-secondary/80 border border-border/80 px-2 py-1 font-medium text-foreground"
                          >
                            <span>{i.menuItem.name}</span>
                            <span className="text-orange-600 dark:text-orange-400 font-bold">
                              ×{i.quantity}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              (₹{i.unitPrice * i.quantity})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Total Price and Status Updater */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Order Total
                      </span>
                      <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        disabled={isPending}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="rounded-xl border border-border bg-secondary/80 px-3 py-2 text-xs font-bold text-foreground shadow-2xs hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer disabled:opacity-50"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            Set: {STATUS_CONFIG[status]?.label || status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
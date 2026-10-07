'use client';

import { updateOrderStatus } from '@/app/actions/orderActions';
import { useState, useTransition } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItem: { name: string };
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

export function AdminOrderTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState('ALL');
  const [isPending, startTransition] = useTransition();

  const filteredOrders =
    filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  const handleStatusChange = (orderId: string, status: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-4">
        {['ALL', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              filter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:opacity-80'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border bg-card p-5 shadow-sm gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-semibold">{order.user.name}</span>
                  <span className="text-xs text-muted-foreground">({order.user.email})</span>
                </div>

                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong className="text-foreground">Slot:</strong> {order.pickupSlot}
                  </p>
                  <p>
                    <strong className="text-foreground">Items:</strong>{' '}
                    {order.items.map((i) => `${i.menuItem.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-primary">
                  ₹{order.totalAmount.toFixed(2)}
                </span>

                <select
                  disabled={isPending}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm font-semibold shadow-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
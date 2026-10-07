import { prisma } from '@/lib/prisma';
import { AdminOrderTable } from './AdminOrderTable';

async function getOrders() {
  'use cache';
  return await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminPage() {
  const orders = await getOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Canteen Management Dashboard</h1>
          <p className="text-muted-foreground">
            Manage incoming student pre-orders and update kitchen statuses.
          </p>
        </div>
      </div>

      <AdminOrderTable orders={orders} />
    </div>
  );
}
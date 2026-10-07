import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { AdminOrderTable } from './AdminOrderTable';
import { connection } from 'next/server';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { ArrowLeft, ChefHat } from 'lucide-react';

async function AdminData() {
  await connection();

  const orders = await prisma.order.findMany({
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

  return <AdminOrderTable orders={orders} />;
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-orange-500 selection:text-white">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo size="md" href="/admin" />
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen & Staff Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs sm:text-sm font-semibold hover:bg-secondary hover:text-foreground transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span>Back to Food Menu</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Canteen Order Operations
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Live queue management • Update kitchen statuses • Track student pre-orders
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground">
                Kitchen Queue Live
              </span>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-xs">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Loading live kitchen orders...</p>
            </div>
          }
        >
          <AdminData />
        </Suspense>
      </main>
    </div>
  );
}
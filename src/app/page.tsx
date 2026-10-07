import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { MainView } from '@/components/MainView';
import { connection } from 'next/server';

async function MenuData() {
  await connection();

  const menuItems = await prisma.menuItem.findMany({
    orderBy: { category: 'asc' },
  });

  return <MainView menuItems={menuItems} />;
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading menu...</div>}>
        <MenuData />
      </Suspense>
    </main>
  );
}
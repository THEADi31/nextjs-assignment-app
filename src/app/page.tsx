import { prisma } from '@/lib/prisma';
import { MainView } from '@/components/MainView';

async function getMenuItems() {
  'use cache';
  return await prisma.menuItem.findMany({
    orderBy: { category: 'asc' },
  });
}

export default async function HomePage() {
  const menuItems = await getMenuItems();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MainView menuItems={menuItems} />
    </main>
  );
}
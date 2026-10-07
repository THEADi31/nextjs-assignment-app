import { prisma } from '@/lib/prisma';
import { MainView } from '../components/MainView';

// Revalidate every 60 seconds (Incremental Static Regeneration)
export const revalidate = 60;

export default async function HomePage() {
  // RSC Database Query
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { category: 'asc' },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MainView menuItems={menuItems} />
    </main>
  );
}
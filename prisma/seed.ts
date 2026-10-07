import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CANTEEN_MENU = [
  // Breakfast
  {
    name: 'Crispy Masala Dosa',
    category: 'Breakfast',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Fluffy Butter Pancakes',
    category: 'Breakfast',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Avocado & Poached Egg Toast',
    category: 'Breakfast',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Toasted Veg Club Sandwich',
    category: 'Breakfast',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },

  // Lunch
  {
    name: 'Paneer Butter Masala Thali',
    category: 'Lunch',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Hyderabadi Dum Biryani',
    category: 'Lunch',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Wok-Tossed Hakka Noodles',
    category: 'Lunch',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Gourmet Veggie Cheese Burger',
    category: 'Lunch',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },

  // Snacks
  {
    name: 'Crispy Samosa Chaat',
    category: 'Snacks',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Cheesy Peri-Peri Loaded Fries',
    category: 'Snacks',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Paneer Tikka Kathi Roll',
    category: 'Snacks',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Crispy Popcorn Chicken Bites',
    category: 'Snacks',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },

  // Beverages
  {
    name: 'Signature Iced Cold Coffee',
    category: 'Beverages',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Fresh Alphonso Mango Smoothie',
    category: 'Beverages',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Adrak Masala Chai',
    category: 'Beverages',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    name: 'Fresh Lime Mint Mojito',
    category: 'Beverages',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
];

async function main() {
  console.log('Cleaning existing data...');
  await prisma.emailLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Canteen Kitchen Admin',
      email: 'admin@canteen.edu',
      role: 'ADMIN',
    },
  });

  const sampleStudents = [
    { name: 'Aditya Purohit', email: 'aditya@canteen.edu' },
    { name: 'Rohan Sharma', email: 'rohan.s@canteen.edu' },
    { name: 'Priya Patel', email: 'priya.p@canteen.edu' },
    { name: 'Ananya Verma', email: 'ananya.v@canteen.edu' },
  ];

  const students = await Promise.all(
    sampleStudents.map((s) =>
      prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          role: 'MEMBER',
        },
      })
    )
  );

  console.log('Seeding realistic menu items with photography...');
  const menuItems = await Promise.all(
    CANTEEN_MENU.map((item) =>
      prisma.menuItem.create({
        data: item,
      })
    )
  );

  console.log('Seeding initial canteen orders...');
  const slots = [
    '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM',
    '12:30 PM - 01:00 PM',
    '01:30 PM - 02:00 PM',
  ];
  const statuses = ['PENDING', 'PREPARING', 'READY'];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const item1 = menuItems[i % menuItems.length];
    const item2 = menuItems[(i + 4) % menuItems.length];
    const total = item1.price + item2.price;

    await prisma.order.create({
      data: {
        userId: student.id,
        status: statuses[i % statuses.length],
        pickupSlot: slots[i % slots.length],
        totalAmount: total,
        items: {
          create: [
            {
              menuItemId: item1.id,
              quantity: 1,
              unitPrice: item1.price,
            },
            {
              menuItemId: item2.id,
              quantity: 1,
              unitPrice: item2.price,
            },
          ],
        },
      },
    });
  }

  console.log('Seeding audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      details: 'Populated canteen menu items with delicious photography and test orders.',
    },
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
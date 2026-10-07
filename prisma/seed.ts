import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

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
      name: 'Canteen Admin',
      email: 'admin@canteen.edu',
      role: 'ADMIN',
    },
  });

  const students = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: 'MEMBER',
        },
      })
    )
  );

  console.log('Seeding menu items...');
  const categories = ['Breakfast', 'Lunch', 'Snacks', 'Beverages'];
  const menuItems = await Promise.all(
    Array.from({ length: 12 }).map(() =>
      prisma.menuItem.create({
        data: {
          name: faker.food.dish(),
          category: faker.helpers.arrayElement(categories),
          price: parseFloat(faker.commerce.price({ min: 20, max: 150 })),
          isAvailable: true,
        },
      })
    )
  );

  console.log('Seeding initial canteen orders...');
  const statuses = ['PENDING', 'READY', 'COMPLETED'];
  for (const student of students) {
    const selectedItem = faker.helpers.arrayElement(menuItems);
    await prisma.order.create({
      data: {
        userId: student.id,
        status: faker.helpers.arrayElement(statuses),
        pickupSlot: '12:30 PM - 01:00 PM',
        totalAmount: selectedItem.price,
        items: {
          create: [
            {
              menuItemId: selectedItem.id,
              quantity: 1,
              unitPrice: selectedItem.price,
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
      details: 'Automated canteen database seed executed via @faker-js/faker',
    },
  });

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
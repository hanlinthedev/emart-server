const { faker } = require('@faker-js/faker');
const PrismaClient = require('@prisma/client').PrismaClient;
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

prisma.$connect();

async function seedProduct() {
  const admin = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@admin.com',
      password: await bcrypt.hash('Admin12345!', 10),
      isAdmin: true,
      avatar: faker.image.avatar(),
    },
  });

  for (let i = 0; i < 100; i++) {
    const cateName = faker.commerce.department();
    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        price: faker.number.float({ fractionDigits: 2 }),
        description: faker.commerce.productDescription(),
        image: 'https://picsum.photos/400/300',
        stock: faker.number.int({ min: 0, max: 100 }),
        rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
        user: { connect: { id: admin.id } },
        category: {
          connectOrCreate: {
            where: {
              name: cateName,
            },
            create: {
              name: cateName,
            },
          },
        },
        reviews: {
          create: {
            rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
            comment: faker.lorem.sentence(),
            user: {
              create: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                password: faker.internet.password(),
                isAdmin: false,
              },
            },
          },
        },
      },
    });
  }
}

seedProduct().then(() => {
  console.log('Seeding completed');
});

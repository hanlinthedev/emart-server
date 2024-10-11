const { faker } = require('@faker-js/faker');
const PrismaClient = require('@prisma/client').PrismaClient;

const prisma = new PrismaClient();

prisma.$connect();

async function seedCategory() {
  for (let i = 0; i < 5; i++) {
    await prisma.category.create({
      data: {
        name: faker.commerce.department(),
      },
    });
  }
}

async function seedProduct() {
  const users = (await prisma.user.findMany()).map((user) => user.id);

  for (let i = 0; i < 100; i++) {
    const cateName = faker.commerce.department();
    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        price: faker.number.float({ fractionDigits: 2 }),
        description: faker.commerce.productDescription(),
        image: faker.image.url(),
        stock: faker.number.int({ min: 0, max: 100 }),
        rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
        user: { connect: { id: '25affc88-4917-49a0-830b-a8a091724ab0' } },
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
                address: {
                  create: {
                    no: faker.location.buildingNumber(),
                    street: faker.location.streetAddress(),
                    quarter: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

// seedCategory();
seedProduct().then(() => {
  console.log('Seeding completed');
});

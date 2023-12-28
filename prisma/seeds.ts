import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as process from 'process';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{ name: 'USER' }, { name: 'ADMIN' }, { name: 'WORKER' }],
  });

  await prisma.skill.createMany({
    data: [
      {
        name: 'Nounou',
      },
      {
        name: 'Femme de ménage',
      },
    ],
  });

  await prisma.user.create({
    data: {
      name: 'Danniella Danny',
      email: 'danniella@clean-area.com',
      password: await bcrypt.hash('danny-admin', 10),
      roles: {
        connect: {
          id: 2,
        },
      },
    },
  });

  for (let i = 0; i <= 20; i++) {
    await prisma.worker.create({
      data: {
        name: faker.person.fullName(),
        about: faker.lorem.paragraphs(),
        user: {
          connect: {
            id: 1,
          },
        },
        skills: {
          connect: {
            id: faker.number.int({ min: 1, max: 2 }),
          },
        },
      },
    });
  }
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });

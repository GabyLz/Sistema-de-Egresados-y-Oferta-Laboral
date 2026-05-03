const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sego.local';
  const password = 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      rol: 'admin',
    },
    create: {
      email,
      passwordHash,
      rol: 'admin',
    },
  });

  if (prisma.administrador) {
    await prisma.administrador.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id },
    });
  }

  console.log(`Admin listo: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

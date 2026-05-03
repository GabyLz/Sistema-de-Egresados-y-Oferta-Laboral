const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const usersToTest = [
    'gabyzanabria15@gmail.com',
    'empresa@gmail.com',
    'admin@sego.local'
  ];

  console.log('--- Verificando Usuarios ---');
  for (const email of usersToTest) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { empresa: true, egresado: true }
    });
    if (user) {
      console.log(`[OK] Usuario: ${email}, Rol: ${user.rol}, ID: ${user.id}`);
      if (user.rol === 'empresa' && user.empresa) {
        console.log(`     Empresa: ${user.empresa.razonSocial}, Estado: ${user.empresa.estado}`);
      }
    } else {
      console.log(`[MISSING] Usuario: ${email}`);
    }
  }

  const allUsers = await prisma.user.findMany({ select: { email: true, rol: true } });
  console.log('\n--- Todos los usuarios en DB ---');
  allUsers.forEach(u => console.log(`${u.email} (${u.rol})`));

  await prisma.$disconnect();
}

checkUsers().catch(e => {
  console.error(e);
  process.exit(1);
});

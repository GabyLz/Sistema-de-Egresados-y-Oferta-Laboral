const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking database connection...');
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in DB: ${userCount}`);
    
    const users = await prisma.user.findMany({
      select: { email: true, rol: true }
    });
    console.log('Users found:', users);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

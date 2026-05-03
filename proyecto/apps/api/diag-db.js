const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection: SUCCESS');
    
    // Check for uuid-ossp extension
    const extensions = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'`;
    if (extensions.length > 0) {
      console.log('uuid-ossp extension: INSTALLED');
    } else {
      console.log('uuid-ossp extension: MISSING');
      console.log('Attempting to install uuid-ossp...');
      try {
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        console.log('uuid-ossp extension: INSTALLED SUCCESSFULY');
      } catch (e) {
        console.error('Failed to install uuid-ossp. You might need superuser permissions.');
      }
    }
  } catch (error) {
    console.error('Database diagnostic FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const prisma = app.get(PrismaService);
	await prisma.enableShutdownHooks(app);
	app.enableCors();
	const port = Number(process.env.PORT || 3040);
	await app.listen(port);
	console.log(`API is running on: http://localhost:${port}`);
}

bootstrap();

import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const prisma = new PrismaClient();

const worker = new Worker('reportes', async job => {
  const { reporteId, tipo, parametros, usuarioId } = job.data;
  console.log('Processing report job', reporteId, tipo);

  try {
    // Example: render a simple HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const html = `<html><body><h1>Reporte: ${tipo}</h1><pre>${JSON.stringify(parametros, null, 2)}</pre></body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const outDir = path.resolve(__dirname, '../../storage/reports');
    fs.mkdirSync(outDir, { recursive: true });
    const filename = `${reporteId}.pdf`;
    const filepath = path.join(outDir, filename);
    await page.pdf({ path: filepath, format: 'A4' });
    await browser.close();

    // Update report record
    await prisma.reporteGenerado.update({ where: { id: reporteId }, data: { estado: 'completado', urlArchivo: `/storage/reports/${filename}`, fechaCompletado: new Date() } });
    console.log('Report generated:', filepath);
  } catch (err) {
    console.error('Report job failed', err);
    await prisma.reporteGenerado.update({ where: { id: job.data.reporteId }, data: { estado: 'fallido' } });
  }
});

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));

console.log('Report worker started');

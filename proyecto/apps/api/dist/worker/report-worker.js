"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const puppeteer = __importStar(require("puppeteer"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const prisma = new client_1.PrismaClient();
const worker = new bullmq_1.Worker('reportes', async (job) => {
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
    }
    catch (err) {
        console.error('Report job failed', err);
        await prisma.reporteGenerado.update({ where: { id: job.data.reporteId }, data: { estado: 'fallido' } });
    }
});
worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));
console.log('Report worker started');

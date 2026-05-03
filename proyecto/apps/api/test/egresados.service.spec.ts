import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EgresadosService } from '../src/modules/egresados/egresados.service';

describe('EgresadosService', () => {
  let service: EgresadosService;
  const mockPrisma = {
    egresado: {
      update: vi.fn(),
    },
  };

  beforeEach(() => {
    service = new EgresadosService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('update', () => {
    it('should validate and parse valid birth dates', async () => {
      const id = 'some-id';
      const data = { fechaNacimiento: '1995-05-15' };
      
      await service.update(id, data);
      
      expect(mockPrisma.egresado.update).toHaveBeenCalledWith({
        where: { id },
        data: expect.objectContaining({
          fechaNacimiento: expect.any(Date),
        }),
      });
    });

    it('should set invalid birth dates to null', async () => {
      const id = 'some-id';
      const data = { fechaNacimiento: 'not-a-date' };
      
      await service.update(id, data);
      
      expect(mockPrisma.egresado.update).toHaveBeenCalledWith({
        where: { id },
        data: expect.objectContaining({
          fechaNacimiento: null,
        }),
      });
    });

    it('should accept valid CV URLs', async () => {
      const id = 'some-id';
      const data = { cvUrl: 'https://example.com/my-cv.pdf' };
      
      await service.update(id, data);
      
      expect(mockPrisma.egresado.update).toHaveBeenCalledWith({
        where: { id },
        data: expect.objectContaining({
          cvUrl: 'https://example.com/my-cv.pdf',
        }),
      });
    });

    it('should throw error for invalid CV URLs', async () => {
      const id = 'some-id';
      const data = { cvUrl: 'invalid-url' };
      
      await expect(service.update(id, data)).rejects.toThrow('El enlace del currículum no es una URL válida');
    });

    it('should filter out fields not in allowedFields', async () => {
      const id = 'some-id';
      const data = { nombres: 'John', hack: 'true' };
      
      await service.update(id, data);
      
      expect(mockPrisma.egresado.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          nombres: 'John',
        },
      });
    });
  });
});

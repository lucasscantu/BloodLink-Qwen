import { demandService } from '../../services/demand.service';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    bloodDemand: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bloodBag: {
      findMany: jest.fn(),
    },
  },
}));

describe('DemandService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar demanda com sucesso', async () => {
      (prisma.bloodDemand.create as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        institutionId: 'inst-1',
        bloodType: 'O_NEG',
        quantity: 5,
        urgency: 'CRITICA',
        status: 'ABERTA',
        description: 'Demanda urgente',
        institution: { id: 'inst-1', name: 'Hospital Central' },
        transfers: [],
      });

      const result = await demandService.create({
        institutionId: 'inst-1',
        bloodType: 'O_NEG' as any,
        quantity: 5,
        urgency: 'CRITICA' as any,
        description: 'Demanda urgente',
      });

      expect(result.id).toBe('dem-1');
      expect(result.status).toBe('ABERTA');
    });
  });

  describe('getById', () => {
    it('deve retornar demanda com transfers incluindo sourceInstitution e destinationInstitution', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        institutionId: 'inst-1',
        bloodType: 'O_NEG',
        quantity: 5,
        urgency: 'CRITICA',
        status: 'ABERTA',
        description: 'Demanda urgente',
        institution: { id: 'inst-1', name: 'Hospital Central' },
        transfers: [
          {
            id: 'tr-1',
            bloodBag: { id: 'bag-1', code: 'BL-00001' },
            sourceInstitution: { id: 'inst-2', name: 'Hemocentro SP' },
            destinationInstitution: { id: 'inst-1', name: 'Hospital Central' },
            status: 'OFERTADA',
          },
        ],
      });

      const result = await demandService.getById('dem-1');

      expect(result.transfers[0].sourceInstitution).toBeDefined();
      expect(result.transfers[0].destinationInstitution).toBeDefined();
    });

    it('deve lançar erro se demanda não existir', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(demandService.getById('invalid-id')).rejects.toThrow(
        'Demanda não encontrada'
      );
    });
  });

  describe('findMatchingBags', () => {
    it('deve encontrar bolsas disponíveis do tipo sanguíneo correto', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        bloodType: 'O_NEG',
        quantity: 5,
      });
      (prisma.bloodBag.findMany as jest.Mock).mockResolvedValue([
        { id: 'bag-1', code: 'BL-00001', bloodType: 'O_NEG', status: 'DISPONIVEL' },
        { id: 'bag-2', code: 'BL-00002', bloodType: 'O_NEG', status: 'DISPONIVEL' },
      ]);

      const result = await demandService.findMatchingBags('dem-1');

      expect(result).toHaveLength(2);
      expect(prisma.bloodBag.findMany).toHaveBeenCalledWith({
        where: {
          bloodType: 'O_NEG',
          status: 'DISPONIVEL',
        },
        include: { instituicaoAtual: true },
      });
    });
  });

  describe('cancel', () => {
    it('deve cancelar demanda ABERTA', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        status: 'ABERTA',
      });
      (prisma.bloodDemand.update as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        status: 'CANCELADA',
      });

      const result = await demandService.cancel('dem-1');
      expect(result.status).toBe('CANCELADA');
    });

    it('deve cancelar demanda EM_ANALISE', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        status: 'EM_ANALISE',
      });
      (prisma.bloodDemand.update as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        status: 'CANCELADA',
      });

      const result = await demandService.cancel('dem-1');
      expect(result.status).toBe('CANCELADA');
    });

    it('deve REJEITAR cancelamento de demanda ATENDIDA', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        status: 'ATENDIDA',
      });

      await expect(demandService.cancel('dem-1')).rejects.toThrow(
        'Demanda não pode ser cancelada no status ATENDIDA'
      );
    });

    it('deve REJEITAR cancelamento de demanda já CANCELADA', async () => {
      (prisma.bloodDemand.findUnique as jest.Mock).mockResolvedValue({
        id: 'dem-1',
        status: 'CANCELADA',
      });

      await expect(demandService.cancel('dem-1')).rejects.toThrow();
    });
  });
});

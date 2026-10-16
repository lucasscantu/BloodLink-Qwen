import { transferService } from '../../services/transfer.service';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    bloodBag: { findUnique: jest.fn(), update: jest.fn() },
    bloodTransfer: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
  },
}));

jest.mock('../../services/blockchain/EvmBlockchainService', () => ({
  getBlockchainService: jest.fn(() => ({
    registerEvent: jest.fn().mockResolvedValue({ txHash: '0xabc', blockNumber: 1, eventIndex: 0 }),
  })),
}));

describe('TransferService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create - guarda de status', () => {
    it('deve criar transferência se bolsa estiver DISPONIVEL', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'DISPONIVEL',
        instituicaoAtualId: 'inst-1',
      });
      (prisma.bloodTransfer.create as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'OFERTADA',
        bloodBag: { id: 'bag-1' },
        sourceInstitution: { id: 'inst-1', name: 'Hemocentro SP' },
        destinationInstitution: { id: 'inst-2', name: 'Hospital Central' },
      });
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({});

      const result = await transferService.create({
        bloodBagId: 'bag-1',
        sourceInstitutionId: 'inst-1',
        destinationInstitutionId: 'inst-2',
        performedById: 'user-1',
      });

      expect(result.status).toBe('OFERTADA');
    });

    it('deve REJEITAR se bolsa estiver UTILIZADA', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'UTILIZADA',
        instituicaoAtualId: 'inst-1',
      });

      await expect(
        transferService.create({
          bloodBagId: 'bag-1',
          sourceInstitutionId: 'inst-1',
          destinationInstitutionId: 'inst-2',
          performedById: 'user-1',
        })
      ).rejects.toThrow('Bolsa não está disponível para transferência');
    });

    it('deve REJEITAR se bolsa estiver DESCARTADA', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'DESCARTADA',
        instituicaoAtualId: 'inst-1',
      });

      await expect(
        transferService.create({
          bloodBagId: 'bag-1',
          sourceInstitutionId: 'inst-1',
          destinationInstitutionId: 'inst-2',
          performedById: 'user-1',
        })
      ).rejects.toThrow();
    });

    it('deve REJEITAR se bolsa estiver EM_TRANSPORTE', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'EM_TRANSPORTE',
        instituicaoAtualId: 'inst-1',
      });

      await expect(
        transferService.create({
          bloodBagId: 'bag-1',
          sourceInstitutionId: 'inst-1',
          destinationInstitutionId: 'inst-2',
          performedById: 'user-1',
        })
      ).rejects.toThrow();
    });
  });

  describe('accept - guarda de status', () => {
    it('deve aceitar se transferência estiver OFERTADA', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'OFERTADA',
        bloodBagId: 'bag-1',
        sourceInstitutionId: 'inst-1',
        destinationInstitutionId: 'inst-2',
      });
      (prisma.bloodTransfer.update as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'ACEITA',
        bloodBag: { id: 'bag-1' },
        sourceInstitution: { id: 'inst-1' },
        destinationInstitution: { id: 'inst-2' },
      });

      const result = await transferService.accept('tr-1', 'user-1');
      expect(result.status).toBe('ACEITA');
    });

    it('deve REJEITAR se transferência estiver ACEITA (duplo clique)', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'ACEITA',
        bloodBagId: 'bag-1',
      });

      await expect(transferService.accept('tr-1', 'user-1')).rejects.toThrow(
        'Transferência não pode ser aceita no status ACEITA'
      );
    });

    it('deve REJEITAR se transferência estiver RECEBIDA', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'RECEBIDA',
        bloodBagId: 'bag-1',
      });

      await expect(transferService.accept('tr-1', 'user-1')).rejects.toThrow();
    });
  });

  describe('confirmReceive - guarda de status', () => {
    it('deve receber se transferência estiver EM_TRANSPORTE', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'EM_TRANSPORTE',
        bloodBagId: 'bag-1',
        sourceInstitutionId: 'inst-1',
        destinationInstitutionId: 'inst-2',
      });
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'EM_TRANSPORTE',
        instituicaoAtualId: 'inst-1',
      });
      (prisma.bloodBagEvent as any) = { create: jest.fn().mockResolvedValue({}) };
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({});
      (prisma.bloodTransfer.update as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'RECEBIDA',
        bloodBag: { id: 'bag-1' },
        sourceInstitution: { id: 'inst-1' },
        destinationInstitution: { id: 'inst-2' },
      });

      const result = await transferService.confirmReceive('tr-1', 'user-1');
      expect(result.status).toBe('RECEBIDA');
    });

    it('deve REJEITAR recebimento se transferência estiver OFERTADA', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'OFERTADA',
        bloodBagId: 'bag-1',
      });

      await expect(transferService.confirmReceive('tr-1', 'user-1')).rejects.toThrow(
        'Recebimento não pode ser confirmado no status OFERTADA'
      );
    });
  });

  describe('cancel - guarda de status', () => {
    it('deve cancelar se transferência estiver OFERTADA', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'OFERTADA',
        bloodBagId: 'bag-1',
      });
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({});
      (prisma.bloodTransfer.update as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'CANCELADA',
        bloodBag: { id: 'bag-1' },
        sourceInstitution: { id: 'inst-1' },
        destinationInstitution: { id: 'inst-2' },
      });

      const result = await transferService.cancel('tr-1', 'user-1');
      expect(result.status).toBe('CANCELADA');
    });

    it('deve REJEITAR cancelamento se transferência estiver EM_TRANSPORTE', async () => {
      (prisma.bloodTransfer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tr-1',
        status: 'EM_TRANSPORTE',
        bloodBagId: 'bag-1',
      });

      await expect(transferService.cancel('tr-1', 'user-1')).rejects.toThrow(
        'Transferência não pode ser cancelada no status EM_TRANSPORTE'
      );
    });
  });
});

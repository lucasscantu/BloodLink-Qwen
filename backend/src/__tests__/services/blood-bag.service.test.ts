import { bloodBagService } from '../../services/blood-bag.service';
import { prisma } from '../../lib/prisma';
import { getBlockchainService } from '../../services/blockchain/EvmBlockchainService';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    bloodBag: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    bloodBagEvent: { create: jest.fn() },
    blockchainTransaction: { create: jest.fn() },
  },
}));

jest.mock('../../services/blockchain/EvmBlockchainService', () => ({
  getBlockchainService: jest.fn(() => ({
    registerEvent: jest.fn().mockResolvedValue({ txHash: '0xabc', blockNumber: 1, eventIndex: 0 }),
    verifyEvent: jest.fn().mockResolvedValue(true),
  })),
}));

describe('BloodBagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar bolsa com status COLETADA', async () => {
      (prisma.bloodBag.count as jest.Mock).mockResolvedValue(0);
      (prisma.bloodBag.create as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        bloodType: 'O_POS',
        status: 'COLETADA',
        instituicaoAtualId: 'inst-1',
        instituicaoAtual: { id: 'inst-1', name: 'Hemocentro SP' },
      });
      (prisma.bloodBagEvent.create as jest.Mock).mockResolvedValue({ id: 'evt-1' });
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({});
      (prisma.blockchainTransaction.create as jest.Mock).mockResolvedValue({});

      const result = await bloodBagService.create({
        bloodType: 'O_POS' as any,
        volume: 450,
        institutionId: 'inst-1',
        performedById: 'user-1',
        expiresAt: new Date('2024-12-31'),
      });

      expect(result.bag.status).toBe('COLETADA');
      expect(result.bag.code).toBe('BL-00001');
    });
  });

  describe('approve - guarda de status', () => {
    it('deve aprovar bolsa no status COLETADA', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'COLETADA',
        instituicaoAtualId: 'inst-1',
      });
      (prisma.bloodBagEvent.create as jest.Mock).mockResolvedValue({ id: 'evt-1' });
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        status: 'APROVADA',
        instituicaoAtual: { id: 'inst-1', name: 'Hemocentro SP' },
      });

      const result = await bloodBagService.approve('bag-1', 'user-1');
      expect(result.bag.status).toBe('APROVADA');
    });

    it('deve aprovar bolsa no status EM_TESTE', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'EM_TESTE',
        instituicaoAtualId: 'inst-1',
      });
      (prisma.bloodBagEvent.create as jest.Mock).mockResolvedValue({ id: 'evt-1' });
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        status: 'APROVADA',
        instituicaoAtual: { id: 'inst-1', name: 'Hemocentro SP' },
      });

      const result = await bloodBagService.approve('bag-1', 'user-1');
      expect(result.bag.status).toBe('APROVADA');
    });

    it('deve REJEITAR aprovação se bolsa não estiver COLETADA ou EM_TESTE', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'DISPONIVEL',
        instituicaoAtualId: 'inst-1',
      });

      await expect(bloodBagService.approve('bag-1', 'user-1')).rejects.toThrow(
        'Bolsa não pode ser aprovada no status DISPONIVEL'
      );
    });

    it('deve REJEITAR aprovação se bolsa estiver UTILIZADA (evita reativação)', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'UTILIZADA',
        instituicaoAtualId: 'inst-1',
      });

      await expect(bloodBagService.approve('bag-1', 'user-1')).rejects.toThrow();
    });
  });

  describe('markAsUsed - guarda de status', () => {
    it('deve marcar como utilizada se DISPONIVEL', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'DISPONIVEL',
        instituicaoAtualId: 'inst-1',
      });
      (prisma.bloodBagEvent.create as jest.Mock).mockResolvedValue({ id: 'evt-1' });
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        status: 'UTILIZADA',
        instituicaoAtual: { id: 'inst-2', name: 'Hospital Central' },
      });

      const result = await bloodBagService.markAsUsed('bag-1', 'user-1', 'inst-2');
      expect(result.bag.status).toBe('UTILIZADA');
    });

    it('deve REJEITAR se bolsa estiver DESCARTADA', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'DESCARTADA',
        instituicaoAtualId: 'inst-1',
      });

      await expect(bloodBagService.markAsUsed('bag-1', 'user-1', 'inst-2')).rejects.toThrow();
    });
  });

  describe('verifyIntegrity', () => {
    it('deve verificar integridade usando eventIndex real', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        code: 'BL-00001',
        events: [
          { eventIndex: 0, dataHash: '0xhash1' },
          { eventIndex: 1, dataHash: '0xhash2' },
        ],
      });

      const result = await bloodBagService.verifyIntegrity('BL-00001');
      expect(result.verified).toBe(true);
      expect(result.totalEvents).toBe(2);

      const blockchain = getBlockchainService();
      expect(blockchain.verifyEvent).toHaveBeenCalledWith('BL-00001', 0, '0xhash1');
      expect(blockchain.verifyEvent).toHaveBeenCalledWith('BL-00001', 1, '0xhash2');
    });
  });
});

import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';
import { generateToken } from '../../middleware/auth';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    bloodBag: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    bloodBagEvent: { create: jest.fn() },
    bloodDemand: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    bloodTransfer: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    institution: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    temperatureReading: { findMany: jest.fn(), create: jest.fn() },
    blockchainTransaction: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    auditLog: { findMany: jest.fn(), create: jest.fn() },
  },
}));

jest.mock('../../services/blockchain/EvmBlockchainService', () => ({
  getBlockchainService: jest.fn(() => ({
    registerEvent: jest.fn().mockResolvedValue({ txHash: '0xabc', blockNumber: 1, eventIndex: 0 }),
    getHistory: jest.fn().mockResolvedValue([]),
    verifyEvent: jest.fn().mockResolvedValue(true),
    getContractAddress: jest.fn().mockReturnValue('0x123'),
  })),
}));

describe('Integration: Blood Bags API', () => {
  const adminToken = generateToken('user-1', 'ADMIN');
  const hemocentroToken = generateToken('user-2', 'HEMOCENTRO');
  const hospitalToken = generateToken('user-3', 'HOSPITAL');
  const auditorToken = generateToken('user-5', 'AUDITOR');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/blood-bags', () => {
    it('deve retornar lista de bolsas para usuário autenticado', async () => {
      (prisma.bloodBag.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'bag-1',
          code: 'BL-00001',
          bloodType: 'O_POS',
          status: 'DISPONIVEL',
          instituicaoAtualId: 'inst-1',
          instituicaoAtual: { id: 'inst-1', name: 'Hemocentro SP' },
        },
      ]);

      const res = await request(app)
        .get('/api/blood-bags')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].code).toBe('BL-00001');
    });

    it('deve aplicar filtro de status', async () => {
      (prisma.bloodBag.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/blood-bags?status=DISPONIVEL')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(prisma.bloodBag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DISPONIVEL' }),
        })
      );
    });

    it('deve mapear institutionId para instituicaoAtualId', async () => {
      (prisma.bloodBag.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/blood-bags?institutionId=inst-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(prisma.bloodBag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ instituicaoAtualId: 'inst-1' }),
        })
      );
    });
  });

  describe('POST /api/blood-bags', () => {
    it('ADMIN deve poder criar bolsa', async () => {
      (prisma.bloodBag.count as jest.Mock).mockResolvedValue(0);
      (prisma.bloodBag.create as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        bloodType: 'O_POS',
        status: 'COLETADA',
        instituicaoAtualId: 'inst-1',
        instituicaoAtual: { id: 'inst-1', name: 'Hemocentro SP' },
      });
      (prisma.bloodBagEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({});
      (prisma.blockchainTransaction.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/blood-bags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bloodType: 'O_POS',
          volume: 450,
          institutionId: 'inst-1',
          expiresAt: '2024-12-31T00:00:00.000Z',
        });

      expect(res.status).toBe(201);
    });

    it('HEMOCENTRO deve poder criar bolsa', async () => {
      (prisma.bloodBag.count as jest.Mock).mockResolvedValue(0);
      (prisma.bloodBag.create as jest.Mock).mockResolvedValue({
        id: 'bag-1',
        code: 'BL-00001',
        status: 'COLETADA',
        instituicaoAtual: { id: 'inst-1', name: 'Hemocentro SP' },
      });
      (prisma.bloodBagEvent.create as jest.Mock).mockResolvedValue({});
      (prisma.bloodBag.update as jest.Mock).mockResolvedValue({});
      (prisma.blockchainTransaction.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/blood-bags')
        .set('Authorization', `Bearer ${hemocentroToken}`)
        .send({
          bloodType: 'A_POS',
          volume: 350,
          institutionId: 'inst-1',
          expiresAt: '2024-12-31T00:00:00.000Z',
        });

      expect(res.status).toBe(201);
    });

    it('HOSPITAL NÃO deve poder criar bolsa', async () => {
      const res = await request(app)
        .post('/api/blood-bags')
        .set('Authorization', `Bearer ${hospitalToken}`)
        .send({
          bloodType: 'A_POS',
          volume: 350,
          institutionId: 'inst-1',
          expiresAt: '2024-12-31T00:00:00.000Z',
        });

      expect(res.status).toBe(403);
    });

    it('AUDITOR NÃO deve poder criar bolsa', async () => {
      const res = await request(app)
        .post('/api/blood-bags')
        .set('Authorization', `Bearer ${auditorToken}`)
        .send({
          bloodType: 'A_POS',
          volume: 350,
          institutionId: 'inst-1',
          expiresAt: '2024-12-31T00:00:00.000Z',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/blood-bags/:code/verify', () => {
    it('ADMIN deve poder verificar integridade', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        code: 'BL-00001',
        events: [{ eventIndex: 0, dataHash: '0xhash' }],
      });

      const res = await request(app)
        .get('/api/blood-bags/BL-00001/verify')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
    });

    it('AUDITOR deve poder verificar integridade', async () => {
      (prisma.bloodBag.findUnique as jest.Mock).mockResolvedValue({
        code: 'BL-00001',
        events: [{ eventIndex: 0, dataHash: '0xhash' }],
      });

      const res = await request(app)
        .get('/api/blood-bags/BL-00001/verify')
        .set('Authorization', `Bearer ${auditorToken}`);

      expect(res.status).toBe(200);
    });

    it('HOSPITAL NÃO deve poder verificar integridade', async () => {
      const res = await request(app)
        .get('/api/blood-bags/BL-00001/verify')
        .set('Authorization', `Bearer ${hospitalToken}`);

      expect(res.status).toBe(403);
    });
  });
});

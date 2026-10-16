import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';

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

describe('Integration: Auth + RBAC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('deve retornar 401 para credenciais inválidas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciais inválidas');
    });

    it('deve retornar 400 para dados inválidos (Zod)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Dados inválidos');
    });
  });

  describe('GET /api/blood-bags - RBAC', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/api/blood-bags');
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/blood-bags')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/institutions - RBAC', () => {
    it('deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .post('/api/institutions')
        .send({ name: 'Test', type: 'HOSPITAL', city: 'SP', state: 'SP', latitude: 0, longitude: 0 });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('deve retornar 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});

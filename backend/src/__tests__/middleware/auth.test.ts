import { authenticate, authorize, generateToken } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticate', () => {
    it('deve retornar 401 se não houver header Authorization', () => {
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token de autenticação não fornecido' });
    });

    it('deve retornar 401 se header não começar com Bearer', () => {
      mockReq.headers = { authorization: 'Basic abc123' };
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('deve retornar 401 se token for inválido', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
    });

    it('deve chamar next() se token for válido', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-1', role: 'ADMIN' });
      authenticate(mockReq as any, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).userId).toBe('user-1');
      expect((mockReq as any).userRole).toBe('ADMIN');
    });
  });

  describe('authorize', () => {
    it('deve retornar 403 se usuário não tiver o papel necessário', () => {
      (mockReq as any).userRole = 'HOSPITAL';
      const middleware = authorize('ADMIN');
      middleware(mockReq as any, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Acesso negado. Papel insuficiente.' });
    });

    it('deve chamar next() se usuário tiver o papel necessário', () => {
      (mockReq as any).userRole = 'ADMIN';
      const middleware = authorize('ADMIN');
      middleware(mockReq as any, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve aceitar múltiplos papéis', () => {
      (mockReq as any).userRole = 'HEMOCENTRO';
      const middleware = authorize('ADMIN', 'HEMOCENTRO');
      middleware(mockReq as any, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve retornar 403 se userRole não estiver definido', () => {
      const middleware = authorize('ADMIN');
      middleware(mockReq as any, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('generateToken', () => {
    it('deve gerar token JWT', () => {
      (jwt.sign as jest.Mock).mockReturnValue('generated-token');
      const token = generateToken('user-1', 'ADMIN');
      expect(token).toBe('generated-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user-1', role: 'ADMIN' },
        'test-secret',
        { expiresIn: '24h' }
      );
    });
  });
});

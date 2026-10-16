import { authService } from '../../services/auth.service';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar token para credenciais válidas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        role: 'ADMIN',
        institutionId: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@test.com', 'senha123');

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
      expect(result.user.role).toBe('ADMIN');
    });

    it('deve lançar erro para email inexistente', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('invalid@test.com', 'senha123')).rejects.toThrow(
        'Credenciais inválidas'
      );
    });

    it('deve lançar erro para senha incorreta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        role: 'ADMIN',
        institutionId: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('test@test.com', 'wrong-password')).rejects.toThrow(
        'Credenciais inválidas'
      );
    });
  });

  describe('register', () => {
    it('deve criar usuário com senha hasheada', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'New User',
        email: 'new@test.com',
        role: 'HOSPITAL',
        institutionId: 'inst-1',
      });

      const result = await authService.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'senha123',
        role: 'HOSPITAL' as any,
        institutionId: 'inst-1',
      });

      expect(result.email).toBe('new@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    });

    it('deve lançar erro para email já cadastrado', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'existing@test.com',
      });

      await expect(
        authService.register({
          name: 'Test',
          email: 'existing@test.com',
          password: 'senha123',
          role: 'HOSPITAL' as any,
        })
      ).rejects.toThrow('Email já cadastrado');
    });
  });
});

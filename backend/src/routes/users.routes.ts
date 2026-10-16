import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR']),
  institutionId: z.string().optional(),
});

usersRouter.use(authenticate, authorize('ADMIN'));

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { institution: true },
    orderBy: { createdAt: 'desc' },
  });
  // Remove passwordHash da resposta
  const safe = users.map(({ passwordHash, ...u }) => u);
  res.json(safe);
});

usersRouter.post('/', validate(createUserSchema), async (req, res) => {
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.create({
    data: { ...req.body, passwordHash },
    include: { institution: true },
  });
  const { passwordHash: _, ...safe } = user;
  res.status(201).json(safe);
});

usersRouter.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { institution: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

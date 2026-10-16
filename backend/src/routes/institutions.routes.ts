import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';

export const institutionsRouter = Router();

const createSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['HEMOCENTRO', 'HOSPITAL']),
  city: z.string().min(2),
  state: z.string().length(2),
  latitude: z.number(),
  longitude: z.number(),
});

institutionsRouter.use(authenticate);

institutionsRouter.get('/', async (_req, res) => {
  const institutions = await prisma.institution.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(institutions);
});

institutionsRouter.post('/', authorize('ADMIN'), validate(createSchema), async (req, res) => {
  const institution = await prisma.institution.create({ data: req.body });
  res.status(201).json(institution);
});

institutionsRouter.get('/:id', async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { id: req.params.id },
  });
  if (!institution) return res.status(404).json({ error: 'Instituição não encontrada' });
  res.json(institution);
});

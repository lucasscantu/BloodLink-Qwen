import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';

export const temperatureRouter = Router();

const createSchema = z.object({
  bloodBagId: z.string(),
  temperature: z.number(),
  institutionId: z.string(),
});

temperatureRouter.use(authenticate);

temperatureRouter.get('/', async (req, res) => {
  const where: any = {};
  if (req.query.bloodBagId) where.bloodBagId = req.query.bloodBagId;
  if (req.query.alert) where.alert = req.query.alert === 'true';

  const readings = await prisma.temperatureReading.findMany({
    where,
    include: { bloodBag: true, institution: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(readings);
});

temperatureRouter.post('/', validate(createSchema), async (req: AuthRequest, res) => {
  const { bloodBagId, temperature, institutionId } = req.body;
  const alert = temperature > 6 || temperature < 2;

  const reading = await prisma.temperatureReading.create({
    data: { bloodBagId, temperature, institutionId, alert },
    include: { bloodBag: true, institution: true },
  });

  res.status(201).json(reading);
});

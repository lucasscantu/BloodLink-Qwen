import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { demandService } from '../services/demand.service';

export const demandsRouter = Router();

const createSchema = z.object({
  institutionId: z.string(),
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  quantity: z.number().int().min(1),
  urgency: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  description: z.string().min(5),
});

demandsRouter.use(authenticate);

demandsRouter.get('/', async (req, res) => {
  const demands = await demandService.list({
    status: req.query.status as string,
    institutionId: req.query.institutionId as string,
  });
  res.json(demands);
});

demandsRouter.get('/:id', async (req, res) => {
  const demand = await demandService.getById(req.params.id);
  res.json(demand);
});

demandsRouter.post('/', authorize('ADMIN', 'HOSPITAL'), validate(createSchema), async (req, res) => {
  const demand = await demandService.create(req.body);
  res.status(201).json(demand);
});

demandsRouter.get('/:id/matching', authorize('ADMIN', 'HEMOCENTRO'), async (req, res) => {
  const bags = await demandService.findMatchingBags(req.params.id);
  res.json(bags);
});

demandsRouter.post('/:id/cancel', authorize('ADMIN', 'HOSPITAL'), async (req, res) => {
  const demand = await demandService.cancel(req.params.id);
  res.json(demand);
});

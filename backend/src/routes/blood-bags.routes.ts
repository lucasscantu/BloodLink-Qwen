import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bloodBagService } from '../services/blood-bag.service';

export const bloodBagsRouter = Router();

const createSchema = z.object({
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  volume: z.number().int().min(200).max(600),
  institutionId: z.string(),
  expiresAt: z.string().datetime(),
});

bloodBagsRouter.use(authenticate);

bloodBagsRouter.get('/', async (req, res) => {
  const bags = await bloodBagService.list({
    status: req.query.status as any,
    bloodType: req.query.bloodType as any,
    instituicaoId: req.query.institutionId as string,
  });
  res.json(bags);
});

bloodBagsRouter.get('/:code', async (req, res) => {
  const bag = await bloodBagService.getByCode(req.params.code);
  res.json(bag);
});

bloodBagsRouter.post('/', authorize('ADMIN', 'HEMOCENTRO'), validate(createSchema), async (req: AuthRequest, res) => {
  const result = await bloodBagService.create({
    ...req.body,
    expiresAt: new Date(req.body.expiresAt),
    performedById: req.userId!,
  });
  res.status(201).json(result);
});

bloodBagsRouter.post('/:id/approve', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const result = await bloodBagService.approve(req.params.id, req.userId!);
  res.json(result);
});

bloodBagsRouter.post('/:id/reject', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const reason = req.body.reason || 'Reprovada em testes';
  const result = await bloodBagService.reject(req.params.id, req.userId!, reason);
  res.json(result);
});

bloodBagsRouter.post('/:id/store', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const result = await bloodBagService.store(req.params.id, req.userId!);
  res.json(result);
});

bloodBagsRouter.post('/:id/available', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const result = await bloodBagService.makeAvailable(req.params.id, req.userId!);
  res.json(result);
});

bloodBagsRouter.post('/:id/use', authorize('ADMIN', 'HOSPITAL'), async (req: AuthRequest, res) => {
  const destinationInstitutionId = req.body.destinationInstitutionId;
  const result = await bloodBagService.markAsUsed(req.params.id, req.userId!, destinationInstitutionId);
  res.json(result);
});

bloodBagsRouter.post('/:id/discard', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const reason = req.body.reason || 'Descartada conforme protocolo';
  const result = await bloodBagService.discard(req.params.id, req.userId!, reason);
  res.json(result);
});

bloodBagsRouter.get('/:code/verify', authorize('ADMIN', 'AUDITOR'), async (req, res) => {
  const result = await bloodBagService.verifyIntegrity(req.params.code);
  res.json(result);
});

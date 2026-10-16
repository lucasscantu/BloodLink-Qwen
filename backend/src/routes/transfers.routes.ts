import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { transferService } from '../services/transfer.service';

export const transfersRouter = Router();

const createSchema = z.object({
  bloodBagId: z.string(),
  demandId: z.string().optional(),
  sourceInstitutionId: z.string(),
  destinationInstitutionId: z.string(),
});

transfersRouter.use(authenticate);

transfersRouter.get('/', async (req, res) => {
  const transfers = await transferService.list({
    status: req.query.status as string,
    sourceInstitutionId: req.query.sourceInstitutionId as string,
    destinationInstitutionId: req.query.destinationInstitutionId as string,
  });
  res.json(transfers);
});

transfersRouter.get('/:id', async (req, res) => {
  const transfer = await transferService.getById(req.params.id);
  res.json(transfer);
});

transfersRouter.post('/', authorize('ADMIN', 'HEMOCENTRO'), validate(createSchema), async (req: AuthRequest, res) => {
  const transfer = await transferService.create({
    ...req.body,
    performedById: req.userId!,
  });
  res.status(201).json(transfer);
});

transfersRouter.post('/:id/accept', authorize('ADMIN', 'HOSPITAL'), async (req: AuthRequest, res) => {
  const transfer = await transferService.accept(req.params.id, req.userId!);
  res.json(transfer);
});

transfersRouter.post('/:id/reserve', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const transfer = await transferService.reserve(req.params.id, req.userId!);
  res.json(transfer);
});

transfersRouter.post('/:id/transport', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const transfer = await transferService.startTransport(req.params.id, req.userId!);
  res.json(transfer);
});

transfersRouter.post('/:id/receive', authorize('ADMIN', 'HOSPITAL'), async (req: AuthRequest, res) => {
  const transfer = await transferService.confirmReceive(req.params.id, req.userId!);
  res.json(transfer);
});

transfersRouter.post('/:id/refuse', authorize('ADMIN', 'HOSPITAL'), async (req: AuthRequest, res) => {
  const reason = req.body.reason || 'Recusada';
  const transfer = await transferService.refuse(req.params.id, req.userId!, reason);
  res.json(transfer);
});

transfersRouter.post('/:id/cancel', authorize('ADMIN', 'HEMOCENTRO'), async (req: AuthRequest, res) => {
  const transfer = await transferService.cancel(req.params.id, req.userId!);
  res.json(transfer);
});

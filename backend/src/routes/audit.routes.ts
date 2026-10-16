import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const auditRouter = Router();

auditRouter.use(authenticate, authorize('ADMIN', 'AUDITOR'));

auditRouter.get('/', async (req, res) => {
  const where: any = {};
  if (req.query.action) where.action = req.query.action;
  if (req.query.entityType) where.entityType = req.query.entityType;
  if (req.query.userId) where.userId = req.query.userId;

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(logs);
});

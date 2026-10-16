import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getBlockchainService } from '../services/blockchain/EvmBlockchainService';
import { prisma } from '../lib/prisma';

export const blockchainRouter = Router();

blockchainRouter.use(authenticate);

blockchainRouter.get('/status', async (_req, res) => {
  const blockchain = getBlockchainService();
  const txCount = await prisma.blockchainTransaction.count();
  res.json({
    contractAddress: blockchain.getContractAddress(),
    totalTransactions: txCount,
    network: 'Hardhat (EVM Local)',
  });
});

blockchainRouter.get('/transactions', authorize('ADMIN', 'AUDITOR'), async (req, res) => {
  const transactions = await prisma.blockchainTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(transactions);
});

blockchainRouter.get('/history/:bloodBagCode', authorize('ADMIN', 'AUDITOR'), async (req, res) => {
  try {
    const blockchain = getBlockchainService();
    const history = await blockchain.getHistory(req.params.bloodBagCode);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar blockchain' });
  }
});

import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { getBlockchainService } from './blockchain/EvmBlockchainService';
import { BloodBagStatus, BloodType } from '@prisma/client';

export class BloodBagService {
  async create(data: {
    bloodType: BloodType;
    volume: number;
    institutionId: string;
    performedById: string;
    expiresAt: Date;
  }) {
    // Gera código único
    const count = await prisma.bloodBag.count();
    const code = `BL-${String(count + 1).padStart(5, '0')}`;

    // ⚠️ Toda bolsa nasce com status COLETADA (nunca EM_TESTE diretamente)
    const bag = await prisma.bloodBag.create({
      data: {
        code,
        bloodType: data.bloodType,
        volume: data.volume,
        status: 'COLETADA',
        instituicaoAtualId: data.institutionId,
        expiresAt: data.expiresAt,
      },
      include: { instituicaoAtual: true },
    });

    // Registra evento de coleta na blockchain
    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ code, bloodType: data.bloodType, volume: data.volume, institutionId: data.institutionId }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      code,
      'COLETA',
      dataHash,
      data.performedById,
      data.institutionId
    );

    // Cria evento no banco com eventIndex real retornado pela blockchain
    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bag.id,
        type: 'COLETA',
        description: `Bolsa ${code} coletada - ${data.bloodType}`,
        performedById: data.performedById,
        institutionId: data.institutionId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    // Atualiza txHash da bolsa
    await prisma.bloodBag.update({
      where: { id: bag.id },
      data: { blockchainTxHash: txHash },
    });

    // Registra transação blockchain
    await prisma.blockchainTransaction.create({
      data: {
        txHash,
        blockNumber,
        method: 'registerEvent',
        bloodBagCode: code,
        eventIndex,
        dataHash,
      },
    });

    return { bag, event };
  }

  async list(filters: { status?: BloodBagStatus; bloodType?: BloodType; instituicaoId?: string }) {
    // ⚠️ Mapeia explicitamente instituicaoId → instituicaoAtualId
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.bloodType) where.bloodType = filters.bloodType;
    if (filters.instituicaoId) where.instituicaoAtualId = filters.instituicaoId;

    return prisma.bloodBag.findMany({
      where,
      include: { instituicaoAtual: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByCode(code: string) {
    const bag = await prisma.bloodBag.findUnique({
      where: { code },
      include: {
        instituicaoAtual: true,
        events: {
          orderBy: { eventIndex: 'asc' },
          include: { performedBy: true, institution: true },
        },
        temperatureReadings: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');
    return bag;
  }

  // ⚠️ Guarda de status: aprovar só se COLETADA ou EM_TESTE
  async approve(bagId: string, performedById: string) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');

    if (bag.status !== 'COLETADA' && bag.status !== 'EM_TESTE') {
      throw new AppError(400, `Bolsa não pode ser aprovada no status ${bag.status}`);
    }

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ bagId, action: 'APROVACAO', timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'APROVACAO', dataHash, performedById, bag.instituicaoAtualId
    );

    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bagId,
        type: 'APROVACAO',
        description: 'Testes realizados - Bolsa aprovada',
        performedById,
        institutionId: bag.instituicaoAtualId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    const updated = await prisma.bloodBag.update({
      where: { id: bagId },
      data: { status: 'APROVADA', blockchainTxHash: txHash },
      include: { instituicaoAtual: true },
    });

    return { bag: updated, event };
  }

  // ⚠️ Guarda de status: reprovar só se COLETADA ou EM_TESTE
  async reject(bagId: string, performedById: string, reason: string) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');

    if (bag.status !== 'COLETADA' && bag.status !== 'EM_TESTE') {
      throw new AppError(400, `Bolsa não pode ser reprovada no status ${bag.status}`);
    }

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ bagId, action: 'REPROVACAO', reason, timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'REPROVACAO', dataHash, performedById, bag.instituicaoAtualId
    );

    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bagId,
        type: 'REPROVACAO',
        description: `Bolsa reprovada: ${reason}`,
        performedById,
        institutionId: bag.instituicaoAtualId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    const updated = await prisma.bloodBag.update({
      where: { id: bagId },
      data: { status: 'REPROVADA', blockchainTxHash: txHash },
      include: { instituicaoAtual: true },
    });

    return { bag: updated, event };
  }

  // ⚠️ Guarda de status: armazenar só se APROVADA
  async store(bagId: string, performedById: string) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');
    if (bag.status !== 'APROVADA') {
      throw new AppError(400, `Bolsa não pode ser armazenada no status ${bag.status}`);
    }

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ bagId, action: 'ARMAZENAMENTO', timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'ARMAZENAMENTO', dataHash, performedById, bag.instituicaoAtualId
    );

    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bagId,
        type: 'ARMAZENAMENTO',
        description: 'Bolsa armazenada em temperatura controlada',
        performedById,
        institutionId: bag.instituicaoAtualId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    const updated = await prisma.bloodBag.update({
      where: { id: bagId },
      data: { status: 'ARMAZENADA', blockchainTxHash: txHash },
      include: { instituicaoAtual: true },
    });

    return { bag: updated, event };
  }

  // ⚠️ Guarda de status: disponibilizar só se ARMAZENADA
  async makeAvailable(bagId: string, performedById: string) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');
    if (bag.status !== 'ARMAZENADA') {
      throw new AppError(400, `Bolsa não pode ser disponibilizada no status ${bag.status}`);
    }

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ bagId, action: 'LIBERACAO', timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'LIBERACAO', dataHash, performedById, bag.instituicaoAtualId
    );

    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bagId,
        type: 'LIBERACAO',
        description: 'Bolsa liberada para uso/transferência',
        performedById,
        institutionId: bag.instituicaoAtualId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    const updated = await prisma.bloodBag.update({
      where: { id: bagId },
      data: { status: 'DISPONIVEL', blockchainTxHash: txHash },
      include: { instituicaoAtual: true },
    });

    return { bag: updated, event };
  }

  // ⚠️ Guarda de status: utilizar só se DISPONIVEL ou RECEBIDA
  async markAsUsed(bagId: string, performedById: string, destinationInstitutionId: string) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');
    if (bag.status !== 'DISPONIVEL' && bag.status !== 'RECEBIDA') {
      throw new AppError(400, `Bolsa não pode ser utilizada no status ${bag.status}`);
    }

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ bagId, action: 'UTILIZACAO', destinationInstitutionId, timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'UTILIZACAO', dataHash, performedById, destinationInstitutionId
    );

    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bagId,
        type: 'UTILIZACAO',
        description: 'Bolsa utilizada em procedimento',
        performedById,
        institutionId: destinationInstitutionId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    const updated = await prisma.bloodBag.update({
      where: { id: bagId },
      data: {
        status: 'UTILIZADA',
        instituicaoAtualId: destinationInstitutionId,
        blockchainTxHash: txHash,
      },
      include: { instituicaoAtual: true },
    });

    return { bag: updated, event };
  }

  // ⚠️ Guarda de status: descartar só se DISPONIVEL
  async discard(bagId: string, performedById: string, reason: string) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');
    if (bag.status !== 'DISPONIVEL') {
      throw new AppError(400, `Bolsa não pode ser descartada no status ${bag.status}`);
    }

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ bagId, action: 'DESCARTE', reason, timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'DESCARTE', dataHash, performedById, bag.instituicaoAtualId
    );

    const event = await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bagId,
        type: 'DESCARTE',
        description: `Bolsa descartada: ${reason}`,
        performedById,
        institutionId: bag.instituicaoAtualId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    const updated = await prisma.bloodBag.update({
      where: { id: bagId },
      data: { status: 'DESCARTADA', blockchainTxHash: txHash },
      include: { instituicaoAtual: true },
    });

    return { bag: updated, event };
  }

  // Verificação de integridade usando eventIndex real
  async verifyIntegrity(code: string) {
    const bag = await prisma.bloodBag.findUnique({
      where: { code },
      include: { events: { orderBy: { eventIndex: 'asc' } } },
    });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');

    const blockchain = getBlockchainService();
    const results: Array<{ eventIndex: number; matches: boolean }> = [];

    for (const event of bag.events) {
      const matches = await blockchain.verifyEvent(code, event.eventIndex, event.dataHash);
      results.push({ eventIndex: event.eventIndex, matches });
    }

    return {
      code,
      totalEvents: bag.events.length,
      verified: results.every(r => r.matches),
      results,
    };
  }
}

export const bloodBagService = new BloodBagService();

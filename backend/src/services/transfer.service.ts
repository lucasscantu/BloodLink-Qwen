import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { getBlockchainService } from './blockchain/EvmBlockchainService';

export class TransferService {
  async create(data: {
    bloodBagId: string;
    demandId?: string;
    sourceInstitutionId: string;
    destinationInstitutionId: string;
    performedById: string;
  }) {
    const bag = await prisma.bloodBag.findUnique({ where: { id: data.bloodBagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');
    if (bag.status !== 'DISPONIVEL') {
      throw new AppError(400, `Bolsa não está disponível para transferência (status: ${bag.status})`);
    }

    const transfer = await prisma.bloodTransfer.create({
      data: {
        bloodBagId: data.bloodBagId,
        demandId: data.demandId || null,
        sourceInstitutionId: data.sourceInstitutionId,
        destinationInstitutionId: data.destinationInstitutionId,
        status: 'OFERTADA',
      },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });

    // Reserva a bolsa
    await prisma.bloodBag.update({
      where: { id: data.bloodBagId },
      data: { status: 'RESERVADA' },
    });

    return transfer;
  }

  async list(filters: { status?: string; sourceInstitutionId?: string; destinationInstitutionId?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.sourceInstitutionId) where.sourceInstitutionId = filters.sourceInstitutionId;
    if (filters.destinationInstitutionId) where.destinationInstitutionId = filters.destinationInstitutionId;

    return prisma.bloodTransfer.findMany({
      where,
      include: {
        bloodBag: { include: { instituicaoAtual: true } },
        sourceInstitution: true,
        destinationInstitution: true,
        demand: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const transfer = await prisma.bloodTransfer.findUnique({
      where: { id },
      include: {
        bloodBag: { include: { instituicaoAtual: true } },
        sourceInstitution: true,
        destinationInstitution: true,
        demand: true,
      },
    });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    return transfer;
  }

  // ⚠️ Guarda: aceitar só se OFERTADA
  async accept(id: string, performedById: string) {
    const transfer = await prisma.bloodTransfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    if (transfer.status !== 'OFERTADA') {
      throw new AppError(400, `Transferência não pode ser aceita no status ${transfer.status}`);
    }

    return prisma.bloodTransfer.update({
      where: { id },
      data: { status: 'ACEITA' },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });
  }

  // ⚠️ Guarda: reservar só se ACEITA
  async reserve(id: string, performedById: string) {
    const transfer = await prisma.bloodTransfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    if (transfer.status !== 'ACEITA') {
      throw new AppError(400, `Transferência não pode ser reservada no status ${transfer.status}`);
    }

    return prisma.bloodTransfer.update({
      where: { id },
      data: { status: 'RESERVADA' },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });
  }

  // ⚠️ Guarda: iniciar transporte só se RESERVADA
  async startTransport(id: string, performedById: string) {
    const transfer = await prisma.bloodTransfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    if (transfer.status !== 'RESERVADA') {
      throw new AppError(400, `Transporte não pode ser iniciado no status ${transfer.status}`);
    }

    const bag = await prisma.bloodBag.findUnique({ where: { id: transfer.bloodBagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ transferId: id, action: 'ENVIO', timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'ENVIO', dataHash, performedById, transfer.sourceInstitutionId
    );

    await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bag.id,
        type: 'ENVIO',
        description: `Bolsa enviada para ${transfer.destinationInstitutionId}`,
        performedById,
        institutionId: transfer.sourceInstitutionId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    await prisma.bloodBag.update({
      where: { id: bag.id },
      data: { status: 'EM_TRANSPORTE', blockchainTxHash: txHash },
    });

    return prisma.bloodTransfer.update({
      where: { id },
      data: { status: 'EM_TRANSPORTE' },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });
  }

  // ⚠️ Guarda: receber só se EM_TRANSPORTE
  async confirmReceive(id: string, performedById: string) {
    const transfer = await prisma.bloodTransfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    if (transfer.status !== 'EM_TRANSPORTE') {
      throw new AppError(400, `Recebimento não pode ser confirmado no status ${transfer.status}`);
    }

    const bag = await prisma.bloodBag.findUnique({ where: { id: transfer.bloodBagId } });
    if (!bag) throw new AppError(404, 'Bolsa não encontrada');

    const blockchain = getBlockchainService();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ transferId: id, action: 'RECEBIMENTO', timestamp: Date.now() }))
      .digest('hex');

    const { txHash, blockNumber, eventIndex } = await blockchain.registerEvent(
      bag.code, 'RECEBIMENTO', dataHash, performedById, transfer.destinationInstitutionId
    );

    await prisma.bloodBagEvent.create({
      data: {
        bloodBagId: bag.id,
        type: 'RECEBIMENTO',
        description: `Bolsa recebida de ${transfer.sourceInstitutionId}`,
        performedById,
        institutionId: transfer.destinationInstitutionId,
        eventIndex,
        dataHash,
        blockchainTxHash: txHash,
      },
    });

    await prisma.bloodBag.update({
      where: { id: bag.id },
      data: {
        status: 'RECEBIDA',
        instituicaoAtualId: transfer.destinationInstitutionId,
        blockchainTxHash: txHash,
      },
    });

    return prisma.bloodTransfer.update({
      where: { id },
      data: { status: 'RECEBIDA' },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });
  }

  // ⚠️ Guarda: recusar só se OFERTADA
  async refuse(id: string, performedById: string, reason: string) {
    const transfer = await prisma.bloodTransfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    if (transfer.status !== 'OFERTADA') {
      throw new AppError(400, `Transferência não pode ser recusada no status ${transfer.status}`);
    }

    // Libera a bolsa de volta
    await prisma.bloodBag.update({
      where: { id: transfer.bloodBagId },
      data: { status: 'DISPONIVEL' },
    });

    return prisma.bloodTransfer.update({
      where: { id },
      data: { status: 'RECUSADA' },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });
  }

  // ⚠️ Guarda: cancelar só se OFERTADA ou ACEITA
  async cancel(id: string, performedById: string) {
    const transfer = await prisma.bloodTransfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError(404, 'Transferência não encontrada');
    if (transfer.status !== 'OFERTADA' && transfer.status !== 'ACEITA') {
      throw new AppError(400, `Transferência não pode ser cancelada no status ${transfer.status}`);
    }

    // Libera a bolsa de volta
    await prisma.bloodBag.update({
      where: { id: transfer.bloodBagId },
      data: { status: 'DISPONIVEL' },
    });

    return prisma.bloodTransfer.update({
      where: { id },
      data: { status: 'CANCELADA' },
      include: {
        bloodBag: true,
        sourceInstitution: true,
        destinationInstitution: true,
      },
    });
  }
}

export const transferService = new TransferService();

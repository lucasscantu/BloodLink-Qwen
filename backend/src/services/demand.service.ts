import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { BloodType, DemandUrgency } from '@prisma/client';

export class DemandService {
  async create(data: {
    institutionId: string;
    bloodType: BloodType;
    quantity: number;
    urgency: DemandUrgency;
    description: string;
  }) {
    return prisma.bloodDemand.create({
      data,
      include: {
        institution: true,
        transfers: {
          include: {
            bloodBag: true,
            sourceInstitution: true,
            destinationInstitution: true,
          },
        },
      },
    });
  }

  async list(filters: { status?: string; institutionId?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.institutionId) where.institutionId = filters.institutionId;

    return prisma.bloodDemand.findMany({
      where,
      include: {
        institution: true,
        transfers: {
          include: {
            bloodBag: true,
            sourceInstitution: true,
            destinationInstitution: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const demand = await prisma.bloodDemand.findUnique({
      where: { id },
      include: {
        institution: true,
        transfers: {
          include: {
            bloodBag: true,
            sourceInstitution: true,
            destinationInstitution: true,
          },
        },
      },
    });
    if (!demand) throw new AppError(404, 'Demanda não encontrada');
    return demand;
  }

  // Matching: encontra bolsas disponíveis que atendem a demanda
  async findMatchingBags(demandId: string) {
    const demand = await this.getById(demandId);
    return prisma.bloodBag.findMany({
      where: {
        bloodType: demand.bloodType,
        status: 'DISPONIVEL',
      },
      include: { instituicaoAtual: true },
    });
  }

  async cancel(id: string) {
    const demand = await prisma.bloodDemand.findUnique({ where: { id } });
    if (!demand) throw new AppError(404, 'Demanda não encontrada');
    if (demand.status === 'ATENDIDA' || demand.status === 'CANCELADA') {
      throw new AppError(400, `Demanda não pode ser cancelada no status ${demand.status}`);
    }
    return prisma.bloodDemand.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });
  }
}

export const demandService = new DemandService();

// ⚠️ Stub manual de @prisma/client com os enums do schema como objetos identidade.
// Os testes mockam ../lib/prisma normalmente, então não precisam do client real gerado.

export const UserRole = {
  ADMIN: 'ADMIN',
  HEMOCENTRO: 'HEMOCENTRO',
  HOSPITAL: 'HOSPITAL',
  AUDITOR: 'AUDITOR',
} as const;

export const BloodType = {
  A_POS: 'A_POS',
  A_NEG: 'A_NEG',
  B_POS: 'B_POS',
  B_NEG: 'B_NEG',
  AB_POS: 'AB_POS',
  AB_NEG: 'AB_NEG',
  O_POS: 'O_POS',
  O_NEG: 'O_NEG',
} as const;

export const BloodBagStatus = {
  COLETADA: 'COLETADA',
  EM_TESTE: 'EM_TESTE',
  APROVADA: 'APROVADA',
  REPROVADA: 'REPROVADA',
  ARMAZENADA: 'ARMAZENADA',
  DISPONIVEL: 'DISPONIVEL',
  RESERVADA: 'RESERVADA',
  EM_TRANSPORTE: 'EM_TRANSPORTE',
  RECEBIDA: 'RECEBIDA',
  UTILIZADA: 'UTILIZADA',
  DESCARTADA: 'DESCARTADA',
  EXPIRADA: 'EXPIRADA',
} as const;

export const InstitutionType = {
  HEMOCENTRO: 'HEMOCENTRO',
  HOSPITAL: 'HOSPITAL',
} as const;

export const DemandStatus = {
  ABERTA: 'ABERTA',
  EM_ANALISE: 'EM_ANALISE',
  ATENDIDA: 'ATENDIDA',
  PARCIALMENTE_ATENDIDA: 'PARCIALMENTE_ATENDIDA',
  CANCELADA: 'CANCELADA',
  EXPIRADA: 'EXPIRADA',
} as const;

export const DemandUrgency = {
  BAIXA: 'BAIXA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA',
} as const;

export const TransferStatus = {
  OFERTADA: 'OFERTADA',
  ACEITA: 'ACEITA',
  RESERVADA: 'RESERVADA',
  EM_TRANSPORTE: 'EM_TRANSPORTE',
  RECEBIDA: 'RECEBIDA',
  RECUSADA: 'RECUSADA',
  CANCELADA: 'CANCELADA',
} as const;

export class PrismaClient {
  bloodBag = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() };
  bloodBagEvent = { create: jest.fn(), findMany: jest.fn() };
  bloodDemand = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() };
  bloodTransfer = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() };
  user = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() };
  institution = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() };
  temperatureReading = { findMany: jest.fn(), create: jest.fn() };
  blockchainTransaction = { create: jest.fn(), findMany: jest.fn(), count: jest.fn() };
  auditLog = { findMany: jest.fn(), create: jest.fn() };
  $connect = jest.fn();
  $disconnect = jest.fn();
}

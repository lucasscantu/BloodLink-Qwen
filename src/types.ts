// Enums
export type UserRole = 'ADMIN' | 'HEMOCENTRO' | 'HOSPITAL' | 'AUDITOR';

export type BloodType = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';

export type BloodBagStatus = 'COLETADA' | 'EM_TESTE' | 'APROVADA' | 'REPROVADA' | 'ARMAZENADA' | 'DISPONIVEL' | 'RESERVADA' | 'EM_TRANSPORTE' | 'RECEBIDA' | 'UTILIZADA' | 'DESCARTADA' | 'EXPIRADA';

export type DemandStatus = 'ABERTA' | 'EM_ANALISE' | 'ATENDIDA' | 'PARCIALMENTE_ATENDIDA' | 'CANCELADA' | 'EXPIRADA';

export type DemandUrgency = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type TransferStatus = 'OFERTADA' | 'ACEITA' | 'RESERVADA' | 'EM_TRANSPORTE' | 'RECEBIDA' | 'RECUSADA' | 'CANCELADA';

export type InstitutionType = 'HEMOCENTRO' | 'HOSPITAL';

// Display labels
export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-'
};

export const STATUS_LABELS: Record<BloodBagStatus, string> = {
  COLETADA: 'Coletada', EM_TESTE: 'Em Teste', APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada', ARMAZENADA: 'Armazenada', DISPONIVEL: 'Disponível',
  RESERVADA: 'Reservada', EM_TRANSPORTE: 'Em Transporte', RECEBIDA: 'Recebida',
  UTILIZADA: 'Utilizada', DESCARTADA: 'Descartada', EXPIRADA: 'Expirada'
};

export const STATUS_COLORS: Record<BloodBagStatus, string> = {
  COLETADA: 'bg-blue-100 text-blue-800',
  EM_TESTE: 'bg-yellow-100 text-yellow-800',
  APROVADA: 'bg-green-100 text-green-800',
  REPROVADA: 'bg-red-100 text-red-800',
  ARMAZENADA: 'bg-indigo-100 text-indigo-800',
  DISPONIVEL: 'bg-emerald-100 text-emerald-800',
  RESERVADA: 'bg-purple-100 text-purple-800',
  EM_TRANSPORTE: 'bg-orange-100 text-orange-800',
  RECEBIDA: 'bg-teal-100 text-teal-800',
  UTILIZADA: 'bg-gray-100 text-gray-800',
  DESCARTADA: 'bg-gray-300 text-gray-800',
  EXPIRADA: 'bg-red-200 text-red-900'
};

export const DEMAND_STATUS_COLORS: Record<DemandStatus, string> = {
  ABERTA: 'bg-blue-100 text-blue-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
  ATENDIDA: 'bg-green-100 text-green-800',
  PARCIALMENTE_ATENDIDA: 'bg-orange-100 text-orange-800',
  CANCELADA: 'bg-gray-100 text-gray-800',
  EXPIRADA: 'bg-red-100 text-red-800'
};

export const URGENCY_COLORS: Record<DemandUrgency, string> = {
  BAIXA: 'bg-green-100 text-green-800',
  MEDIA: 'bg-yellow-100 text-yellow-800',
  ALTA: 'bg-orange-100 text-orange-800',
  CRITICA: 'bg-red-100 text-red-800'
};

export const TRANSFER_STATUS_COLORS: Record<TransferStatus, string> = {
  OFERTADA: 'bg-blue-100 text-blue-800',
  ACEITA: 'bg-green-100 text-green-800',
  RESERVADA: 'bg-purple-100 text-purple-800',
  EM_TRANSPORTE: 'bg-orange-100 text-orange-800',
  RECEBIDA: 'bg-teal-100 text-teal-800',
  RECUSADA: 'bg-red-100 text-red-800',
  CANCELADA: 'bg-gray-100 text-gray-800'
};

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId: string | null;
  institution?: Institution;
  createdAt: string;
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface BloodBag {
  id: string;
  code: string;
  bloodType: BloodType;
  volume: number;
  status: BloodBagStatus;
  instituicaoAtualId: string;
  instituicaoAtual?: Institution;
  collectedAt: string;
  expiresAt: string;
  events: BloodBagEvent[];
  temperatureReadings: TemperatureReading[];
  blockchainTxHash: string | null;
}

export interface BloodBagEvent {
  id: string;
  bloodBagId: string;
  type: string;
  description: string;
  performedById: string;
  performedBy?: User;
  institutionId: string;
  institution?: Institution;
  eventIndex: number;
  dataHash: string;
  blockchainTxHash: string;
  createdAt: string;
}

export interface BloodDemand {
  id: string;
  institutionId: string;
  institution?: Institution;
  bloodType: BloodType;
  quantity: number;
  urgency: DemandUrgency;
  status: DemandStatus;
  description: string;
  createdAt: string;
  transfers?: BloodTransfer[];
}

export interface BloodTransfer {
  id: string;
  bloodBagId: string;
  bloodBag?: BloodBag;
  demandId: string | null;
  sourceInstitutionId: string;
  sourceInstitution?: Institution;
  destinationInstitutionId: string;
  destinationInstitution?: Institution;
  status: TransferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureReading {
  id: string;
  bloodBagId: string;
  temperature: number;
  institutionId: string;
  createdAt: string;
  alert: boolean;
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  blockNumber: number;
  method: string;
  bloodBagCode: string;
  eventIndex: number;
  dataHash: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

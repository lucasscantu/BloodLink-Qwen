import { Institution, User, BloodBag, BloodDemand, BloodTransfer, TemperatureReading, AuditLog, BloodBagEvent, BloodType, BloodBagStatus, DemandUrgency } from './types';

// Institutions
export const institutions: Institution[] = [
  { id: 'inst-1', name: 'Hemocentro São Paulo', type: 'HEMOCENTRO', city: 'São Paulo', state: 'SP', latitude: -23.5505, longitude: -46.6333, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'inst-2', name: 'Hospital Municipal Central', type: 'HOSPITAL', city: 'São Paulo', state: 'SP', latitude: -23.5630, longitude: -46.6545, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'inst-3', name: 'Hospital Santa Maria', type: 'HOSPITAL', city: 'Campinas', state: 'SP', latitude: -22.9099, longitude: -47.0626, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'inst-4', name: 'Hemocentro Regional Campinas', type: 'HEMOCENTRO', city: 'Campinas', state: 'SP', latitude: -22.9068, longitude: -47.0617, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'inst-5', name: 'Hospital Universitário USP', type: 'HOSPITAL', city: 'Ribeirão Preto', state: 'SP', latitude: -21.1704, longitude: -47.8103, createdAt: '2024-02-15T00:00:00Z' },
];

// Users
export const users: User[] = [
  { id: 'user-1', name: 'Administrador Geral', email: 'admin@bloodlink.com', role: 'ADMIN', institutionId: null, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'user-2', name: 'Dr. Carlos Hemocentro', email: 'hemocentro@bloodlink.com', role: 'HEMOCENTRO', institutionId: 'inst-1', createdAt: '2024-01-01T00:00:00Z', institution: institutions[0] },
  { id: 'user-3', name: 'Dra. Ana Hospital Central', email: 'hospitalA@bloodlink.com', role: 'HOSPITAL', institutionId: 'inst-2', createdAt: '2024-01-01T00:00:00Z', institution: institutions[1] },
  { id: 'user-4', name: 'Dr. Pedro Santa Maria', email: 'hospitalB@bloodlink.com', role: 'HOSPITAL', institutionId: 'inst-3', createdAt: '2024-01-15T00:00:00Z', institution: institutions[2] },
  { id: 'user-5', name: 'Auditor Silva', email: 'auditor@bloodlink.com', role: 'AUDITOR', institutionId: null, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'user-6', name: 'Enf. Maria Campinas', email: 'hemocentro2@bloodlink.com', role: 'HEMOCENTRO', institutionId: 'inst-4', createdAt: '2024-02-01T00:00:00Z', institution: institutions[3] },
];

// Helper to generate events
function generateEvent(bloodBagId: string, type: string, description: string, userId: string, instId: string, index: number, date: string): BloodBagEvent {
  return {
    id: `evt-${bloodBagId}-${index}`,
    bloodBagId,
    type,
    description,
    performedById: userId,
    performedBy: users.find(u => u.id === userId),
    institutionId: instId,
    institution: institutions.find(i => i.id === instId),
    eventIndex: index,
    dataHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    blockchainTxHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    createdAt: date,
  };
}

// Blood Bags
const bloodTypes: BloodType[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const statuses: BloodBagStatus[] = ['COLETADA', 'EM_TESTE', 'APROVADA', 'ARMAZENADA', 'DISPONIVEL', 'UTILIZADA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA', 'DESCARTADA', 'REPROVADA'];

function generateBloodBags(): BloodBag[] {
  const bags: BloodBag[] = [];
  for (let i = 1; i <= 120; i++) {
    const bloodType = bloodTypes[i % bloodTypes.length];
    const status = statuses[i % statuses.length];
    const instId = i % 3 === 0 ? 'inst-1' : i % 3 === 1 ? 'inst-4' : 'inst-2';
    const inst = institutions.find(inst2 => inst2.id === instId)!;
    const collectedDate = new Date(2024, Math.floor(i / 10), (i % 28) + 1).toISOString();
    const expiresDate = new Date(2024, Math.floor(i / 10) + 1, (i % 28) + 1).toISOString();

    const events: BloodBagEvent[] = [
      generateEvent(`bag-${i}`, 'COLETA', `Bolsa coletada - ${bloodType}`, 'user-2', instId, 0, collectedDate),
    ];
    if (['APROVADA', 'ARMAZENADA', 'DISPONIVEL', 'UTILIZADA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'APROVACAO', 'Testes realizados - Aprovada', 'user-2', instId, 1, collectedDate));
    }
    if (['REPROVADA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'REPROVACAO', 'Testes realizados - Reprovada', 'user-2', instId, 1, collectedDate));
    }
    if (['ARMAZENADA', 'DISPONIVEL', 'UTILIZADA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'ARMAZENAMENTO', 'Bolsa armazenada em temperatura controlada', 'user-2', instId, 2, collectedDate));
    }
    if (['DISPONIVEL', 'UTILIZADA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'LIBERACAO', 'Bolsa liberada para uso/transferência', 'user-2', instId, 3, collectedDate));
    }
    if (['UTILIZADA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'UTILIZACAO', 'Bolsa utilizada em procedimento', 'user-3', 'inst-2', 4, collectedDate));
    }
    if (['EM_TRANSPORTE'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'ENVIO', 'Bolsa enviada para transferência', 'user-2', instId, 4, collectedDate));
    }
    if (['RECEBIDA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'ENVIO', 'Bolsa enviada para transferência', 'user-2', instId, 4, collectedDate));
      events.push(generateEvent(`bag-${i}`, 'RECEBIMENTO', 'Bolsa recebida na instituição destino', 'user-3', 'inst-2', 5, collectedDate));
    }
    if (['DESCARTADA'].includes(status)) {
      events.push(generateEvent(`bag-${i}`, 'DESCARTE', 'Bolsa descartada conforme protocolo', 'user-2', instId, 4, collectedDate));
    }

    bags.push({
      id: `bag-${i}`,
      code: `BL-${String(i).padStart(5, '0')}`,
      bloodType,
      volume: 350 + (i % 5) * 10,
      status,
      instituicaoAtualId: instId,
      instituicaoAtual: inst,
      collectedAt: collectedDate,
      expiresAt: expiresDate,
      events,
      temperatureReadings: [],
      blockchainTxHash: events[events.length - 1]?.blockchainTxHash || null,
    });
  }
  return bags;
}

export const bloodBags: BloodBag[] = generateBloodBags();

// Temperature readings (for the alert demo bag)
const demoBag = bloodBags.find(b => b.status === 'DISPONIVEL');
export const temperatureReadings: TemperatureReading[] = demoBag ? [
  { id: 'temp-1', bloodBagId: demoBag.id, temperature: 4.2, institutionId: 'inst-1', createdAt: '2024-06-01T08:00:00Z', alert: false },
  { id: 'temp-2', bloodBagId: demoBag.id, temperature: 4.5, institutionId: 'inst-1', createdAt: '2024-06-01T12:00:00Z', alert: false },
  { id: 'temp-3', bloodBagId: demoBag.id, temperature: 7.8, institutionId: 'inst-1', createdAt: '2024-06-01T16:00:00Z', alert: true },
  { id: 'temp-4', bloodBagId: demoBag.id, temperature: 5.1, institutionId: 'inst-1', createdAt: '2024-06-01T20:00:00Z', alert: false },
  { id: 'temp-5', bloodBagId: demoBag.id, temperature: 4.3, institutionId: 'inst-1', createdAt: '2024-06-02T08:00:00Z', alert: false },
] : [];

// Demands
export const demands: BloodDemand[] = [
  { id: 'dem-1', institutionId: 'inst-2', institution: institutions[1], bloodType: 'O_NEG', quantity: 5, urgency: 'CRITICA', status: 'ABERTA', description: 'Necessidade urgente de O- para cirurgias de emergência', createdAt: '2024-06-01T10:00:00Z', transfers: [] },
  { id: 'dem-2', institutionId: 'inst-3', institution: institutions[2], bloodType: 'A_POS', quantity: 3, urgency: 'ALTA', status: 'EM_ANALISE', description: 'Reposição de estoque para UTI', createdAt: '2024-06-02T14:00:00Z', transfers: [] },
  { id: 'dem-3', institutionId: 'inst-5', institution: institutions[4], bloodType: 'B_POS', quantity: 2, urgency: 'MEDIA', status: 'ATENDIDA', description: 'Demanda programada para hemodiálise', createdAt: '2024-05-28T09:00:00Z', transfers: [{ id: 'tr-1', bloodBagId: 'bag-5', bloodBag: bloodBags[4], demandId: 'dem-3', sourceInstitutionId: 'inst-1', sourceInstitution: institutions[0], destinationInstitutionId: 'inst-5', destinationInstitution: institutions[4], status: 'RECEBIDA', createdAt: '2024-05-29T10:00:00Z', updatedAt: '2024-05-30T14:00:00Z' }] },
  { id: 'dem-4', institutionId: 'inst-2', institution: institutions[1], bloodType: 'AB_POS', quantity: 4, urgency: 'BAIXA', status: 'ABERTA', description: 'Reposição preventiva de estoque', createdAt: '2024-06-03T08:00:00Z', transfers: [] },
];

// Transfers
export const transfers: BloodTransfer[] = [
  { id: 'tr-1', bloodBagId: 'bag-5', bloodBag: bloodBags[4], demandId: 'dem-3', sourceInstitutionId: 'inst-1', sourceInstitution: institutions[0], destinationInstitutionId: 'inst-5', destinationInstitution: institutions[4], status: 'RECEBIDA', createdAt: '2024-05-29T10:00:00Z', updatedAt: '2024-05-30T14:00:00Z' },
  { id: 'tr-2', bloodBagId: 'bag-10', bloodBag: bloodBags[9], demandId: null, sourceInstitutionId: 'inst-1', sourceInstitution: institutions[0], destinationInstitutionId: 'inst-2', destinationInstitution: institutions[1], status: 'OFERTADA', createdAt: '2024-06-03T09:00:00Z', updatedAt: '2024-06-03T09:00:00Z' },
  { id: 'tr-3', bloodBagId: 'bag-15', bloodBag: bloodBags[14], demandId: 'dem-1', sourceInstitutionId: 'inst-4', sourceInstitution: institutions[3], destinationInstitutionId: 'inst-2', destinationInstitution: institutions[1], status: 'EM_TRANSPORTE', createdAt: '2024-06-02T15:00:00Z', updatedAt: '2024-06-03T08:00:00Z' },
];

// Audit logs
export const auditLogs: AuditLog[] = [
  { id: 'audit-1', userId: 'user-1', user: users[0], action: 'CREATE_INSTITUTION', entityType: 'Institution', entityId: 'inst-1', details: 'Instituição criada: Hemocentro São Paulo', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'audit-2', userId: 'user-2', user: users[1], action: 'CREATE_BLOOD_BAG', entityType: 'BloodBag', entityId: 'bag-1', details: 'Bolsa BL-00001 cadastrada - O+', createdAt: '2024-01-02T08:00:00Z' },
  { id: 'audit-3', userId: 'user-2', user: users[1], action: 'APPROVE_BLOOD_BAG', entityType: 'BloodBag', entityId: 'bag-1', details: 'Bolsa BL-00001 aprovada após testes', createdAt: '2024-01-02T10:00:00Z' },
  { id: 'audit-4', userId: 'user-3', user: users[2], action: 'CREATE_DEMAND', entityType: 'BloodDemand', entityId: 'dem-1', details: 'Demanda criada: 5 bolsas O- (CRÍTICA)', createdAt: '2024-06-01T10:00:00Z' },
  { id: 'audit-5', userId: 'user-2', user: users[1], action: 'CREATE_TRANSFER', entityType: 'BloodTransfer', entityId: 'tr-2', details: 'Transferência ofertada: BL-00010 → Hospital Municipal Central', createdAt: '2024-06-03T09:00:00Z' },
  { id: 'audit-6', userId: 'user-6', user: users[5], action: 'ACCEPT_TRANSFER', entityType: 'BloodTransfer', entityId: 'tr-3', details: 'Transferência aceita: BL-00015 → Hospital Municipal Central', createdAt: '2024-06-02T16:00:00Z' },
  { id: 'audit-7', userId: 'user-2', user: users[1], action: 'TEMPERATURE_ALERT', entityType: 'BloodBag', entityId: demoBag?.id || 'bag-1', details: 'Alerta de temperatura: 7.8°C (limite: 6°C)', createdAt: '2024-06-01T16:00:00Z' },
  { id: 'audit-8', userId: 'user-5', user: users[4], action: 'VERIFY_INTEGRITY', entityType: 'BloodBag', entityId: 'bag-1', details: 'Integridade blockchain verificada: OK', createdAt: '2024-06-03T11:00:00Z' },
];

// Stats helpers
export function getStats() {
  const total = bloodBags.length;
  const available = bloodBags.filter(b => b.status === 'DISPONIVEL').length;
  const inTransit = bloodBags.filter(b => b.status === 'EM_TRANSPORTE').length;
  const used = bloodBags.filter(b => b.status === 'UTILIZADA').length;
  const collected = bloodBags.filter(b => b.status === 'COLETADA').length;
  const testing = bloodBags.filter(b => b.status === 'EM_TESTE').length;
  const approved = bloodBags.filter(b => b.status === 'APROVADA').length;
  const stored = bloodBags.filter(b => b.status === 'ARMAZENADA').length;
  const rejected = bloodBags.filter(b => b.status === 'REPROVADA').length;

  const byBloodType = bloodTypes.map(bt => ({
    type: bt,
    count: bloodBags.filter(b => b.bloodType === bt).length,
    available: bloodBags.filter(b => b.bloodType === bt && b.status === 'DISPONIVEL').length,
  }));

  const byStatus = statuses.map(s => ({
    status: s,
    count: bloodBags.filter(b => b.status === s).length,
  }));

  const openDemands = demands.filter(d => d.status === 'ABERTA' || d.status === 'EM_ANALISE').length;
  const activeTransfers = transfers.filter(t => !['RECEBIDA', 'RECUSADA', 'CANCELADA'].includes(t.status)).length;

  return { total, available, inTransit, used, collected, testing, approved, stored, rejected, byBloodType, byStatus, openDemands, activeTransfers };
}

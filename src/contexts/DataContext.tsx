import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  institutions as initialInstitutions,
  users as initialUsers,
  bloodBags as initialBloodBags,
  demands as initialDemands,
  transfers as initialTransfers,
  temperatureReadings as initialTemps,
  auditLogs as initialAuditLogs,
} from '../data';
import {
  Institution, User, BloodBag, BloodDemand, BloodTransfer,
  TemperatureReading, AuditLog, BloodBagEvent, BloodType,
  DemandUrgency, InstitutionType, UserRole
} from '../types';

interface DataStore {
  // Data
  institutions: Institution[];
  users: User[];
  bloodBags: BloodBag[];
  demands: BloodDemand[];
  transfers: BloodTransfer[];
  temperatureReadings: TemperatureReading[];
  auditLogs: AuditLog[];

  // Institution actions
  addInstitution: (data: Omit<Institution, 'id' | 'createdAt'>) => void;

  // User actions
  addUser: (data: { name: string; email: string; role: UserRole; institutionId?: string }) => void;

  // Blood bag actions
  addBloodBag: (data: { bloodType: BloodType; volume: number; institutionId: string; performedBy: User }) => void;
  approveBloodBag: (bagId: string, performedBy: User) => void;
  rejectBloodBag: (bagId: string, reason: string, performedBy: User) => void;
  storeBloodBag: (bagId: string, performedBy: User) => void;
  makeAvailableBloodBag: (bagId: string, performedBy: User) => void;
  useBloodBag: (bagId: string, performedBy: User) => void;
  discardBloodBag: (bagId: string, reason: string, performedBy: User) => void;

  // Demand actions
  addDemand: (data: { institutionId: string; bloodType: BloodType; quantity: number; urgency: DemandUrgency; description: string }) => void;
  cancelDemand: (demandId: string) => void;

  // Transfer actions
  createTransfer: (data: { bloodBagId: string; sourceInstitutionId: string; destinationInstitutionId: string; demandId?: string }) => void;
  acceptTransfer: (transferId: string) => void;
  reserveTransfer: (transferId: string) => void;
  startTransportTransfer: (transferId: string, performedBy: User) => void;
  receiveTransfer: (transferId: string, performedBy: User) => void;
  refuseTransfer: (transferId: string) => void;
  cancelTransfer: (transferId: string) => void;

  // Temperature
  addTemperatureReading: (bloodBagId: string, temperature: number, institutionId: string) => void;

  // Helpers
  getBloodBagByCode: (code: string) => BloodBag | undefined;
  getInstitutionById: (id: string) => Institution | undefined;
  getUserById: (id: string) => User | undefined;
}

const DataContext = createContext<DataStore | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bloodBags, setBloodBags] = useState<BloodBag[]>(initialBloodBags);
  const [demands, setDemands] = useState<BloodDemand[]>(initialDemands);
  const [transfers, setTransfers] = useState<BloodTransfer[]>(initialTransfers);
  const [temperatureReadings, setTemperatureReadings] = useState<TemperatureReading[]>(initialTemps);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const addAuditLog = useCallback((userId: string, action: string, entityType: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random()}`,
      userId,
      user: users.find(u => u.id === userId),
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [...prev, log]);
  }, [users]);

  const generateEvent = useCallback((
    bloodBagId: string,
    type: string,
    description: string,
    performedBy: User,
    institutionId: string,
    eventIndex: number
  ): BloodBagEvent => ({
    id: `evt-${Date.now()}-${Math.random()}`,
    bloodBagId,
    type,
    description,
    performedById: performedBy.id,
    performedBy,
    institutionId,
    institution: institutions.find(i => i.id === institutionId),
    eventIndex,
    dataHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    blockchainTxHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    createdAt: new Date().toISOString(),
  }), [institutions]);

  // Institution actions
  const addInstitution = useCallback((data: Omit<Institution, 'id' | 'createdAt'>) => {
    const newInst: Institution = {
      ...data,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInstitutions(prev => [...prev, newInst]);
  }, []);

  // User actions
  const addUser = useCallback((data: { name: string; email: string; role: UserRole; institutionId?: string }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      institutionId: data.institutionId || null,
      institution: data.institutionId ? institutions.find(i => i.id === data.institutionId) : undefined,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  }, [institutions]);

  // Blood bag actions
  const addBloodBag = useCallback((data: { bloodType: BloodType; volume: number; institutionId: string; performedBy: User }) => {
    const count = bloodBags.length;
    const code = `BL-${String(count + 1).padStart(5, '0')}`;
    const newBag: BloodBag = {
      id: `bag-${Date.now()}`,
      code,
      bloodType: data.bloodType,
      volume: data.volume,
      status: 'COLETADA',
      instituicaoAtualId: data.institutionId,
      instituicaoAtual: institutions.find(i => i.id === data.institutionId),
      collectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
      events: [],
      temperatureReadings: [],
      blockchainTxHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    };

    const event = generateEvent(newBag.id, 'COLETA', `Bolsa ${code} coletada - ${data.bloodType}`, data.performedBy, data.institutionId, 0);
    newBag.events = [event];

    setBloodBags(prev => [newBag, ...prev]);
    addAuditLog(data.performedBy.id, 'CREATE_BLOOD_BAG', 'BloodBag', newBag.id, `Bolsa ${code} cadastrada - ${data.bloodType}`);
  }, [bloodBags.length, institutions, generateEvent, addAuditLog]);

  const updateBagWithEvent = useCallback((bagId: string, newStatus: BloodBag['status'], eventType: string, description: string, performedBy: User, extraUpdate?: Partial<BloodBag>) => {
    setBloodBags(prev => prev.map(bag => {
      if (bag.id !== bagId) return bag;
      const event = generateEvent(bagId, eventType, description, performedBy, bag.instituicaoAtualId, bag.events.length);
      return {
        ...bag,
        status: newStatus,
        events: [...bag.events, event],
        blockchainTxHash: event.blockchainTxHash,
        ...extraUpdate,
      };
    }));
  }, [generateEvent]);

  const approveBloodBag = useCallback((bagId: string, performedBy: User) => {
    updateBagWithEvent(bagId, 'APROVADA', 'APROVACAO', 'Testes realizados - Bolsa aprovada', performedBy);
    const bag = bloodBags.find(b => b.id === bagId);
    if (bag) addAuditLog(performedBy.id, 'APPROVE_BLOOD_BAG', 'BloodBag', bagId, `Bolsa ${bag.code} aprovada`);
  }, [updateBagWithEvent, bloodBags, addAuditLog]);

  const rejectBloodBag = useCallback((bagId: string, reason: string, performedBy: User) => {
    updateBagWithEvent(bagId, 'REPROVADA', 'REPROVACAO', `Bolsa reprovada: ${reason}`, performedBy);
    const bag = bloodBags.find(b => b.id === bagId);
    if (bag) addAuditLog(performedBy.id, 'REJECT_BLOOD_BAG', 'BloodBag', bagId, `Bolsa ${bag.code} reprovada: ${reason}`);
  }, [updateBagWithEvent, bloodBags, addAuditLog]);

  const storeBloodBag = useCallback((bagId: string, performedBy: User) => {
    updateBagWithEvent(bagId, 'ARMAZENADA', 'ARMAZENAMENTO', 'Bolsa armazenada em temperatura controlada', performedBy);
  }, [updateBagWithEvent]);

  const makeAvailableBloodBag = useCallback((bagId: string, performedBy: User) => {
    updateBagWithEvent(bagId, 'DISPONIVEL', 'LIBERACAO', 'Bolsa liberada para uso/transferência', performedBy);
  }, [updateBagWithEvent]);

  const useBloodBag = useCallback((bagId: string, performedBy: User) => {
    updateBagWithEvent(bagId, 'UTILIZADA', 'UTILIZACAO', 'Bolsa utilizada em procedimento', performedBy);
    const bag = bloodBags.find(b => b.id === bagId);
    if (bag) addAuditLog(performedBy.id, 'USE_BLOOD_BAG', 'BloodBag', bagId, `Bolsa ${bag.code} utilizada`);
  }, [updateBagWithEvent, bloodBags, addAuditLog]);

  const discardBloodBag = useCallback((bagId: string, reason: string, performedBy: User) => {
    updateBagWithEvent(bagId, 'DESCARTADA', 'DESCARTE', `Bolsa descartada: ${reason}`, performedBy);
  }, [updateBagWithEvent]);

  // Demand actions
  const addDemand = useCallback((data: { institutionId: string; bloodType: BloodType; quantity: number; urgency: DemandUrgency; description: string }) => {
    const newDemand: BloodDemand = {
      id: `dem-${Date.now()}`,
      institutionId: data.institutionId,
      institution: institutions.find(i => i.id === data.institutionId),
      bloodType: data.bloodType,
      quantity: data.quantity,
      urgency: data.urgency,
      status: 'ABERTA',
      description: data.description,
      createdAt: new Date().toISOString(),
      transfers: [],
    };
    setDemands(prev => [newDemand, ...prev]);
  }, [institutions]);

  const cancelDemand = useCallback((demandId: string) => {
    setDemands(prev => prev.map(d => d.id === demandId ? { ...d, status: 'CANCELADA' as const } : d));
  }, []);

  // Transfer actions
  const createTransfer = useCallback((data: { bloodBagId: string; sourceInstitutionId: string; destinationInstitutionId: string; demandId?: string }) => {
    const newTransfer: BloodTransfer = {
      id: `tr-${Date.now()}`,
      bloodBagId: data.bloodBagId,
      bloodBag: bloodBags.find(b => b.id === data.bloodBagId),
      demandId: data.demandId || null,
      sourceInstitutionId: data.sourceInstitutionId,
      sourceInstitution: institutions.find(i => i.id === data.sourceInstitutionId),
      destinationInstitutionId: data.destinationInstitutionId,
      destinationInstitution: institutions.find(i => i.id === data.destinationInstitutionId),
      status: 'OFERTADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransfers(prev => [newTransfer, ...prev]);

    // Reserva a bolsa
    setBloodBags(prev => prev.map(b => b.id === data.bloodBagId ? { ...b, status: 'RESERVADA' as const } : b));

    // Adiciona à demanda se houver
    if (data.demandId) {
      setDemands(prev => prev.map(d => {
        if (d.id !== data.demandId) return d;
        return { ...d, transfers: [...(d.transfers || []), newTransfer], status: 'EM_ANALISE' as const };
      }));
    }
  }, [bloodBags, institutions]);

  const updateTransferStatus = useCallback((transferId: string, newStatus: BloodTransfer['status'], bagUpdate?: Partial<BloodBag>) => {
    setTransfers(prev => prev.map(t =>
      t.id === transferId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    ));
    if (bagUpdate) {
      setBloodBags(prev => prev.map(b =>
        b.id === (transfers.find(t => t.id === transferId)?.bloodBagId) ? { ...b, ...bagUpdate } : b
      ));
    }
  }, [transfers]);

  const acceptTransfer = useCallback((transferId: string) => {
    updateTransferStatus(transferId, 'ACEITA');
  }, [updateTransferStatus]);

  const reserveTransfer = useCallback((transferId: string) => {
    updateTransferStatus(transferId, 'RESERVADA');
  }, [updateTransferStatus]);

  const startTransportTransfer = useCallback((transferId: string, performedBy: User) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;
    updateTransferStatus(transferId, 'EM_TRANSPORTE', { status: 'EM_TRANSPORTE' });

    // Adiciona evento de envio na bolsa
    setBloodBags(prev => prev.map(bag => {
      if (bag.id !== transfer.bloodBagId) return bag;
      const event = generateEvent(bag.id, 'ENVIO', `Bolsa enviada para ${transfer.destinationInstitution?.name}`, performedBy, transfer.sourceInstitutionId, bag.events.length);
      return { ...bag, status: 'EM_TRANSPORTE' as const, events: [...bag.events, event] };
    }));
  }, [transfers, updateTransferStatus, generateEvent]);

  const receiveTransfer = useCallback((transferId: string, performedBy: User) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;
    updateTransferStatus(transferId, 'RECEBIDA', {
      status: 'RECEBIDA',
      instituicaoAtualId: transfer.destinationInstitutionId,
      instituicaoAtual: transfer.destinationInstitution,
    });

    setBloodBags(prev => prev.map(bag => {
      if (bag.id !== transfer.bloodBagId) return bag;
      const event = generateEvent(bag.id, 'RECEBIMENTO', `Bolsa recebida de ${transfer.sourceInstitution?.name}`, performedBy, transfer.destinationInstitutionId, bag.events.length);
      return { ...bag, status: 'RECEBIDA' as const, events: [...bag.events, event] };
    }));

    // Atualiza demanda se houver
    if (transfer.demandId) {
      setDemands(prev => prev.map(d => {
        if (d.id !== transfer.demandId) return d;
        return { ...d, status: 'ATENDIDA' as const };
      }));
    }
  }, [transfers, updateTransferStatus, generateEvent]);

  const refuseTransfer = useCallback((transferId: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;
    updateTransferStatus(transferId, 'RECUSADA', { status: 'DISPONIVEL' });
  }, [transfers, updateTransferStatus]);

  const cancelTransfer = useCallback((transferId: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;
    updateTransferStatus(transferId, 'CANCELADA', { status: 'DISPONIVEL' });
  }, [transfers, updateTransferStatus]);

  // Temperature
  const addTemperatureReading = useCallback((bloodBagId: string, temperature: number, institutionId: string) => {
    const alert = temperature > 6 || temperature < 2;
    const reading: TemperatureReading = {
      id: `temp-${Date.now()}`,
      bloodBagId,
      temperature,
      institutionId,
      alert,
      createdAt: new Date().toISOString(),
    };
    setTemperatureReadings(prev => [reading, ...prev]);
  }, []);

  // Helpers
  const getBloodBagByCode = useCallback((code: string) => {
    return bloodBags.find(b => b.code === code);
  }, [bloodBags]);

  const getInstitutionById = useCallback((id: string) => {
    return institutions.find(i => i.id === id);
  }, [institutions]);

  const getUserById = useCallback((id: string) => {
    return users.find(u => u.id === id);
  }, [users]);

  return (
    <DataContext.Provider value={{
      institutions, users, bloodBags, demands, transfers, temperatureReadings, auditLogs,
      addInstitution, addUser,
      addBloodBag, approveBloodBag, rejectBloodBag, storeBloodBag, makeAvailableBloodBag, useBloodBag, discardBloodBag,
      addDemand, cancelDemand,
      createTransfer, acceptTransfer, reserveTransfer, startTransportTransfer, receiveTransfer, refuseTransfer, cancelTransfer,
      addTemperatureReading,
      getBloodBagByCode, getInstitutionById, getUserById,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

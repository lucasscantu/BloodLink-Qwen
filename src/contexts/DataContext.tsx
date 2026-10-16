import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
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
  DemandUrgency, InstitutionType, UserRole, BloodBagStatus
} from '../types';

const STORAGE_KEY = 'bloodlink_data';

interface DataState {
  institutions: Institution[];
  users: User[];
  bloodBags: BloodBag[];
  demands: BloodDemand[];
  transfers: BloodTransfer[];
  temperatureReadings: TemperatureReading[];
  auditLogs: AuditLog[];
}

interface DataStore extends DataState {
  // Institution actions
  addInstitution: (data: Omit<Institution, 'id' | 'createdAt'>) => Institution;
  
  // User actions
  addUser: (data: { name: string; email: string; role: UserRole; institutionId?: string }) => User;
  
  // Blood bag actions
  addBloodBag: (data: { bloodType: BloodType; volume: number; institutionId: string; performedBy: User }) => BloodBag;
  approveBloodBag: (bagId: string, performedBy: User) => BloodBag | null;
  rejectBloodBag: (bagId: string, reason: string, performedBy: User) => BloodBag | null;
  storeBloodBag: (bagId: string, performedBy: User) => BloodBag | null;
  makeAvailableBloodBag: (bagId: string, performedBy: User) => BloodBag | null;
  useBloodBag: (bagId: string, performedBy: User) => BloodBag | null;
  discardBloodBag: (bagId: string, reason: string, performedBy: User) => BloodBag | null;
  
  // Demand actions
  addDemand: (data: { institutionId: string; bloodType: BloodType; quantity: number; urgency: DemandUrgency; description: string }) => BloodDemand;
  cancelDemand: (demandId: string) => BloodDemand | null;
  
  // Transfer actions
  createTransfer: (data: { bloodBagId: string; sourceInstitutionId: string; destinationInstitutionId: string; demandId?: string }) => BloodTransfer | null;
  acceptTransfer: (transferId: string) => BloodTransfer | null;
  reserveTransfer: (transferId: string) => BloodTransfer | null;
  startTransportTransfer: (transferId: string, performedBy: User) => BloodTransfer | null;
  receiveTransfer: (transferId: string, performedBy: User) => BloodTransfer | null;
  refuseTransfer: (transferId: string) => BloodTransfer | null;
  cancelTransfer: (transferId: string) => BloodTransfer | null;
  
  // Temperature
  addTemperatureReading: (bloodBagId: string, temperature: number, institutionId: string) => TemperatureReading;
  
  // Helpers
  getBloodBagByCode: (code: string) => BloodBag | undefined;
  getBloodBagById: (id: string) => BloodBag | undefined;
  getInstitutionById: (id: string) => Institution | undefined;
  getUserById: (id: string) => User | undefined;
  getDemandById: (id: string) => BloodDemand | undefined;
  getTransferById: (id: string) => BloodTransfer | undefined;
  
  // Reset
  resetData: () => void;
}

const DataContext = createContext<DataStore | undefined>(undefined);

// Load data from localStorage or use initial data
function loadInitialState(): DataState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  return {
    institutions: initialInstitutions,
    users: initialUsers,
    bloodBags: initialBloodBags,
    demands: initialDemands,
    transfers: initialTransfers,
    temperatureReadings: initialTemps,
    auditLogs: initialAuditLogs,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(loadInitialState);

  // Persist to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [state]);

  const addAuditLog = useCallback((userId: string, action: string, entityType: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      userId,
      user: state.users.find(u => u.id === userId),
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, auditLogs: [log, ...prev.auditLogs] }));
  }, [state.users]);

  const generateEvent = useCallback((
    bloodBagId: string,
    type: string,
    description: string,
    performedBy: User,
    institutionId: string,
    eventIndex: number
  ): BloodBagEvent => ({
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    bloodBagId,
    type,
    description,
    performedById: performedBy.id,
    performedBy,
    institutionId,
    institution: state.institutions.find(i => i.id === institutionId),
    eventIndex,
    dataHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    blockchainTxHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    createdAt: new Date().toISOString(),
  }), [state.institutions]);

  // Institution actions
  const addInstitution = useCallback((data: Omit<Institution, 'id' | 'createdAt'>): Institution => {
    const newInst: Institution = {
      ...data,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, institutions: [...prev.institutions, newInst] }));
    return newInst;
  }, []);

  // User actions
  const addUser = useCallback((data: { name: string; email: string; role: UserRole; institutionId?: string }): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      institutionId: data.institutionId || null,
      institution: data.institutionId ? state.institutions.find(i => i.id === data.institutionId) : undefined,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  }, [state.institutions]);

  // Blood bag actions
  const addBloodBag = useCallback((data: { bloodType: BloodType; volume: number; institutionId: string; performedBy: User }): BloodBag => {
    const count = state.bloodBags.length;
    const code = `BL-${String(count + 1).padStart(5, '0')}`;
    const newBag: BloodBag = {
      id: `bag-${Date.now()}`,
      code,
      bloodType: data.bloodType,
      volume: data.volume,
      status: 'COLETADA',
      instituicaoAtualId: data.institutionId,
      instituicaoAtual: state.institutions.find(i => i.id === data.institutionId),
      collectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
      events: [],
      temperatureReadings: [],
      blockchainTxHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    };

    const event = generateEvent(newBag.id, 'COLETA', `Bolsa ${code} coletada - ${data.bloodType}`, data.performedBy, data.institutionId, 0);
    newBag.events = [event];

    setState(prev => ({ ...prev, bloodBags: [newBag, ...prev.bloodBags] }));
    addAuditLog(data.performedBy.id, 'CREATE_BLOOD_BAG', 'BloodBag', newBag.id, `Bolsa ${code} cadastrada - ${data.bloodType}`);
    
    return newBag;
  }, [state.bloodBags.length, state.institutions, generateEvent, addAuditLog]);

  const updateBagWithEvent = useCallback((bagId: string, newStatus: BloodBagStatus, eventType: string, description: string, performedBy: User, extraUpdate?: Partial<BloodBag>): BloodBag | null => {
    let updatedBag: BloodBag | null = null;
    
    setState(prev => {
      const bag = prev.bloodBags.find(b => b.id === bagId);
      if (!bag) return prev;
      
      const event = generateEvent(bagId, eventType, description, performedBy, bag.instituicaoAtualId, bag.events.length);
      updatedBag = {
        ...bag,
        status: newStatus,
        events: [...bag.events, event],
        blockchainTxHash: event.blockchainTxHash,
        ...extraUpdate,
      };
      
      return {
        ...prev,
        bloodBags: prev.bloodBags.map(b => b.id === bagId ? updatedBag! : b),
      };
    });
    
    return updatedBag;
  }, [generateEvent]);

  const approveBloodBag = useCallback((bagId: string, performedBy: User): BloodBag | null => {
    const bag = state.bloodBags.find(b => b.id === bagId);
    if (!bag || (bag.status !== 'COLETADA' && bag.status !== 'EM_TESTE')) {
      return null;
    }
    
    const updated = updateBagWithEvent(bagId, 'APROVADA', 'APROVACAO', 'Testes realizados - Bolsa aprovada', performedBy);
    if (updated) {
      addAuditLog(performedBy.id, 'APPROVE_BLOOD_BAG', 'BloodBag', bagId, `Bolsa ${bag.code} aprovada`);
    }
    return updated;
  }, [state.bloodBags, updateBagWithEvent, addAuditLog]);

  const rejectBloodBag = useCallback((bagId: string, reason: string, performedBy: User): BloodBag | null => {
    const bag = state.bloodBags.find(b => b.id === bagId);
    if (!bag || (bag.status !== 'COLETADA' && bag.status !== 'EM_TESTE')) {
      return null;
    }
    
    const updated = updateBagWithEvent(bagId, 'REPROVADA', 'REPROVACAO', `Bolsa reprovada: ${reason}`, performedBy);
    if (updated) {
      addAuditLog(performedBy.id, 'REJECT_BLOOD_BAG', 'BloodBag', bagId, `Bolsa ${bag.code} reprovada: ${reason}`);
    }
    return updated;
  }, [state.bloodBags, updateBagWithEvent, addAuditLog]);

  const storeBloodBag = useCallback((bagId: string, performedBy: User): BloodBag | null => {
    const bag = state.bloodBags.find(b => b.id === bagId);
    if (!bag || bag.status !== 'APROVADA') return null;
    
    return updateBagWithEvent(bagId, 'ARMAZENADA', 'ARMAZENAMENTO', 'Bolsa armazenada em temperatura controlada', performedBy);
  }, [state.bloodBags, updateBagWithEvent]);

  const makeAvailableBloodBag = useCallback((bagId: string, performedBy: User): BloodBag | null => {
    const bag = state.bloodBags.find(b => b.id === bagId);
    if (!bag || bag.status !== 'ARMAZENADA') return null;
    
    return updateBagWithEvent(bagId, 'DISPONIVEL', 'LIBERACAO', 'Bolsa liberada para uso/transferência', performedBy);
  }, [state.bloodBags, updateBagWithEvent]);

  const useBloodBag = useCallback((bagId: string, performedBy: User): BloodBag | null => {
    const bag = state.bloodBags.find(b => b.id === bagId);
    if (!bag || (bag.status !== 'DISPONIVEL' && bag.status !== 'RECEBIDA')) return null;
    
    const updated = updateBagWithEvent(bagId, 'UTILIZADA', 'UTILIZACAO', 'Bolsa utilizada em procedimento', performedBy);
    if (updated) {
      addAuditLog(performedBy.id, 'USE_BLOOD_BAG', 'BloodBag', bagId, `Bolsa ${bag.code} utilizada`);
    }
    return updated;
  }, [state.bloodBags, updateBagWithEvent, addAuditLog]);

  const discardBloodBag = useCallback((bagId: string, reason: string, performedBy: User): BloodBag | null => {
    const bag = state.bloodBags.find(b => b.id === bagId);
    if (!bag || bag.status !== 'DISPONIVEL') return null;
    
    return updateBagWithEvent(bagId, 'DESCARTADA', 'DESCARTE', `Bolsa descartada: ${reason}`, performedBy);
  }, [state.bloodBags, updateBagWithEvent]);

  // Demand actions
  const addDemand = useCallback((data: { institutionId: string; bloodType: BloodType; quantity: number; urgency: DemandUrgency; description: string }): BloodDemand => {
    const newDemand: BloodDemand = {
      id: `dem-${Date.now()}`,
      institutionId: data.institutionId,
      institution: state.institutions.find(i => i.id === data.institutionId),
      bloodType: data.bloodType,
      quantity: data.quantity,
      urgency: data.urgency,
      status: 'ABERTA',
      description: data.description,
      createdAt: new Date().toISOString(),
      transfers: [],
    };
    setState(prev => ({ ...prev, demands: [newDemand, ...prev.demands] }));
    return newDemand;
  }, [state.institutions]);

  const cancelDemand = useCallback((demandId: string): BloodDemand | null => {
    let updated: BloodDemand | null = null;
    setState(prev => {
      const demand = prev.demands.find(d => d.id === demandId);
      if (!demand || demand.status === 'ATENDIDA' || demand.status === 'CANCELADA') return prev;
      
      updated = { ...demand, status: 'CANCELADA' };
      return {
        ...prev,
        demands: prev.demands.map(d => d.id === demandId ? updated! : d),
      };
    });
    return updated;
  }, []);

  // Transfer actions
  const createTransfer = useCallback((data: { bloodBagId: string; sourceInstitutionId: string; destinationInstitutionId: string; demandId?: string }): BloodTransfer | null => {
    const bag = state.bloodBags.find(b => b.id === data.bloodBagId);
    if (!bag || bag.status !== 'DISPONIVEL') return null;
    
    const newTransfer: BloodTransfer = {
      id: `tr-${Date.now()}`,
      bloodBagId: data.bloodBagId,
      bloodBag: bag,
      demandId: data.demandId || null,
      sourceInstitutionId: data.sourceInstitutionId,
      sourceInstitution: state.institutions.find(i => i.id === data.sourceInstitutionId),
      destinationInstitutionId: data.destinationInstitutionId,
      destinationInstitution: state.institutions.find(i => i.id === data.destinationInstitutionId),
      status: 'OFERTADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      transfers: [newTransfer, ...prev.transfers],
      bloodBags: prev.bloodBags.map(b => b.id === data.bloodBagId ? { ...b, status: 'RESERVADA' as const } : b),
      demands: data.demandId ? prev.demands.map(d => {
        if (d.id !== data.demandId) return d;
        return { ...d, transfers: [...(d.transfers || []), newTransfer], status: 'EM_ANALISE' as const };
      }) : prev.demands,
    }));
    
    return newTransfer;
  }, [state.bloodBags, state.institutions]);

  const updateTransferStatus = useCallback((transferId: string, newStatus: BloodTransfer['status'], bagUpdate?: Partial<BloodBag>): BloodTransfer | null => {
    let updated: BloodTransfer | null = null;
    
    setState(prev => {
      const transfer = prev.transfers.find(t => t.id === transferId);
      if (!transfer) return prev;
      
      updated = { ...transfer, status: newStatus, updatedAt: new Date().toISOString() };
      
      return {
        ...prev,
        transfers: prev.transfers.map(t => t.id === transferId ? updated! : t),
        bloodBags: bagUpdate ? prev.bloodBags.map(b => b.id === transfer.bloodBagId ? { ...b, ...bagUpdate } : b) : prev.bloodBags,
      };
    });
    
    return updated;
  }, []);

  const acceptTransfer = useCallback((transferId: string): BloodTransfer | null => {
    const transfer = state.transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'OFERTADA') return null;
    return updateTransferStatus(transferId, 'ACEITA');
  }, [state.transfers, updateTransferStatus]);

  const reserveTransfer = useCallback((transferId: string): BloodTransfer | null => {
    const transfer = state.transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'ACEITA') return null;
    return updateTransferStatus(transferId, 'RESERVADA');
  }, [state.transfers, updateTransferStatus]);

  const startTransportTransfer = useCallback((transferId: string, performedBy: User): BloodTransfer | null => {
    const transfer = state.transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'RESERVADA') return null;
    
    setState(prev => {
      const bag = prev.bloodBags.find(b => b.id === transfer.bloodBagId);
      if (!bag) return prev;
      
      const event = generateEvent(bag.id, 'ENVIO', `Bolsa enviada para ${transfer.destinationInstitution?.name}`, performedBy, transfer.sourceInstitutionId, bag.events.length);
      
      return {
        ...prev,
        transfers: prev.transfers.map(t => t.id === transferId ? { ...t, status: 'EM_TRANSPORTE' as const, updatedAt: new Date().toISOString() } : t),
        bloodBags: prev.bloodBags.map(b => b.id === transfer.bloodBagId ? { ...b, status: 'EM_TRANSPORTE' as const, events: [...b.events, event] } : b),
      };
    });
    
    return { ...transfer, status: 'EM_TRANSPORTE' };
  }, [state.transfers, generateEvent]);

  const receiveTransfer = useCallback((transferId: string, performedBy: User): BloodTransfer | null => {
    const transfer = state.transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'EM_TRANSPORTE') return null;
    
    setState(prev => {
      const bag = prev.bloodBags.find(b => b.id === transfer.bloodBagId);
      if (!bag) return prev;
      
      const event = generateEvent(bag.id, 'RECEBIMENTO', `Bolsa recebida de ${transfer.sourceInstitution?.name}`, performedBy, transfer.destinationInstitutionId, bag.events.length);
      
      return {
        ...prev,
        transfers: prev.transfers.map(t => t.id === transferId ? { ...t, status: 'RECEBIDA' as const, updatedAt: new Date().toISOString() } : t),
        bloodBags: prev.bloodBags.map(b => b.id === transfer.bloodBagId ? {
          ...b,
          status: 'RECEBIDA' as const,
          instituicaoAtualId: transfer.destinationInstitutionId,
          instituicaoAtual: transfer.destinationInstitution,
          events: [...b.events, event],
        } : b),
        demands: transfer.demandId ? prev.demands.map(d => d.id === transfer.demandId ? { ...d, status: 'ATENDIDA' as const } : d) : prev.demands,
      };
    });
    
    return { ...transfer, status: 'RECEBIDA' };
  }, [state.transfers, generateEvent]);

  const refuseTransfer = useCallback((transferId: string): BloodTransfer | null => {
    const transfer = state.transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'OFERTADA') return null;
    return updateTransferStatus(transferId, 'RECUSADA', { status: 'DISPONIVEL' });
  }, [state.transfers, updateTransferStatus]);

  const cancelTransfer = useCallback((transferId: string): BloodTransfer | null => {
    const transfer = state.transfers.find(t => t.id === transferId);
    if (!transfer || (transfer.status !== 'OFERTADA' && transfer.status !== 'ACEITA')) return null;
    return updateTransferStatus(transferId, 'CANCELADA', { status: 'DISPONIVEL' });
  }, [state.transfers, updateTransferStatus]);

  // Temperature
  const addTemperatureReading = useCallback((bloodBagId: string, temperature: number, institutionId: string): TemperatureReading => {
    const alert = temperature > 6 || temperature < 2;
    const reading: TemperatureReading = {
      id: `temp-${Date.now()}`,
      bloodBagId,
      temperature,
      institutionId,
      alert,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, temperatureReadings: [reading, ...prev.temperatureReadings] }));
    return reading;
  }, []);

  // Helpers
  const getBloodBagByCode = useCallback((code: string) => state.bloodBags.find(b => b.code === code), [state.bloodBags]);
  const getBloodBagById = useCallback((id: string) => state.bloodBags.find(b => b.id === id), [state.bloodBags]);
  const getInstitutionById = useCallback((id: string) => state.institutions.find(i => i.id === id), [state.institutions]);
  const getUserById = useCallback((id: string) => state.users.find(u => u.id === id), [state.users]);
  const getDemandById = useCallback((id: string) => state.demands.find(d => d.id === id), [state.demands]);
  const getTransferById = useCallback((id: string) => state.transfers.find(t => t.id === id), [state.transfers]);

  // Reset
  const resetData = useCallback(() => {
    setState({
      institutions: initialInstitutions,
      users: initialUsers,
      bloodBags: initialBloodBags,
      demands: initialDemands,
      transfers: initialTransfers,
      temperatureReadings: initialTemps,
      auditLogs: initialAuditLogs,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <DataContext.Provider value={{
      ...state,
      addInstitution, addUser,
      addBloodBag, approveBloodBag, rejectBloodBag, storeBloodBag, makeAvailableBloodBag, useBloodBag, discardBloodBag,
      addDemand, cancelDemand,
      createTransfer, acceptTransfer, reserveTransfer, startTransportTransfer, receiveTransfer, refuseTransfer, cancelTransfer,
      addTemperatureReading,
      getBloodBagByCode, getBloodBagById, getInstitutionById, getUserById, getDemandById, getTransferById,
      resetData,
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

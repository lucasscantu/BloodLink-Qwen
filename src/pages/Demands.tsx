import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { BloodType, DemandUrgency, BLOOD_TYPE_LABELS, DEMAND_STATUS_COLORS, URGENCY_COLORS } from '../types';
import { Plus } from 'lucide-react';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';

export default function Demands() {
  const { user, hasRole } = useAuth();
  const { demands, addDemand, cancelDemand } = useData();
  const { success } = useNotification();
  const [showCreate, setShowCreate] = useState(false);

  const filteredDemands = user?.role === 'HOSPITAL' && user.institutionId
    ? demands.filter(d => d.institutionId === user.institutionId)
    : demands;

  const columns = [
    {
      key: 'institution',
      header: 'Instituição',
      sortable: true,
      render: (demand: typeof demands[0]) => demand.institution?.name || '—',
    },
    {
      key: 'bloodType',
      header: 'Tipo',
      sortable: true,
      render: (demand: typeof demands[0]) => (
        <span className="font-semibold">{BLOOD_TYPE_LABELS[demand.bloodType]}</span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantidade',
      sortable: true,
      render: (demand: typeof demands[0]) => `${demand.quantity} bolsas`,
    },
    {
      key: 'urgency',
      header: 'Urgência',
      sortable: true,
      render: (demand: typeof demands[0]) => (
        <span className={`badge ${URGENCY_COLORS[demand.urgency]}`}>{demand.urgency}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (demand: typeof demands[0]) => (
        <span className={`badge ${DEMAND_STATUS_COLORS[demand.status]}`}>{demand.status}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (demand: typeof demands[0]) => (
        <span className="text-sm text-gray-600 truncate block max-w-xs">{demand.description}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criada em',
      sortable: true,
      render: (demand: typeof demands[0]) => new Date(demand.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandas de Sangue</h1>
          <p className="text-gray-500 text-sm">{filteredDemands.length} demandas</p>
        </div>
        {hasRole('ADMIN', 'HOSPITAL') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova Demanda
          </button>
        )}
      </div>

      <DataTable
        data={filteredDemands}
        columns={columns}
        itemsPerPage={10}
        emptyMessage="Nenhuma demanda encontrada"
      />

      {showCreate && <CreateDemandModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateDemandModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { institutions, addDemand } = useData();
  const { success } = useNotification();
  const [institutionId, setInstitutionId] = useState(user?.institutionId || '');
  const [bloodType, setBloodType] = useState<BloodType>('O_POS');
  const [quantity, setQuantity] = useState('1');
  const [urgency, setUrgency] = useState<DemandUrgency>('MEDIA');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;
    setLoading(true);
    setTimeout(() => {
      addDemand({
        institutionId,
        bloodType,
        quantity: parseInt(quantity),
        urgency,
        description,
      });
      success('Demanda criada com sucesso!');
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Criar Nova Demanda">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Solicitante *</label>
          <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="input-field" required>
            <option value="">Selecione...</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Sanguíneo</label>
          <select value={bloodType} onChange={e => setBloodType(e.target.value as BloodType)} className="input-field">
            {Object.entries(BLOOD_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-field" min={1} max={50} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value as DemandUrgency)} className="input-field">
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} placeholder="Descreva a necessidade..." />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading || !institutionId} className="btn-primary flex-1">
            {loading ? 'Criando...' : 'Criar Demanda'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

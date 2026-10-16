import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { demands, institutions } from '../data';
import { BloodDemand, BloodType, DemandUrgency, BLOOD_TYPE_LABELS, DEMAND_STATUS_COLORS, URGENCY_COLORS } from '../types';
import { Plus } from 'lucide-react';

export default function Demands() {
  const { user, hasRole } = useAuth();
  const [demandsList, setDemandsList] = useState<BloodDemand[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      let filtered = [...demands];
      if (user?.role === 'HOSPITAL' && user.institutionId) {
        filtered = filtered.filter(d => d.institutionId === user.institutionId);
      }
      setDemandsList(filtered);
    } catch {
      setError('Erro ao carregar demandas.');
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandas de Sangue</h1>
          <p className="text-gray-500 text-sm">{demandsList.length} demandas</p>
        </div>
        {hasRole('ADMIN', 'HOSPITAL') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova Demanda
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demandsList.map(demand => (
          <div key={demand.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className={`badge ${DEMAND_STATUS_COLORS[demand.status]}`}>{demand.status}</span>
              <span className={`badge ${URGENCY_COLORS[demand.urgency]}`}>{demand.urgency}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{demand.institution?.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {demand.quantity} bolsas de {BLOOD_TYPE_LABELS[demand.bloodType]}
            </p>
            <p className="text-sm text-gray-500 mt-2">{demand.description}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="text-xs text-gray-500">
                {new Date(demand.createdAt).toLocaleDateString('pt-BR')}
              </span>
              {demand.transfers && demand.transfers.length > 0 && (
                <span className="text-xs text-blood-600">
                  {demand.transfers.length} transferência(s)
                </span>
              )}
            </div>
            {demand.transfers && demand.transfers.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-600 mb-2">Transferências:</p>
                {demand.transfers.map(t => (
                  <div key={t.id} className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{t.sourceInstitution?.name}</span>
                    <span>→</span>
                    <span>{t.destinationInstitution?.name}</span>
                    <span className={`badge ${DEMAND_STATUS_COLORS[t.status as keyof typeof DEMAND_STATUS_COLORS] || 'bg-gray-100 text-gray-600'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && <CreateDemandModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateDemandModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [institutionId, setInstitutionId] = useState(user?.institutionId || '');
  const [bloodType, setBloodType] = useState<BloodType>('O_POS');
  const [quantity, setQuantity] = useState('1');
  const [urgency, setUrgency] = useState<DemandUrgency>('MEDIA');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Criar Nova Demanda</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-green-700 font-medium">Demanda criada com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Solicitante *</label>
              <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="input-field" required>
                <option value="">Selecione...</option>
                {institutions.filter(i => i.type === 'HOSPITAL' || user?.role === 'ADMIN').map(inst => (
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
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transfers, bloodBags, institutions } from '../data';
import { BloodTransfer, TRANSFER_STATUS_COLORS, BLOOD_TYPE_LABELS } from '../types';
import { ArrowRightLeft, Plus } from 'lucide-react';

export default function Transfers() {
  const { user, hasRole } = useAuth();
  const [transfersList, setTransfersList] = useState<BloodTransfer[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setTransfersList([...transfers]);
    } catch {
      setError('Erro ao carregar transferências.');
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transferências</h1>
          <p className="text-gray-500 text-sm">{transfersList.length} transferências</p>
        </div>
        {hasRole('ADMIN', 'HEMOCENTRO') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova Transferência
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Transfer Cards */}
      <div className="space-y-4">
        {transfersList.map(transfer => (
          <div key={transfer.id} className="card hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blood-100 flex items-center justify-center">
                  <ArrowRightLeft size={18} className="text-blood-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transfer.bloodBag?.code || 'N/A'} — {transfer.bloodBag ? BLOOD_TYPE_LABELS[transfer.bloodBag.bloodType] : ''}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <span className="font-medium">{transfer.sourceInstitution?.name}</span>
                    <span className="text-blood-500">→</span>
                    <span className="font-medium">{transfer.destinationInstitution?.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${TRANSFER_STATUS_COLORS[transfer.status]}`}>
                  {transfer.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(transfer.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Action buttons based on status */}
            <div className="mt-4 pt-3 border-t flex flex-wrap gap-2">
              {transfer.status === 'OFERTADA' && hasRole('ADMIN', 'HOSPITAL') && (
                <button className="btn-success text-sm py-1 px-3">Aceitar</button>
              )}
              {transfer.status === 'ACEITA' && hasRole('ADMIN', 'HEMOCENTRO') && (
                <button className="btn-primary text-sm py-1 px-3">Reservar Bolsa</button>
              )}
              {transfer.status === 'RESERVADA' && hasRole('ADMIN', 'HEMOCENTRO') && (
                <button className="btn-primary text-sm py-1 px-3">Iniciar Transporte</button>
              )}
              {transfer.status === 'EM_TRANSPORTE' && hasRole('ADMIN', 'HOSPITAL') && (
                <button className="btn-success text-sm py-1 px-3">Confirmar Recebimento</button>
              )}
              {transfer.status === 'OFERTADA' && hasRole('ADMIN', 'HEMOCENTRO') && (
                <button className="btn-danger text-sm py-1 px-3">Cancelar</button>
              )}
              {transfer.status === 'OFERTADA' && hasRole('ADMIN', 'HOSPITAL') && (
                <button className="btn-danger text-sm py-1 px-3">Recusar</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreate && <CreateTransferModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateTransferModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [sourceId, setSourceId] = useState(user?.institutionId || '');
  const [destId, setDestId] = useState('');
  const [bagCode, setBagCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableBags = bloodBags.filter(b => b.status === 'DISPONIVEL' && b.instituicaoAtualId === sourceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destId || !bagCode) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Ofertar Transferência</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-green-700 font-medium">Transferência ofertada!</p>
            <p className="text-sm text-gray-500 mt-2">A instituição destino será notificada.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Origem *</label>
              <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="input-field" required>
                <option value="">Selecione...</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Destino *</label>
              <select value={destId} onChange={e => setDestId(e.target.value)} className="input-field" required>
                <option value="">Selecione...</option>
                {institutions.filter(i => i.id !== sourceId).map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bolsa Disponível *</label>
              <select value={bagCode} onChange={e => setBagCode(e.target.value)} className="input-field" required>
                <option value="">Selecione uma bolsa...</option>
                {availableBags.map(bag => (
                  <option key={bag.id} value={bag.code}>{bag.code} - {BLOOD_TYPE_LABELS[bag.bloodType]} ({bag.volume}mL)</option>
                ))}
              </select>
              {sourceId && availableBags.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Nenhuma bolsa disponível nesta instituição.</p>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={loading || !sourceId || !destId || !bagCode} className="btn-primary flex-1">
                {loading ? 'Ofertando...' : 'Ofertar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

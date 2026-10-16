import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { TRANSFER_STATUS_COLORS, BLOOD_TYPE_LABELS } from '../types';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';

export default function Transfers() {
  const { user, hasRole } = useAuth();
  const { transfers, bloodBags, createTransfer, acceptTransfer, reserveTransfer, startTransportTransfer, receiveTransfer, refuseTransfer, cancelTransfer } = useData();
  const { success } = useNotification();
  const [showCreate, setShowCreate] = useState(false);

  const columns = [
    {
      key: 'bag',
      header: 'Bolsa',
      render: (transfer: typeof transfers[0]) => (
        <span className="font-mono text-blood-600 font-medium">
          {transfer.bloodBag?.code || 'N/A'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (transfer: typeof transfers[0]) => (
        transfer.bloodBag ? BLOOD_TYPE_LABELS[transfer.bloodBag.bloodType] : '—'
      ),
    },
    {
      key: 'source',
      header: 'Origem',
      sortable: true,
      render: (transfer: typeof transfers[0]) => (
        <span className="text-sm">{transfer.sourceInstitution?.name || '—'}</span>
      ),
    },
    {
      key: 'arrow',
      header: '',
      render: () => <ArrowRightLeft size={16} className="text-blood-500" />,
    },
    {
      key: 'destination',
      header: 'Destino',
      sortable: true,
      render: (transfer: typeof transfers[0]) => (
        <span className="text-sm">{transfer.destinationInstitution?.name || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (transfer: typeof transfers[0]) => (
        <span className={`badge ${TRANSFER_STATUS_COLORS[transfer.status]}`}>
          {transfer.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data',
      sortable: true,
      render: (transfer: typeof transfers[0]) => new Date(transfer.createdAt).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (transfer: typeof transfers[0]) => (
        <TransferActions transfer={transfer} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transferências</h1>
          <p className="text-gray-500 text-sm">{transfers.length} transferências</p>
        </div>
        {hasRole('ADMIN', 'HEMOCENTRO') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova Transferência
          </button>
        )}
      </div>

      <DataTable
        data={transfers}
        columns={columns}
        itemsPerPage={10}
        emptyMessage="Nenhuma transferência encontrada"
      />

      {showCreate && <CreateTransferModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function TransferActions({ transfer }: { transfer: any }) {
  const { user, hasRole } = useAuth();
  const { acceptTransfer, reserveTransfer, startTransportTransfer, receiveTransfer, refuseTransfer, cancelTransfer } = useData();
  const { success } = useNotification();

  if (!user) return null;

  const handleAccept = () => {
    acceptTransfer(transfer.id);
    success('Transferência aceita!');
  };

  const handleReserve = () => {
    reserveTransfer(transfer.id);
    success('Bolsa reservada!');
  };

  const handleTransport = () => {
    startTransportTransfer(transfer.id, user);
    success('Transporte iniciado!');
  };

  const handleReceive = () => {
    receiveTransfer(transfer.id, user);
    success('Recebimento confirmado!');
  };

  const handleRefuse = () => {
    refuseTransfer(transfer.id);
    success('Transferência recusada.');
  };

  const handleCancel = () => {
    cancelTransfer(transfer.id);
    success('Transferência cancelada.');
  };

  return (
    <div className="flex flex-wrap gap-1">
      {transfer.status === 'OFERTADA' && hasRole('ADMIN', 'HOSPITAL') && (
        <button onClick={handleAccept} className="text-xs btn-success py-1 px-2">Aceitar</button>
      )}
      {transfer.status === 'OFERTADA' && hasRole('ADMIN', 'HOSPITAL') && (
        <button onClick={handleRefuse} className="text-xs btn-danger py-1 px-2">Recusar</button>
      )}
      {transfer.status === 'OFERTADA' && hasRole('ADMIN', 'HEMOCENTRO') && (
        <button onClick={handleCancel} className="text-xs btn-danger py-1 px-2">Cancelar</button>
      )}
      {transfer.status === 'ACEITA' && hasRole('ADMIN', 'HEMOCENTRO') && (
        <button onClick={handleReserve} className="text-xs btn-primary py-1 px-2">Reservar</button>
      )}
      {transfer.status === 'RESERVADA' && hasRole('ADMIN', 'HEMOCENTRO') && (
        <button onClick={handleTransport} className="text-xs btn-primary py-1 px-2">Transportar</button>
      )}
      {transfer.status === 'EM_TRANSPORTE' && hasRole('ADMIN', 'HOSPITAL') && (
        <button onClick={handleReceive} className="text-xs btn-success py-1 px-2">Receber</button>
      )}
    </div>
  );
}

function CreateTransferModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { institutions, bloodBags, createTransfer } = useData();
  const { success } = useNotification();
  const [sourceId, setSourceId] = useState(user?.institutionId || '');
  const [destId, setDestId] = useState('');
  const [bagId, setBagId] = useState('');
  const [loading, setLoading] = useState(false);

  const availableBags = bloodBags.filter(b => b.status === 'DISPONIVEL' && b.instituicaoAtualId === sourceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destId || !bagId) return;
    setLoading(true);
    setTimeout(() => {
      createTransfer({
        bloodBagId: bagId,
        sourceInstitutionId: sourceId,
        destinationInstitutionId: destId,
      });
      success('Transferência ofertada com sucesso!');
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Ofertar Transferência">
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
          <select value={bagId} onChange={e => setBagId(e.target.value)} className="input-field" required>
            <option value="">Selecione uma bolsa...</option>
            {availableBags.map(bag => (
              <option key={bag.id} value={bag.id}>{bag.code} - {BLOOD_TYPE_LABELS[bag.bloodType]} ({bag.volume}mL)</option>
            ))}
          </select>
          {sourceId && availableBags.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">Nenhuma bolsa disponível nesta instituição.</p>
          )}
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading || !sourceId || !destId || !bagId} className="btn-primary flex-1">
            {loading ? 'Ofertando...' : 'Ofertar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

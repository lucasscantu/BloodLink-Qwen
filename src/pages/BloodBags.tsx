import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { BloodType, BLOOD_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { Plus, Eye, QrCode } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ExportButton } from '../components/ExportButton';

export default function BloodBags() {
  const { user, hasRole } = useAuth();
  const { bloodBags, addBloodBag } = useData();
  const { success, error: showError } = useNotification();
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredBags = useMemo(() => {
    let filtered = [...bloodBags];
    if (user?.role === 'HOSPITAL' && user.institutionId) {
      filtered = filtered.filter(b => b.instituicaoAtualId === user.institutionId);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.code.toLowerCase().includes(s) ||
        BLOOD_TYPE_LABELS[b.bloodType].toLowerCase().includes(s) ||
        b.instituicaoAtual?.name.toLowerCase().includes(s)
      );
    }
    if (statusFilter) filtered = filtered.filter(b => b.status === statusFilter);
    if (typeFilter) filtered = filtered.filter(b => b.bloodType === typeFilter);
    return filtered;
  }, [bloodBags, user, search, statusFilter, typeFilter]);

  const columns = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      render: (bag: typeof bloodBags[0]) => (
        <Link to={`/blood-bags/${bag.code}`} className="font-mono text-blood-600 hover:underline font-medium">
          {bag.code}
        </Link>
      ),
    },
    {
      key: 'bloodType',
      header: 'Tipo',
      sortable: true,
      render: (bag: typeof bloodBags[0]) => (
        <span className="font-semibold">{BLOOD_TYPE_LABELS[bag.bloodType]}</span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      sortable: true,
      render: (bag: typeof bloodBags[0]) => `${bag.volume} mL`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (bag: typeof bloodBags[0]) => (
        <span className={`status-badge ${STATUS_COLORS[bag.status]}`}>
          {STATUS_LABELS[bag.status]}
        </span>
      ),
    },
    {
      key: 'institution',
      header: 'Instituição',
      render: (bag: typeof bloodBags[0]) => bag.instituicaoAtual?.name || '—',
    },
    {
      key: 'collectedAt',
      header: 'Coleta',
      sortable: true,
      render: (bag: typeof bloodBags[0]) => new Date(bag.collectedAt).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (bag: typeof bloodBags[0]) => (
        <div className="flex items-center gap-2">
          <Link to={`/blood-bags/${bag.code}`} className="text-gray-500 hover:text-blood-600" title="Ver detalhes">
            <Eye size={16} />
          </Link>
          <Link to={`/blood-bags/${bag.code}?qr=true`} className="text-gray-500 hover:text-blood-600" title="QR Code">
            <QrCode size={16} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bolsas de Sangue</h1>
          <p className="text-gray-500 text-sm">{filteredBags.length} bolsas encontradas</p>
        </div>
        <div className="flex gap-2">
          <ExportButton data={filteredBags} filename="bolsas-sangue" columns={[
            { key: 'code', header: 'Código' },
            { key: 'bloodType', header: 'Tipo' },
            { key: 'volume', header: 'Volume' },
            { key: 'status', header: 'Status' },
          ]} />
          {hasRole('ADMIN', 'HEMOCENTRO') && (
            <button onClick={() => setShowRegister(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Cadastrar Bolsa
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar por código, tipo ou instituição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1"
          />
          <div className="flex gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-auto">
              <option value="">Todos os tipos</option>
              {Object.entries(BLOOD_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredBags}
        columns={columns}
        searchable={false}
        itemsPerPage={15}
        emptyMessage="Nenhuma bolsa encontrada com os filtros aplicados"
      />

      {showRegister && <RegisterBagModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}

function RegisterBagModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { institutions, addBloodBag } = useData();
  const { success } = useNotification();
  const [bloodType, setBloodType] = useState<BloodType>('O_POS');
  const [volume, setVolume] = useState('450');
  const [institutionId, setInstitutionId] = useState(user?.institutionId || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId || !user) return;
    setLoading(true);
    setTimeout(() => {
      addBloodBag({
        bloodType,
        volume: parseInt(volume),
        institutionId,
        performedBy: user,
      });
      success('Bolsa cadastrada com sucesso e registrada na blockchain!');
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Cadastrar Nova Bolsa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Sanguíneo</label>
          <select value={bloodType} onChange={e => setBloodType(e.target.value as BloodType)} className="input-field">
            {Object.entries(BLOOD_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Volume (mL)</label>
          <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="input-field" min={200} max={600} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Responsável *</label>
          <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="input-field" required>
            <option value="">Selecione...</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name} ({inst.type === 'HEMOCENTRO' ? 'Hemocentro' : 'Hospital'})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading || !institutionId} className="btn-primary flex-1">
            {loading ? 'Registrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

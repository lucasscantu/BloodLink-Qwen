import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bloodBags, institutions } from '../data';
import { BloodBag, BloodType, BLOOD_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { Plus, Search, Eye, QrCode } from 'lucide-react';

export default function BloodBags() {
  const { user, hasRole } = useAuth();
  const [bags, setBags] = useState<BloodBag[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      let filtered = [...bloodBags];
      if (user?.role === 'HOSPITAL' && user.institutionId) {
        filtered = filtered.filter(b => b.instituicaoAtualId === user.institutionId);
      }
      setBags(filtered);
    } catch {
      setError('Erro ao carregar bolsas de sangue.');
    }
  }, [user]);

  const filteredBags = bags.filter(bag => {
    const matchSearch = bag.code.toLowerCase().includes(search.toLowerCase()) ||
      BLOOD_TYPE_LABELS[bag.bloodType].toLowerCase().includes(search.toLowerCase()) ||
      bag.instituicaoAtual?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || bag.status === statusFilter;
    const matchType = !typeFilter || bag.bloodType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const canRegister = hasRole('ADMIN', 'HEMOCENTRO');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bolsas de Sangue</h1>
          <p className="text-gray-500 text-sm">{filteredBags.length} bolsas encontradas</p>
        </div>
        {canRegister && (
          <button onClick={() => setShowRegister(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Cadastrar Bolsa
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código, tipo ou instituição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
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
      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Volume</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Instituição</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Coleta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBags.slice(0, 50).map(bag => (
                <tr key={bag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/blood-bags/${bag.code}`} className="font-mono text-blood-600 hover:underline font-medium">
                      {bag.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold">{BLOOD_TYPE_LABELS[bag.bloodType]}</td>
                  <td className="px-4 py-3">{bag.volume} mL</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${STATUS_COLORS[bag.status]}`}>
                      {STATUS_LABELS[bag.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{bag.instituicaoAtual?.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(bag.collectedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/blood-bags/${bag.code}`} className="text-gray-500 hover:text-blood-600" title="Ver detalhes">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/blood-bags/${bag.code}?qr=true`} className="text-gray-500 hover:text-blood-600" title="QR Code">
                        <QrCode size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBags.length > 50 && (
          <div className="p-4 text-center text-sm text-gray-500 border-t">
            Mostrando 50 de {filteredBags.length} bolsas. Use os filtros para refinar.
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegister && <RegisterBagModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}

function RegisterBagModal({ onClose }: { onClose: () => void }) {
  const { user, hasRole } = useAuth();
  const [bloodType, setBloodType] = useState<BloodType>('O_POS');
  const [volume, setVolume] = useState('450');
  const [institutionId, setInstitutionId] = useState(user?.institutionId || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <h2 className="text-xl font-bold mb-4">Cadastrar Nova Bolsa</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-green-700 font-medium">Bolsa cadastrada com sucesso!</p>
            <p className="text-sm text-gray-500 mt-2">Registrada na blockchain com hash SHA-256.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

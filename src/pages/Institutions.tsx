import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { InstitutionType } from '../types';
import { Plus, MapPin, Building2 } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function Institutions() {
  const { institutions, addInstitution } = useData();
  const { success } = useNotification();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instituições</h1>
          <p className="text-gray-500 text-sm">{institutions.length} instituições cadastradas</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova Instituição
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutions.map(inst => (
          <div key={inst.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                inst.type === 'HEMOCENTRO' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <Building2 size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{inst.name}</h3>
                <span className={`badge mt-1 ${inst.type === 'HEMOCENTRO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {inst.type === 'HEMOCENTRO' ? 'Hemocentro' : 'Hospital'}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <MapPin size={14} />
                  <span>{inst.city}, {inst.state}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {inst.latitude.toFixed(4)}, Lng: {inst.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && <CreateInstitutionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateInstitutionModal({ onClose }: { onClose: () => void }) {
  const { addInstitution } = useData();
  const { success } = useNotification();
  const [name, setName] = useState('');
  const [type, setType] = useState<InstitutionType>('HOSPITAL');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addInstitution({
        name,
        type,
        city,
        state,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
      });
      success('Instituição cadastrada com sucesso!');
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Cadastrar Instituição">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select value={type} onChange={e => setType(e.target.value as InstitutionType)} className="input-field">
            <option value="HOSPITAL">Hospital</option>
            <option value="HEMOCENTRO">Hemocentro</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <input type="text" value={state} onChange={e => setState(e.target.value)} className="input-field" maxLength={2} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

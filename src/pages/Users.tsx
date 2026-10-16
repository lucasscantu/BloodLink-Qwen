import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { UserRole } from '../types';
import { Plus } from 'lucide-react';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';

export default function UsersPage() {
  const { users, addUser } = useData();
  const { success } = useNotification();
  const [showCreate, setShowCreate] = useState(false);

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    HEMOCENTRO: 'bg-purple-100 text-purple-800',
    HOSPITAL: 'bg-blue-100 text-blue-800',
    AUDITOR: 'bg-gray-100 text-gray-800',
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      render: (u: typeof users[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blood-100 flex items-center justify-center text-blood-700 text-xs font-bold">
            {u.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{u.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Papel',
      sortable: true,
      render: (u: typeof users[0]) => (
        <span className={`badge ${roleColors[u.role]}`}>{u.role}</span>
      ),
    },
    {
      key: 'institution',
      header: 'Instituição',
      render: (u: typeof users[0]) => u.institution?.name || '—',
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      sortable: true,
      render: (u: typeof users[0]) => new Date(u.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm">{users.length} usuários cadastrados</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        itemsPerPage={10}
        emptyMessage="Nenhum usuário encontrado"
      />

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { institutions, addUser } = useData();
  const { success } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('HOSPITAL');
  const [institutionId, setInstitutionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addUser({
        name,
        email,
        role,
        institutionId: institutionId || undefined,
      });
      success('Usuário cadastrado com sucesso!');
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Cadastrar Usuário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Papel *</label>
          <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="input-field">
            <option value="ADMIN">Administrador</option>
            <option value="HEMOCENTRO">Hemocentro</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="AUDITOR">Auditor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
          <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="input-field">
            <option value="">Nenhuma (apenas ADMIN/AUDITOR)</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
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

import React, { useState } from 'react';
import { users, institutions } from '../data';
import { User, UserRole } from '../types';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [usersList, setUsersList] = useState<User[]>([...users]);
  const [showCreate, setShowCreate] = useState(false);

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    HEMOCENTRO: 'bg-purple-100 text-purple-800',
    HOSPITAL: 'bg-blue-100 text-blue-800',
    AUDITOR: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm">{usersList.length} usuários cadastrados</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Papel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Instituição</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blood-100 flex items-center justify-center text-blood-700 text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${roleColors[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {u.institution?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('HOSPITAL');
  const [institutionId, setInstitutionId] = useState('');
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
        <h2 className="text-xl font-bold mb-4">Cadastrar Usuário</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-green-700 font-medium">Usuário cadastrado com sucesso!</p>
          </div>
        ) : (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Inicial *</label>
              <input type="password" defaultValue="senha123" className="input-field" required />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

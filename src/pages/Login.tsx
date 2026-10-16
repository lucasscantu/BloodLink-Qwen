import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas. Use um dos emails de demonstração.');
      }
    } catch {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@bloodlink.com', label: 'Administrador', role: 'ADMIN' },
    { email: 'hemocentro@bloodlink.com', label: 'Hemocentro SP', role: 'HEMOCENTRO' },
    { email: 'hospitalA@bloodlink.com', label: 'Hospital Central', role: 'HOSPITAL' },
    { email: 'auditor@bloodlink.com', label: 'Auditor', role: 'AUDITOR' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blood-100 rounded-full mb-4">
            <Droplets className="text-blood-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BloodLink</h1>
          <p className="text-gray-500 mt-2">Rastreabilidade de Bolsas de Sangue com Blockchain</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border p-8">
          <h2 className="text-xl font-semibold mb-6">Acessar Sistema</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 mb-3 font-medium">Usuários de demonstração (senha: senha123):</p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map(u => (
                <button
                  key={u.email}
                  onClick={() => { setEmail(u.email); setPassword('senha123'); }}
                  className="text-left p-2 rounded-lg border hover:border-blood-300 hover:bg-blood-50 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-900">{u.label}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Protótipo acadêmico — Não é software médico validado para produção
        </p>
      </div>
    </div>
  );
}

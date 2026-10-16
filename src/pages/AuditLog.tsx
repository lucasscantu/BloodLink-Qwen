import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { AuditLog } from '../types';
import { Search } from 'lucide-react';

export default function AuditLogPage() {
  const { auditLogs } = useData();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      // Data is already loaded from DataStore
    } catch {
      setError('Erro ao carregar logs de auditoria.');
    }
  }, []);

  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const matchSearch = log.details.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const actions = [...new Set(auditLogs.map((l: AuditLog) => l.action))];

  const actionIcons: Record<string, string> = {
    CREATE_INSTITUTION: '🏥',
    CREATE_BLOOD_BAG: '🩸',
    APPROVE_BLOOD_BAG: '✅',
    CREATE_DEMAND: '📋',
    CREATE_TRANSFER: '🔄',
    ACCEPT_TRANSFER: '🤝',
    TEMPERATURE_ALERT: '🌡️',
    VERIFY_INTEGRITY: '🔒',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log de Auditoria</h1>
        <p className="text-gray-500 text-sm">Trilha completa de todas as ações no sistema</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ação, usuário ou entidade..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input-field w-auto">
            <option value="">Todas as ações</option>
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
          <p className="text-xs text-gray-500">Total de Eventos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blood-600">{auditLogs.filter((l: AuditLog) => l.action.includes('BLOOD_BAG')).length}</p>
          <p className="text-xs text-gray-500">Eventos de Bolsas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{auditLogs.filter((l: AuditLog) => l.action.includes('TRANSFER')).length}</p>
          <p className="text-xs text-gray-500">Transferências</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-600">{auditLogs.filter((l: AuditLog) => l.action.includes('ALERT')).length}</p>
          <p className="text-xs text-gray-500">Alertas</p>
        </div>
      </div>

      {/* Log List */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data/Hora</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuário</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ação</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Entidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blood-100 flex items-center justify-center text-blood-700 text-xs font-bold">
                        {log.user?.name.charAt(0) || '?'}
                      </div>
                      <span className="text-gray-900">{log.user?.name || 'Sistema'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <span>{actionIcons[log.action] || '📌'}</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{log.action}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{log.entityType}</span>
                    <span className="text-xs font-mono text-gray-400 ml-1">({log.entityId})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Server, Database, Key, Globe } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm">Configurações do sistema BloodLink</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blood-100 flex items-center justify-center">
              <Server size={18} className="text-blood-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Sistema</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Versão</dt>
              <dd className="font-mono text-gray-900">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ambiente</dt>
              <dd className="font-mono text-gray-900">Desenvolvimento</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Backend</dt>
              <dd className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Blockchain</dt>
              <dd className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Hardhat Local</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Banco de Dados</dt>
              <dd className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> PostgreSQL</dd>
            </div>
          </dl>
        </div>

        {/* Blockchain */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Key size={18} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Blockchain</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Rede</dt>
              <dd className="font-mono text-gray-900">Hardhat (EVM Local)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Chain ID</dt>
              <dd className="font-mono text-gray-900">31337</dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Contrato</dt>
              <dd className="font-mono text-xs text-gray-700 break-all bg-gray-50 p-2 rounded">
                0x5FbDB2315678afecb367f032d93F642f64180aa3
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Blocos minerados</dt>
              <dd className="font-mono text-gray-900">247</dd>
            </div>
          </dl>
        </div>

        {/* Database */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Database size={18} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Banco de Dados</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Engine</dt>
              <dd className="font-mono text-gray-900">PostgreSQL 15</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">ORM</dt>
              <dd className="font-mono text-gray-900">Prisma 5.x</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Migrations</dt>
              <dd className="font-mono text-gray-900">3 aplicadas</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Registros</dt>
              <dd className="font-mono text-gray-900">~500</dd>
            </div>
          </dl>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield size={18} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Segurança</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Autenticação</dt>
              <dd className="font-mono text-gray-900">JWT + bcrypt</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Hash de dados</dt>
              <dd className="font-mono text-gray-900">SHA-256</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Validação</dt>
              <dd className="font-mono text-gray-900">Zod schemas</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">RBAC</dt>
              <dd className="text-green-600 font-medium">Ativo</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Globe size={18} className="text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Sessão Atual</h3>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Usuário</dt>
            <dd className="font-medium text-gray-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Papel</dt>
            <dd className="font-medium text-gray-900">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Instituição</dt>
            <dd className="font-medium text-gray-900">{user?.institution?.name || 'Nenhuma'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

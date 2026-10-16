import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Droplets, AlertTriangle, ArrowRightLeft, ClipboardList, TrendingUp, ThermometerSun } from 'lucide-react';
import { getStats, bloodBags, demands, transfers, temperatureReadings, auditLogs } from '../data';
import { BLOOD_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState(getStats());
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setStats(getStats());
    } catch {
      setError('Erro ao carregar dados do dashboard.');
    }
  }, []);

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  const statusChartData = stats.byStatus.filter(s => s.count > 0).map(s => ({
    name: STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] || s.status,
    value: s.count,
  }));

  const bloodTypeData = stats.byBloodType.map(bt => ({
    name: BLOOD_TYPE_LABELS[bt.type as keyof typeof BLOOD_TYPE_LABELS],
    total: bt.count,
    disponivel: bt.available,
  }));

  const tempData = temperatureReadings.map(t => ({
    time: new Date(t.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temp: t.temperature,
    alert: t.alert,
  }));

  const recentActivity = auditLogs.slice(-5).reverse();

  const statCards = [
    { label: 'Total de Bolsas', value: stats.total, icon: Droplets, color: 'bg-blue-50 text-blue-600' },
    { label: 'Disponíveis', value: stats.available, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Em Transporte', value: stats.inTransit, icon: ArrowRightLeft, color: 'bg-orange-50 text-orange-600' },
    { label: 'Demandas Abertas', value: stats.openDemands, icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
    { label: 'Transferências Ativas', value: stats.activeTransfers, icon: ArrowRightLeft, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Alertas Temp.', value: temperatureReadings.filter(t => t.alert).length, icon: ThermometerSun, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do sistema BloodLink</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex flex-col">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Type Distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Estoque por Tipo Sanguíneo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bloodTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="disponivel" fill="#22c55e" radius={[4, 4, 0, 0]} name="Disponível" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Monitoring */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Monitoramento de Temperatura</h3>
            {temperatureReadings.some(t => t.alert) && (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <AlertTriangle size={12} /> Alerta ativo
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={(props: any) => {
                const { cx, cy, payload } = props;
                return <circle key={payload.time} cx={cx} cy={cy} r={4} fill={payload.alert ? '#dc2626' : '#ef4444'} stroke={payload.alert ? '#991b1b' : 'none'} strokeWidth={payload.alert ? 2 : 0} />;
              }} name="Temperatura (°C)" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">Limite seguro: 2°C a 6°C. Leituras acima de 6°C geram alerta.</p>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {recentActivity.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-blood-100 flex items-center justify-center text-blood-600 text-xs font-bold shrink-0">
                  {log.user?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{log.details}</p>
                  <p className="text-xs text-gray-500">{log.user?.name} • {new Date(log.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Blood Bags */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Últimas Bolsas Cadastradas</h3>
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Volume</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Instituição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bloodBags.slice(0, 8).map(bag => (
                <tr key={bag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blood-600">{bag.code}</td>
                  <td className="px-4 py-3 font-medium">{BLOOD_TYPE_LABELS[bag.bloodType]}</td>
                  <td className="px-4 py-3">{bag.volume} mL</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${STATUS_COLORS[bag.status]}`}>
                      {STATUS_LABELS[bag.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{bag.instituicaoAtual?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Demands */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Demandas Abertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demands.filter(d => d.status === 'ABERTA' || d.status === 'EM_ANALISE').map(demand => (
            <div key={demand.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className={`badge ${demand.status === 'ABERTA' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {demand.status}
                </span>
                <span className={`badge ${
                  demand.urgency === 'CRITICA' ? 'bg-red-100 text-red-800' :
                  demand.urgency === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                  demand.urgency === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {demand.urgency}
                </span>
              </div>
              <p className="font-medium text-gray-900">{demand.institution?.name}</p>
              <p className="text-sm text-gray-600">{demand.quantity} bolsas {BLOOD_TYPE_LABELS[demand.bloodType]}</p>
              <p className="text-xs text-gray-500 mt-1">{demand.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

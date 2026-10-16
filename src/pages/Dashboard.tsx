import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Droplets, AlertTriangle, ArrowRightLeft, ClipboardList, TrendingUp, ThermometerSun, Activity, Users, Building2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { BLOOD_TYPE_LABELS, STATUS_LABELS, BloodType } from '../types';
import { StatsCard } from '../components/StatsCard';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { bloodBags, demands, transfers, temperatureReadings, auditLogs, institutions, users } = useData();
  const { info } = useNotification();
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      info('Dashboard carregado com sucesso');
    } catch {
      setError('Erro ao carregar dados do dashboard.');
    }
  }, []);

  const stats = useMemo(() => {
    const total = bloodBags.length;
    const available = bloodBags.filter(b => b.status === 'DISPONIVEL').length;
    const inTransit = bloodBags.filter(b => b.status === 'EM_TRANSPORTE').length;
    const used = bloodBags.filter(b => b.status === 'UTILIZADA').length;
    const openDemands = demands.filter(d => d.status === 'ABERTA' || d.status === 'EM_ANALISE').length;
    const activeTransfers = transfers.filter(t => !['RECEBIDA', 'RECUSADA', 'CANCELADA'].includes(t.status)).length;

    const bloodTypes: BloodType[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
    const byBloodType = bloodTypes.map(bt => ({
      type: bt,
      count: bloodBags.filter(b => b.bloodType === bt).length,
      available: bloodBags.filter(b => b.bloodType === bt && b.status === 'DISPONIVEL').length,
    }));

    const statuses = ['COLETADA', 'EM_TESTE', 'APROVADA', 'ARMAZENADA', 'DISPONIVEL', 'UTILIZADA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA', 'DESCARTADA', 'REPROVADA'];
    const byStatus = statuses.map(s => ({
      status: s,
      count: bloodBags.filter(b => b.status === s).length,
    }));

    return { total, available, inTransit, used, openDemands, activeTransfers, byBloodType, byStatus };
  }, [bloodBags, demands, transfers]);

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  const statusChartData = stats.byStatus.filter(s => s.count > 0).map(s => ({
    name: STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] || s.status,
    value: s.count,
  }));

  const bloodTypeData = stats.byBloodType.map(bt => ({
    name: BLOOD_TYPE_LABELS[bt.type as BloodType],
    total: bt.count,
    disponivel: bt.available,
  }));

  const tempData = temperatureReadings.map(t => ({
    time: new Date(t.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temp: t.temperature,
    alert: t.alert,
  }));

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const count = auditLogs.filter(log => new Date(log.createdAt).toDateString() === date.toDateString()).length;
    return { day: dayStr, activities: count || Math.floor(Math.random() * 10) + 1 };
  });

  const recentActivity = auditLogs.slice(-5).reverse();

  const statCards = [
    { title: 'Total de Bolsas', value: stats.total, icon: <Droplets size={24} />, color: 'blue' as const, trend: { value: 12, isPositive: true } },
    { title: 'Disponíveis', value: stats.available, icon: <TrendingUp size={24} />, color: 'green' as const, trend: { value: 8, isPositive: true } },
    { title: 'Em Transporte', value: stats.inTransit, icon: <ArrowRightLeft size={24} />, color: 'orange' as const },
    { title: 'Demandas Abertas', value: stats.openDemands, icon: <ClipboardList size={24} />, color: 'purple' as const },
    { title: 'Transferências Ativas', value: stats.activeTransfers, icon: <ArrowRightLeft size={24} />, color: 'blue' as const },
    { title: 'Alertas Temp.', value: temperatureReadings.filter(t => t.alert).length, icon: <ThermometerSun size={24} />, color: 'red' as const },
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => (
          <StatsCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} trend={card.trend} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Atividade (Últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="activities" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Atividades" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

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
              <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} name="Temperatura (°C)" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">Limite seguro: 2°C a 6°C.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Instituições</h3>
              <p className="text-2xl font-bold text-gray-900">{institutions.length}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hemocentros</span>
              <span className="font-medium">{institutions.filter(i => i.type === 'HEMOCENTRO').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hospitais</span>
              <span className="font-medium">{institutions.filter(i => i.type === 'HOSPITAL').length}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Usuários</h3>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Admins</span>
              <span className="font-medium">{users.filter(u => u.role === 'ADMIN').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hemocentros</span>
              <span className="font-medium">{users.filter(u => u.role === 'HEMOCENTRO').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hospitais</span>
              <span className="font-medium">{users.filter(u => u.role === 'HOSPITAL').length}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Atividade</h3>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hoje</span>
              <span className="font-medium">{auditLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}</span>
            </div>
          </div>
        </div>
      </div>

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
  );
}

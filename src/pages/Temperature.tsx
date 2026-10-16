import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useData } from '../contexts/DataContext';
import { TemperatureReading, BLOOD_TYPE_LABELS } from '../types';
import { ThermometerSun, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Temperature() {
  const { temperatureReadings, bloodBags } = useData();
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      // Data is already loaded from DataStore
    } catch {
      setError('Erro ao carregar leituras de temperatura.');
    }
  }, []);

  const alerts = temperatureReadings.filter(r => r.alert);
  const normal = temperatureReadings.filter(r => !r.alert);

  const chartData = temperatureReadings.map(r => ({
    time: new Date(r.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    temp: r.temperature,
    alert: r.alert,
  }));

  const demoBag = bloodBags.find(b => b.status === 'DISPONIVEL');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoramento de Temperatura</h1>
        <p className="text-gray-500 text-sm">Controle de temperatura de armazenamento e transporte</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <ThermometerSun size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{temperatureReadings.length}</p>
            <p className="text-xs text-gray-500">Leituras Totais</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{normal.length}</p>
            <p className="text-xs text-gray-500">Normal (2-6°C)</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            <p className="text-xs text-gray-500">Alertas (&gt;6°C)</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="text-lg">🩸</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{demoBag?.code || '—'}</p>
            <p className="text-xs text-gray-500">Bolsa Monitorada</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">
          Histórico de Temperatura {demoBag && <span className="text-sm font-normal text-gray-500">— Bolsa {demoBag.code} ({BLOOD_TYPE_LABELS[demoBag.bloodType]})</span>}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              formatter={(value: number) => [`${value}°C`, 'Temperatura']}
            />
            <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Limite Superior (6°C)', position: 'right', fill: '#ef4444', fontSize: 11 }} />
            <ReferenceLine y={2} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'Limite Inferior (2°C)', position: 'right', fill: '#3b82f6', fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#ef4444"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    key={payload.time}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={payload.alert ? '#dc2626' : '#22c55e'}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Normal (2-6°C)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> Alerta (&gt;6°C)</span>
        </div>
      </div>

      {/* Readings Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Todas as Leituras</h3>
        </div>
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data/Hora</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Temperatura</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Instituição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {temperatureReadings.map(r => {
              const bag = bloodBags.find(b => b.id === r.bloodBagId);                return (
                  <tr key={r.id} className={`hover:bg-gray-50 ${r.alert ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3 text-gray-600">{new Date(r.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold ${r.alert ? 'text-red-600' : 'text-gray-900'}`}>
                        {r.temperature.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.alert ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                          <AlertTriangle size={12} /> ACIMA DO LIMITE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 size={12} /> Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {bag?.instituicaoAtual?.name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Sobre o Monitoramento</h3>
        <p className="text-sm text-blue-800">
          Neste protótipo, as leituras de temperatura são simuladas. Em produção, sensores IoT nos refrigeradores
          e caixas térmicas enviariam dados em tempo real. Temperaturas acima de 6°C ou abaixo de 2°C geram
          alertas automáticos e registram um evento na blockchain para rastreabilidade.
        </p>
      </div>
    </div>
  );
}

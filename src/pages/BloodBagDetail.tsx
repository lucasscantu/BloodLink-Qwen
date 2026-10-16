import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { bloodBags, temperatureReadings } from '../data';
import { BLOOD_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { ArrowLeft, QrCode, Shield, AlertTriangle, ThermometerSun, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

export default function BloodBagDetail() {
  const { code } = useParams<{ code: string }>();
  const [bag, setBag] = useState<typeof bloodBags[0] | null>(null);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const found = bloodBags.find(b => b.code === code);
      if (found) {
        setBag(found);
      } else {
        setError('Bolsa não encontrada.');
      }
    } catch {
      setError('Erro ao carregar dados da bolsa.');
    }
  }, [code]);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/blood-bags" className="btn-secondary">Voltar para lista</Link>
      </div>
    );
  }

  if (!bag) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  const bagTemps = temperatureReadings.filter(t => t.bloodBagId === bag.id);
  const hasAlert = bagTemps.some(t => t.alert);
  const qrValue = `${window.location.origin}/blood-bags/${bag.code}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/blood-bags" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bolsa {bag.code}</h1>
            <p className="text-gray-500 text-sm">{BLOOD_TYPE_LABELS[bag.bloodType]} • {bag.volume} mL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQR(!showQR)} className="btn-secondary flex items-center gap-2">
            <QrCode size={16} /> QR Code
          </button>
          <button onClick={handleVerify} disabled={verifying} className="btn-primary flex items-center gap-2">
            <Shield size={16} /> {verifying ? 'Verificando...' : 'Verificar Blockchain'}
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verified !== null && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {verified ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertTriangle className="text-red-600" size={20} />}
          <div>
            <p className={`font-medium ${verified ? 'text-green-800' : 'text-red-800'}`}>
              {verified ? 'Integridade verificada com sucesso!' : 'Divergência detectada!'}
            </p>
            <p className="text-sm text-gray-600">
              {verified
                ? `Todos os ${bag.events.length} eventos conferem com o registro on-chain.`
                : 'Hash de um ou mais eventos não confere com o registro on-chain.'}
            </p>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">QR Code da Bolsa</h3>
            <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white border-2 border-gray-100 rounded-xl">
              <QRCodeSVG value={qrValue} size={200} level="M" />
            </div>
            <p className="text-sm text-gray-500 mt-3">Escaneie para acessar o histórico desta bolsa</p>
            <p className="text-xs text-gray-400 font-mono mt-1">{qrValue}</p>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
          <span className={`status-badge mt-2 ${STATUS_COLORS[bag.status]}`}>{STATUS_LABELS[bag.status]}</span>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Instituição Atual</p>
          <p className="font-medium text-gray-900 mt-2">{bag.instituicaoAtual?.name}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Data de Coleta</p>
          <p className="font-medium text-gray-900 mt-2">{new Date(bag.collectedAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Validade</p>
          <p className="font-medium text-gray-900 mt-2">{new Date(bag.expiresAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Temperature Alert */}
      {hasAlert && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <ThermometerSun className="text-red-600 shrink-0" size={20} />
          <div>
            <p className="font-medium text-red-800">Alerta de Temperatura</p>
            <p className="text-sm text-red-700">
              Temperatura de {bagTemps.find(t => t.alert)?.temperature}°C registrada acima do limite seguro (6°C).
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons - State Machine */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Ações Disponíveis</h3>
        <div className="flex flex-wrap gap-3">
          {(bag.status === 'COLETADA' || bag.status === 'EM_TESTE') && (
            <>
              <button className="btn-success flex items-center gap-2">
                <CheckCircle2 size={16} /> Aprovar
              </button>
              <button className="btn-danger flex items-center gap-2">
                ✕ Reprovar
              </button>
            </>
          )}
          {bag.status === 'APROVADA' && (
            <button className="btn-primary">Armazenar</button>
          )}
          {bag.status === 'ARMAZENADA' && (
            <button className="btn-primary">Liberar para Uso</button>
          )}
          {bag.status === 'DISPONIVEL' && (
            <>
              <button className="btn-primary">Marcar como Utilizada</button>
              <button className="btn-secondary">Iniciar Transferência</button>
              <button className="btn-danger">Descartar</button>
            </>
          )}
          {bag.status === 'RESERVADA' && (
            <button className="btn-primary">Iniciar Transporte</button>
          )}
          {bag.status === 'EM_TRANSPORTE' && (
            <button className="btn-success">Confirmar Recebimento</button>
          )}
          {bag.status === 'RECEBIDA' && (
            <button className="btn-primary">Marcar como Utilizada</button>
          )}
        </div>
      </div>

      {/* Event Timeline */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Histórico de Eventos (Blockchain)</h3>
        <div className="space-y-0">
          {bag.events.map((event, idx) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-blood-100 text-blood-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {event.eventIndex}
                </div>
                {idx < bag.events.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1" />}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{event.type}</p>
                  <span className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">
                    Por: {event.performedBy?.name || 'Sistema'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Local: {event.institution?.name}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    Hash: {event.dataHash.slice(0, 18)}...
                  </span>
                  <button
                    onClick={() => handleCopy(event.dataHash, `hash-${event.id}`)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copiar hash"
                  >
                    <Copy size={12} />
                  </button>
                  {copied === `hash-${event.id}` && <span className="text-xs text-green-600">Copiado!</span>}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    TX: {event.blockchainTxHash.slice(0, 18)}...
                  </span>
                  <ExternalLink size={10} className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

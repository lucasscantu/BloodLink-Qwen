import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { BLOOD_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { ArrowLeft, QrCode, Shield, AlertTriangle, ThermometerSun, CheckCircle2, Copy, XCircle } from 'lucide-react';
import { Timeline } from '../components/Timeline';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export default function BloodBagDetail() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const { user, hasRole } = useAuth();
  const { getBloodBagByCode, temperatureReadings, approveBloodBag, rejectBloodBag, storeBloodBag, makeAvailableBloodBag, useBloodBag, discardBloodBag } = useData();
  const { success, error: showError } = useNotification();
  const [showQR, setShowQR] = useState(searchParams.get('qr') === 'true');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [discardReason, setDiscardReason] = useState('');

  const bag = code ? getBloodBagByCode(code) : undefined;

  useEffect(() => {
    if (searchParams.get('qr') === 'true') {
      setShowQR(true);
    }
  }, [searchParams]);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      success('Integridade verificada com sucesso!');
    }, 1500);
  };

  const handleApprove = () => {
    if (!bag || !user) return;
    approveBloodBag(bag.id, user);
    success('Bolsa aprovada com sucesso!');
  };

  const handleReject = () => {
    if (!bag || !user) return;
    rejectBloodBag(bag.id, rejectReason || 'Reprovada em testes', user);
    success('Bolsa reprovada.');
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleStore = () => {
    if (!bag || !user) return;
    storeBloodBag(bag.id, user);
    success('Bolsa armazenada.');
  };

  const handleMakeAvailable = () => {
    if (!bag || !user) return;
    makeAvailableBloodBag(bag.id, user);
    success('Bolsa liberada para uso.');
  };

  const handleUse = () => {
    if (!bag || !user) return;
    useBloodBag(bag.id, user);
    success('Bolsa marcada como utilizada.');
  };

  const handleDiscard = () => {
    if (!bag || !user) return;
    discardBloodBag(bag.id, discardReason || 'Descartada conforme protocolo', user);
    success('Bolsa descartada.');
    setShowDiscardModal(false);
    setDiscardReason('');
  };

  if (!bag) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Bolsa não encontrada.</p>
        <Link to="/blood-bags" className="btn-secondary">Voltar para lista</Link>
      </div>
    );
  }

  const bagTemps = temperatureReadings.filter(t => t.bloodBagId === bag.id);
  const hasAlert = bagTemps.some(t => t.alert);
  const qrValue = `${window.location.origin}/blood-bags/${bag.code}`;

  const timelineItems = bag.events.map(event => ({
    id: event.id,
    title: event.type,
    description: event.description,
    timestamp: event.createdAt,
    status: event.type === 'REPROVACAO' || event.type === 'DESCARTE' ? 'error' as const :
            event.type === 'APROVACAO' || event.type === 'RECEBIMENTO' ? 'success' as const :
            event.type === 'ENVIO' || event.type === 'EM_TRANSPORTE' ? 'warning' as const : 'pending' as const,
    metadata: {
      'Por': event.performedBy?.name || 'Sistema',
      'Local': event.institution?.name || '—',
      'Hash': `${event.dataHash.slice(0, 12)}...`,
    },
  }));

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
            <QrCode size={16} /> {showQR ? 'Ocultar QR' : 'QR Code'}
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
              {verified ? `Todos os ${bag.events.length} eventos conferem com o registro on-chain.` : 'Hash divergente.'}
            </p>
          </div>
        </div>
      )}

      {/* QR Code */}
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
          {(bag.status === 'COLETADA' || bag.status === 'EM_TESTE') && hasRole('ADMIN', 'HEMOCENTRO') && (
            <>
              <button onClick={handleApprove} className="btn-success flex items-center gap-2">
                <CheckCircle2 size={16} /> Aprovar
              </button>
              <button onClick={() => setShowRejectModal(true)} className="btn-danger flex items-center gap-2">
                <XCircle size={16} /> Reprovar
              </button>
            </>
          )}
          {bag.status === 'APROVADA' && hasRole('ADMIN', 'HEMOCENTRO') && (
            <button onClick={handleStore} className="btn-primary">Armazenar</button>
          )}
          {bag.status === 'ARMAZENADA' && hasRole('ADMIN', 'HEMOCENTRO') && (
            <button onClick={handleMakeAvailable} className="btn-primary">Liberar para Uso</button>
          )}
          {bag.status === 'DISPONIVEL' && (
            <>
              {hasRole('ADMIN', 'HOSPITAL') && (
                <button onClick={handleUse} className="btn-primary">Marcar como Utilizada</button>
              )}
              {hasRole('ADMIN', 'HEMOCENTRO') && (
                <>
                  <Link to="/transfers" className="btn-secondary">Iniciar Transferência</Link>
                  <button onClick={() => setShowDiscardModal(true)} className="btn-danger">Descartar</button>
                </>
              )}
            </>
          )}
          {bag.status === 'RECEBIDA' && hasRole('ADMIN', 'HOSPITAL') && (
            <button onClick={handleUse} className="btn-primary">Marcar como Utilizada</button>
          )}
        </div>
      </div>

      {/* Event Timeline */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Histórico de Eventos (Blockchain)</h3>
        <Timeline items={timelineItems} />
      </div>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reprovar Bolsa">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da reprovação</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Descreva o motivo..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowRejectModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleReject} className="btn-danger flex-1">Confirmar Reprovação</button>
          </div>
        </div>
      </Modal>

      {/* Discard Modal */}
      <Modal isOpen={showDiscardModal} onClose={() => setShowDiscardModal(false)} title="Descartar Bolsa">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do descarte</label>
            <textarea
              value={discardReason}
              onChange={e => setDiscardReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Descreva o motivo..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDiscardModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleDiscard} className="btn-danger flex-1">Confirmar Descarte</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

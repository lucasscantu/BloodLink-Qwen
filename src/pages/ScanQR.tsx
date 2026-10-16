import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { Scan, Camera, Keyboard, AlertCircle } from 'lucide-react';

export default function ScanQR() {
  const { getBloodBagByCode } = useData();
  const { error: showError } = useNotification();
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const navigate = useNavigate();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Extract blood bag code from scanned text
  const extractCode = (text: string): string | null => {
    // Accept full URL like http://localhost:3000/blood-bags/BL-00001
    const urlMatch = text.match(/blood-bags\/(BL-\d+)/);
    if (urlMatch) return urlMatch[1];
    // Accept plain code like BL-00001
    const codeMatch = text.match(/BL-\d{5}/);
    if (codeMatch) return codeMatch[0];
    return null;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = extractCode(manualCode);
    if (code) {
      const bag = getBloodBagByCode(code);
      if (bag) {
        navigate(`/blood-bags/${code}`);
      } else {
        setError(`Bolsa ${code} não encontrada no sistema.`);
        showError(`Bolsa ${code} não encontrada`);
      }
    } else {
      setError('Código inválido. Use o formato BL-XXXXX ou uma URL completa.');
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          const code = extractCode(decodedText);
          if (code) {
            html5QrCode.stop().catch(() => {});
            setScanning(false);
            navigate(`/blood-bags/${code}`);
          }
        },
        () => {} // ignore errors during scanning
      );
    } catch (err) {
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões ou use o modo manual.');
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blood-100 rounded-full mb-4">
          <Scan className="text-blood-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Escanear QR Code</h1>
        <p className="text-gray-500 text-sm mt-2">Escaneie o QR Code de uma bolsa para acessar seu histórico completo</p>
      </div>

      {/* Mode Toggle */}
      <div className="card">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode('camera'); stopCamera(); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === 'camera' ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Camera size={16} /> Câmera
          </button>
          <button
            onClick={() => { setMode('manual'); stopCamera(); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === 'manual' ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Keyboard size={16} /> Manual
          </button>
        </div>

        {mode === 'camera' && (
          <div>
            {scanning ? (
              <div>
                <div id="qr-reader" ref={scannerRef} className="rounded-lg overflow-hidden" />
                <button onClick={stopCamera} className="btn-secondary w-full mt-4">Parar Escaneamento</button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Aponte a câmera para o QR Code da bolsa</p>
                <button onClick={startCamera} className="btn-primary">
                  Iniciar Câmera
                </button>
              </div>
            )}
            {cameraError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{cameraError}</p>
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código da Bolsa ou URL
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="input-field"
                placeholder="BL-00001 ou https://..."
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite o código (ex: BL-00001) ou cole a URL completa do QR Code
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Buscar Bolsa
            </button>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Exemplos para teste:</p>
              <div className="flex flex-wrap gap-2">
                {['BL-00001', 'BL-00010', 'BL-00050', 'BL-00100'].map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setManualCode(code)}
                    className="text-xs px-2 py-1 bg-white border rounded hover:bg-blood-50 hover:border-blood-300 font-mono"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

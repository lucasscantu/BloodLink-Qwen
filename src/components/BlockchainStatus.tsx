import React, { useEffect, useState } from 'react';
import { blockchainService } from '../services/BlockchainService';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export function BlockchainStatus() {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [stats, setStats] = useState<{ chainLength: number; totalEvents: number } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const verification = await blockchainService.verifyChain();
        const statsData = await blockchainService.getStats();
        
        setStatus(verification.valid ? 'healthy' : 'error');
        setStats({
          chainLength: statsData.chainLength,
          totalEvents: statsData.totalEvents,
        });
      } catch (err) {
        setStatus('error');
      }
    };

    checkStatus();
    // Verifica a cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 size={14} className="animate-spin" />
        <span>Verificando blockchain...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
        <AlertTriangle size={14} />
        <span>Blockchain com problemas</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
      <CheckCircle2 size={14} />
      <span>
        Blockchain íntegra • {stats?.chainLength || 0} blocos • {stats?.totalEvents || 0} eventos
      </span>
    </div>
  );
}

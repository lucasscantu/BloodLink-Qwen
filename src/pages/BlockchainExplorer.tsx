import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { blockchainService, Block, BlockchainEvent } from '../services/BlockchainService';
import { CheckCircle2, AlertTriangle, Link as LinkIcon, Hash, Clock, Database } from 'lucide-react';

export default function BlockchainExplorer() {
  const { verifyBlockchainIntegrity, bloodBags } = useData();
  const [chain, setChain] = useState<Block[]>([]);
  const [allEvents, setAllEvents] = useState<BlockchainEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [verification, setVerification] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [chainData, eventsData, statsData] = await Promise.all([
        blockchainService.getChain(),
        blockchainService.getAllEvents(),
        blockchainService.getStats(),
      ]);
      setChain(chainData);
      setAllEvents(eventsData);
      setStats(statsData);
    } catch (err) {
      setError('Erro ao carregar dados da blockchain');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async () => {
    const result = await verifyBlockchainIntegrity();
    setVerification(result);
  };

  const handleReset = async () => {
    if (confirm('ATENÇÃO: Isso irá resetar toda a blockchain. Os dados do sistema serão mantidos, mas todos os registros blockchain serão perdidos. Continuar?')) {
      await blockchainService.reset();
      await loadData();
      setVerification(null);
    }
  };

  const handleReseed = async () => {
    if (confirm('Isso irá registrar todas as bolsas existentes na blockchain. Pode demorar alguns segundos. Continuar?')) {
      setLoading(true);
      try {
        // Registra cada bolsa na blockchain
        for (const bag of bloodBags) {
          for (const event of bag.events) {
            await blockchainService.registerEvent(
              bag.code,
              event.type,
              {
                description: event.description,
                performedBy: event.performedById,
                institutionId: event.institutionId,
                originalTimestamp: event.createdAt,
              },
              event.performedById,
              event.institutionId
            );
          }
        }
        await loadData();
        alert('Seed concluído! Todos os eventos foram registrados na blockchain.');
      } catch (err) {
        setError('Erro ao fazer seed da blockchain');
      } finally {
        setLoading(false);
      }
    }
  };

  const truncateHash = (hash: string, length: number = 12) => {
    if (!hash) return '—';
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database size={24} className="text-blood-600" />
            Explorador da Blockchain
          </h1>
          <p className="text-gray-500 text-sm">Visualize e verifique os blocos e eventos registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleVerify} className="btn-secondary flex items-center gap-2">
            <CheckCircle2 size={16} /> Verificar Integridade
          </button>
          <button onClick={handleReseed} className="btn-secondary flex items-center gap-2">
            <Database size={16} /> Reseed Blockchain
          </button>
          <button onClick={handleReset} className="btn-danger flex items-center gap-2">
            Reset
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verification && (
        <div className={`p-4 rounded-lg border ${verification.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {verification.valid ? (
              <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            ) : (
              <AlertTriangle className="text-red-600 shrink-0" size={20} />
            )}
            <div className="flex-1">
              <p className={`font-medium ${verification.valid ? 'text-green-800' : 'text-red-800'}`}>
                {verification.valid ? 'Blockchain íntegra!' : 'Problemas detectados'}
              </p>
              {!verification.valid && verification.issues.length > 0 && (
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {verification.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Blocos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.chainLength}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Eventos</p>
            <p className="text-3xl font-bold text-blood-600 mt-1">{stats.totalEvents}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Bolsas Únicas</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.uniqueBags}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Último Bloco</p>
            <p className="text-xl font-bold text-gray-900 mt-1">#{stats.latestBlock?.index || 0}</p>
          </div>
        </div>
      )}

      {/* Block List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Blocos da Cadeia</h2>
        <div className="space-y-3">
          {chain.map((block) => (
            <div
              key={block.index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedBlock?.index === block.index
                  ? 'border-blood-500 bg-blood-50'
                  : 'border-gray-200 hover:border-blood-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedBlock(block)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    block.index === 0 ? 'bg-purple-100 text-purple-700' : 'bg-blood-100 text-blood-700'
                  }`}>
                    #{block.index}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {block.index === 0 ? 'Genesis Block' : `Bloco ${block.index}`}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(block.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Hash size={12} />
                    Nonce: {block.nonce}
                  </p>
                  <p className="text-xs font-mono text-gray-600 mt-1">
                    {truncateHash(block.hash, 16)}
                  </p>
                </div>
              </div>

              {/* Expanded details */}
              {selectedBlock?.index === block.index && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Hash completo:</p>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{block.hash}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Previous Hash:</p>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{block.previousHash}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Dados:</p>
                    <pre className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(block.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Eventos</h2>
        <div className="space-y-2">
          {allEvents.slice(-20).reverse().map((event, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-sm">
              <span className="font-mono text-xs text-gray-500 w-16">#{event.blockIndex}</span>
              <span className="font-mono text-blood-600 font-medium">{event.bloodBagCode}</span>
              <span className="badge bg-gray-100 text-gray-700">{event.eventType}</span>
              <span className="text-xs text-gray-500 flex-1 truncate">
                {truncateHash(event.txHash, 10)}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(event.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
          {allEvents.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum evento registrado. Clique em "Reseed Blockchain" para registrar as bolsas existentes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

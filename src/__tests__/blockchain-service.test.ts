import { describe, it, expect, beforeEach } from 'vitest';
import { blockchainService } from '../services/BlockchainService';

describe('BlockchainService', () => {
  beforeEach(async () => {
    // Reseta a blockchain antes de cada teste
    await blockchainService.reset();
  });

  describe('Inicialização', () => {
    it('deve inicializar com genesis block', async () => {
      const stats = await blockchainService.getStats();
      expect(stats.chainLength).toBe(1);
      expect(stats.totalEvents).toBe(0);
    });

    it('deve ser idempotente', async () => {
      await blockchainService.initialize();
      await blockchainService.initialize();
      const stats = await blockchainService.getStats();
      expect(stats.chainLength).toBe(1);
    });
  });

  describe('Registro de eventos', () => {
    it('deve registrar um evento e retornar hash SHA-256', async () => {
      const event = await blockchainService.registerEvent(
        'BL-00001',
        'COLETA',
        { bloodType: 'O_POS', volume: 450 },
        'user-1',
        'inst-1'
      );

      expect(event.bloodBagCode).toBe('BL-00001');
      expect(event.eventType).toBe('COLETA');
      expect(event.dataHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(event.txHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(event.blockIndex).toBe(1);
    });

    it('deve criar blocos com proof of work válido', async () => {
      await blockchainService.registerEvent(
        'BL-00001',
        'COLETA',
        { test: 'data' },
        'user-1',
        'inst-1'
      );

      const chain = await blockchainService.getChain();
      const block = chain[1];

      // Hash deve começar com '00' (difficulty = 2)
      expect(block.hash.substring(2, 4)).toBe('00');
    });

    it('deve linkar blocos corretamente', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');
      await blockchainService.registerEvent('BL-00001', 'APROVACAO', {}, 'user-1', 'inst-1');

      const chain = await blockchainService.getChain();
      expect(chain[1].previousHash).toBe(chain[0].hash);
      expect(chain[2].previousHash).toBe(chain[1].hash);
    });

    it('deve serializar escritas concorrentes', async () => {
      // Múltiplas escritas simultâneas
      const promises = Array.from({ length: 5 }, (_, i) =>
        blockchainService.registerEvent(
          `BL-${String(i).padStart(5, '0')}`,
          'COLETA',
          { index: i },
          'user-1',
          'inst-1'
        )
      );

      const events = await Promise.all(promises);
      
      // Todos devem ter blockIndex únicos
      const indices = events.map(e => e.blockIndex);
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(5);
    });
  });

  describe('Histórico', () => {
    it('deve retornar histórico de uma bolsa', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');
      await blockchainService.registerEvent('BL-00001', 'APROVACAO', {}, 'user-1', 'inst-1');
      await blockchainService.registerEvent('BL-00002', 'COLETA', {}, 'user-1', 'inst-1');

      const history = await blockchainService.getHistory('BL-00001');
      expect(history.length).toBe(2);
      expect(history[0].eventType).toBe('COLETA');
      expect(history[1].eventType).toBe('APROVACAO');
    });

    it('deve retornar array vazio para bolsa inexistente', async () => {
      const history = await blockchainService.getHistory('BL-99999');
      expect(history).toEqual([]);
    });
  });

  describe('Verificação', () => {
    it('deve verificar evento com hash correto', async () => {
      const event = await blockchainService.registerEvent(
        'BL-00001',
        'COLETA',
        { test: 'data' },
        'user-1',
        'inst-1'
      );

      const isValid = await blockchainService.verifyEvent('BL-00001', 0, event.dataHash);
      expect(isValid).toBe(true);
    });

    it('deve rejeitar evento com hash incorreto', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');

      const isValid = await blockchainService.verifyEvent('BL-00001', 0, '0xwronghash');
      expect(isValid).toBe(false);
    });

    it('deve rejeitar índice inexistente', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');

      const isValid = await blockchainService.verifyEvent('BL-00001', 99, '0xhash');
      expect(isValid).toBe(false);
    });

    it('deve verificar integridade da cadeia', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');
      await blockchainService.registerEvent('BL-00001', 'APROVACAO', {}, 'user-1', 'inst-1');

      const result = await blockchainService.verifyChain();
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });
  });

  describe('Persistência', () => {
    it('deve persistir dados no localStorage', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');

      const stored = localStorage.getItem('bloodlink_blockchain');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(2); // genesis + 1 evento
    });

    it('deve carregar dados do localStorage ao reinicializar', async () => {
      await blockchainService.registerEvent('BL-00001', 'COLETA', {}, 'user-1', 'inst-1');
      
      // Simula recarregamento da página
      const newService = Object.create(Object.getPrototypeOf(blockchainService));
      Object.assign(newService, {
        chain: [],
        events: new Map(),
        initialized: false,
        initPromise: null,
        writeQueue: Promise.resolve(),
      });

      await newService.initialize();
      const stats = await newService.getStats();
      expect(stats.chainLength).toBe(2);
    });
  });

  describe('Hash SHA-256', () => {
    it('deve gerar hashes SHA-256 válidos', async () => {
      const hash = await blockchainService.calculateDataHash({ test: 'data' });
      
      // SHA-256 produz 64 caracteres hexadecimais
      expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('deve gerar hashes diferentes para dados diferentes', async () => {
      const hash1 = await blockchainService.calculateDataHash({ test: 'data1' });
      const hash2 = await blockchainService.calculateDataHash({ test: 'data2' });
      
      expect(hash1).not.toBe(hash2);
    });

    it('deve gerar mesmo hash para mesmos dados', async () => {
      const data = { test: 'data', number: 42 };
      const hash1 = await blockchainService.calculateDataHash(data);
      const hash2 = await blockchainService.calculateDataHash(data);
      
      expect(hash1).toBe(hash2);
    });
  });
});

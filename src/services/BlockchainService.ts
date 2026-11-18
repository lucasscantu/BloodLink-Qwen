/**
 * Blockchain Service - Implementação real de blockchain no browser
 *
 * Características:
 * - Hashes SHA-256 reais (Web Crypto API)
 * - Estrutura de blocos imutável
 * - Proof of Work real (com limite seguro)
 * - Persistência em localStorage
 * - Verificação de integridade criptográfica
 * - Fila de serialização para evitar race conditions
 */

export interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface BlockchainEvent {
  bloodBagCode: string;
  eventType: string;
  dataHash: string;
  performedBy: string;
  institutionId: string;
  timestamp: number;
  blockIndex: number;
  txHash: string;
}

const STORAGE_KEY = 'bloodlink_blockchain';
const MAX_NONCE_ITERATIONS = 100000;
const MINING_DIFFICULTY = 2; // hash deve começar com '00'

class BlockchainService {
  private chain: Block[] = [];
  private events: Map<string, BlockchainEvent[]> = new Map();
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private writeQueue: Promise<any> = Promise.resolve();

  constructor() {
    // Lazy initialization - não faz nada assíncrono no constructor
  }

  /**
   * Inicializa a blockchain. Deve ser chamado antes de qualquer operação.
   * É idempotente e thread-safe.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    await this.initPromise;
    this.initialized = true;
  }

  private async doInitialize(): Promise<void> {
    // Tenta carregar do localStorage
    const loaded = this.loadFromStorage();
    if (loaded && loaded.length > 0) {
      this.chain = loaded;
      // Reconstrói o mapa de eventos a partir da cadeia
      this.rebuildEventsMap();
      return;
    }

    // Cria genesis block
    const genesisHash = await this.calculateHash(
      0,
      Date.now(),
      { message: 'Genesis Block - BloodLink Blockchain', version: '1.0.0' },
      '0',
      0
    );

    this.chain = [{
      index: 0,
      timestamp: Date.now(),
      data: { message: 'Genesis Block - BloodLink Blockchain', version: '1.0.0' },
      previousHash: '0',
      hash: genesisHash,
      nonce: 0,
    }];

    this.saveToStorage();
  }

  /**
   * Calcula hash SHA-256 usando Web Crypto API
   */
  private async calculateHash(
    index: number,
    timestamp: number,
    data: any,
    previousHash: string,
    nonce: number
  ): Promise<string> {
    const str = `${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`;
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Calcula hash dos dados (para verificação de integridade)
   */
  async calculateDataHash(data: any): Promise<string> {
    const str = JSON.stringify(data);
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Proof of Work - minera um bloco encontrando nonce válido
   */
  private async mineBlock(block: Block, difficulty: number = MINING_DIFFICULTY): Promise<Block> {
    const target = '0'.repeat(difficulty);
    let nonce = 0;

    while (nonce < MAX_NONCE_ITERATIONS) {
      const hash = await this.calculateHash(
        block.index,
        block.timestamp,
        block.data,
        block.previousHash,
        nonce
      );

      if (hash.substring(2, 2 + difficulty) === target) {
        return { ...block, hash, nonce };
      }

      nonce++;
    }

    // Se não encontrar dentro do limite, retorna com o último hash calculado
    // Isso é extremamente improvável com difficulty=2 (1/256 de chance por tentativa)
    const finalHash = await this.calculateHash(
      block.index,
      block.timestamp,
      block.data,
      block.previousHash,
      nonce
    );
    return { ...block, hash: finalHash, nonce };
  }

  /**
   * Registra um evento na blockchain (operação serializada)
   */
  async registerEvent(
    bloodBagCode: string,
    eventType: string,
    eventData: any,
    performedBy: string,
    institutionId: string
  ): Promise<BlockchainEvent> {
    await this.initialize();

    // ⚠️ Serializa escritas para evitar race conditions
    const result = this.writeQueue.then(async () => {
      const dataHash = await this.calculateDataHash(eventData);

      const previousBlock = this.chain[this.chain.length - 1];
      const newBlock: Block = {
        index: this.chain.length,
        timestamp: Date.now(),
        data: {
          bloodBagCode,
          eventType,
          dataHash,
          performedBy,
          institutionId,
        },
        previousHash: previousBlock.hash,
        hash: '',
        nonce: 0,
      };

      // Minera o bloco (Proof of Work)
      const minedBlock = await this.mineBlock(newBlock);
      this.chain.push(minedBlock);
      this.saveToStorage();

      // Cria o evento
      const event: BlockchainEvent = {
        bloodBagCode,
        eventType,
        dataHash,
        performedBy,
        institutionId,
        timestamp: minedBlock.timestamp,
        blockIndex: minedBlock.index,
        txHash: minedBlock.hash,
      };

      // Adiciona ao mapa de eventos
      if (!this.events.has(bloodBagCode)) {
        this.events.set(bloodBagCode, []);
      }
      this.events.get(bloodBagCode)!.push(event);

      return event;
    });

    // Atualiza a fila, mas não propaga erros para próximas escritas
    this.writeQueue = result.catch(() => {});

    return result;
  }

  /**
   * Retorna histórico de eventos de uma bolsa
   */
  async getHistory(bloodBagCode: string): Promise<BlockchainEvent[]> {
    await this.initialize();
    return this.events.get(bloodBagCode) || [];
  }

  /**
   * Verifica se um evento específico tem hash correto
   */
  async verifyEvent(
    bloodBagCode: string,
    eventIndex: number,
    expectedDataHash: string
  ): Promise<boolean> {
    await this.initialize();
    const events = this.events.get(bloodBagCode);
    if (!events || eventIndex >= events.length || eventIndex < 0) {
      return false;
    }
    return events[eventIndex].dataHash === expectedDataHash;
  }

  /**
   * Verifica integridade de toda a cadeia
   */
  async verifyChain(): Promise<{ valid: boolean; issues: string[] }> {
    await this.initialize();
    const issues: string[] = [];

    if (this.chain.length === 0) {
      return { valid: false, issues: ['Cadeia vazia'] };
    }

    // Verifica genesis block
    const genesis = this.chain[0];
    const expectedGenesisHash = await this.calculateHash(
      genesis.index,
      genesis.timestamp,
      genesis.data,
      genesis.previousHash,
      genesis.nonce
    );
    if (genesis.hash !== expectedGenesisHash) {
      issues.push(`Genesis block corrompido (hash não confere)`);
    }

    // Verifica cada bloco subsequente
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verifica link com bloco anterior
      if (currentBlock.previousHash !== previousBlock.hash) {
        issues.push(`Bloco ${i}: previousHash não confere com hash do bloco ${i - 1}`);
      }

      // Verifica hash do bloco atual
      const recalculatedHash = await this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) {
        issues.push(`Bloco ${i}: hash corrompido`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Retorna informações sobre a blockchain
   */
  async getStats(): Promise<{
    chainLength: number;
    latestBlock: Block | null;
    totalEvents: number;
    uniqueBags: number;
  }> {
    await this.initialize();
    let totalEvents = 0;
    this.events.forEach(events => {
      totalEvents += events.length;
    });

    return {
      chainLength: this.chain.length,
      latestBlock: this.chain[this.chain.length - 1] || null,
      totalEvents,
      uniqueBags: this.events.size,
    };
  }

  /**
   * Retorna todos os blocos da cadeia
   */
  async getChain(): Promise<Block[]> {
    await this.initialize();
    return [...this.chain];
  }

  /**
   * Retorna todos os eventos de todas as bolsas
   */
  async getAllEvents(): Promise<BlockchainEvent[]> {
    await this.initialize();
    const allEvents: BlockchainEvent[] = [];
    this.events.forEach(events => {
      allEvents.push(...events);
    });
    return allEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Reconstrói o mapa de eventos a partir da cadeia
   */
  private rebuildEventsMap(): void {
    this.events.clear();
    for (const block of this.chain) {
      if (block.index === 0) continue; // Pula genesis
      const { bloodBagCode, eventType, dataHash, performedBy, institutionId } = block.data;
      if (!bloodBagCode) continue;

      const event: BlockchainEvent = {
        bloodBagCode,
        eventType,
        dataHash,
        performedBy,
        institutionId,
        timestamp: block.timestamp,
        blockIndex: block.index,
        txHash: block.hash,
      };

      if (!this.events.has(bloodBagCode)) {
        this.events.set(bloodBagCode, []);
      }
      this.events.get(bloodBagCode)!.push(event);
    }
  }

  /**
   * Persiste a cadeia no localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chain));
    } catch (error) {
      console.error('[Blockchain] Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Carrega a cadeia do localStorage
   */
  private loadFromStorage(): Block[] | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Blockchain] Erro ao carregar do localStorage:', error);
      return null;
    }
  }

  /**
   * Reseta a blockchain (apenas para testes/desenvolvimento)
   */
  async reset(): Promise<void> {
    this.chain = [];
    this.events.clear();
    this.initialized = false;
    this.initPromise = null;
    this.writeQueue = Promise.resolve();
    localStorage.removeItem(STORAGE_KEY);
    await this.initialize();
  }
}

// Singleton
export const blockchainService = new BlockchainService();

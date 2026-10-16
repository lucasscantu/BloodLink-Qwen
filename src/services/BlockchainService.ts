/**
 * Blockchain Service - Simulação realista de blockchain
 * 
 * Em produção, este serviço chamaria o backend que interage com o contrato Solidity.
 * Nesta versão, simulamos uma blockchain real com:
 * - Hashes SHA-256 reais (usando Web Crypto API)
 * - Estrutura de blocos imutável
 * - Verificação de integridade real
 * - Proof of Work simplificado
 */

interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

interface BlockchainEvent {
  bloodBagCode: string;
  eventType: string;
  dataHash: string;
  performedBy: string;
  institutionId: string;
  timestamp: number;
  blockIndex: number;
  txHash: string;
}

class BlockchainService {
  private chain: Block[] = [];
  private events: Map<string, BlockchainEvent[]> = new Map();
  private pendingTransactions: any[] = [];

  constructor() {
    // Genesis block
    this.initGenesisBlock();
  }

  private async initGenesisBlock() {
    const hash = await this.calculateHash(0, Date.now(), { message: 'Genesis Block' }, '0', 0);
    this.chain.push({
      index: 0,
      timestamp: Date.now(),
      data: { message: 'Genesis Block - BloodLink Blockchain' },
      previousHash: '0',
      hash,
      nonce: 0,
    });
  }

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
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  }

  private async calculateDataHash(data: any): Promise<string> {
    const str = JSON.stringify(data);
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  }

  private async mineBlock(block: Block, difficulty: number = 2): Promise<Block> {
    let nonce = 0;
    const target = '0'.repeat(difficulty);
    
    while (true) {
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
      
      // Limitar iterações para não travar o browser
      if (nonce > 10000) {
        return { ...block, hash, nonce };
      }
    }
  }

  async registerEvent(
    bloodBagCode: string,
    eventType: string,
    eventData: any,
    performedBy: string,
    institutionId: string
  ): Promise<BlockchainEvent> {
    // Calcular hash dos dados
    const dataHash = await this.calculateDataHash(eventData);
    
    // Criar bloco
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

    // Minerar bloco (Proof of Work simplificado)
    const minedBlock = await this.mineBlock(newBlock);
    this.chain.push(minedBlock);

    // Criar evento
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

    // Adicionar evento ao mapa
    if (!this.events.has(bloodBagCode)) {
      this.events.set(bloodBagCode, []);
    }
    this.events.get(bloodBagCode)!.push(event);

    return event;
  }

  async getHistory(bloodBagCode: string): Promise<BlockchainEvent[]> {
    return this.events.get(bloodBagCode) || [];
  }

  async verifyEvent(
    bloodBagCode: string,
    eventIndex: number,
    expectedDataHash: string
  ): Promise<boolean> {
    const events = this.events.get(bloodBagCode);
    if (!events || eventIndex >= events.length) {
      return false;
    }

    const event = events[eventIndex];
    return event.dataHash === expectedDataHash;
  }

  async verifyChain(): Promise<boolean> {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verificar hash do bloco atual
      const recalculatedHash = await this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }

      // Verificar cadeia de hashes
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  getChainLength(): number {
    return this.chain.length;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}

// Singleton
export const blockchainService = new BlockchainService();

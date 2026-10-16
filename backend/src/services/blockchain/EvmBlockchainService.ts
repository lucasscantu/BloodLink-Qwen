import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { BlockchainService } from './BlockchainService';

const CONTRACT_ABI = [
  "function registerEvent(string memory bloodBagCode, string memory eventType, string memory dataHash, string memory performedBy, string memory institutionId) external returns (uint256 eventIndex)",
  "function getHistory(string memory bloodBagCode) external view returns (tuple(uint256 eventIndex, string eventType, string dataHash, string performedBy, string institutionId, uint256 timestamp, string txHash)[] memory)",
  "function verifyEvent(string memory bloodBagCode, uint256 eventIndex, string memory expectedHash) external view returns (bool)",
  "function getEventCount(string memory bloodBagCode) external view returns (uint256)",
];

export class EvmBlockchainService implements BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private contractAddress: string;
  
  // ⚠️ Fila de serialização: garante no máximo uma transação em voo por vez
  // para evitar colisão de nonce entre chamadas concorrentes da mesma wallet.
  private writeQueue: Promise<any> = Promise.resolve();

  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Carrega endereço do contrato do arquivo de deploy
    const deployedPath = process.env.DEPLOYED_CONTRACT_PATH || path.join(__dirname, '../../blockchain/deployed.json');
    try {
      const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
      this.contractAddress = deployed.address;
    } catch {
      // Fallback para endereço padrão do Hardhat
      this.contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    }
    
    this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.wallet);
  }

  async registerEvent(
    bloodBagCode: string,
    eventType: string,
    dataHash: string,
    performedBy: string,
    institutionId: string
  ): Promise<{ txHash: string; blockNumber: number; eventIndex: number }> {
    // ⚠️ Serializa escritas via encadeamento de promises
    const result = this.writeQueue.then(async () => {
      const tx = await this.contract.registerEvent(
        bloodBagCode,
        eventType,
        dataHash,
        performedBy,
        institutionId
      );
      const receipt = await tx.wait();
      
      // Extrai eventIndex do log de evento
      const eventIndex = Number(receipt.logs[0]?.topics[1] || 0);
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        eventIndex,
      };
    });
    
    // Atualiza a fila para a próxima escrita
    this.writeQueue = result.catch(() => {});
    
    return result;
  }

  async getHistory(bloodBagCode: string): Promise<Array<{
    eventIndex: number;
    eventType: string;
    dataHash: string;
    performedBy: string;
    institutionId: string;
    timestamp: number;
    txHash: string;
  }>> {
    const history = await this.contract.getHistory(bloodBagCode);
    return history.map((h: any) => ({
      eventIndex: Number(h.eventIndex),
      eventType: h.eventType,
      dataHash: h.dataHash,
      performedBy: h.performedBy,
      institutionId: h.institutionId,
      timestamp: Number(h.timestamp),
      txHash: h.txHash,
    }));
  }

  async verifyEvent(
    bloodBagCode: string,
    eventIndex: number,
    expectedHash: string
  ): Promise<boolean> {
    return await this.contract.verifyEvent(bloodBagCode, eventIndex, expectedHash);
  }

  getContractAddress(): string {
    return this.contractAddress;
  }
}

// Singleton
let instance: BlockchainService | null = null;

export function getBlockchainService(): BlockchainService {
  if (!instance) {
    instance = new EvmBlockchainService();
  }
  return instance;
}

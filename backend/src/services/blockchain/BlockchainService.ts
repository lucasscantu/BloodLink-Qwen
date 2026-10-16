// Interface abstrata para permitir trocar de rede blockchain no futuro
export interface BlockchainService {
  registerEvent(
    bloodBagCode: string,
    eventType: string,
    dataHash: string,
    performedBy: string,
    institutionId: string
  ): Promise<{ txHash: string; blockNumber: number; eventIndex: number }>;

  getHistory(bloodBagCode: string): Promise<Array<{
    eventIndex: number;
    eventType: string;
    dataHash: string;
    performedBy: string;
    institutionId: string;
    timestamp: number;
    txHash: string;
  }>>;

  verifyEvent(
    bloodBagCode: string,
    eventIndex: number,
    expectedHash: string
  ): Promise<boolean>;

  getContractAddress(): string;
}

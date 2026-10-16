# BloodLink Blockchain

Contrato inteligente e infraestrutura blockchain para o sistema BloodLink.

## Stack

- **Framework**: Hardhat
- **Linguagem**: Solidity 0.8.20
- **Rede**: Hardhat Network (EVM local)
- **Testes**: Hardhat + Chai
- **Deploy**: Script automatizado

## Contrato: BloodLinkRegistry

Contrato **append-only** para registro de eventos de bolsas de sangue.

### Funções

```solidity
// Registra evento e retorna eventIndex
function registerEvent(
    string memory bloodBagCode,
    string memory eventType,
    string memory dataHash,
    string memory performedBy,
    string memory institutionId
) external returns (uint256 eventIndex)

// Retorna histórico completo de uma bolsa
function getHistory(string memory bloodBagCode) 
    external view returns (Event[] memory)

// Verifica integridade de um evento específico
function verifyEvent(
    string memory bloodBagCode,
    uint256 eventIndex,
    string memory expectedHash
) external view returns (bool)

// Conta eventos de uma bolsa
function getEventCount(string memory bloodBagCode) 
    external view returns (uint256)
```

### Características

- ✅ **Append-only**: Não permite update ou delete
- ✅ **Imutável**: Eventos não podem ser alterados após registro
- ✅ **Auditável**: Histórico completo consultável
- ✅ **Isolado**: Histórico separado por bolsa
- ✅ **Verificável**: Hash SHA-256 dos dados

## Instalação

```bash
npm install
npx hardhat compile
```

## Scripts

- `npm run compile` — Compila contratos
- `npm run test` — Roda testes
- `npm run node` — Inicia nó local
- `npm run deploy` — Deploy no nó local
- `npm run deploy:local` — Deploy in-memory

## Testes

```bash
npx hardhat test
```

### Cobertura

- ✅ Registro e leitura de histórico
- ✅ Índices sequenciais corretos
- ✅ Natureza append-only (sem update/delete)
- ✅ Eventos anteriores intactos após novo registro
- ✅ verifyEvent com hash correto e divergente
- ✅ eventIndex inexistente retorna false
- ✅ Isolamento entre bolsas diferentes
- ✅ Interface pública sem funções de update/delete

## Deploy

### Nó Local

```bash
# Terminal 1: Iniciar nó
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.js --network localhost
```

O script gera:
- `deployed.json` — Endereço do contrato
- `src/blockchain-abi.json` — ABI para o backend

### Docker

O Dockerfile `Dockerfile.blockchain` automatiza:
1. Inicia nó Hardhat
2. Aguarda nó estar pronto
3. Faz deploy automático
4. Salva `deployed.json` em volume compartilhado

## Estrutura

```
blockchain/
├── contracts/
│   └── BloodLinkRegistry.sol    # Contrato principal
├── scripts/
│   └── deploy.js                # Script de deploy
├── test/
│   └── BloodLinkRegistry.test.js # Testes
├── hardhat.config.js            # Configuração Hardhat
└── package.json
```

## ⚠️ Notas Importantes

1. **Rede de desenvolvimento**: Hardhat é para desenvolvimento. Em produção, usar rede permissionada (Hyperledger Fabric, Quorum).
2. **Dados on-chain**: Apenas hashes e identificadores. Dados sensíveis ficam no PostgreSQL.
3. **eventIndex**: Retornado pela função `registerEvent` e persistido no banco para verificação.
4. **Gas**: Em rede local, gas é irrelevante. Em produção, otimizar structs e eventos.

## Segurança

- Não há funções de update/delete por design
- Apenas o owner pode fazer deploy (controlado pelo script)
- Dados sensíveis NUNCA são armazenados on-chain
- Hash SHA-256 garante integridade dos dados off-chain

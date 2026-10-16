# Arquitetura BloodLink

## Visão Geral

O BloodLink é composto por 4 serviços principais que se comunicam via Docker Compose:

```
┌──────────────────────────────────────────────────────────────────┐
│                        Docker Compose                            │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Frontend │───▶│ Backend  │───▶│ Postgres │    │Blockchain│  │
│  │  (Nginx) │    │ (Express)│    │  (15)    │    │ (Hardhat)│  │
│  │  :3000   │    │  :4000   │    │  :5432   │    │  :8545   │  │
│  └──────────┘    └────┬─────┘    └──────────┘    └────┬─────┘  │
│                       │                                │         │
│                       └────────────────────────────────┘         │
│                       BlockchainService (ethers.js)              │
└──────────────────────────────────────────────────────────────────┘
```

## Uso da Blockchain

### Contrato Append-Only

O contrato `BloodLinkRegistry` (Solidity 0.8.20) implementa um registro **append-only**:

- `registerEvent(code, type, hash, user, institution)` → retorna `eventIndex`
- `getHistory(code)` → retorna array de eventos
- `verifyEvent(code, index, hash)` → verifica integridade
- `getEventCount(code)` → conta eventos

**Nenhum dado pessoal sensível é armazenado on-chain.** Apenas:
- Identificadores lógicos (código da bolsa)
- Tipos de evento
- Hash SHA-256 dos dados detalhados
- IDs de instituição e usuário

### Interface BlockchainService

A blockchain é isolada atrás de uma interface `BlockchainService`, permitindo trocar a implementação (ex.: Hyperledger Fabric) sem alterar o resto do sistema:

```typescript
interface BlockchainService {
  registerEvent(...): Promise<{txHash, blockNumber, eventIndex}>;
  getHistory(code): Promise<Event[]>;
  verifyEvent(code, index, hash): Promise<boolean>;
}
```

### Fila de Serialização

A implementação `EvmBlockchainService` usa uma fila interna para serializar escritas, evitando colisão de nonce entre chamadas concorrentes da mesma wallet.

## QR Code

### Geração
- Biblioteca: `qrcode.react`
- Conteúdo: URL completa para `/blood-bags/<codigo>`
- Exibido na página de detalhe da bolsa

### Escaneamento
- Biblioteca: `html5-qrcode`
- Aceita URL completa ou código puro
- Extrai código via regex: `/blood-bags\/(BL-\d+)/` ou `/BL-\d{5}/`
- Alternativa manual para quando câmera não está disponível

## Modelo de Dados

### Máquina de Estados da Bolsa

```
COLETADA / EM_TESTE ──► APROVADA ──► ARMAZENADA ──► DISPONIVEL ──┬──► RESERVADA ──► EM_TRANSPORTE ──► RECEBIDA
      │                                                          ├──► UTILIZADA
      └──► REPROVADA                                             └──► DESCARTADA
```

### Guardas de Status

Toda transição tem uma guarda que rejeita a operação se o status atual não for o esperado:
- Aprovar: `COLETADA` ou `EM_TESTE`
- Armazenar: `APROVADA`
- Disponibilizar: `ARMAZENADA`
- Utilizar: `DISPONIVEL` ou `RECEBIDA`
- Descartar: `DISPONIVEL`
- Aceitar transferência: `OFERTADA`
- Receber: `EM_TRANSPORTE`

### eventIndex

O campo `eventIndex` em `BloodBagEvent` armazena o índice real retornado pela blockchain no momento do registro. **Nunca é reconstruído por timestamp** para evitar divergências em rede local rápida.

## RBAC

| Papel | Permissões |
|-------|-----------|
| ADMIN | Tudo: instituições, usuários, bolsas, demandas, transferências, auditoria |
| HEMOCENTRO | Cadastrar bolsas, aprovar/reprovar, gerenciar estoque, ofertar transferências |
| HOSPITAL | Criar demandas, aceitar transferências, receber bolsas, registrar uso |
| AUDITOR | Somente leitura: auditoria, verificação blockchain |

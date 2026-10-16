# BloodLink Backend

API REST para o sistema BloodLink de rastreabilidade de bolsas de sangue.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Linguagem**: TypeScript (strict mode)
- **ORM**: Prisma
- **Banco**: PostgreSQL 15
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Blockchain**: ethers.js (Hardhat EVM)
- **Testes**: Jest + Supertest

## Instalação

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Scripts

- `npm run dev` — Servidor de desenvolvimento com hot reload
- `npm run build` — Compila TypeScript
- `npm start` — Servidor de produção
- `npm test` — Roda testes
- `npm run typecheck` — Verifica tipos TypeScript

## Estrutura

```
src/
├── app.ts                    # Configuração Express
├── server.ts                 # Entry point
├── lib/
│   └── prisma.ts            # Prisma client
├── middleware/
│   ├── auth.ts              # JWT + RBAC
│   ├── error-handler.ts     # Tratamento de erros
│   └── validate.ts          # Validação Zod
├── routes/
│   ├── auth.routes.ts
│   ├── blood-bags.routes.ts
│   ├── demands.routes.ts
│   ├── transfers.routes.ts
│   ├── institutions.routes.ts
│   ├── users.routes.ts
│   ├── temperature.routes.ts
│   ├── audit.routes.ts
│   └── blockchain.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── blood-bag.service.ts
│   ├── demand.service.ts
│   ├── transfer.service.ts
│   └── blockchain/
│       ├── BlockchainService.ts      # Interface
│       └── EvmBlockchainService.ts   # Implementação
└── __tests__/
    ├── services/
    └── integration/
```

## Endpoints

Ver [API Reference](../docs/API.md) para documentação completa.

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/bloodlink"
JWT_SECRET="your-secret-key"
PORT=4000
BLOCKCHAIN_RPC_URL="http://localhost:8545"
BLOCKCHAIN_PRIVATE_KEY="0x..."
DEPLOYED_CONTRACT_PATH="./blockchain/deployed.json"
```

## Testes

```bash
npm test
```

Cobertura:
- Services (guardas de status, lógica de negócio)
- Integração (auth, RBAC, validação)
- Blockchain (registro, verificação)

## ⚠️ Notas Importantes

1. **OpenSSL no Alpine**: O Dockerfile inclui `openssl` para o Prisma funcionar no Alpine
2. **Fila de serialização**: O `EvmBlockchainService` serializa escritas para evitar colisão de nonce
3. **eventIndex**: Persistido no momento do registro, nunca reconstruído por timestamp
4. **Filtros**: `instituicaoId` é mapeado para `instituicaoAtualId` no service

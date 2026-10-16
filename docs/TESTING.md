# Testes

## Backend (Jest + Supertest)

```bash
cd backend
npm test
```

### Cobertura

- **BloodBagService**: criação com status COLETADA, aprovação (COLETADA/EM_TESTE), rejeição de status inválido, utilização, descarte, verificação de integridade com eventIndex
- **TransferService**: criação com guarda de status, aceite/reserva/transporte/recebimento com guardas
- **Integration**: autenticação, validação Zod, RBAC, health check

## Frontend (Vitest + Testing Library)

```bash
npm test
```

### Cobertura

- Página de Login: renderização, usuários demo, preenchimento automático
- AuthContext: estado inicial não autenticado
- Extração de código QR: URL completa e código puro
- Guards de rota por papel

## Blockchain (Hardhat + Chai)

```bash
cd backend/blockchain
npx hardhat test
```

### Cobertura

- Registro e leitura de histórico
- Índices sequenciais corretos
- Natureza append-only (sem update/delete)
- Eventos anteriores intactos após novo registro
- verifyEvent com hash correto e divergente
- eventIndex inexistente retorna false
- Isolamento entre bolsas diferentes
- Interface pública sem funções de update/delete

## ⚠️ Notas sobre Vitest

- Nunca usar `beforeEach(() => vi.clearAllMocks())` com retorno implícito
- Sempre usar corpo de bloco: `beforeEach(() => { vi.clearAllMocks(); });`

## ⚠️ Stub de @prisma/client

Os testes do backend usam um stub manual de `@prisma/client` (em `src/__mocks__/prisma-client.ts`) mapeado via `moduleNameMapper` no Jest. Isso permite rodar testes sem depender de `prisma generate`.

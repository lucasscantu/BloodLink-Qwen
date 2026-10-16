# Testes

## Frontend (Vitest + Testing Library)

```bash
npm test
```

### Suítes de Testes

#### Componentes Reutilizáveis
- **StatusBadge** (`components.test.tsx`)
  - Renderização de label correto
  - Data-testid correto
  - Aplicação de classes de cor

- **LoadingSpinner** (`components.test.tsx`)
  - Texto padrão e customizado
  - Acessibilidade (role="status")
  - Data-testid

- **ErrorMessage** (`components.test.tsx`)
  - Renderização de mensagem
  - Botão de retry condicional

- **ConfirmationModal** (`confirmation-modal.test.tsx`)
  - Visibilidade condicional (isOpen)
  - Callbacks de confirmação/cancelamento
  - Labels customizados
  - Variantes de estilo

- **Toast** (`toast.test.tsx`)
  - Tipos (success, error, info)
  - Auto-dismiss com timer
  - Botão de fechar
  - Acessibilidade (role="alert")

#### Autenticação e RBAC
- **AuthContext** (`auth.test.tsx`, `rbac.test.tsx`)
  - Estado inicial não autenticado
  - Reconhecimento de cada papel (ADMIN, HEMOCENTRO, HOSPITAL, AUDITOR)
  - hasRole funcionando corretamente

- **ProtectedRoute** (`protected-route.test.tsx`)
  - Redirecionamento para /login quando não autenticado
  - Renderização de conteúdo quando autenticado

#### Lógica de Negócio
- **Visibilidade de Botões** (`button-visibility.test.ts`)
  - ⚠️ **COLETADA mostra Aprovar/Reprovar** (correção do bug)
  - EM_TESTE mostra Aprovar/Reprovar
  - Cada status tem ações corretas
  - Papéis corretos para cada ação
  - Status finais (UTILIZADA, DESCARTADA, REPROVADA) sem ações

- **Extração de QR Code** (`qr-extraction.test.ts`)
  - URL completa
  - Código puro
  - Texto inválido
  - Casos edge

#### Hooks Customizados
- **useToast** (`use-toast.test.ts`)
  - Lista inicial vazia
  - Adicionar toasts (success, error, info)
  - Remover toast por id
  - IDs únicos

- **useDebounce** (`use-debounce.test.ts`)
  - Valor inicial imediato
  - Atualização após delay
  - Reset de timer
  - Delay padrão e customizado

- **useLocalStorage** (`use-local-storage.test.ts`)
  - Valor inicial
  - Valor do localStorage
  - Atualização com setValue
  - Função como valor
  - Objetos complexos
  - JSON inválido

#### Utilitários
- **Format Utils** (`format-utils.test.ts`)
  - formatDate, formatDateTime
  - formatBloodType (A+ O- etc)
  - formatVolume
  - truncateText
  - formatHash
  - timeAgo (há X minutos/horas/dias)

#### Páginas
- **NotFound** (`not-found.test.tsx`)
  - Código 404
  - Mensagem
  - Botões de navegação

- **Login** (`auth.test.tsx`)
  - Renderização do formulário
  - Usuários de demonstração
  - Preenchimento automático

## Backend (Jest + Supertest)

```bash
cd backend
npm test
```

### Suítes de Testes

#### Services
- **BloodBagService** (`services/blood-bag.service.test.ts`)
  - Criação com status COLETADA
  - Aprovação (COLETADA e EM_TESTE)
  - Rejeição de status inválido
  - Utilização com guardas
  - Verificação de integridade com eventIndex

- **TransferService** (`services/transfer.service.test.ts`)
  - Criação com guarda de status (DISPONIVEL)
  - Rejeição para status inválidos (UTILIZADA, DESCARTADA, EM_TRANSPORTE)
  - Aceite com guarda (OFERTADA)
  - Recebimento com guarda (EM_TRANSPORTE)
  - Cancelamento com guardas

- **DemandService** (`services/demand.service.test.ts`)
  - Criação de demanda
  - Busca com include correto (sourceInstitution + destinationInstitution)
  - Matching de bolsas
  - Cancelamento com guardas

- **AuthService** (`services/auth.service.test.ts`)
  - Login com credenciais válidas
  - Login com email inexistente
  - Login com senha incorreta
  - Registro com hash de senha
  - Registro com email duplicado

#### Middleware
- **Auth Middleware** (`middleware/auth.test.ts`)
  - authenticate: header ausente, formato inválido, token inválido, token válido
  - authorize: papel insuficiente, papel correto, múltiplos papéis
  - generateToken

- **Logger Middleware** (`middleware/logger.test.ts`)
  - Chamada de next()
  - Log de status 200
  - Warn para status >= 400

#### Integração
- **Auth + RBAC** (`integration/app.test.ts`)
  - Login com credenciais inválidas
  - Validação Zod
  - RBAC sem token
  - Health check

- **Blood Bags API** (`integration/blood-bags.test.ts`)
  - Listagem com filtros
  - Mapeamento institutionId → instituicaoAtualId
  - RBAC para criação (ADMIN/HEMOCENTRO sim, HOSPITAL/AUDITOR não)
  - Verificação de integridade (ADMIN/AUDITOR sim, HOSPITAL não)

## Blockchain (Hardhat + Chai)

```bash
cd backend/blockchain
npx hardhat test
```

### Suítes de Testes

#### Testes Básicos (`BloodLinkRegistry.test.js`)
- Registro e leitura de histórico
- Índices sequenciais corretos
- Natureza append-only (sem update/delete)
- Eventos anteriores intactos após novo registro
- verifyEvent com hash correto e divergente
- eventIndex inexistente retorna false
- Isolamento entre bolsas diferentes
- Interface pública sem funções de update/delete

#### Testes Avançados (`BloodLinkRegistry.advanced.test.js`)
- Event Emission
- Concurrent Registration (ordem correta)
- Empty History (bolsa sem eventos)
- Data Integrity (todos os campos)
- Multiple Users (diferentes signers)
- Special Characters (strings especiais e vazias)

## ⚠️ Notas sobre Vitest

- Nunca usar `beforeEach(() => vi.clearAllMocks())` com retorno implícito
- Sempre usar corpo de bloco: `beforeEach(() => { vi.clearAllMocks(); });`

## ⚠️ Stub de @prisma/client

Os testes do backend usam um stub manual de `@prisma/client` (em `src/__mocks__/prisma-client.ts`) mapeado via `moduleNameMapper` no Jest. Isso permite rodar testes sem depender de `prisma generate`.

## Cobertura Esperada

| Camada | Componentes Testados |
|--------|---------------------|
| Frontend | 15+ suítes, 80+ testes |
| Backend | 10+ suítes, 50+ testes |
| Blockchain | 2 suítes, 20+ testes |

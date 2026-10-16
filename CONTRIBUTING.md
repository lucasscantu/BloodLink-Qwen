# Contribuindo com o BloodLink

Obrigado pelo interesse em contribuir! Este guia vai te ajudar a configurar o ambiente e entender o processo.

## Configuração do Ambiente

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- PostgreSQL 15 (se rodando localmente sem Docker)

### Setup

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/bloodlink.git
cd bloodlink

# Frontend
npm install

# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev

# Blockchain
cd blockchain
npm install
npx hardhat compile
```

### Rodando o projeto

```bash
# Com Docker (recomendado)
docker compose up --build

# Ou localmente:
# Terminal 1 - Blockchain
cd backend/blockchain && npx hardhat node

# Terminal 2 - Deploy contrato
cd backend/blockchain && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 - Backend
cd backend && npm run dev

# Terminal 4 - Frontend
npm run dev
```

## Convenções de Código

### TypeScript
- Strict mode habilitado
- Interfaces para todos os tipos de dados
- Enums para valores fixos (status, tipos, papéis)

### Backend
- Services encapsulam lógica de negócio
- Routes apenas fazem parsing e chamam services
- Middleware para auth, RBAC e validação
- Zod para validação de input

### Frontend
- Componentes funcionais com hooks
- Context API para estado global (auth)
- React Router para navegação
- Tailwind CSS para estilização

### Commits
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Mensagens em português ou inglês (consistente)
- Referenciar issues quando aplicável: `fix: corrige bug de status (#42)`

## Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
npm test
```

### Blockchain
```bash
cd backend/blockchain
npx hardhat test
```

## Processo de PR

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nome-da-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona feature X'`
4. Push para a branch: `git push origin feature/nome-da-feature`
5. Abra um Pull Request

### Checklist do PR

- [ ] Testes passando (frontend, backend, blockchain)
- [ ] Build sem erros (`npm run build`)
- [ ] Type-check sem erros (`npm run typecheck`)
- [ ] Documentação atualizada (se aplicável)
- [ ] Changelog atualizado (se aplicável)

## Dúvidas?

Abra uma issue ou entre em contato com os mantenedores.

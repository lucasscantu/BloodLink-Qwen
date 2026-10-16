# 🩸 BloodLink

**Sistema de Rastreabilidade de Bolsas de Sangue com Blockchain**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933.svg)](https://nodejs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-yellow.svg)](https://hardhat.org/)

Protótipo acadêmico de uma rede permissionada para gestão, rastreabilidade e redistribuição de bolsas de sangue entre hospitais e hemocentros, utilizando blockchain para garantir imutabilidade e auditoria completa.

## 🌟 Características

- ✅ **Rastreabilidade Completa**: Histórico imutável de cada bolsa na blockchain
- ✅ **QR Code**: Geração e escaneamento para acesso rápido ao histórico
- ✅ **Gestão de Estoque**: Controle completo de bolsas de sangue
- ✅ **Transferências**: Fluxo completo entre instituições (oferta → aceite → transporte → recebimento)
- ✅ **Demandas**: Sistema de solicitações com matching automático
- ✅ **Monitoramento**: Temperatura com alertas em tempo real
- ✅ **Auditoria**: Log completo de todas as ações
- ✅ **RBAC**: 4 perfis de usuário com permissões granulares
- ✅ **Blockchain**: Contrato append-only com verificação de integridade
- ✅ **Testes**: Cobertura nas três camadas (frontend, backend, blockchain)

## 🏗️ Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │     │ Blockchain │
│ React+Vite  │     │ Node+Express │────▶│   + Prisma   │     │  (Hardhat) │
│  Port 3000  │     │   Port 4000  │────▶│   Port 5432  │     │  Port 8545 │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
                           │
                    ┌──────┴──────┐
                    │ Blockchain  │
                    │  Service    │
                    │ (ethers.js) │
                    └─────────────┘
```

## 🚀 Início Rápido

### Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/bloodlink.git
cd bloodlink

# Setup automático
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Ou manualmente:

```bash
docker compose up --build
```

Acesse:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:4000
- ⛓️ **Blockchain RPC**: http://localhost:8545

### Desenvolvimento Local

```bash
# Terminal 1 - Blockchain
cd backend/blockchain
npm install
npx hardhat node

# Terminal 2 - Deploy do contrato
cd backend/blockchain
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 - Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Terminal 4 - Frontend
npm install
npm run dev
```

## 👥 Usuários de Demonstração

| Email | Senha | Papel | Descrição |
|-------|-------|-------|-----------|
| admin@bloodlink.com | senha123 | ADMIN | Administrador do sistema |
| hemocentro@bloodlink.com | senha123 | HEMOCENTRO | Hemocentro São Paulo |
| hospitalA@bloodlink.com | senha123 | HOSPITAL | Hospital Municipal Central |
| hospitalB@bloodlink.com | senha123 | HOSPITAL | Hospital Santa Maria |
| auditor@bloodlink.com | senha123 | AUDITOR | Auditor do sistema |

## 📚 Documentação

- [📖 Arquitetura](docs/ARCHITECTURE.md) - Diagrama, blockchain, QR Code, modelo de dados
- [🔌 API Reference](docs/API.md) - Documentação completa de endpoints
- [🧪 Testes](docs/TESTING.md) - O que cada suíte cobre
- [🎯 Demo Guide](docs/DEMO.md) - Roteiro guiado de demonstração
- [✅ Verificação](docs/VERIFICATION.md) - O que foi validado
- [🔧 Troubleshooting](docs/TROUBLESHOOTING.md) - Problemas comuns e soluções
- [🤝 Contribuindo](CONTRIBUTING.md) - Como contribuir com o projeto

## 🛠️ Scripts Úteis

```bash
# Setup completo com Docker
./scripts/setup.sh

# Reset do banco de dados
./scripts/reset-db.sh

# Rodar todos os testes
./scripts/test-all.sh

# Apenas testes do frontend
npm test

# Apenas testes do backend
cd backend && npm test

# Apenas testes da blockchain
cd backend/blockchain && npx hardhat test

# Type checking
npm run typecheck
cd backend && npm run typecheck
```

## 🧪 Testes

O projeto possui testes automatizados nas três camadas:

### Frontend (Vitest + Testing Library)
- Componentes reutilizáveis
- Autenticação e RBAC
- Guards de rota
- Lógica de negócio (visibilidade de botões, extração de QR)
- Hooks customizados
- Utilitários de formatação

### Backend (Jest + Supertest)
- Services com guardas de status
- Middleware de autenticação e RBAC
- Testes de integração (API completa)
- Validação de dados

### Blockchain (Hardhat + Chai)
- Registro e leitura de histórico
- Natureza append-only
- Verificação de integridade
- Isolamento entre bolsas

## 📊 Stack Tecnológica

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- React Router (navegação)
- Recharts (gráficos)
- qrcode.react (geração de QR)
- html5-qrcode (escaneamento)
- Vitest + Testing Library (testes)

### Backend
- Node.js 20 + TypeScript (strict)
- Express.js (API REST)
- Prisma ORM (banco de dados)
- PostgreSQL 15
- JWT + bcrypt (autenticação)
- Zod (validação)
- ethers.js (blockchain)
- Jest + Supertest (testes)

### Blockchain
- Hardhat (framework)
- Solidity 0.8.20 (contratos)
- EVM local (desenvolvimento)
- Contrato append-only

### Infraestrutura
- Docker + Docker Compose
- Nginx (servidor frontend)
- CI/CD com GitHub Actions

## 🔐 Segurança

- ✅ JWT para autenticação
- ✅ bcrypt para senhas
- ✅ RBAC com 4 perfis
- ✅ Validação Zod em todas as rotas
- ✅ Guards de status em todas as transições
- ✅ Hash SHA-256 para integridade
- ✅ Dados sensíveis NUNCA na blockchain

## ⚠️ Aviso Legal

Este é um **protótipo acadêmico**. Não é software médico validado para uso em produção. Não deve ser utilizado em ambientes clínicos reais sem validação regulatória completa.

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para fins acadêmicos**

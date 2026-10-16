# 🩸 BloodLink

**Sistema de Rastreabilidade de Bolsas de Sangue com Blockchain**

Protótipo acadêmico de uma rede permissionada para gestão, rastreabilidade e redistribuição de bolsas de sangue entre hospitais e hemocentros, utilizando blockchain para garantir imutabilidade e auditoria completa.

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

## 🚀 Instalação Rápida (Docker)

```bash
docker compose up --build
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Blockchain RPC: http://localhost:8545

## 👥 Usuários de Demonstração

| Email | Senha | Papel |
|-------|-------|-------|
| admin@bloodlink.com | senha123 | Administrador |
| hemocentro@bloodlink.com | senha123 | Hemocentro SP |
| hospitalA@bloodlink.com | senha123 | Hospital Central |
| hospitalB@bloodlink.com | senha123 | Hospital Santa Maria |
| auditor@bloodlink.com | senha123 | Auditor |

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Testes](docs/TESTING.md)
- [Demo Guide](docs/DEMO.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🛠️ Desenvolvimento Local

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend
npm install
npm run dev

# Blockchain
cd backend/blockchain
npm install
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## ⚠️ Aviso

Este é um **protótipo acadêmico**. Não é software médico validado para uso em produção.

## 📄 Licença

MIT — Ver [LICENSE](LICENSE)

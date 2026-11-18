# 🩸 BloodLink — Resumo do Projeto

## 📌 O que é o BloodLink?

O **BloodLink** é um sistema web acadêmico desenvolvido para **rastreabilidade, gerenciamento e redistribuição de bolsas de sangue** entre hospitais e hemocentros, utilizando **tecnologia blockchain** para garantir a imutabilidade e auditoria completa de todo o ciclo de vida das bolsas.

Trata-se de um **protótipo funcional** que demonstra como uma rede permissionada de instituições de saúde pode compartilhar, rastrear e auditar recursos sanguíneos de forma transparente, segura e descentralizada.

---

## 🎯 Finalidade do Projeto

### Problema que Resolve

No ecossistema de saúde, o controle de bolsas de sangue enfrenta desafios significativos:

1. **Falta de rastreabilidade**: Dificuldade em acompanhar o histórico completo de uma bolsa desde a coleta até o uso.
2. **Ausência de auditoria confiável**: Sistemas centralizados podem ser manipulados ou ter registros alterados.
3. **Ineficiência na redistribuição**: Hospitais com excesso de estoque não conseguem transferir bolsas para instituições com deficiência de forma ágil.
4. **Fragilidade no monitoramento**: Controle de temperatura e condições de armazenamento muitas vezes não são registrados de forma imutável.
5. **Dificuldade de verificação**: Não há como garantir que o histórico de uma bolsa não foi adulterado.

### Solução Proposta

O BloodLink resolve esses problemas através de:

- **Blockchain permissionada**: Registro imutável de todos os eventos relacionados a cada bolsa.
- **Rede colaborativa**: Hospitais e hemocentros conectados em uma única rede confiável.
- **Rastreabilidade completa**: Histórico detalhado desde a coleta até o uso ou descarte.
- **Verificação criptográfica**: Possibilidade de validar a integridade de qualquer registro.
- **Sistema de demandas**: Mecanismo para solicitar e atender necessidades de sangue entre instituições.

---

## 👥 Público-Alvo

O sistema é destinado a:

- **Hemocentros**: Instituições responsáveis pela coleta, testes e armazenamento de sangue.
- **Hospitais**: Instituições que utilizam bolsas de sangue em procedimentos médicos.
- **Auditores**: Profissionais responsáveis por verificar a conformidade dos processos.
- **Administradores**: Gestores do sistema que configuram instituições e usuários.

---

## 🏗️ Arquitetura do Sistema

### Perfis de Usuário

| Papel | Responsabilidades |
|-------|-------------------|
| **ADMIN** | Gerencia instituições, usuários e tem acesso total ao sistema |
| **HEMOCENTRO** | Cadastra bolsas, realiza testes, aprova/reprova, controla estoque |
| **HOSPITAL** | Cria demandas, recebe bolsas, registra uso em procedimentos |
| **AUDITOR** | Consulta registros, verifica integridade blockchain, audita processos |

### Componentes Principais

1. **Frontend (React + TypeScript + Tailwind)**
   - Interface responsiva e moderna
   - Dashboard com métricas em tempo real
   - Geração e escaneamento de QR Codes
   - Visualização da blockchain

2. **Backend (Node.js + Express + Prisma)**
   - API REST completa
   - Autenticação JWT com RBAC
   - Validação com Zod
   - Integração com blockchain

3. **Blockchain (Hardhat + Solidity)**
   - Contrato append-only
   - Hashes SHA-256 reais
   - Proof of Work
   - Verificação de integridade

4. **Banco de Dados (PostgreSQL)**
   - Armazenamento de dados sensíveis
   - Relacionamentos complexos
   - Consultas otimizadas

---

## 🔄 Fluxo de uma Bolsa de Sangue

```
COLETA → TESTES → APROVAÇÃO/REPROVAÇÃO → ARMAZENAMENTO → DISPONIBILIZAÇÃO
                                                              ↓
                                          ┌───────────────────┴───────────────────┐
                                          ↓                   ↓                   ↓
                                    UTILIZADA          TRANSFERÊNCIA          DESCARTADA
                                                           ↓
                                          ┌────────────────┴────────────────┐
                                          ↓                ↓                ↓
                                      OFERTADA → ACEITA → RESERVADA → EM_TRANSPORTE → RECEBIDA
```

Cada etapa é registrada na blockchain com:
- Hash SHA-256 dos dados
- Timestamp preciso
- Identificação do responsável
- Instituição onde ocorreu
- Link para o bloco anterior

---

## 🔐 Segurança e Privacidade

### O que é Registrado na Blockchain
✅ Código da bolsa (identificador lógico)
✅ Tipo sanguíneo
✅ Volume
✅ Tipo de evento (COLETA, APROVACAO, etc.)
✅ Hash SHA-256 dos dados completos
✅ ID do usuário responsável
✅ ID da instituição
✅ Timestamp

### O que NÃO é Registrado na Blockchain
❌ Dados pessoais de doadores (nome, CPF, etc.)
❌ Informações clínicas sensíveis
❌ Resultados detalhados de testes
❌ Qualquer dado que permita identificação do doador

Os dados sensíveis ficam apenas no banco de dados PostgreSQL, com acesso restrito e controle de permissões.

---

## 🎨 Diferenciais do Projeto

### 1. **Blockchain Real e Funcional**
- Hashes SHA-256 criptograficamente seguros (Web Crypto API)
- Estrutura de blocos imutável com linkagem
- Proof of Work simplificado
- Persistência em localStorage
- Verificação de integridade completa

### 2. **Interface Moderna e Responsiva**
- Design profissional com Tailwind CSS
- Gráficos interativos com Recharts
- QR Codes para acesso rápido
- Navegação intuitiva

### 3. **Sistema de Transferências Completo**
- Fluxo completo: oferta → aceite → reserva → transporte → recebimento
- Guards de status em todas as transições
- Registro blockchain em cada etapa

### 4. **Monitoramento de Temperatura**
- Registro de leituras
- Alertas automáticos
- Gráficos de evolução
- Integração com blockchain

### 5. **Auditoria Completa**
- Log de todas as ações
- Verificação de integridade blockchain
- Explorer visual da cadeia
- Estatísticas em tempo real

### 6. **Testes Abrangentes**
- Testes unitários no frontend (Vitest)
- Testes de integração no backend (Jest)
- Testes do contrato blockchain (Hardhat)
- Cobertura de casos críticos

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- React Router (navegação)
- Recharts (gráficos)
- qrcode.react (geração de QR)
- html5-qrcode (escaneamento)
- Vitest + Testing Library (testes)
- Zod (validação)

### Backend
- Node.js 20 + TypeScript (strict)
- Express.js (API REST)
- Prisma ORM
- PostgreSQL 15
- JWT + bcrypt (autenticação)
- Zod (validação)
- ethers.js (blockchain)
- Jest + Supertest (testes)

### Blockchain
- Hardhat (framework)
- Solidity 0.8.20 (contratos)
- EVM local (desenvolvimento)
- Web Crypto API (hashes SHA-256)

### Infraestrutura
- Docker + Docker Compose
- Nginx (servidor frontend)
- GitHub Actions (CI/CD)

---

## 📊 Dados de Demonstração

O sistema vem pré-carregado com:

- **5 instituições** (2 hemocentros + 3 hospitais)
- **6 usuários** (1 de cada perfil + extras)
- **120 bolsas** com status variados
- **Demandas** de diferentes urgências
- **Transferências** em diferentes estágios
- **Leituras de temperatura** incluindo alertas
- **Logs de auditoria** de ações realizadas

---

## 🎓 Contexto Acadêmico

O BloodLink foi desenvolvido como **protótipo acadêmico** para demonstrar:

1. **Aplicação prática de blockchain** em saúde
2. **Sistemas distribuídos** com múltiplos participantes
3. **Rastreabilidade imutável** de recursos críticos
4. **Segurança e privacidade** de dados sensíveis
5. **Arquitetura moderna** de aplicações web
6. **Boas práticas** de desenvolvimento

### ⚠️ Aviso Importante

Este é um **protótipo acadêmico** e **NÃO é software médico validado para produção**. Não deve ser utilizado em ambientes clínicos reais sem:
- Validação regulatória completa (ANVISA, FDA, etc.)
- Auditoria de segurança independente
- Testes clínicos adequados
- Certificações necessárias

---

## 🚀 Como Executar

### Com Docker (Recomendado)
```bash
docker compose up --build
```

### Desenvolvimento Local
```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

# Blockchain
cd backend/blockchain
npm install
npx hardhat node
```

---

## 📈 Métricas do Projeto

- **Linhas de código**: ~15.000+
- **Componentes React**: 30+
- **Páginas**: 12
- **Endpoints da API**: 30+
- **Testes**: 50+
- **Hooks customizados**: 6
- **Componentes reutilizáveis**: 15+

---

## 🎯 Objetivos Atingidos

✅ Sistema funcional de ponta a ponta
✅ Blockchain real com hashes SHA-256
✅ Rastreabilidade completa de bolsas
✅ Sistema de transferências entre instituições
✅ Monitoramento de temperatura com alertas
✅ Auditoria completa com verificação blockchain
✅ Interface moderna e responsiva
✅ Testes automatizados nas três camadas
✅ Documentação completa
✅ Docker funcional
✅ CI/CD configurado

---

## 🔮 Melhorias Futuras

- Integração com blockchain permissionada real (Hyperledger Fabric)
- Sensores IoT para monitoramento de temperatura em tempo real
- Notificações push/websocket
- Mapa interativo das instituições
- Relatórios PDF exportáveis
- Internacionalização (i18n)
- Dark mode
- PWA (Progressive Web App)
- Testes E2E com Cypress/Playwright

---

## 📄 Licença

MIT License — Ver arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como protótipo acadêmico para demonstrar a aplicação de tecnologia blockchain na área da saúde, especificamente no gerenciamento e rastreabilidade de bolsas de sangue.

**Stack principal**: React + Node.js + PostgreSQL + Blockchain (Hardhat/Solidity)

**Status**: ✅ Funcional e completo para demonstração acadêmica

---

*"O BloodLink demonstra como a tecnologia blockchain pode ser aplicada para resolver problemas reais na área da saúde, garantindo transparência, segurança e rastreabilidade em processos críticos."*

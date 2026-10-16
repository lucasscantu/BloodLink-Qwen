# API Reference

Base URL: `http://localhost:4000/api`

## Autenticação

Todas as rotas (exceto `/auth/login`) requerem header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| POST | `/auth/login` | Login | Público |
| POST | `/auth/register` | Registrar usuário | ADMIN |

### Blood Bags

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/blood-bags` | Listar bolsas | Todos autenticados |
| GET | `/blood-bags/:code` | Detalhe da bolsa | Todos autenticados |
| POST | `/blood-bags` | Cadastrar bolsa | ADMIN, HEMOCENTRO |
| POST | `/blood-bags/:id/approve` | Aprovar bolsa | ADMIN, HEMOCENTRO |
| POST | `/blood-bags/:id/reject` | Reprovar bolsa | ADMIN, HEMOCENTRO |
| POST | `/blood-bags/:id/store` | Armazenar | ADMIN, HEMOCENTRO |
| POST | `/blood-bags/:id/available` | Disponibilizar | ADMIN, HEMOCENTRO |
| POST | `/blood-bags/:id/use` | Marcar como utilizada | ADMIN, HOSPITAL |
| POST | `/blood-bags/:id/discard` | Descartar | ADMIN, HEMOCENTRO |
| GET | `/blood-bags/:code/verify` | Verificar integridade | ADMIN, AUDITOR |

### Demands

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/demands` | Listar demandas | Todos autenticados |
| GET | `/demands/:id` | Detalhe da demanda | Todos autenticados |
| POST | `/demands` | Criar demanda | ADMIN, HOSPITAL |
| GET | `/demands/:id/matching` | Bolsas compatíveis | ADMIN, HEMOCENTRO |
| POST | `/demands/:id/cancel` | Cancelar demanda | ADMIN, HOSPITAL |

### Transfers

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/transfers` | Listar transferências | Todos autenticados |
| GET | `/transfers/:id` | Detalhe | Todos autenticados |
| POST | `/transfers` | Ofertar transferência | ADMIN, HEMOCENTRO |
| POST | `/transfers/:id/accept` | Aceitar | ADMIN, HOSPITAL |
| POST | `/transfers/:id/reserve` | Reservar | ADMIN, HEMOCENTRO |
| POST | `/transfers/:id/transport` | Iniciar transporte | ADMIN, HEMOCENTRO |
| POST | `/transfers/:id/receive` | Confirmar recebimento | ADMIN, HOSPITAL |
| POST | `/transfers/:id/refuse` | Recusar | ADMIN, HOSPITAL |
| POST | `/transfers/:id/cancel` | Cancelar | ADMIN, HEMOCENTRO |

### Institutions

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/institutions` | Listar | Todos autenticados |
| POST | `/institutions` | Criar | ADMIN |
| GET | `/institutions/:id` | Detalhe | Todos autenticados |

### Users

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/users` | Listar | ADMIN |
| POST | `/users` | Criar | ADMIN |
| GET | `/users/:id` | Detalhe | ADMIN |

### Temperature

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/temperature` | Listar leituras | Todos autenticados |
| POST | `/temperature` | Registrar leitura | Todos autenticados |

### Audit

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/audit` | Logs de auditoria | ADMIN, AUDITOR |

### Blockchain

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/blockchain/status` | Status da rede | Todos autenticados |
| GET | `/blockchain/transactions` | Transações | ADMIN, AUDITOR |
| GET | `/blockchain/history/:code` | Histórico on-chain | ADMIN, AUDITOR |

## Filtros (Query Params)

### GET /blood-bags
- `status` — Filtrar por status
- `bloodType` — Filtrar por tipo sanguíneo
- `institutionId` — Filtrar por instituição (mapeado para `instituicaoAtualId`)

### GET /demands
- `status` — Filtrar por status
- `institutionId` — Filtrar por instituição

### GET /transfers
- `status` — Filtrar por status
- `sourceInstitutionId` — Filtrar por origem
- `destinationInstitutionId` — Filtrar por destino

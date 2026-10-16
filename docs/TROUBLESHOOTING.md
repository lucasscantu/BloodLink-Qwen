# Troubleshooting

## Sintoma → Causa → Correção

| Sintoma | Causa | Correção |
|---------|-------|----------|
| Backend não conecta ao Postgres | Porta errada no DATABASE_URL | Verificar formato: `postgresql://user:pass@postgres:5432/db` |
| Prisma "binary not found" no Docker | Falta OpenSSL no Alpine | `RUN apk add --no-cache openssl` antes de `prisma generate` |
| "Cannot read properties of undefined" em transferência | Falta `destinationInstitution` no include | Adicionar no include do endpoint |
| Botão "Aprovar" não aparece | Status COLETADA não incluído na condição | Verificar: `status === 'COLETADA' \|\| status === 'EM_TESTE'` |
| Nonce collision na blockchain | Chamadas concorrentes da mesma wallet | Usar fila de serialização no BlockchainService |
| Migration não aplica tabelas | Pasta migrations vazia | Gerar migration com `prisma migrate dev` ou SQL manual |
| Filtro `instituicaoId` rejeitado pelo Prisma | Nome do campo é `instituicaoAtualId` | Mapear explicitamente no service |
| Frontend travado em "Carregando..." | Promise rejeitada sem catch | Adicionar `.catch()` ou `try/catch` em toda chamada |
| Usuário sem permissão vê página quebrada | Falta guarda de rota no frontend | Adicionar `RoleGuard` no React Router |
| Bolsa UTILIZADA volta para DISPONIVEL | Falta guarda de status no service | Adicionar verificação antes de toda transição |
| Docker backend não encontra contrato | deployed.json não existe | Verificar volume compartilhado e healthcheck do blockchain |
| QR scanner não funciona | Câmera bloqueada pelo browser | Usar modo manual como alternativa |
| Dashboard não carrega | Erro não tratado no useEffect | Adicionar try/catch e setState de erro |

## Limitações Conhecidas

1. **Blockchain local**: Hardhat é uma rede de desenvolvimento. Em produção, usar rede permissionada (Hyperledger Fabric, Quorum).
2. **Temperatura simulada**: Leituras são mock. Em produção, integrar com sensores IoT.
3. **Sem job de expiração**: Status EXPIRADA existe no enum mas não há job automático.
4. **Autenticação simplificada**: JWT com secret fixa. Em produção, usar refresh tokens e rotação de secret.
5. **Sem paginação**: Listas retornam todos os registros. Adicionar cursor-based pagination.

## Melhorias Futuras

- [ ] Integração com Hyperledger Fabric
- [ ] Sensores IoT reais para temperatura
- [ ] Notificações push/websocket
- [ ] Mapa com localização das instituições
- [ ] Relatórios PDF exportáveis
- [ ] 2FA para administradores
- [ ] Rate limiting na API
- [ ] Cache Redis para consultas frequentes

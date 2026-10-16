# Guia de Demonstração

## Roteiro Guiado

### 1. Login
1. Acesse http://localhost:3000
2. Clique em "Administrador" para preencher credenciais
3. Clique em "Entrar"

### 2. Dashboard
- Visualize estatísticas gerais: total de bolsas, disponíveis, em transporte
- Gráficos de distribuição por tipo sanguíneo e status
- Monitoramento de temperatura com alerta
- Atividade recente

### 3. Bolsas de Sangue
1. Navegue para "Bolsas de Sangue"
2. Filtre por status ou tipo sanguíneo
3. Clique no código de uma bolsa (ex: BL-00001)
4. Veja o histórico completo de eventos com hashes blockchain
5. Clique em "QR Code" para gerar
6. Clique em "Verificar Blockchain" para validar integridade

### 4. Escanear QR Code
1. Navegue para "Escanear QR"
2. No modo manual, digite "BL-00001"
3. Ou teste com os códigos sugeridos

### 5. Fluxo de Transferência (como HEMOCENTRO)
1. Faça logout e login como `hemocentro@bloodlink.com`
2. Vá em "Transferências"
3. Clique em "Nova Transferência"
4. Selecione bolsa disponível, instituição destino
5. Acompanhe o fluxo: OFERTADA → ACEITA → RESERVADA → EM_TRANSPORTE → RECEBIDA

### 6. Demandas (como HOSPITAL)
1. Login como `hospitalA@bloodlink.com`
2. Vá em "Demandas"
3. Crie nova demanda com urgência CRÍTICA
4. Veja bolsas compatíveis

### 7. Auditoria (como AUDITOR)
1. Login como `auditor@bloodlink.com`
2. Vá em "Auditoria"
3. Filtre por tipo de ação
4. Verifique a trilha completa

### 8. Administração (como ADMIN)
1. Login como `admin@bloodlink.com`
2. Gerencie instituições e usuários
3. Acesse configurações do sistema

## Cenário de Alerta de Temperatura

A bolsa com status DISPONIVEL tem leituras de temperatura simuladas, incluindo uma acima de 6°C que gera alerta visível no Dashboard e na página de Temperatura.

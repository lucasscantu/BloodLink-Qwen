#!/bin/bash

echo "🩸 BloodLink - Reset Database"
echo "=============================="
echo ""
echo "⚠️  Este script irá:"
echo "   1. Parar todos os containers"
echo "   2. Remover volumes do banco de dados"
echo "   3. Recriar o banco com dados de demonstração"
echo ""
read -p "Deseja continuar? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "🛑 Parando containers..."
docker compose down -v

echo ""
echo "🗑️  Removendo volumes..."
docker volume rm bloodlink_postgres_data 2>/dev/null || true
docker volume rm bloodlink_blockchain_deployed 2>/dev/null || true

echo ""
echo "🔨 Reconstruindo containers..."
docker compose build

echo ""
echo "🚀 Iniciando serviços com seed..."
docker compose up -d

echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

echo ""
echo "✅ Reset completo!"
echo ""
echo "📊 Serviços disponíveis:"
echo "   • Frontend:    http://localhost:3000"
echo "   • Backend API: http://localhost:4000"
echo ""
echo "👥 Usuários de demonstração (senha: senha123):"
echo "   • admin@bloodlink.com"
echo "   • hemocentro@bloodlink.com"
echo "   • hospitalA@bloodlink.com"
echo "   • auditor@bloodlink.com"

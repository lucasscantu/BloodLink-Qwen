#!/bin/bash

echo "🩸 BloodLink - Script de Setup"
echo "================================"
echo ""

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verifica se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# Verifica se as portas estão disponíveis
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    else
        echo "✅ Porta $1 disponível"
        return 0
    fi
}

echo "Verificando portas..."
check_port 3000 || echo "   → Frontend não poderá rodar na porta 3000"
check_port 4000 || echo "   → Backend não poderá rodar na porta 4000"
check_port 5432 || echo "   → PostgreSQL não poderá rodar na porta 5432"
check_port 8545 || echo "   → Blockchain não poderá rodar na porta 8545"
echo ""

# Build e start
echo "🔨 Fazendo build dos containers..."
docker compose build

echo ""
echo "🚀 Iniciando serviços..."
docker compose up -d

echo ""
echo "✅ Setup completo!"
echo ""
echo "📊 Serviços disponíveis:"
echo "   • Frontend:    http://localhost:3000"
echo "   • Backend API: http://localhost:4000"
echo "   • PostgreSQL:  localhost:5432"
echo "   • Blockchain:  http://localhost:8545"
echo ""
echo "👥 Usuários de demonstração (senha: senha123):"
echo "   • admin@bloodlink.com"
echo "   • hemocentro@bloodlink.com"
echo "   • hospitalA@bloodlink.com"
echo "   • auditor@bloodlink.com"
echo ""
echo "📝 Logs: docker compose logs -f"
echo "🛑 Parar: docker compose down"

#!/bin/bash

echo "🩸 BloodLink - Test Runner"
echo "=========================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de resultados
PASSED=0
FAILED=0

# Função para rodar testes
run_tests() {
    local name=$1
    local command=$2
    local dir=$3
    
    echo "🧪 Testando: $name"
    echo "   Comando: $command"
    echo ""
    
    if [ -n "$dir" ]; then
        cd "$dir" || exit 1
    fi
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $name - PASSOU${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $name - FALHOU${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if [ -n "$dir" ]; then
        cd - > /dev/null || exit 1
    fi
    
    echo ""
    echo "─────────────────────────────────────"
    echo ""
}

# Frontend tests
run_tests "Frontend (Vitest)" "npm test" ""

# Backend tests
run_tests "Backend (Jest)" "npm test" "backend"

# Blockchain tests
run_tests "Blockchain (Hardhat)" "npx hardhat test" "backend/blockchain"

# Type checking
echo "🔍 Verificando tipos TypeScript..."
echo ""

if npm run typecheck; then
    echo -e "${GREEN}✅ TypeCheck Frontend - PASSOU${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ TypeCheck Frontend - FALHOU${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

if cd backend && npm run typecheck; then
    echo -e "${GREEN}✅ TypeCheck Backend - PASSOU${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ TypeCheck Backend - FALHOU${NC}"
    FAILED=$((FAILED + 1))
fi

cd ..

echo ""
echo "══════════════════════════════════════"
echo ""
echo "📊 Resumo:"
echo -e "   ${GREEN}✅ Passaram: $PASSED${NC}"
echo -e "   ${RED}❌ Falharam: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Alguns testes falharam. Verifique os logs acima.${NC}"
    exit 1
fi

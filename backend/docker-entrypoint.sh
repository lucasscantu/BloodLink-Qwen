#!/bin/sh
set -e

echo "[BloodLink Backend] Starting..."

# Aguarda o Postgres estar pronto
echo "[BloodLink Backend] Waiting for PostgreSQL..."
until npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; do
  sleep 1
done
echo "[BloodLink Backend] PostgreSQL is ready!"

# Aplica migrations
echo "[BloodLink Backend] Running migrations..."
npx prisma migrate deploy

# Verifica se o banco está vazio (seed condicional)
echo "[BloodLink Backend] Checking if seed is needed..."
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\"" 2>/dev/null | grep -o '[0-9]\+' || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "[BloodLink Backend] Database is empty. Running seed..."
  npx ts-node prisma/seed.ts
  echo "[BloodLink Backend] Seed completed!"
else
  echo "[BloodLink Backend] Database already has data. Skipping seed."
fi

# Inicia o servidor
echo "[BloodLink Backend] Starting server on port ${PORT:-4000}..."
exec node dist/server.js

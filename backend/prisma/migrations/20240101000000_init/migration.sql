-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR');
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');
CREATE TYPE "BloodBagStatus" AS ENUM ('COLETADA', 'EM_TESTE', 'APROVADA', 'REPROVADA', 'ARMAZENADA', 'DISPONIVEL', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA', 'UTILIZADA', 'DESCARTADA', 'EXPIRADA');
CREATE TYPE "InstitutionType" AS ENUM ('HEMOCENTRO', 'HOSPITAL');
CREATE TYPE "DemandStatus" AS ENUM ('ABERTA', 'EM_ANALISE', 'ATENDIDA', 'PARCIALMENTE_ATENDIDA', 'CANCELADA', 'EXPIRADA');
CREATE TYPE "DemandUrgency" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');
CREATE TYPE "TransferStatus" AS ENUM ('OFERTADA', 'ACEITA', 'RESERVADA', 'EM_TRANSPORTE', 'RECEBIDA', 'RECUSADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BloodBag" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "volume" INTEGER NOT NULL,
    "status" "BloodBagStatus" NOT NULL DEFAULT 'COLETADA',
    "instituicaoAtualId" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "blockchainTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BloodBag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BloodBagEvent" (
    "id" TEXT NOT NULL,
    "bloodBagId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "eventIndex" INTEGER NOT NULL,
    "dataHash" TEXT NOT NULL,
    "blockchainTxHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BloodBagEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BloodDemand" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "urgency" "DemandUrgency" NOT NULL,
    "status" "DemandStatus" NOT NULL DEFAULT 'ABERTA',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BloodDemand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BloodTransfer" (
    "id" TEXT NOT NULL,
    "bloodBagId" TEXT NOT NULL,
    "demandId" TEXT,
    "sourceInstitutionId" TEXT NOT NULL,
    "destinationInstitutionId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'OFERTADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BloodTransfer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemperatureReading" (
    "id" TEXT NOT NULL,
    "bloodBagId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "institutionId" TEXT NOT NULL,
    "alert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemperatureReading_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlockchainTransaction" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "bloodBagCode" TEXT NOT NULL,
    "eventIndex" INTEGER NOT NULL,
    "dataHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockchainTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");
CREATE INDEX "Institution_city_state_idx" ON "Institution"("city", "state");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "BloodBag_code_idx" ON "BloodBag"("code");
CREATE UNIQUE INDEX "BloodBag_code_key" ON "BloodBag"("code");
CREATE INDEX "BloodBag_status_idx" ON "BloodBag"("status");
CREATE INDEX "BloodBag_bloodType_idx" ON "BloodBag"("bloodType");
CREATE INDEX "BloodBag_instituicaoAtualId_idx" ON "BloodBag"("instituicaoAtualId");
CREATE INDEX "BloodBagEvent_bloodBagId_eventIndex_idx" ON "BloodBagEvent"("bloodBagId", "eventIndex");
CREATE INDEX "BloodBagEvent_blockchainTxHash_idx" ON "BloodBagEvent"("blockchainTxHash");
CREATE INDEX "BloodDemand_status_idx" ON "BloodDemand"("status");
CREATE INDEX "BloodDemand_bloodType_idx" ON "BloodDemand"("bloodType");
CREATE INDEX "BloodTransfer_status_idx" ON "BloodTransfer"("status");
CREATE INDEX "BloodTransfer_bloodBagId_idx" ON "BloodTransfer"("bloodBagId");
CREATE INDEX "BloodTransfer_demandId_idx" ON "BloodTransfer"("demandId");
CREATE INDEX "TemperatureReading_bloodBagId_idx" ON "TemperatureReading"("bloodBagId");
CREATE INDEX "TemperatureReading_alert_idx" ON "TemperatureReading"("alert");
CREATE UNIQUE INDEX "BlockchainTransaction_txHash_key" ON "BlockchainTransaction"("txHash");
CREATE INDEX "BlockchainTransaction_bloodBagCode_idx" ON "BlockchainTransaction"("bloodBagCode");
CREATE INDEX "BlockchainTransaction_txHash_idx" ON "BlockchainTransaction"("txHash");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BloodBag" ADD CONSTRAINT "BloodBag_instituicaoAtualId_fkey" FOREIGN KEY ("instituicaoAtualId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodBagEvent" ADD CONSTRAINT "BloodBagEvent_bloodBagId_fkey" FOREIGN KEY ("bloodBagId") REFERENCES "BloodBag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodBagEvent" ADD CONSTRAINT "BloodBagEvent_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodBagEvent" ADD CONSTRAINT "BloodBagEvent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodDemand" ADD CONSTRAINT "BloodDemand_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodTransfer" ADD CONSTRAINT "BloodTransfer_bloodBagId_fkey" FOREIGN KEY ("bloodBagId") REFERENCES "BloodBag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodTransfer" ADD CONSTRAINT "BloodTransfer_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "BloodDemand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BloodTransfer" ADD CONSTRAINT "BloodTransfer_sourceInstitutionId_fkey" FOREIGN KEY ("sourceInstitutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BloodTransfer" ADD CONSTRAINT "BloodTransfer_destinationInstitutionId_fkey" FOREIGN KEY ("destinationInstitutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TemperatureReading" ADD CONSTRAINT "TemperatureReading_bloodBagId_fkey" FOREIGN KEY ("bloodBagId") REFERENCES "BloodBag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TemperatureReading" ADD CONSTRAINT "TemperatureReading_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

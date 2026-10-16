const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BloodLinkRegistry", function () {
  let registry;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const BloodLinkRegistry = await ethers.getContractFactory("BloodLinkRegistry");
    registry = await BloodLinkRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Registro e leitura de histórico", function () {
    it("deve registrar um evento e retornar eventIndex 0", async function () {
      const tx = await registry.registerEvent(
        "BL-00001", "COLETA", "0xabc123", "user-1", "inst-1"
      );
      const receipt = await tx.wait();
      
      const count = await registry.getEventCount("BL-00001");
      expect(count).to.equal(1);
      
      const history = await registry.getHistory("BL-00001");
      expect(history.length).to.equal(1);
      expect(history[0].eventIndex).to.equal(0);
      expect(history[0].eventType).to.equal("COLETA");
      expect(history[0].dataHash).to.equal("0xabc123");
    });

    it("deve registrar múltiplos eventos com índices sequenciais", async function () {
      await registry.registerEvent("BL-00002", "COLETA", "0xhash1", "user-1", "inst-1");
      await registry.registerEvent("BL-00002", "APROVACAO", "0xhash2", "user-2", "inst-1");
      await registry.registerEvent("BL-00002", "ARMAZENAMENTO", "0xhash3", "user-1", "inst-1");
      
      const history = await registry.getHistory("BL-00002");
      expect(history.length).to.equal(3);
      expect(history[0].eventIndex).to.equal(0);
      expect(history[1].eventIndex).to.equal(1);
      expect(history[2].eventIndex).to.equal(2);
    });
  });

  describe("Natureza append-only", function () {
    it("não deve expor funções de update ou delete", async function () {
      // Verifica que o contrato não tem funções de modificação além de registerEvent
      const functions = registry.interface.fragments.filter(f => f.type === "function");
      const names = functions.map(f => f.name);
      
      expect(names).to.include("registerEvent");
      expect(names).to.include("getHistory");
      expect(names).to.include("verifyEvent");
      expect(names).to.include("getEventCount");
      
      // Não deve ter funções como updateEvent, deleteEvent, removeEvent
      expect(names).to.not.include("updateEvent");
      expect(names).to.not.include("deleteEvent");
      expect(names).to.not.include("removeEvent");
      expect(names).to.not.include("modifyEvent");
    });

    it("deve manter eventos anteriores intactos após novo registro", async function () {
      await registry.registerEvent("BL-00003", "COLETA", "0xoriginal", "user-1", "inst-1");
      
      const historyBefore = await registry.getHistory("BL-00003");
      expect(historyBefore[0].dataHash).to.equal("0xoriginal");
      
      // Registra novo evento
      await registry.registerEvent("BL-00003", "APROVACAO", "0xnew", "user-2", "inst-1");
      
      // Evento anterior não foi alterado
      const historyAfter = await registry.getHistory("BL-00003");
      expect(historyAfter[0].dataHash).to.equal("0xoriginal");
      expect(historyAfter[1].dataHash).to.equal("0xnew");
    });
  });

  describe("verifyEvent", function () {
    it("deve retornar true para hash correto", async function () {
      await registry.registerEvent("BL-00004", "COLETA", "0xcorrect_hash", "user-1", "inst-1");
      
      const result = await registry.verifyEvent("BL-00004", 0, "0xcorrect_hash");
      expect(result).to.be.true;
    });

    it("deve retornar false para hash divergente", async function () {
      await registry.registerEvent("BL-00005", "COLETA", "0xoriginal_hash", "user-1", "inst-1");
      
      const result = await registry.verifyEvent("BL-00005", 0, "0xwrong_hash");
      expect(result).to.be.false;
    });

    it("deve retornar false para eventIndex inexistente", async function () {
      await registry.registerEvent("BL-00006", "COLETA", "0xhash", "user-1", "inst-1");
      
      const result = await registry.verifyEvent("BL-00006", 99, "0xhash");
      expect(result).to.be.false;
    });
  });

  describe("Isolamento entre bolsas", function () {
    it("deve isolar histórico entre bolsas diferentes", async function () {
      await registry.registerEvent("BL-00007", "COLETA", "0xhash_a", "user-1", "inst-1");
      await registry.registerEvent("BL-00008", "COLETA", "0xhash_b", "user-2", "inst-2");
      
      const historyA = await registry.getHistory("BL-00007");
      const historyB = await registry.getHistory("BL-00008");
      
      expect(historyA.length).to.equal(1);
      expect(historyB.length).to.equal(1);
      expect(historyA[0].dataHash).to.equal("0xhash_a");
      expect(historyB[0].dataHash).to.equal("0xhash_b");
    });
  });
});

import { describe, it, expect } from 'chai';
const { ethers } = require("hardhat");

describe("BloodLinkRegistry - Advanced Tests", function () {
  let registry;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const BloodLinkRegistry = await ethers.getContractFactory("BloodLinkRegistry");
    registry = await BloodLinkRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Event Emission", function () {
    it("deve emitir evento EventRegistered ao registrar", async function () {
      await expect(
        registry.registerEvent("BL-00001", "COLETA", "0xhash", "user-1", "inst-1")
      ).to.emit(registry, "EventRegistered")
        .withArgs("BL-00001", 0, "COLETA", "0xhash", "user-1", "inst-1", await getBlockTimestamp());
    });
  });

  describe("Concurrent Registration", function () {
    it("deve manter ordem correta com múltiplos registros sequenciais", async function () {
      // Registra 5 eventos
      for (let i = 0; i < 5; i++) {
        await registry.registerEvent("BL-00010", `EVENT_${i}`, `0xhash${i}`, "user-1", "inst-1");
      }

      const history = await registry.getHistory("BL-00010");
      expect(history.length).to.equal(5);

      // Verifica ordem
      for (let i = 0; i < 5; i++) {
        expect(history[i].eventIndex).to.equal(i);
        expect(history[i].eventType).to.equal(`EVENT_${i}`);
      }
    });
  });

  describe("Empty History", function () {
    it("deve retornar array vazio para bolsa sem eventos", async function () {
      const history = await registry.getHistory("BL-99999");
      expect(history.length).to.equal(0);
    });

    it("deve retornar 0 para getEventCount de bolsa inexistente", async function () {
      const count = await registry.getEventCount("BL-99999");
      expect(count).to.equal(0);
    });

    it("verifyEvent deve retornar false para bolsa inexistente", async function () {
      const result = await registry.verifyEvent("BL-99999", 0, "0xhash");
      expect(result).to.be.false;
    });
  });

  describe("Data Integrity", function () {
    it("deve armazenar todos os campos corretamente", async function () {
      await registry.registerEvent(
        "BL-00020",
        "APROVACAO",
        "0xabcdef1234567890",
        "user-42",
        "inst-99"
      );

      const history = await registry.getHistory("BL-00020");
      const event = history[0];

      expect(event.eventIndex).to.equal(0);
      expect(event.eventType).to.equal("APROVACAO");
      expect(event.dataHash).to.equal("0xabcdef1234567890");
      expect(event.performedBy).to.equal("user-42");
      expect(event.institutionId).to.equal("inst-99");
      expect(event.timestamp).to.be.greaterThan(0);
    });

    it("deve manter timestamp consistente", async function () {
      const tx = await registry.registerEvent("BL-00030", "COLETA", "0xhash", "user-1", "inst-1");
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const history = await registry.getHistory("BL-00030");
      expect(Number(history[0].timestamp)).to.equal(block.timestamp);
    });
  });

  describe("Multiple Users", function () {
    it("deve permitir que diferentes usuários registrem eventos para a mesma bolsa", async function () {
      await registry.connect(owner).registerEvent("BL-00040", "COLETA", "0xhash1", "user-1", "inst-1");
      await registry.connect(user1).registerEvent("BL-00040", "APROVACAO", "0xhash2", "user-2", "inst-1");

      const history = await registry.getHistory("BL-00040");
      expect(history.length).to.equal(2);
      expect(history[0].performedBy).to.equal("user-1");
      expect(history[1].performedBy).to.equal("user-2");
    });
  });

  describe("Special Characters", function () {
    it("deve aceitar strings com caracteres especiais", async function () {
      await registry.registerEvent(
        "BL-00050",
        "COLETA ESPECIAL",
        "0xhash-com-caracteres-especiais-!@#$%",
        "user-1",
        "inst-1"
      );

      const history = await registry.getHistory("BL-00050");
      expect(history[0].eventType).to.equal("COLETA ESPECIAL");
      expect(history[0].dataHash).to.equal("0xhash-com-caracteres-especiais-!@#$%");
    });

    it("deve aceitar strings vazias", async function () {
      await registry.registerEvent("BL-00060", "", "", "", "");

      const history = await registry.getHistory("BL-00060");
      expect(history.length).to.equal(1);
      expect(history[0].eventType).to.equal("");
      expect(history[0].dataHash).to.equal("");
    });
  });
});

async function getBlockTimestamp() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
}

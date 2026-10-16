// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BloodLinkRegistry
 * @dev Contrato append-only para registro de eventos de bolsas de sangue.
 *      Não permite atualização nem exclusão de registros — apenas leitura e append.
 */
contract BloodLinkRegistry {
    struct Event {
        uint256 eventIndex;
        string eventType;
        string dataHash;
        string performedBy;
        string institutionId;
        uint256 timestamp;
        string txHash; // preenchido externamente ou via hash da tx
    }

    // bloodBagCode => array de eventos
    mapping(string => Event[]) private histories;
    // bloodBagCode => contagem
    mapping(string => uint256) private eventCounts;

    event EventRegistered(
        string indexed bloodBagCode,
        uint256 indexed eventIndex,
        string eventType,
        string dataHash,
        string performedBy,
        string institutionId,
        uint256 timestamp
    );

    /**
     * @dev Registra um novo evento para uma bolsa. Append-only.
     * @return eventIndex O índice do evento recém-criado no array daquela bolsa.
     */
    function registerEvent(
        string memory bloodBagCode,
        string memory eventType,
        string memory dataHash,
        string memory performedBy,
        string memory institutionId
    ) external returns (uint256 eventIndex) {
        eventIndex = eventCounts[bloodBagCode];
        
        histories[bloodBagCode].push(Event({
            eventIndex: eventIndex,
            eventType: eventType,
            dataHash: dataHash,
            performedBy: performedBy,
            institutionId: institutionId,
            timestamp: block.timestamp,
            txHash: "" // será preenchido pelo backend com o hash real
        }));
        
        eventCounts[bloodBagCode] = eventIndex + 1;
        
        emit EventRegistered(
            bloodBagCode,
            eventIndex,
            eventType,
            dataHash,
            performedBy,
            institutionId,
            block.timestamp
        );
        
        return eventIndex;
    }

    /**
     * @dev Retorna o histórico completo de eventos de uma bolsa.
     */
    function getHistory(string memory bloodBagCode) external view returns (Event[] memory) {
        return histories[bloodBagCode];
    }

    /**
     * @dev Verifica se o hash de um evento específico confere com o registrado.
     *      Usa o eventIndex real (persistido no momento do registro).
     */
    function verifyEvent(
        string memory bloodBagCode,
        uint256 eventIndex,
        string memory expectedHash
    ) external view returns (bool) {
        if (eventIndex >= eventCounts[bloodBagCode]) {
            return false;
        }
        return keccak256(abi.encodePacked(histories[bloodBagCode][eventIndex].dataHash))
            == keccak256(abi.encodePacked(expectedHash));
    }

    /**
     * @dev Retorna a quantidade de eventos de uma bolsa.
     */
    function getEventCount(string memory bloodBagCode) external view returns (uint256) {
        return eventCounts[bloodBagCode];
    }

    // ⚠️ NOTA: Não existem funções de update ou delete.
    // O contrato é estritamente append-only por design.
}

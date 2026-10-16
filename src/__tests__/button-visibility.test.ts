import { describe, it, expect } from 'vitest';
import { BloodBagStatus } from '../types';

// Função que determina quais botões de ação devem ser visíveis
// ⚠️ CORREÇÃO: COLETADA e EM_TESTE devem mostrar botões de Aprovar/Reprovar
export function getAvailableActions(status: BloodBagStatus, userRole: string): string[] {
  const actions: string[] = [];

  // ⚠️ CORREÇÃO DO BUG: Ambas as condições COLETADA e EM_TESTE devem mostrar Aprovar/Reprovar
  if (status === 'COLETADA' || status === 'EM_TESTE') {
    if (userRole === 'ADMIN' || userRole === 'HEMOCENTRO') {
      actions.push('approve', 'reject');
    }
  }

  if (status === 'APROVADA') {
    if (userRole === 'ADMIN' || userRole === 'HEMOCENTRO') {
      actions.push('store');
    }
  }

  if (status === 'ARMAZENADA') {
    if (userRole === 'ADMIN' || userRole === 'HEMOCENTRO') {
      actions.push('makeAvailable');
    }
  }

  if (status === 'DISPONIVEL') {
    if (userRole === 'ADMIN' || userRole === 'HOSPITAL') {
      actions.push('markAsUsed');
    }
    if (userRole === 'ADMIN' || userRole === 'HEMOCENTRO') {
      actions.push('startTransfer', 'discard');
    }
  }

  if (status === 'RESERVADA') {
    if (userRole === 'ADMIN' || userRole === 'HEMOCENTRO') {
      actions.push('startTransport');
    }
  }

  if (status === 'EM_TRANSPORTE') {
    if (userRole === 'ADMIN' || userRole === 'HOSPITAL') {
      actions.push('confirmReceive');
    }
  }

  if (status === 'RECEBIDA') {
    if (userRole === 'ADMIN' || userRole === 'HOSPITAL') {
      actions.push('markAsUsed');
    }
  }

  return actions;
}

describe('Visibilidade condicional de botões por status', () => {
  describe('Status COLETADA', () => {
    it('⚠️ DEVE mostrar botão de aprovar (correção do bug)', () => {
      const actions = getAvailableActions('COLETADA', 'HEMOCENTRO');
      expect(actions).toContain('approve');
    });

    it('⚠️ DEVE mostrar botão de reprovar (correção do bug)', () => {
      const actions = getAvailableActions('COLETADA', 'HEMOCENTRO');
      expect(actions).toContain('reject');
    });

    it('ADMIN também deve ver botões de aprovar/reprovar', () => {
      const actions = getAvailableActions('COLETADA', 'ADMIN');
      expect(actions).toContain('approve');
      expect(actions).toContain('reject');
    });

    it('HOSPITAL não deve ver botões de aprovar/reprovar', () => {
      const actions = getAvailableActions('COLETADA', 'HOSPITAL');
      expect(actions).not.toContain('approve');
      expect(actions).not.toContain('reject');
    });
  });

  describe('Status EM_TESTE', () => {
    it('deve mostrar botão de aprovar', () => {
      const actions = getAvailableActions('EM_TESTE', 'HEMOCENTRO');
      expect(actions).toContain('approve');
    });

    it('deve mostrar botão de reprovar', () => {
      const actions = getAvailableActions('EM_TESTE', 'HEMOCENTRO');
      expect(actions).toContain('reject');
    });
  });

  describe('Status APROVADA', () => {
    it('deve mostrar botão de armazenar', () => {
      const actions = getAvailableActions('APROVADA', 'HEMOCENTRO');
      expect(actions).toContain('store');
    });

    it('não deve mostrar botão de aprovar', () => {
      const actions = getAvailableActions('APROVADA', 'HEMOCENTRO');
      expect(actions).not.toContain('approve');
    });
  });

  describe('Status ARMAZENADA', () => {
    it('deve mostrar botão de disponibilizar', () => {
      const actions = getAvailableActions('ARMAZENADA', 'HEMOCENTRO');
      expect(actions).toContain('makeAvailable');
    });
  });

  describe('Status DISPONIVEL', () => {
    it('HOSPITAL deve ver botão de utilizar', () => {
      const actions = getAvailableActions('DISPONIVEL', 'HOSPITAL');
      expect(actions).toContain('markAsUsed');
    });

    it('HEMOCENTRO deve ver botão de transferir', () => {
      const actions = getAvailableActions('DISPONIVEL', 'HEMOCENTRO');
      expect(actions).toContain('startTransfer');
    });

    it('HEMOCENTRO deve ver botão de descartar', () => {
      const actions = getAvailableActions('DISPONIVEL', 'HEMOCENTRO');
      expect(actions).toContain('discard');
    });
  });

  describe('Status RESERVADA', () => {
    it('deve mostrar botão de iniciar transporte', () => {
      const actions = getAvailableActions('RESERVADA', 'HEMOCENTRO');
      expect(actions).toContain('startTransport');
    });
  });

  describe('Status EM_TRANSPORTE', () => {
    it('HOSPITAL deve ver botão de confirmar recebimento', () => {
      const actions = getAvailableActions('EM_TRANSPORTE', 'HOSPITAL');
      expect(actions).toContain('confirmReceive');
    });
  });

  describe('Status RECEBIDA', () => {
    it('HOSPITAL deve ver botão de utilizar', () => {
      const actions = getAvailableActions('RECEBIDA', 'HOSPITAL');
      expect(actions).toContain('markAsUsed');
    });
  });

  describe('Status UTILIZADA', () => {
    it('não deve mostrar nenhuma ação', () => {
      const actions = getAvailableActions('UTILIZADA', 'ADMIN');
      expect(actions).toHaveLength(0);
    });
  });

  describe('Status DESCARTADA', () => {
    it('não deve mostrar nenhuma ação', () => {
      const actions = getAvailableActions('DESCARTADA', 'ADMIN');
      expect(actions).toHaveLength(0);
    });
  });

  describe('Status REPROVADA', () => {
    it('não deve mostrar nenhuma ação', () => {
      const actions = getAvailableActions('REPROVADA', 'ADMIN');
      expect(actions).toHaveLength(0);
    });
  });
});

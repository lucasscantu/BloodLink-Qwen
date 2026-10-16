import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatBloodType,
  formatVolume,
  truncateText,
  formatHash,
  timeAgo,
} from '../utils/format';

describe('Format Utils', () => {
  describe('formatDate', () => {
    it('deve formatar data em pt-BR', () => {
      const result = formatDate('2024-06-15T10:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data e hora em pt-BR', () => {
      const result = formatDateTime('2024-06-15T10:30:00Z');
      expect(result).toBeDefined();
    });
  });

  describe('formatBloodType', () => {
    it('deve formatar A_POS como A+', () => {
      expect(formatBloodType('A_POS')).toBe('A+');
    });

    it('deve formatar O_NEG como O-', () => {
      expect(formatBloodType('O_NEG')).toBe('O-');
    });

    it('deve formatar AB_POS como AB+', () => {
      expect(formatBloodType('AB_POS')).toBe('AB+');
    });
  });

  describe('formatVolume', () => {
    it('deve formatar volume com mL', () => {
      expect(formatVolume(450)).toBe('450 mL');
    });

    it('deve formatar volume pequeno', () => {
      expect(formatVolume(200)).toBe('200 mL');
    });
  });

  describe('truncateText', () => {
    it('deve retornar texto completo se menor que maxLength', () => {
      expect(truncateText('curto', 10)).toBe('curto');
    });

    it('deve truncar texto longo com ellipsis', () => {
      expect(truncateText('texto muito longo para exibir', 10)).toBe('texto muit...');
    });

    it('deve retornar texto exato se igual a maxLength', () => {
      expect(truncateText('exatamente', 10)).toBe('exatamente');
    });
  });

  describe('formatHash', () => {
    it('deve truncar hash longo', () => {
      const hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890';
      const result = formatHash(hash, 6);
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(hash.length);
    });

    it('deve retornar hash completo se curto', () => {
      const hash = '0xabc';
      expect(formatHash(hash, 10)).toBe('0xabc');
    });
  });

  describe('timeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('deve retornar "agora mesmo" para menos de 1 minuto', () => {
      expect(timeAgo('2024-06-15T11:59:30Z')).toBe('agora mesmo');
    });

    it('deve retornar minutos', () => {
      expect(timeAgo('2024-06-15T11:55:00Z')).toBe('há 5 minutos');
    });

    it('deve retornar "há 1 minuto" (singular)', () => {
      expect(timeAgo('2024-06-15T11:59:00Z')).toBe('há 1 minuto');
    });

    it('deve retornar horas', () => {
      expect(timeAgo('2024-06-15T09:00:00Z')).toBe('há 3 horas');
    });

    it('deve retornar dias', () => {
      expect(timeAgo('2024-06-12T12:00:00Z')).toBe('há 3 dias');
    });
  });
});

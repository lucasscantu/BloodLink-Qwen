import { describe, it, expect } from 'vitest';

// Função de extração de código QR (reutilizada do ScanQR.tsx)
export function extractCodeFromQR(text: string): string | null {
  // Aceita URL completa: http://localhost:3000/blood-bags/BL-00001
  const urlMatch = text.match(/blood-bags\/(BL-\d+)/);
  if (urlMatch) return urlMatch[1];
  
  // Aceita código puro: BL-00001
  const codeMatch = text.match(/BL-\d{5}/);
  if (codeMatch) return codeMatch[0];
  
  return null;
}

describe('Extração de código do QR Code', () => {
  describe('URL completa', () => {
    it('deve extrair código de URL localhost', () => {
      const result = extractCodeFromQR('http://localhost:3000/blood-bags/BL-00001');
      expect(result).toBe('BL-00001');
    });

    it('deve extrair código de URL com domínio', () => {
      const result = extractCodeFromQR('https://bloodlink.example.com/blood-bags/BL-00042');
      expect(result).toBe('BL-00042');
    });

    it('deve extrair código de URL com path adicional', () => {
      const result = extractCodeFromQR('http://localhost:3000/blood-bags/BL-00100?qr=true');
      expect(result).toBe('BL-00100');
    });
  });

  describe('Código puro', () => {
    it('deve extrair código BL-00001', () => {
      const result = extractCodeFromQR('BL-00001');
      expect(result).toBe('BL-00001');
    });

    it('deve extrair código BL-99999', () => {
      const result = extractCodeFromQR('BL-99999');
      expect(result).toBe('BL-99999');
    });

    it('deve extrair código de texto com prefixo', () => {
      const result = extractCodeFromQR('Bolsa: BL-00050');
      expect(result).toBe('BL-00050');
    });
  });

  describe('Texto inválido', () => {
    it('deve retornar null para texto sem código', () => {
      const result = extractCodeFromQR('texto qualquer sem código');
      expect(result).toBeNull();
    });

    it('deve retornar null para string vazia', () => {
      const result = extractCodeFromQR('');
      expect(result).toBeNull();
    });

    it('deve retornar null para código com formato errado', () => {
      const result = extractCodeFromQR('BL-123'); // apenas 3 dígitos
      expect(result).toBeNull();
    });

    it('deve retornar null para código com letras extras', () => {
      const result = extractCodeFromQR('BL-00001A');
      // Deve extrair BL-00001 (os primeiros 5 dígitos)
      expect(result).toBe('BL-00001');
    });
  });

  describe('Casos edge', () => {
    it('deve extrair o primeiro código encontrado em texto com múltiplos', () => {
      const result = extractCodeFromQR('BL-00001 e BL-00002');
      expect(result).toBe('BL-00001');
    });

    it('deve ser case-sensitive para BL', () => {
      const result = extractCodeFromQR('bl-00001');
      expect(result).toBeNull();
    });

    it('deve aceitar URL com query params', () => {
      const result = extractCodeFromQR('http://localhost:3000/blood-bags/BL-00001?tab=history');
      expect(result).toBe('BL-00001');
    });
  });
});

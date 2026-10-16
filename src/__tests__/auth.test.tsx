import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

// Helper para renderizar com providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
}

describe('Login Page', () => {
  it('deve renderizar o formulário de login', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('BloodLink')).toBeDefined();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined();
    expect(screen.getByText('Entrar')).toBeDefined();
  });

  it('deve mostrar usuários de demonstração', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('admin@bloodlink.com')).toBeDefined();
    expect(screen.getByText('hemocentro@bloodlink.com')).toBeDefined();
  });

  it('deve preencher email ao clicar em usuário demo', () => {
    renderWithProviders(<Login />);
    const adminBtn = screen.getByText('Administrador');
    fireEvent.click(adminBtn);
    const emailInput = screen.getByPlaceholderText('seu@email.com') as HTMLInputElement;
    expect(emailInput.value).toBe('admin@bloodlink.com');
  });
});

describe('Auth Context', () => {
  it('deve iniciar não autenticado', () => {
    let authState: any;
    function TestComponent() {
      authState = useAuth();
      return null;
    }
    render(
      <BrowserRouter>
        <AuthProvider><TestComponent /></AuthProvider>
      </BrowserRouter>
    );
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBeNull();
  });
});

describe('QR Code extraction', () => {
  it('deve extrair código de URL completa', () => {
    const extractCode = (text: string): string | null => {
      const urlMatch = text.match(/blood-bags\/(BL-\d+)/);
      if (urlMatch) return urlMatch[1];
      const codeMatch = text.match(/BL-\d{5}/);
      if (codeMatch) return codeMatch[0];
      return null;
    };

    expect(extractCode('http://localhost:3000/blood-bags/BL-00001')).toBe('BL-00001');
    expect(extractCode('BL-00042')).toBe('BL-00042');
    expect(extractCode('invalid-text')).toBeNull();
  });
});

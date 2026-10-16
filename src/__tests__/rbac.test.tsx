import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Componente de teste que mostra o papel do usuário
function RoleDisplay() {
  const { user, hasRole } = useAuth();
  return (
    <div>
      <p data-testid="user-role">{user?.role || 'none'}</p>
      <p data-testid="can-admin">{hasRole('ADMIN') ? 'yes' : 'no'}</p>
      <p data-testid="can-hemocentro">{hasRole('HEMOCENTRO') ? 'yes' : 'no'}</p>
      <p data-testid="can-hospital">{hasRole('HOSPITAL') ? 'yes' : 'no'}</p>
      <p data-testid="can-auditor">{hasRole('AUDITOR') ? 'yes' : 'no'}</p>
    </div>
  );
}

describe('AuthContext - RBAC', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve iniciar não autenticado', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RoleDisplay />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-role').textContent).toBe('none');
  });

  it('deve reconhecer papel ADMIN', async () => {
    // Simula login
    localStorage.setItem('bloodlink_user', JSON.stringify({
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'ADMIN',
      institutionId: null,
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <RoleDisplay />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-role').textContent).toBe('ADMIN');
    expect(screen.getByTestId('can-admin').textContent).toBe('yes');
  });

  it('deve reconhecer papel HEMOCENTRO', () => {
    localStorage.setItem('bloodlink_user', JSON.stringify({
      id: '2',
      name: 'Hemocentro',
      email: 'hemo@test.com',
      role: 'HEMOCENTRO',
      institutionId: 'inst-1',
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <RoleDisplay />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-role').textContent).toBe('HEMOCENTRO');
    expect(screen.getByTestId('can-hemocentro').textContent).toBe('yes');
    expect(screen.getByTestId('can-admin').textContent).toBe('no');
  });

  it('deve reconhecer papel HOSPITAL', () => {
    localStorage.setItem('bloodlink_user', JSON.stringify({
      id: '3',
      name: 'Hospital',
      email: 'hospital@test.com',
      role: 'HOSPITAL',
      institutionId: 'inst-2',
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <RoleDisplay />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-role').textContent).toBe('HOSPITAL');
    expect(screen.getByTestId('can-hospital').textContent).toBe('yes');
  });

  it('deve reconhecer papel AUDITOR', () => {
    localStorage.setItem('bloodlink_user', JSON.stringify({
      id: '4',
      name: 'Auditor',
      email: 'auditor@test.com',
      role: 'AUDITOR',
      institutionId: null,
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <RoleDisplay />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-role').textContent).toBe('AUDITOR');
    expect(screen.getByTestId('can-auditor').textContent).toBe('yes');
  });
});

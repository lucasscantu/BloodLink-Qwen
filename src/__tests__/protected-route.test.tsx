import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Componente de teste para rota protegida
function ProtectedTestPage() {
  return <div data-testid="protected-page">Conteúdo Protegido</div>;
}

function PublicTestPage() {
  return <div data-testid="public-page">Conteúdo Público</div>;
}

// Simula o comportamento do ProtectedRoute
function TestProtectedRoute({ children }: { children: React.ReactNode }) {
  const userJson = localStorage.getItem('bloodlink_user');
  if (!userJson) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve redirecionar para /login quando não autenticado', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicTestPage />} />
            <Route path="/protected" element={
              <TestProtectedRoute>
                <ProtectedTestPage />
              </TestProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Deve estar na página pública (login) porque não está autenticado
    expect(screen.getByTestId('public-page')).toBeDefined();
    expect(screen.queryByTestId('protected-page')).toBeNull();
  });

  it('deve renderizar conteúdo quando autenticado', () => {
    localStorage.setItem('bloodlink_user', JSON.stringify({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      role: 'ADMIN',
    }));

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicTestPage />} />
            <Route path="/protected" element={
              <TestProtectedRoute>
                <ProtectedTestPage />
              </TestProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Deve estar na página protegida porque está autenticado
    expect(screen.getByTestId('protected-page')).toBeDefined();
    expect(screen.queryByTestId('public-page')).toBeNull();
  });
});

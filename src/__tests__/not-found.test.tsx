import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

describe('NotFound Page', () => {
  it('deve renderizar código 404', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeDefined();
  });

  it('deve renderizar mensagem de página não encontrada', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('Página não encontrada')).toBeDefined();
  });

  it('deve ter botão para voltar', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('Voltar')).toBeDefined();
  });

  it('deve ter link para dashboard', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('Ir para Dashboard')).toBeDefined();
  });
});

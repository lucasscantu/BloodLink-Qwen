import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

describe('StatusBadge', () => {
  it('deve renderizar o label correto', () => {
    render(<StatusBadge status="DISPONIVEL" label="Disponível" color="bg-green-100 text-green-800" />);
    expect(screen.getByText('Disponível')).toBeDefined();
  });

  it('deve ter data-testid correto', () => {
    render(<StatusBadge status="COLETADA" label="Coletada" color="bg-blue-100 text-blue-800" />);
    expect(screen.getByTestId('status-badge-COLETADA')).toBeDefined();
  });

  it('deve aplicar a classe de cor', () => {
    render(<StatusBadge status="REPROVADA" label="Reprovada" color="bg-red-100 text-red-800" />);
    const badge = screen.getByTestId('status-badge-REPROVADA');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });
});

describe('LoadingSpinner', () => {
  it('deve renderizar com texto padrão', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Carregando...')).toBeDefined();
  });

  it('deve renderizar com texto customizado', () => {
    render(<LoadingSpinner text="Buscando dados..." />);
    expect(screen.getByText('Buscando dados...')).toBeDefined();
  });

  it('deve ter role status para acessibilidade', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('deve ter data-testid', () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId('loading-spinner')).toBeDefined();
  });
});

describe('ErrorMessage', () => {
  it('deve renderizar a mensagem de erro', () => {
    render(<ErrorMessage message="Erro ao carregar dados" />);
    expect(screen.getByText('Erro ao carregar dados')).toBeDefined();
  });

  it('deve ter data-testid', () => {
    render(<ErrorMessage message="Erro" />);
    expect(screen.getByTestId('error-message')).toBeDefined();
  });

  it('deve renderizar botão de retry quando onRetry é fornecido', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Erro" onRetry={onRetry} />);
    expect(screen.getByTestId('retry-button')).toBeDefined();
  });

  it('não deve renderizar botão de retry quando onRetry não é fornecido', () => {
    render(<ErrorMessage message="Erro" />);
    expect(screen.queryByTestId('retry-button')).toBeNull();
  });
});

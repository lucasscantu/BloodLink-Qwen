import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../components/Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar a mensagem', () => {
    render(<Toast message="Operação realizada com sucesso" onClose={vi.fn()} />);
    expect(screen.getByText('Operação realizada com sucesso')).toBeDefined();
  });

  it('deve renderizar tipo success', () => {
    render(<Toast message="Sucesso" type="success" onClose={vi.fn()} />);
    expect(screen.getByTestId('toast-success')).toBeDefined();
  });

  it('deve renderizar tipo error', () => {
    render(<Toast message="Erro" type="error" onClose={vi.fn()} />);
    expect(screen.getByTestId('toast-error')).toBeDefined();
  });

  it('deve renderizar tipo info por padrão', () => {
    render(<Toast message="Info" onClose={vi.fn()} />);
    expect(screen.getByTestId('toast-info')).toBeDefined();
  });

  it('deve chamar onClose ao clicar no botão fechar', () => {
    const onClose = vi.fn();
    render(<Toast message="Teste" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve chamar onClose automaticamente após duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Teste" duration={2000} onClose={onClose} />);
    
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(onClose).toHaveBeenCalled();
  });

  it('deve ter role alert para acessibilidade', () => {
    render(<Toast message="Teste" onClose={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeDefined();
  });
});

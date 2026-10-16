import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../components/ConfirmationModal';

describe('ConfirmationModal', () => {
  it('não deve renderizar quando isOpen é false', () => {
    render(
      <ConfirmationModal
        isOpen={false}
        title="Teste"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText('Teste')).toBeNull();
  });

  it('deve renderizar quando isOpen é true', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirmar Ação"
        message="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Confirmar Ação')).toBeDefined();
    expect(screen.getByText('Tem certeza?')).toBeDefined();
  });

  it('deve chamar onConfirm ao clicar no botão confirmar', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationModal
        isOpen={true}
        title="Teste"
        message="Mensagem"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('deve chamar onCancel ao clicar no botão cancelar', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmationModal
        isOpen={true}
        title="Teste"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('deve usar labels customizados', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Teste"
        message="Mensagem"
        confirmLabel="Sim, excluir"
        cancelLabel="Não, manter"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Sim, excluir')).toBeDefined();
    expect(screen.getByText('Não, manter')).toBeDefined();
  });

  it('deve aplicar classe danger por padrão', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Teste"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton.className).toContain('btn-danger');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../components/Modal';

describe('Modal', () => {
  it('não deve renderizar quando isOpen é false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Teste">
        Conteúdo
      </Modal>
    );
    expect(screen.queryByText('Teste')).toBeNull();
  });

  it('deve renderizar quando isOpen é true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Teste">
        Conteúdo
      </Modal>
    );
    expect(screen.getByText('Teste')).toBeDefined();
    expect(screen.getByText('Conteúdo')).toBeDefined();
  });

  it('deve chamar onClose ao clicar no overlay', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Teste">
        Conteúdo
      </Modal>
    );
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve chamar onClose ao clicar no botão fechar', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Teste">
        Conteúdo
      </Modal>
    );
    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve esconder botão fechar quando showCloseButton é false', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Teste" showCloseButton={false}>
        Conteúdo
      </Modal>
    );
    expect(screen.queryByTestId('modal-close-button')).toBeNull();
  });

  it('deve aplicar classe de tamanho correta', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Teste" size="lg">
        Conteúdo
      </Modal>
    );
    const modal = screen.getByTestId('modal-content');
    expect(modal.className).toContain('max-w-lg');
  });

  it('deve chamar onClose ao pressionar ESC', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Teste">
        Conteúdo
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

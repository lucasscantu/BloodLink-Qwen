import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../hooks/useToast';

describe('useToast', () => {
  it('deve iniciar com lista vazia', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('deve adicionar toast com addToast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('Mensagem de teste', 'info');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Mensagem de teste');
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('deve adicionar toast de sucesso', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success('Operação concluída');
    });
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('deve adicionar toast de erro', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.error('Algo deu errado');
    });
    expect(result.current.toasts[0].type).toBe('error');
  });

  it('deve adicionar toast de info', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.info('Informação');
    });
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('deve remover toast por id', () => {
    const { result } = renderHook(() => useToast());
    let id: string;
    act(() => {
      id = result.current.addToast('Teste', 'info');
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      result.current.removeToast(id!);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('deve adicionar múltiplos toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success('Primeiro');
      result.current.error('Segundo');
      result.current.info('Terceiro');
    });
    expect(result.current.toasts).toHaveLength(3);
  });

  it('deve gerar id único para cada toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('Primeiro', 'info');
      result.current.addToast('Segundo', 'info');
    });
    const ids = result.current.toasts.map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });
});

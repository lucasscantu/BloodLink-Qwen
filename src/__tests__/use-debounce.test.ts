import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve retornar valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('deve atualizar valor após delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'updated' });
    });

    // Ainda não atualizou
    expect(result.current).toBe('initial');

    // Avança o tempo
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('deve resetar timer se valor mudar antes do delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    act(() => {
      rerender({ value: 'second' });
    });

    // Avança metade do tempo
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Muda o valor novamente
    act(() => {
      rerender({ value: 'third' });
    });

    // Avança mais 150ms (total 300ms desde 'second', mas só 150ms desde 'third')
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Ainda deve ser 'first' porque o timer foi resetado
    expect(result.current).toBe('first');

    // Avança mais 150ms (total 300ms desde 'third')
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('third');
  });

  it('deve usar delay padrão de 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    act(() => {
      rerender({ value: 'updated' });
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('deve aceitar delay customizado', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    act(() => {
      rerender({ value: 'updated' });
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../hooks/useForm';
import { z } from 'zod';

const testSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Idade mínima: 18 anos'),
});

describe('useForm', () => {
  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() =>
      useForm({
        schema: testSchema,
        initialValues: { name: '', email: '', age: 0 },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.values).toEqual({ name: '', email: '', age: 0 });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('deve atualizar valores com setValue', () => {
    const { result } = renderHook(() =>
      useForm({
        schema: testSchema,
        initialValues: { name: '', email: '', age: 0 },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setValue('name', 'João');
    });

    expect(result.current.values.name).toBe('João');
  });

  it('deve validar e mostrar erros', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        schema: testSchema,
        initialValues: { name: 'Jo', email: 'invalid', age: 10 },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter quando válido', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        schema: testSchema,
        initialValues: { name: 'João Silva', email: 'joao@test.com', age: 25 },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'João Silva',
      email: 'joao@test.com',
      age: 25,
    });
  });

  it('deve resetar formulário', () => {
    const { result } = renderHook(() =>
      useForm({
        schema: testSchema,
        initialValues: { name: '', email: '', age: 0 },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setValue('name', 'João');
    });

    expect(result.current.values.name).toBe('João');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values.name).toBe('');
  });

  it('deve marcar campos como touched', () => {
    const { result } = renderHook(() =>
      useForm({
        schema: testSchema,
        initialValues: { name: '', email: '', age: 0 },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setTouched('name');
    });

    expect(result.current.touched.name).toBe(true);
  });
});

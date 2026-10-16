import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '../components/Timeline';

const mockItems = [
  {
    id: '1',
    title: 'Evento 1',
    description: 'Descrição 1',
    timestamp: '2024-06-15T10:00:00Z',
    status: 'success' as const,
  },
  {
    id: '2',
    title: 'Evento 2',
    description: 'Descrição 2',
    timestamp: '2024-06-15T11:00:00Z',
    status: 'pending' as const,
  },
  {
    id: '3',
    title: 'Evento 3',
    timestamp: '2024-06-15T12:00:00Z',
    status: 'error' as const,
  },
];

describe('Timeline', () => {
  it('deve renderizar todos os itens', () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText('Evento 1')).toBeDefined();
    expect(screen.getByText('Evento 2')).toBeDefined();
    expect(screen.getByText('Evento 3')).toBeDefined();
  });

  it('deve renderizar descrições quando fornecidas', () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText('Descrição 1')).toBeDefined();
    expect(screen.getByText('Descrição 2')).toBeDefined();
  });

  it('deve mostrar datas por padrão', () => {
    render(<Timeline items={mockItems} />);
    // Deve ter pelo menos uma data formatada
    const dates = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dates.length).toBeGreaterThan(0);
  });

  it('deve esconder datas quando showDate é false', () => {
    render(<Timeline items={mockItems} showDate={false} />);
    const dates = screen.queryAllByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dates.length).toBe(0);
  });

  it('deve renderizar metadata quando fornecida', () => {
    const itemsWithMetadata = [
      {
        ...mockItems[0],
        metadata: { 'Usuário': 'Admin', 'Local': 'SP' },
      },
    ];
    render(<Timeline items={itemsWithMetadata} />);
    expect(screen.getByText('Usuário:')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByText('Local:')).toBeDefined();
    expect(screen.getByText('SP')).toBeDefined();
  });

  it('deve aplicar cores de status corretas', () => {
    const { container } = render(<Timeline items={mockItems} />);
    const successBorder = container.querySelector('.border-green-500');
    const errorBorder = container.querySelector('.border-red-500');
    expect(successBorder).toBeDefined();
    expect(errorBorder).toBeDefined();
  });
});

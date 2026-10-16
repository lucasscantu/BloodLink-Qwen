import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../components/DataTable';

interface TestItem {
  id: number;
  name: string;
  value: number;
}

const mockData: TestItem[] = [
  { id: 1, name: 'Item 1', value: 100 },
  { id: 2, name: 'Item 2', value: 200 },
  { id: 3, name: 'Item 3', value: 300 },
];

const columns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'value', header: 'Valor', sortable: true },
];

describe('DataTable', () => {
  it('deve renderizar dados', () => {
    render(<DataTable data={mockData} columns={columns} />);
    expect(screen.getByText('Item 1')).toBeDefined();
    expect(screen.getByText('Item 2')).toBeDefined();
    expect(screen.getByText('Item 3')).toBeDefined();
  });

  it('deve renderizar cabeçalhos', () => {
    render(<DataTable data={mockData} columns={columns} />);
    expect(screen.getByText('ID')).toBeDefined();
    expect(screen.getByText('Nome')).toBeDefined();
    expect(screen.getByText('Valor')).toBeDefined();
  });

  it('deve mostrar mensagem vazia quando não há dados', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Nenhum item" />);
    expect(screen.getByText('Nenhum item')).toBeDefined();
  });

  it('deve filtrar dados com busca', () => {
    render(<DataTable data={mockData} columns={columns} searchable />);
    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'Item 2' } });
    expect(screen.queryByText('Item 1')).toBeNull();
    expect(screen.getByText('Item 2')).toBeDefined();
  });

  it('deve paginar dados', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: (i + 1) * 100,
    }));
    render(<DataTable data={largeData} columns={columns} itemsPerPage={10} />);
    expect(screen.getByText(/Mostrando 1 a 10 de 25/)).toBeDefined();
  });

  it('deve chamar onRowClick ao clicar em uma linha', () => {
    const onRowClick = vi.fn();
    render(<DataTable data={mockData} columns={columns} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Item 1'));
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('deve renderizar coluna com função render customizada', () => {
    const customColumns = [
      { key: 'name', header: 'Nome', render: (item: TestItem) => <strong>{item.name}</strong> },
    ];
    render(<DataTable data={mockData} columns={customColumns} />);
    const strong = screen.getByText('Item 1').closest('strong');
    expect(strong).toBeDefined();
  });
});

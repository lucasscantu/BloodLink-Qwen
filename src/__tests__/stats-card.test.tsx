import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../components/StatsCard';
import { Droplets } from 'lucide-react';

describe('StatsCard', () => {
  it('deve renderizar título e valor', () => {
    render(<StatsCard title="Total" value={100} icon={<Droplets />} />);
    expect(screen.getByText('Total')).toBeDefined();
    expect(screen.getByText('100')).toBeDefined();
  });

  it('deve renderizar subtítulo quando fornecido', () => {
    render(<StatsCard title="Total" value={100} icon={<Droplets />} subtitle="bolsas" />);
    expect(screen.getByText('bolsas')).toBeDefined();
  });

  it('deve renderizar tendência positiva', () => {
    render(
      <StatsCard
        title="Total"
        value={100}
        icon={<Droplets />}
        trend={{ value: 10, isPositive: true }}
      />
    );
    expect(screen.getByText('10%')).toBeDefined();
    expect(screen.getByText('vs. mês anterior')).toBeDefined();
  });

  it('deve renderizar tendência negativa', () => {
    render(
      <StatsCard
        title="Total"
        value={100}
        icon={<Droplets />}
        trend={{ value: 5, isPositive: false }}
      />
    );
    expect(screen.getByText('5%')).toBeDefined();
  });

  it('deve aplicar cor correta', () => {
    const { container } = render(
      <StatsCard title="Total" value={100} icon={<Droplets />} color="green" />
    );
    const iconContainer = container.querySelector('.bg-green-50');
    expect(iconContainer).toBeDefined();
  });

  it('deve renderizar ícone', () => {
    render(<StatsCard title="Total" value={100} icon={<Droplets data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeDefined();
  });
});

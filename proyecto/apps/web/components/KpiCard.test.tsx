import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import KpiCard from './KpiCard';

test('KpiCard renders title and value', () => {
  render(<KpiCard title="Test KPI" value={123} />);
  expect(screen.getByText('Test KPI')).toBeTruthy();
  expect(screen.getByText('123')).toBeTruthy();
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import PerfilPage from './page';

// Mock de next/navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

// Mock de AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de Navbar
vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

describe('PerfilPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch global
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/egresados/perfil/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            nombres: 'Juan',
            apellidos: 'Perez',
            carrera: 'Ingeniería',
            dni: '12345678',
            habilidades: [{ nombre: 'React' }]
          }),
        });
      }
      if (url.includes('/habilidades')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: '1', nombre: 'React' }],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  test('renders profile page with user data', async () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      userRole: 'egresado',
      userId: 'user-123',
      userName: 'Juan Perez',
      loading: false,
    });

    render(<PerfilPage />);

    // Verificar que se muestra el título
    expect(screen.getByText(/Mi Perfil Profesional/i)).toBeTruthy();

    // Esperar a que los datos se carguen
    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeTruthy();
      expect(screen.getByDisplayValue('Ingeniería')).toBeTruthy();
      expect(screen.getByText('React')).toBeTruthy();
    }, { timeout: 3000 });
  });

  test('redirects to login if not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      userRole: null,
      userId: null,
      userName: null,
      loading: false,
    });

    render(<PerfilPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });
});

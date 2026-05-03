import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import Navbar from './Navbar';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock de AuthContext
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de fetch global
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test('renders public navbar when not logged in', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      userRole: null,
      userName: null,
      logout: mockLogout,
    });

    render(<Navbar />);
    expect(screen.getByText('SEGO SYSTEM')).toBeTruthy();
    expect(screen.getByText('Iniciar Sesión')).toBeTruthy();
    expect(screen.getByText('Registrarse')).toBeTruthy();
  });

  test('renders admin sidebar when logged in as admin', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      userRole: 'admin',
      userName: 'Admin User',
      logout: mockLogout,
    });

    render(<Navbar />);
    
    // Debería mostrar secciones de administración
    expect(screen.getByText('Administración')).toBeTruthy();
    expect(screen.getByText('Panel Principal')).toBeTruthy();
    expect(screen.getAllByText('Gestión de Egresados').length).toBeGreaterThan(0);
    expect(screen.getByText('Admin User')).toBeTruthy();
  });

  test('renders egresado sidebar when logged in as egresado', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      userRole: 'egresado',
      userName: 'Egresado User',
      logout: mockLogout,
    });

    render(<Navbar />);
    
    expect(screen.getByText('Mi Carrera')).toBeTruthy();
    expect(screen.getByText('Mi Dashboard')).toBeTruthy();
    expect(screen.getByText('Perfil Profesional')).toBeTruthy();
    expect(screen.getByText('Egresado User')).toBeTruthy();
  });

  test('calls logout function when clicking logout button', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      userRole: 'admin',
      userName: 'Admin User',
      logout: mockLogout,
    });

    render(<Navbar />);
    
    const logoutButton = screen.getByText('Cerrar Sesión');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});

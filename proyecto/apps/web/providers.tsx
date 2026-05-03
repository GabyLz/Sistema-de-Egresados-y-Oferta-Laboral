'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

type Role = 'admin' | 'egresado' | 'empresa';

function isAuthGateRoute(pathname: string) {
  return pathname === '/' || pathname === '/login' || pathname === '/register';
}

function isPublicRoute(pathname: string) {
  if (pathname.startsWith('/reset-password')) return true;
  if (pathname.startsWith('/forgot-password')) return true;
  return isAuthGateRoute(pathname);
}

function isAllowedForRole(pathname: string, role: Role) {
  if (pathname.startsWith('/empresas')) return role === 'admin';
  if (pathname.startsWith('/egresados')) return role === 'admin' || role === 'empresa';
  if (pathname.startsWith('/ofertas/') && pathname.includes('/postulantes')) return role === 'admin' || role === 'empresa';
  return true;
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userRole, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [renderChildren, setRenderChildren] = React.useState(false);

  React.useEffect(() => {
    if (!pathname) return;

    if (loading) {
      if (isAuthGateRoute(pathname)) {
        setRenderChildren(false);
      } else if (isPublicRoute(pathname)) {
        setRenderChildren(true);
      } else {
        setRenderChildren(false);
      }
      return;
    }

    if (!isLoggedIn) {
      if (isPublicRoute(pathname)) {
        setRenderChildren(true);
      } else {
        setRenderChildren(false);
        router.replace('/login');
      }
      return;
    }

    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
      setRenderChildren(false);
      router.replace('/dashboard');
      return;
    }

    if (userRole && !isAllowedForRole(pathname, userRole)) {
      setRenderChildren(false);
      router.replace('/dashboard');
      return;
    }

    setRenderChildren(true);
  }, [isLoggedIn, loading, pathname, router, userRole]);

  if (!renderChildren) {
    if (pathname && isLoggedIn && userRole && !isPublicRoute(pathname)) {
      return (
        <main className="page-shell">
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>Cargando...</p>
          </div>
        </main>
      );
    }

    return (
      <main className="public-shell" style={{ background: '#f1f5f9' }}>
        <div className="public-container" style={{ maxWidth: '520px' }}>
          <div className="card auth-card" style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <RouteGuard>{children}</RouteGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}

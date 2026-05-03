'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useMemo, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Iconos memoizados para mejor rendimiento
const IconHome = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const IconUsers = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconBriefcase = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);
const IconFileText = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>);
const IconBell = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>);
const IconBuilding = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M15 18h.01"/><path d="M9 18h.01"/></svg>);
const IconLogOut = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const IconHelp = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>);
const IconSettings = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);

IconHome.displayName = 'IconHome';
IconUsers.displayName = 'IconUsers';
IconBriefcase.displayName = 'IconBriefcase';
IconFileText.displayName = 'IconFileText';
IconBell.displayName = 'IconBell';
IconBuilding.displayName = 'IconBuilding';
IconLogOut.displayName = 'IconLogOut';
IconHelp.displayName = 'IconHelp';
IconSettings.displayName = 'IconSettings';


type Role = 'admin' | 'egresado' | 'empresa';

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const sidebarSections: Record<Role, SidebarSection[]> = {
  admin: [
    {
      title: 'Administración',
      items: [
          { label: 'Panel Principal', href: '/dashboard', icon: <IconHome /> },
          { label: 'Gestión de Egresados', href: '/egresados', icon: <IconUsers /> },
          { label: 'Gestión de Empresas', href: '/empresas', icon: <IconBuilding /> },
          { label: 'Moderar Ofertas', href: '/ofertas', icon: <IconBriefcase /> },
          { label: 'Reportes del Sistema', href: '/reportes', icon: <IconFileText /> },
          { label: 'Configuración', href: '/configuracion', icon: <IconSettings /> },
        ],
    },
    {
      title: 'Soporte',
      items: [
        { href: '/ayuda', label: 'Centro de Ayuda', icon: <IconHelp /> },
      ],
    },
  ],
  egresado: [
    {
      title: 'Mi Carrera',
      items: [
        { href: '/dashboard', label: 'Mi Dashboard', icon: <IconHome /> },
        { href: '/perfil', label: 'Perfil Profesional', icon: <IconFileText /> },
        { href: '/ofertas', label: 'Bolsa de Trabajo', icon: <IconBriefcase /> },
        { href: '/postulaciones', label: 'Mis Postulaciones', icon: <IconFileText /> },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { href: '/configuracion', label: 'Seguridad', icon: <IconSettings /> },
        { href: '/ayuda', label: 'Ayuda y Soporte', icon: <IconHelp /> },
      ],
    },
  ],
  empresa: [
    {
      title: 'Reclutamiento',
      items: [
        { href: '/dashboard', label: 'Panel de Control', icon: <IconHome /> },
        { href: '/ofertas', label: 'Mis Ofertas', icon: <IconBriefcase /> },
        { href: '/postulaciones', label: 'Gestión de Candidatos', icon: <IconUsers /> },
        { href: '/egresados', label: 'Buscar Talento', icon: <IconUsers /> },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { href: '/configuracion', label: 'Seguridad', icon: <IconSettings /> },
        { href: '/ayuda', label: 'Ayuda y Soporte', icon: <IconHelp /> },
      ],
    },
  ],
};

export default function Navbar() {
  const { isLoggedIn, userRole, userName, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const handleDeleteNotification = async (id: string) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/notificaciones/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setNotifications((current) => current.filter((notification) => notification.id !== id));
        }
      } catch (e) {
        console.error('Error deleting notification:', e);
      }
    };
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userName || !isLoggedIn) return;

    const controller = new AbortController();
    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/notificaciones/${userName}`, {
          signal: controller.signal
        });
        if (res.ok) setNotifications(await res.json());
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Error fetching notifications:', e);
        }
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    
    fetchNotifications();
    return () => controller.abort();
  }, [userName, isLoggedIn]);

  const sections = useMemo(() => {
    if (!userRole) return [];
    return sidebarSections[userRole as Role] || [];
  }, [userRole]);

  // Public Navbar (SSR friendly)
  const publicNav = (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          SEGO SYSTEM
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login" className="btn btn-secondary">Iniciar Sesión</Link>
          <Link href="/register" className="btn btn-primary">Registrarse</Link>
        </div>
      </div>
    </nav>
  );

  if (!mounted) return publicNav;
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/reset-password') || pathname.startsWith('/forgot-password')) {
    return publicNav;
  }

  if (isLoggedIn && userRole) {
    const showNotificationCenter = userRole === 'admin';

    return (
      <>
        {/* Barra Superior con Notificaciones */}
        <div className="topbar" style={{ top: '-6px' }}>
          <div style={{ marginRight: 'auto', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            {new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}
          </div>
          {showNotificationCenter && (
            <>
              <div className="topbar-notifications" onClick={() => setShowNotifications(!showNotifications)}>
                <IconBell />
                {notifications.length > 0 && <span className="notification-badge"></span>}
              </div>

              {showNotifications && (
            <div className="card" style={{ 
              position: 'absolute', top: '70px', right: '32px', 
              width: '320px', zIndex: 1000, padding: '16px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Notificaciones</h3>
              <div style={{ fontSize: '0.85rem', maxHeight: '300px', overflowY: 'auto' }}>
                {isLoadingNotifications ? (
                  <p style={{ padding: '8px 0', color: 'var(--text-light)', textAlign: 'center' }}>Cargando...</p>
                ) : notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{n.titulo || 'Notificación'}</p>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.contenido}</p>
                      </div>
                      {n.tipo === 'nueva_oferta' && (
                        <Link href="/ofertas" className="btn btn-primary btn-small" style={{ width: 'fit-content', alignSelf: 'flex-start', padding: '8px 12px' }}>
                          Postular
                        </Link>
                      )}
                      <button className="btn btn-secondary btn-small" style={{ width: 'fit-content', alignSelf: 'flex-start', padding: '8px 12px' }} onClick={() => handleDeleteNotification(n.id)}>
                        Quitar
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '8px 0', color: 'var(--text-light)', textAlign: 'center' }}>
                    No tienes notificaciones.
                  </p>
                )}
              </div>
            </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Lateral */}
        <aside className="navbar-sidebar">
          <div className="navbar-container-sidebar">
            <div style={{ marginBottom: '24px' }}>
              <Link href="/" className="navbar-brand-sidebar">
                SEGO SYSTEM
              </Link>
              <p className="sidebar-subtitle">Gestión de Egresados</p>
            </div>

            <div className="sidebar-sections">
              {sections.map((section) => (
                <div key={section.title} className="sidebar-section">
                  <p className="sidebar-section-title">{section.title}</p>
                  <ul className="navbar-menu-sidebar">
                    {section.items.map((item) => {
                      // Mejora en la lógica de 'active' para soportar sub-rutas
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link href={item.href} className={isActive ? 'active' : ''}>
                            <span style={{ marginRight: '12px', display: 'flex' }}>{item.icon}</span>
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
              <div className="sidebar-user">
                <p className="sidebar-user-name" style={{ marginBottom: '4px' }}>{userName}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {userRole}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  logout();
                  router.replace('/login');
                }}
                className="btn sidebar-logout"
              >
                <IconLogOut />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }

  return publicNav;
}

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Droplets, QrCode, Scan, ClipboardList, ArrowRightLeft,
  Building2, Users, Shield, LogOut, Menu, X, Settings, Activity, ChevronDown
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: { path: string; label: string; icon: any; roles: string[] }[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR'] },
    { path: '/blood-bags', label: 'Bolsas de Sangue', icon: Droplets, roles: ['ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR'] },
    { path: '/scan', label: 'Escanear QR', icon: Scan, roles: ['ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR'] },
    { path: '/demands', label: 'Demandas', icon: ClipboardList, roles: ['ADMIN', 'HEMOCENTRO', 'HOSPITAL'] },
    { path: '/transfers', label: 'Transferências', icon: ArrowRightLeft, roles: ['ADMIN', 'HEMOCENTRO', 'HOSPITAL'] },
    { path: '/temperature', label: 'Temperatura', icon: Activity, roles: ['ADMIN', 'HEMOCENTRO', 'HOSPITAL'] },
    { path: '/audit', label: 'Auditoria', icon: Shield, roles: ['ADMIN', 'AUDITOR'] },
    { path: '/institutions', label: 'Instituições', icon: Building2, roles: ['ADMIN'] },
    { path: '/users', label: 'Usuários', icon: Users, roles: ['ADMIN'] },
    { path: '/settings', label: 'Configurações', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blood-800 to-blood-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="font-bold text-lg">BloodLink</span>
          </Link>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : 'text-white/70 hover:text-white'}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-white/60 hover:text-white" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user?.institution ? user.institution.name : 'Administração Central'}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 rounded-full bg-blood-100 flex items-center justify-center text-blood-700 font-bold text-sm">
                {user?.name.charAt(0)}
              </div>
              <span className="hidden sm:block">{user?.name.split(' ')[0]}</span>
              <ChevronDown size={14} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={14} /> Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

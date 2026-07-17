import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, FileText, Plus, BarChart3, Menu, X } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/movimientos', label: 'Movimientos', icon: TrendingUp },
    { path: '/nuevo-movimiento', label: 'Nuevo Movimiento', icon: Plus },
    { path: '/analizar', label: 'Analizar Documento', icon: FileText },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar - Mobile/Tablet */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } lg:block lg:relative fixed inset-0 z-40 lg:z-auto w-64 bg-gray-900 text-white transition-all duration-300 shadow-lg lg:w-64`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold">Casa 106</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-800 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 max-h-[calc(100vh-120px)] overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-casa-blue text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col lg:flex-row">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 w-full order-first lg:order-none">
          <div className="px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Casa 106 - Gestor de Gastos</h1>
            <div className="w-10 lg:hidden" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Home, FilePlus, History, User, LogOut, LayoutDashboard, FileText, Users, X, Bell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NotificationToast = () => {
  const { auth, notifications, markNotificationAsRead } = useApp();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  const myNotifications = notifications.filter(n => n.userId === auth.user?.id && !n.read);

  useEffect(() => {
    if (myNotifications.length > 0) {
      const latestId = myNotifications[0].id;
      if (!visibleNotifications.includes(latestId)) {
        setVisibleNotifications(prev => [...prev, latestId]);
        setTimeout(() => {
          handleDismiss(latestId);
        }, 5000);
      }
    }
  }, [myNotifications]);

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(vid => vid !== id));
    markNotificationAsRead(id);
  };

  if (visibleNotifications.length === 0) return null;

  const toShow = myNotifications.filter(n => visibleNotifications.includes(n.id));

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm px-4 md:px-0">
      {toShow.map(n => (
        <div 
          key={n.id} 
          className={`p-4 rounded-lg shadow-lg border-l-4 flex justify-between items-start animate-in slide-in-from-top-2 bg-white ${n.type === 'SUCCESS' ? 'border-green-500' : n.type === 'ERROR' ? 'border-red-500' : 'border-blue-500'}`}
        >
          <div className="flex gap-3">
             <div className={`${n.type === 'SUCCESS' ? 'text-green-500' : n.type === 'ERROR' ? 'text-red-500' : 'text-blue-500'}`}><Bell size={18} /></div>
             <div>
               <p className="text-sm font-medium text-gray-800">{n.message}</p>
               <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
             </div>
          </div>
          <button onClick={() => handleDismiss(n.id)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { auth, logout } = useApp();

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  if (!auth.isAuthenticated) {
    return <>{children}</>;
  }

  if (auth.user?.role === Role.ADMIN) {
    return (
      <div className="flex h-screen bg-gray-50" role="main">
        <NotificationToast />
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col" aria-label="Navigasi Admin">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-orange-600">SPKPPSU</h1>
            <p className="text-xs text-gray-500">Admin Kelurahan</p>
          </div>
          <nav className="flex-1 p-4 space-y-2" aria-label="Menu utama">
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'admin-dashboard' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-current={activePage === 'admin-dashboard' ? 'page' : undefined}
            >
              <LayoutDashboard size={20} aria-hidden="true" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('admin-reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'admin-reports' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-current={activePage === 'admin-reports' ? 'page' : undefined}
            >
              <FileText size={20} aria-hidden="true" />
              <span className="font-medium">Kelola Laporan</span>
            </button>
            <button
              onClick={() => onNavigate('admin-users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'admin-users' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-current={activePage === 'admin-users' ? 'page' : undefined}
            >
              <Users size={20} aria-hidden="true" />
              <span className="font-medium">Data Petugas</span>
            </button>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
              aria-label="Keluar dari akun"
            >
              <LogOut size={20} aria-hidden="true" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </aside>

        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-4" role="banner">
           <h1 className="font-bold text-orange-600">SPKPPSU Admin</h1>
           <button 
             onClick={handleLogout}
             aria-label="Keluar dari akun"
             className="p-2 rounded-full hover:bg-gray-100"
           >
             <LogOut size={20} className="text-gray-600" aria-hidden="true" />
           </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8" id="main-content">
          {children}
        </main>
        
         <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-10" aria-label="Navigasi bawah admin">
            <button 
              onClick={() => onNavigate('admin-dashboard')} 
              className={`p-2 ${activePage === 'admin-dashboard' ? 'text-orange-600' : 'text-gray-400'}`}
              aria-label="Dashboard"
              aria-current={activePage === 'admin-dashboard' ? 'page' : undefined}
            >
              <LayoutDashboard size={24} aria-hidden="true" />
            </button>
            <button 
              onClick={() => onNavigate('admin-reports')} 
              className={`p-2 ${activePage === 'admin-reports' ? 'text-orange-600' : 'text-gray-400'}`}
              aria-label="Kelola Laporan"
              aria-current={activePage === 'admin-reports' ? 'page' : undefined}
            >
               <FileText size={24} aria-hidden="true" />
            </button>
            <button 
              onClick={() => onNavigate('admin-users')} 
              className={`p-2 ${activePage === 'admin-users' ? 'text-orange-600' : 'text-gray-400'}`}
              aria-label="Data Petugas"
              aria-current={activePage === 'admin-users' ? 'page' : undefined}
            >
               <Users size={24} aria-hidden="true" />
            </button>
         </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50" role="main">
      <NotificationToast />
      <header className="bg-orange-600 text-white p-4 shadow-sm sticky top-0 z-10" role="banner">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">SPKPPSU</h1>
            <p className="text-xs text-orange-100">Kelurahan</p>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={auth.user?.avatarUrl || '/default-avatar.png'} 
              alt={`${auth.user?.name || 'Pengguna'} avatar`} 
              className="w-8 h-8 rounded-full border-2 border-orange-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24" id="main-content">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20" aria-label="Navigasi utama petugas">
        <NavItem 
          icon={<Home size={22} />} 
          label="Beranda" 
          active={activePage === 'petugas-home'} 
          onClick={() => onNavigate('petugas-home')} 
        />
        <NavItem 
          icon={<FilePlus size={22} />} 
          label="Lapor" 
          active={activePage === 'petugas-create'} 
          onClick={() => onNavigate('petugas-create')} 
        />
        <NavItem 
          icon={<History size={22} />} 
          label="Riwayat" 
          active={activePage === 'petugas-history'} 
          onClick={() => onNavigate('petugas-history')} 
        />
        <NavItem 
          icon={<User size={22} />} 
          label="Profil" 
          active={activePage === 'petugas-profile'} 
          onClick={() => onNavigate('petugas-profile')} 
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
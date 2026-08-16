"use client";
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  AlertOctagon, 
  Sparkles, 
  Menu, 
  X,
  User,
  Bell,
  Building,
  Briefcase,
  LogOut,
  Edit2,
  Camera,
  Check
} from 'lucide-react';
import { Resident } from '@/lib/types';
import Logo from './Logo';
import { signout } from '@/app/(auth)/login/actions';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: 'dashboard' | 'payments' | 'bookings' | 'incidents' | 'directory') => void;
  resident: Resident;
  pendingPaymentsCount: number;
  activeBookingsCount: number;
  activeIncidentsCount: number;
  isAdmin?: boolean;
  onUpdateResident?: (updated: Partial<Resident>) => void;
}

export default function Navbar({
  currentTab,
  onTabChange,
  resident,
  pendingPaymentsCount,
  activeBookingsCount,
  activeIncidentsCount,
  isAdmin = false,
  onUpdateResident
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [editProfileOpen, setEditProfileOpen] = React.useState(false);
  const [editName, setEditName] = React.useState(resident.name);
  const [editAvatar, setEditAvatar] = React.useState(resident.avatar);

  React.useEffect(() => {
    setEditName(resident.name);
    setEditAvatar(resident.avatar);
  }, [resident]);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    if (onUpdateResident) {
      onUpdateResident({
        name: editName.trim(),
        avatar: editAvatar.trim() || resident.avatar
      });
    }
    setEditProfileOpen(false);
  };

  const navItems = isAdmin ? ([
    { id: 'dashboard', label: 'Inicio', icon: Home, badge: 0 },
    { id: 'payments', label: 'Aprobar Pagos', icon: CreditCard, badge: pendingPaymentsCount },
    { id: 'bookings', label: 'Gestionar Reservas', icon: Calendar, badge: activeBookingsCount },
    { id: 'incidents', label: 'Ver Reportes', icon: AlertOctagon, badge: activeIncidentsCount },
    { id: 'directory', label: 'Directorio', icon: Briefcase, badge: 0 }
  ] as const) : ([
    { id: 'dashboard', label: 'Inicio', icon: Home, badge: 0 },
    { id: 'payments', label: 'Pagos', icon: CreditCard, badge: pendingPaymentsCount },
    { id: 'bookings', label: 'Reservar Área', icon: Calendar, badge: activeBookingsCount },
    { id: 'incidents', label: 'Incidentes', icon: AlertOctagon, badge: activeIncidentsCount },
    { id: 'directory', label: 'Directorio', icon: Briefcase, badge: 0 }
  ] as const);

  const handleNavClick = (tabId: 'dashboard' | 'payments' | 'bookings' | 'incidents' | 'directory') => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#E5E1DA] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo brand */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <Logo size="sm" variant="color" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-[11px] font-bold tracking-widest uppercase text-[#5A554F]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`py-1 transition-all relative uppercase tracking-widest text-[11px] font-bold ${
                    isActive 
                      ? 'border-b-2 border-brand-teal text-brand-blue' 
                      : 'text-[#8C857B] hover:text-brand-blue'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 text-[9px] font-sans font-bold bg-brand-teal text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User profile actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => alert('No tienes notificaciones administrativas sin leer.')}
              className="p-2 text-[#8C857B] hover:text-[#1A1A1A] rounded-full hover:bg-[#F5F2ED] transition relative"
              title="Notificaciones"
            >
              <Bell className="w-4.5 h-4.5" />
              {pendingPaymentsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-teal rounded-full animate-pulse"></span>
              )}
            </button>

            <span className="h-6 w-px bg-[#E5E1DA]"></span>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setEditProfileOpen(true)}
                className="h-8 w-8 rounded-full bg-[#E5E1DA] flex items-center justify-center border border-[#CEC7BC] overflow-hidden shrink-0 hover:ring-2 hover:ring-[#0D9488] transition cursor-pointer relative group"
                title="Editar Nombre y Foto de Perfil"
              >
                <img 
                  src={resident.avatar} 
                  alt={resident.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
              <div className="text-left mr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] block leading-tight">
                    {resident.name}
                  </span>
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    className="text-[#8C857B] hover:text-[#1A1A1A] transition"
                    title="Editar Perfil"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[9px] text-[#8C857B] uppercase tracking-widest block leading-none font-medium mt-0.5">
                  {isAdmin ? 'Administración' : `${resident.tower} • ${resident.apartment}`}
                </span>
              </div>
              <button
                onClick={() => signout()}
                className="p-1.5 text-[#8C857B] hover:text-rose-600 rounded-none hover:bg-rose-50 border border-[#E5E1DA] transition"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile menu trigger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => alert(isAdmin ? 'Bienvenido Administrador a la plataforma ResidenSmart.' : `Bienvenido ${resident.name}. Estás conectado desde ${resident.tower}, ${resident.apartment}.`)}
              className="p-1 px-2.5 bg-[#F5F2ED] border border-[#E5E1DA] rounded-none text-[10px] font-bold tracking-widest text-[#1A1A1A]"
            >
              <span className="font-mono">{isAdmin ? 'ADMIN' : resident.apartment}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] hover:bg-[#F5F2ED] transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu List with Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#E5E1DA] bg-[#FDFCFB]"
          >
            <div className="px-4 pt-2 pb-4 space-y-1 bg-[#F5F2ED]/50">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold tracking-widest uppercase transition ${
                      isActive 
                        ? 'bg-brand-blue text-white' 
                        : 'text-[#5A554F] hover:bg-[#F5F2ED] hover:text-brand-blue'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${isActive ? 'bg-white text-brand-blue' : 'bg-brand-teal text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="border-t border-[#E5E1DA] mt-4 pt-4 flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-[#E5E1DA] flex items-center justify-center border border-[#CEC7BC] overflow-hidden shrink-0">
                    <img 
                      src={resident.avatar} 
                      alt={resident.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] block">
                      {isAdmin ? 'Administrador' : resident.name}
                    </span>
                    <span className="text-[9px] text-[#8C857B] tracking-widest uppercase block">
                      {isAdmin ? 'Administración' : `${resident.tower} • ${resident.apartment}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signout()}
                  className="p-2 text-[#8C857B] hover:text-rose-600 border border-[#E5E1DA] bg-white text-[9px] font-bold tracking-widest uppercase flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {editProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E5E1DA] max-w-md w-full p-6 text-left space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-4">
                <div>
                  <h3 className="text-base font-serif italic text-[#1A1A1A]">Editar Perfil de Usuario</h3>
                  <p className="text-[10px] text-[#8C857B] uppercase tracking-wider font-mono">Personaliza tu nombre y foto de perfil</p>
                </div>
                <button
                  onClick={() => setEditProfileOpen(false)}
                  className="p-1 text-[#8C857B] hover:text-[#1A1A1A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8C857B] mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8C857B] mb-1.5">
                    Seleccionar Foto de Perfil (Avatares)
                  </label>
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {avatarPresets.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setEditAvatar(url)}
                        className={`h-10 w-10 rounded-full border overflow-hidden relative transition ${
                          editAvatar === url ? 'ring-2 ring-[#0D9488] border-transparent scale-105' : 'border-[#E5E1DA] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="preset" className="w-full h-full object-cover" />
                        {editAvatar === url && (
                          <div className="absolute inset-0 bg-[#0D9488]/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8C857B] mb-1.5">
                    O Ingresa una URL de Imagen Personalizada
                  </label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(false)}
                    className="px-4 py-2 border border-[#E5E1DA] text-[10px] font-bold uppercase tracking-widest text-[#8C857B] hover:bg-[#F5F2ED]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest transition"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}

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
  Briefcase
} from 'lucide-react';
import { Resident } from '@/lib/types';
import Logo from './Logo';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: 'dashboard' | 'payments' | 'bookings' | 'incidents' | 'directory') => void;
  resident: Resident;
  pendingPaymentsCount: number;
  activeBookingsCount: number;
  activeIncidentsCount: number;
  isAdmin?: boolean;
}

export default function Navbar({
  currentTab,
  onTabChange,
  resident,
  pendingPaymentsCount,
  activeBookingsCount,
  activeIncidentsCount,
  isAdmin = false
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
              <div className="h-8 w-8 rounded-full bg-[#E5E1DA] flex items-center justify-center border border-[#CEC7BC] overflow-hidden shrink-0">
                <img 
                  src={resident.avatar} 
                  alt={resident.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] block leading-tight">
                  {isAdmin ? 'Administrador' : resident.name}
                </span>
                <span className="text-[9px] text-[#8C857B] uppercase tracking-widest block leading-none font-medium mt-0.5">
                  {isAdmin ? 'Administración' : `${resident.tower} • ${resident.apartment}`}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile menu trigger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => alert(isAdmin ? 'Bienvenido Administrador a la plataforma ResidenSmart.' : `Bienvenido Luis. Estás conectado desde Torre B, ${resident.apartment}.`)}
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

              <div className="border-t border-[#E5E1DA] mt-4 pt-4 flex items-center space-x-3 px-4">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

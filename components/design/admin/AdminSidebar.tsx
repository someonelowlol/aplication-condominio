"use client";
import React from 'react';
import { 
  Home, 
  Users, 
  Coins, 
  Megaphone, 
  Wrench, 
  CalendarRange, 
  Shield, 
  Scale, 
  Settings, 
  Sparkles 
} from 'lucide-react';

export interface AdminTabItem {
  id: string;
  label: string;
  sublabel: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}
import Logo from '../Logo';

export const ADMIN_TABS: AdminTabItem[] = [
  { id: 'dashboard', label: 'Panel de Control', sublabel: 'KPIs y Operatividad', icon: Home },
  { id: 'crm', label: 'CRM y Unidades', sublabel: 'Residentes, Mascotas, Autos', icon: Users },
  { id: 'finanzas', label: 'Finanzas Core', sublabel: 'Alícuotas, Bancos, Egresos', icon: Coins },
  { id: 'comunidad', label: 'Comunidad y Muro', sublabel: 'Comunicación, Votos, Chat', icon: Megaphone },
  { id: 'mantenimiento', label: 'Help Desk y Manto.', sublabel: 'Tickets, Proveedores', icon: Wrench },
  { id: 'reservas', label: 'Reservas y Áreas', sublabel: 'Aprobación y Reglas', icon: CalendarRange },
  { id: 'seguridad', label: 'Seguridad y Acceso', sublabel: 'Visitas QR, Paquetería', icon: Shield },
  { id: 'legal', label: 'Legal y Multas', sublabel: 'Reglamentos, Sanciones', icon: Scale },
  { id: 'config', label: 'Configuración', sublabel: 'Auditoría, Roles, Sedes', icon: Settings },
  { id: 'ia_iot', label: 'Tecnología IA/IoT', sublabel: 'Chatbot, Medidores', icon: Sparkles }
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-72 bg-white border border-[#E5E1DA] p-4 flex flex-col space-y-3 shrink-0 rounded-none h-fit lg:sticky lg:top-24">
      <div className="border-b border-[#E5E1DA] pb-3 mb-2 flex items-center space-x-3">
        <Logo showText={false} size="sm" className="w-8 h-8 shrink-0" />
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">
            Consola
          </span>
          <h2 className="text-sm font-serif italic text-brand-blue mt-0.5 font-normal leading-tight">
            Administración
          </h2>
        </div>
      </div>

      <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 lg:gap-1.5 scrollbar-thin">
        {ADMIN_TABS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-3 px-4 py-3 border text-left rounded-none shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-blue border-brand-blue text-white'
                  : 'bg-white border-[#E5E1DA] hover:bg-[#F5F2ED] text-[#5A554F] hover:text-brand-blue'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="text-left select-none">
                <span className="text-[10px] font-bold tracking-widest uppercase block leading-tight">
                  {item.label}
                </span>
                <span className={`text-[8px] tracking-wider block font-sans leading-none mt-0.5 ${isActive ? 'text-gray-400' : 'text-[#8C857B]'}`}>
                  {item.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

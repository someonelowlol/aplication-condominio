"use client";
import React from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp 
} from 'lucide-react';
import { Payment, Booking, Incident } from '@/lib/types';

interface AdminDashboardProps {
  payments: Payment[];
  bookings: Booking[];
  incidents: Incident[];
  onTabChange: (tabId: string) => void;
}

export default function AdminDashboard({ payments, bookings, incidents, onTabChange }: AdminDashboardProps) {
  // Compute KPIs
  const paidPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const reviewPayments = payments.filter(p => p.status === 'under_review');

  const totalInvoiced = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDelinquent = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  // Bank balance simulator (fixed base + paid amount)
  const bankBalance = 1245600.00 + totalPaid;

  const openTicketsCount = incidents.filter(i => i.status !== 'resolved').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Resumen General</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Panel de Control Operativo</h1>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Balance */}
        <div className="bg-white border border-[#E5E1DA] p-6 rounded-none flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#8C857B] uppercase block">Saldo Conciliado en Bancos</span>
              <span className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1 block">{formatCurrency(bankBalance)}</span>
            </div>
            <div className="p-2 bg-[#F5F2ED] border border-[#E5E1DA]">
              <TrendingUp className="w-4.5 h-4.5 text-[#1A1A1A]" />
            </div>
          </div>
          <div className="text-[10px] text-[#8C857B] uppercase tracking-wider flex items-center space-x-1.5 border-t border-[#E5E1DA] pt-3">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span>Cuenta STP Banregio Activa</span>
          </div>
        </div>

        {/* Delinquency Rate */}
        <div className="bg-white border border-[#E5E1DA] p-6 rounded-none flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#8C857B] uppercase block">Morosidad Total Acumulada</span>
              <span className="text-2xl font-serif font-bold text-rose-700 mt-1 block">{formatCurrency(totalDelinquent)}</span>
            </div>
            <div className="p-2 bg-rose-50 border border-rose-100">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-700" />
            </div>
          </div>
          <div className="text-[10px] text-rose-700 uppercase tracking-wider flex items-center space-x-1.5 border-t border-rose-100 pt-3">
            <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
            <span>{payments.filter(p => p.status === 'pending').length} cargos vencidos / por cobrar</span>
          </div>
        </div>

        {/* Monthly Flux */}
        <div className="bg-white border border-[#E5E1DA] p-6 rounded-none flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#8C857B] uppercase block">Recaudación vs Egresos (Mes)</span>
              <span className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1 block">
                {formatCurrency(totalPaid)} <span className="text-[10px] font-mono text-[#8C857B] font-normal">/ $89,450.00</span>
              </span>
            </div>
            <div className="p-2 bg-[#F5F2ED] border border-[#E5E1DA]">
              <ArrowUpRight className="w-4.5 h-4.5 text-emerald-600" />
            </div>
          </div>
          <div className="text-[10px] text-[#8C857B] uppercase tracking-wider flex items-center space-x-1.5 border-t border-[#E5E1DA] pt-3">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span>Superávit corriente en caja</span>
          </div>
        </div>
      </div>

      {/* OPERATIONS & ALERTS CRITICALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Operational Status (2 columns on large) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
            Estado Operativo Actual
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => onTabChange('mantenimiento')}
              className="bg-white border border-[#E5E1DA] p-5 hover:bg-[#F5F2ED] transition cursor-pointer flex justify-between items-center"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-[#8C857B] uppercase block">Tickets de Soporte Abiertos</span>
                <span className="text-2xl font-serif text-[#1A1A1A] font-bold">{openTicketsCount}</span>
              </div>
              <div className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center bg-[#F5F2ED]">
                <Wrench className="w-4 h-4 text-[#8C857B]" />
              </div>
            </div>

            <div 
              onClick={() => onTabChange('reservas')}
              className="bg-white border border-[#E5E1DA] p-5 hover:bg-[#F5F2ED] transition cursor-pointer flex justify-between items-center"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-[#8C857B] uppercase block">Solicitudes de Reservación</span>
                <span className="text-2xl font-serif text-[#1A1A1A] font-bold">{pendingBookingsCount}</span>
              </div>
              <div className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center bg-[#F5F2ED]">
                <Calendar className="w-4 h-4 text-[#8C857B]" />
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white border border-[#E5E1DA] p-6 space-y-4">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
              Bitácora de Actividad Reciente
            </h4>
            
            <div className="divide-y divide-[#E5E1DA]">
              {reviewPayments.length > 0 ? (
                reviewPayments.map(p => (
                  <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                    <span className="text-[#8C857B]">
                      Comprobante de pago subido por <strong className="text-[#1A1A1A]">Luis Martínez (402)</strong>
                    </span>
                    <button 
                      onClick={() => onTabChange('finanzas')}
                      className="text-[#1A1A1A] font-bold uppercase tracking-wider text-[9px] hover:underline shrink-0 ml-4"
                    >
                      Revisar
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-3 text-xs text-[#8C857B] italic">No hay comprobantes pendientes de validación.</div>
              )}

              {incidents.slice(0, 2).map(inc => (
                <div key={inc.id} className="py-3 flex justify-between items-center text-xs">
                  <span className="text-[#8C857B]">
                    Incidente reportado: <strong className="text-[#1A1A1A]">{inc.title}</strong> ({inc.location.split(',')[0]})
                  </span>
                  <span className="text-[9px] font-mono text-[#8C857B] tracking-wider uppercase ml-4">{inc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Alerts (1 column) */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
            Alertas Críticas y Urgentes
          </h3>

          <div className="space-y-4">
            {/* Alert 1 */}
            <div className="bg-amber-50 border border-amber-200 p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold tracking-wider uppercase text-[9px]">Vencimiento Próximo de Contrato</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                El contrato de mantenimiento semestral de <strong className="text-[#1A1A1A]">Otis Elevadores</strong> expira en <span className="font-bold">14 días</span>. Se requiere renovación para evitar suspensión de póliza.
              </p>
            </div>

            {/* Alert 2 */}
            <div className="bg-rose-50 border border-rose-200 p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-rose-800">
                <Bell className="w-4 h-4 shrink-0" />
                <span className="font-bold tracking-wider uppercase text-[9px]">Mantenimiento Preventivo Pendiente</span>
              </div>
              <p className="text-rose-950 leading-relaxed">
                El mantenimiento preventivo de las <strong className="text-[#1A1A1A]">bombas de agua del sótano</strong> está programado para el día de mañana a las 09:00 hrs. Se notificará corte preventivo temporal a condóminos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

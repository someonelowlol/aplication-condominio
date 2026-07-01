"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Building, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CreditCard,
  Bell, 
  Megaphone, 
  PhoneCall, 
  ShieldCheck, 
  Copy, 
  Check, 
  Info,
  X,
  Plus,
  Sparkles
} from 'lucide-react';

import { 
  CURRENT_RESIDENT, 
  INITIAL_PAYMENTS, 
  INITIAL_AMENITIES, 
  INITIAL_BOOKINGS, 
  INITIAL_INCIDENTS, 
  INITIAL_ANNOUNCEMENTS 
} from '@/lib/mockData';
import { Payment, Booking, Incident, Announcement, Resident } from '@/lib/types';

// Child components
import Navbar from './Navbar';
import PaymentsSection from './PaymentsSection';
import BookingsSection from './BookingsSection';
import IncidentsSection from './IncidentsSection';
import DirectorySection from './DirectorySection';

// Admin modules
import AdminWorkspace from './admin/AdminWorkspace';

export default function DashboardClient({ isAdmin }: { isAdmin: boolean }) {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'payments' | 'bookings' | 'incidents' | 'directory'>('dashboard');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Sync currentTab from top Navbar with side AdminTab (only for admin)
  useEffect(() => {
    if (!isAdmin) return;
    if (currentTab === 'dashboard' && adminTab !== 'dashboard') {
      const isNavbarTab = ['dashboard', 'finanzas', 'reservas', 'mantenimiento', 'crm'].includes(adminTab);
      if (isNavbarTab) setAdminTab('dashboard');
    } else if (currentTab === 'payments' && adminTab !== 'finanzas') {
      setAdminTab('finanzas');
    } else if (currentTab === 'bookings' && adminTab !== 'reservas') {
      setAdminTab('reservas');
    } else if (currentTab === 'incidents' && adminTab !== 'mantenimiento') {
      setAdminTab('mantenimiento');
    } else if (currentTab === 'directory' && adminTab !== 'crm') {
      setAdminTab('crm');
    }
  }, [currentTab, isAdmin]);

  const handleAdminTabChange = (tab: string) => {
    setAdminTab(tab);
    if (tab === 'dashboard') setCurrentTab('dashboard');
    else if (tab === 'finanzas') setCurrentTab('payments');
    else if (tab === 'reservas') setCurrentTab('bookings');
    else if (tab === 'mantenimiento') setCurrentTab('incidents');
    else if (tab === 'crm') setCurrentTab('directory');
    else setCurrentTab('dashboard');
  };
  
  // State backing with SSR-safe localStorage fallback
  const [resident, setResident] = useState<Resident>(() => {
    if (typeof window === 'undefined') return CURRENT_RESIDENT;
    const saved = localStorage.getItem('condo_resident');
    return saved ? JSON.parse(saved) : CURRENT_RESIDENT;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PAYMENTS;
    const saved = localStorage.getItem('condo_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === 'undefined') return INITIAL_BOOKINGS;
    const saved = localStorage.getItem('condo_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    if (typeof window === 'undefined') return INITIAL_INCIDENTS;
    const saved = localStorage.getItem('condo_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
    const saved = localStorage.getItem('condo_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Active announcement focus state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Sync state to localStorage (only runs in the browser)
  useEffect(() => {
    localStorage.setItem('condo_resident', JSON.stringify(resident));
    localStorage.setItem('condo_payments', JSON.stringify(payments));
    localStorage.setItem('condo_bookings', JSON.stringify(bookings));
    localStorage.setItem('condo_incidents', JSON.stringify(incidents));
    localStorage.setItem('condo_announcements', JSON.stringify(announcements));
  }, [resident, payments, bookings, incidents, announcements]);

  // ACTION: Record payment success
  const handlePaySuccess = (paymentId: string, amount: number, paymentMethod: string, proofName?: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: paymentMethod === 'cash' ? 'under_review' : 'paid',
          paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          paymentMethod: paymentMethod as any,
          proofFile: proofName
        };
      }
      return p;
    }));

    // Deduct from outstanding balance if not checking cash receipt
    if (paymentMethod !== 'cash') {
      setResident(prev => ({
        ...prev,
        balance: Math.max(0, prev.balance - amount)
      }));
    }
  };

  // ACTION: Add simulated admin charge
  const handleAddCustomPayment = (newPay: Payment) => {
    setPayments(prev => [newPay, ...prev]);
    setResident(prev => ({
      ...prev,
      balance: prev.balance + newPay.amount
    }));
  };

  // ACTION: Record new Booking
  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    
    // Auto generate matching outstanding payment receipt for high fidelity, if rate > 0
    if (newBooking.totalCost > 0) {
      const associatedPayment: Payment = {
        id: `pay-book-${newBooking.id}`,
        title: `Uso de Amenidad: ${newBooking.amenityName}`,
        description: `Cargo correspondiente a la reservación formal agendada para el día ${newBooking.date} en horario ${newBooking.timeSlot}.`,
        amount: newBooking.totalCost,
        dueDate: newBooking.date,
        status: 'pending',
        category: 'amenity',
        reference: `REF-BOOK-${newBooking.id.substring(5, 9).toUpperCase()}`
      };
      
      setPayments(prev => [associatedPayment, ...prev]);
      setResident(prev => ({
        ...prev,
        balance: prev.balance + associatedPayment.amount
      }));
    }
  };

  // ACTION: Cancel booking
  const handleCancelBooking = (bookingId: string) => {
    let refundAmount = 0;
    
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        refundAmount = b.totalCost;
        return { ...b, status: 'cancelled' };
      }
      return b;
    }));

    // Look for matching outstanding amenity payment to remove it
    setPayments(prev => {
      const isPending = prev.some(p => p.id === `pay-book-${bookingId}` && p.status === 'pending');
      if (isPending) {
        // Just remove from balance and remove receipt
        setResident(curr => ({ ...curr, balance: Math.max(0, curr.balance - refundAmount) }));
        return prev.filter(p => p.id !== `pay-book-${bookingId}`);
      } else {
        // If already paid, or cash, maybe keep paid receipts but update status
        return prev;
      }
    });
  };

  // ACTION: Add direct incident report
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);

    // Simulate automatic supervisor reply after 2.5 seconds to feel ultra responsive!
    setTimeout(() => {
      setIncidents(currIncidents => {
        return currIncidents.map(inc => {
          if (inc.id === newIncident.id) {
            const adminReply = {
              id: `comm-admin-auto-${Date.now()}`,
              authorName: 'Soporte Residencial',
              authorRole: 'admin' as const,
              content: 'Hola Luis. Hemos tomado nota de tu reporte de inmediato. Se ha asignado con estatus prioritario. Un técnico de guardia realizará una evaluación presencial hoy mismo.',
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
            
            return {
              ...inc,
              status: 'assigned',
              technicianName: inc.category === 'plumbing' 
                ? 'Carlos Gutiérrez (Plomería)' 
                : inc.category === 'electricity' 
                  ? 'Sofía Alatorre (Electricidad)' 
                  : inc.category === 'elevator'
                    ? 'Ing. Pedro Ruiz (Otis Elevadores)'
                    : 'Personal de Seguridad nocturno',
              comments: [...inc.comments, adminReply],
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
          }
          return inc;
        });
      });
    }, 2500);
  };

  // ACTION: Add comment in incident thread
  const handleAddComment = (incidentId: string, commentContent: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: resident.name,
      authorRole: 'resident' as const,
      content: commentContent,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          comments: [...inc.comments, newComment],
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return inc;
    }));

    // Simulate subsequent technical team reaction after 1.8 seconds!
    setTimeout(() => {
      setIncidents(curr => curr.map(inc => {
        if (inc.id === incidentId) {
          // Verify if already has tech reply
          const lastComment = inc.comments[inc.comments.length - 1];
          if (lastComment && lastComment.authorName === resident.name) {
            const techReply = {
              id: `comm-tech-auto-${Date.now()}`,
              authorName: inc.technicianName || 'Mesa Administrativa',
              authorRole: 'technician' as const,
              content: 'Entenido. Proseguiremos con esta información en la inspección de campo.',
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
            return {
              ...inc,
              comments: [...inc.comments, techReply],
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
          }
        }
        return inc;
      }));
    }, 1800);
  };

  // Reset demo simulation state helper
  const handleResetDemoState = () => {
    if (confirm('¿Deseas restaurar la información demostrativa original? Esto borrará tu progreso y cambios actuales.')) {
      localStorage.clear();
      setResident(CURRENT_RESIDENT);
      setPayments(INITIAL_PAYMENTS);
      setBookings(INITIAL_BOOKINGS);
      setIncidents(INITIAL_INCIDENTS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      setCurrentTab('dashboard');
      setAdminTab('dashboard');
    }
  };

  // Admin handlers
  const handleApprovePayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'paid',
          paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return p;
    }));
  };

  const handleRejectPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'pending',
          paymentMethod: undefined,
          proofFile: undefined
        };
      }
      return p;
    }));
  };

  const handleApproveBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
  };

  const handleChangeIncidentStatus = (incidentId: string, status: 'reported' | 'assigned' | 'in_progress' | 'resolved') => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) } : inc));
  };

  const handleAssignTechnician = (incidentId: string, technicianName: string) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { 
      ...inc, 
      technicianName, 
      status: 'assigned',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) 
    } : inc));
  };

  const [selectedAdminIncidentId, setSelectedAdminIncidentId] = useState<string | null>(null);

  // Count active stats
  const pendingPaymentsCount = isAdmin 
    ? payments.filter(p => p.status === 'under_review').length
    : payments.filter(p => p.status === 'pending').length;

  const activeBookingsCount = isAdmin 
    ? bookings.filter(b => b.status === 'pending').length
    : bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#F5F2ED] antialiased">
      
      {/* GLOBAL BANNER DE SIMULACIÓN */}
      <div className="bg-brand-blue text-[#E5E1DA] text-[10px] uppercase tracking-widest py-2.5 px-6 flex flex-wrap justify-between items-center border-b border-brand-teal/20 gap-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-ping"></span>
          <span>
            {isAdmin 
              ? <>Demostración interactiva • <strong className="text-white">Administrador</strong> (ResidenSmart)</>
              : <>Demostración interactiva • <strong className="text-white hover:underline">{resident.name}</strong> ({resident.apartment})</>
            }
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="opacity-75 hidden sm:inline">Vistas simuladas con LocalStorage</span>
          <button
            onClick={handleResetDemoState}
            className="text-white hover:text-brand-blue font-bold bg-brand-teal/30 hover:bg-white border border-brand-teal/40 px-2 py-0.5 transition leading-none text-[9px] tracking-widest uppercase"
          >
            Reiniciar Demo
          </button>
        </div>
      </div>

      {/* STICKY PORTAL NAVBAR */}
      <Navbar 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        resident={resident}
        pendingPaymentsCount={pendingPaymentsCount}
        activeBookingsCount={activeBookingsCount}
        activeIncidentsCount={activeIncidentsCount}
        isAdmin={isAdmin}
      />

      {/* CENTRAL WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isAdmin ? (
          <AdminWorkspace
            adminTab={adminTab}
            onAdminTabChange={handleAdminTabChange}
            payments={payments}
            bookings={bookings}
            incidents={incidents}
            announcements={announcements}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            onAddCustomPayment={handleAddCustomPayment}
            onApproveBooking={handleApproveBooking}
            onCancelBooking={handleCancelBooking}
            onChangeIncidentStatus={handleChangeIncidentStatus}
            onAssignTechnician={handleAssignTechnician}
            onAddComment={handleAddComment}
            onAddAnnouncement={(newAnn) => setAnnouncements(prev => [newAnn, ...prev])}
          />
        ) : (
          <AnimatePresence mode="wait">
            {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 animate-fade-in"
            >
              {/* HERO WELCOME CARD */}
              <div id="welcome-hero" className="bg-white border border-[#E5E1DA] p-6 md:p-10 relative overflow-hidden shadow-none rounded-none text-[#1A1A1A]">
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                  {isAdmin ? (
                    <div className="space-y-4 max-w-xl text-left">
                      <div className="inline-flex items-center space-x-1.5 bg-[#F5F2ED] text-[#8C857B] px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-[#E5E1DA]/50">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Portal de Administración Activo</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-serif italic leading-tight text-[#1A1A1A] font-normal">
                        Hola, <br />Administrador.
                      </h1>
                      <p className="text-xs md:text-sm text-[#8C857B] leading-relaxed max-w-md">
                        Bienvenido a la plataforma de administración de <strong className="text-[#1A1A1A] font-medium">ResidenSmart</strong>. Aquí podrá publicar anuncios oficiales, coordinar reportes de fallas, auditar transferencias de cuotas y gestionar las reservas de amenidades.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-xl text-left">
                      <div className="inline-flex items-center space-x-1.5 bg-[#F5F2ED] text-[#8C857B] px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-[#E5E1DA]/50">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Portal de Condóminos Activo</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-serif italic leading-tight text-[#1A1A1A] font-normal">
                        Hola, <br />{resident.name}.
                      </h1>
                      <p className="text-xs md:text-sm text-[#8C857B] leading-relaxed max-w-md">
                        Bienvenido a su portal digital de <strong className="text-[#1A1A1A] font-medium">ResidenSmart</strong>. Aquí podrá gestionar los servicios de su propiedad, agendar áreas comunes y consultar sus estados de cuenta de manera eficiente y transparente.
                      </p>
                    </div>
                  )}

                  {/* fast action cards */}
                  {isAdmin ? (
                    <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 space-y-6 w-full md:max-w-xs rounded-none shrink-0 text-left">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-0.5">Recaudación (Junio)</h2>
                          <div className="text-xl font-serif text-[#1A1A1A]">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                              payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E1DA]">
                          <div>
                            <h3 className="text-[8px] font-bold tracking-wider uppercase text-[#8C857B] mb-0.5">Por Cobrar</h3>
                            <span className="text-xs font-bold text-rose-700">
                              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                                payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
                              )}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-[8px] font-bold tracking-wider uppercase text-[#8C857B] mb-0.5">Por Aprobar</h3>
                            <span className="text-xs font-bold text-amber-700">
                              {payments.filter(p => p.status === 'under_review').length} pagos
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => setCurrentTab('payments')}
                          className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none cursor-pointer text-center"
                        >
                          Revisar Comprobantes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 space-y-6 w-full md:max-w-xs rounded-none shrink-0 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-1">Estado de Cuenta</h2>
                          <div className="text-2xl md:text-3xl font-serif text-[#1A1A1A]">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(resident.balance)}
                          </div>
                        </div>
                        <span className="bg-white px-2 py-1 text-[9px] font-bold tracking-widest border border-[#E5E1DA] uppercase text-[#1A1A1A]">
                          {pendingPaymentsCount > 0 ? 'Pendiente' : 'Al día'}
                        </span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          id="btn-quick-pay"
                          onClick={() => setCurrentTab('payments')}
                          className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none cursor-pointer"
                        >
                          Pagar Mantenimiento
                        </button>
                        <p className="text-[10px] text-[#8C857B] italic text-center">
                          Próximo vencimiento ordinario: Día 10
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACCIONES DE ACCESO RÁPIDO */}
                <div className="mt-8 pt-8 border-t border-[#E5E1DA] flex flex-col space-y-3">
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] text-left">
                    {isAdmin ? 'Acciones Administrativas' : 'Servicios Rápidos'}
                  </h2>
                  {isAdmin ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button
                        onClick={() => {
                          const title = prompt('Ingresa el título del comunicado:');
                          const content = prompt('Ingresa el contenido del comunicado:');
                          if (title && content) {
                            const newAnn = {
                              id: `ann-${Date.now()}`,
                              title,
                              content,
                              date: new Date().toISOString().substring(0, 10),
                              category: 'maintenance' as const,
                              author: 'Administrador General'
                            };
                            setAnnouncements(prev => [newAnn, ...prev]);
                            alert('Comunicado publicado con éxito.');
                          }
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Megaphone className="w-4 h-4 text-[#8C857B]" />
                        <span>Crear Comunicado</span>
                      </button>

                      <button
                        onClick={() => {
                          const amountStr = prompt('Monto del cargo en MXN (ej: 1850):');
                          const title = prompt('Concepto del cargo (ej: Cuota mantenimiento Julio):');
                          if (amountStr && title) {
                            const amount = parseFloat(amountStr);
                            if (!isNaN(amount)) {
                              const newPay: Payment = {
                                id: `pay-custom-${Date.now()}`,
                                title,
                                description: `Cargo administrativo generado de manera extraordinaria.`,
                                amount,
                                dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().substring(0, 10),
                                status: 'pending',
                                category: 'maintenance',
                                reference: `REF-ADM-${Date.now().toString().substring(8, 12)}`
                              };
                              handleAddCustomPayment(newPay);
                              alert('Cargo administrativo agregado con éxito.');
                            }
                          }
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Plus className="w-4 h-4 text-[#8C857B]" />
                        <span>Generar Cargo</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('incidents')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#8C857B]" />
                        <span>Fallas Reportadas ({incidents.filter(i => i.status !== 'resolved').length})</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('bookings')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Calendar className="w-4 h-4 text-[#8C857B]" />
                        <span>Ver Reservas ({bookings.length})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button
                        onClick={() => setCurrentTab('bookings')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Calendar className="w-4 h-4 text-[#8C857B]" />
                        <span>Reservar Áreas</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('incidents')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#8C857B]" />
                        <span>Reportar Falla</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab('incidents');
                          alert('Hemos preparado los campos para reportar una falla eléctrica en el elevador.');
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Clock className="w-4 h-4 text-[#8C857B]" />
                        <span>Luz en Elevador</span>
                      </button>

                      <button
                        onClick={() => {
                          alert('TELÉFONOS DE EMERGENCIA DE RESIDENSMART:\n\n' + 
                            '• Caseta de Vigilancia Principal: +52 55 9002 1100\n' + 
                            '• Conserjería Nocturna: +52 55 9002 1122\n' + 
                            '• Protección Civil Zona S.: 911 / 55 5658 1111\n\n' + 
                            'Haga clic para copiar.');
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <PhoneCall className="w-4 h-4 text-[#8C857B]" />
                        <span>Copiar Vigilancia</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
                
              {/* TWO COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
                {/* COLUMN 1 & 2: TABLON DE ANUNCIOS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-end border-b border-[#E5E1DA] pb-2 mb-4">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Avisos de la Administración</h2>
                    <span className="text-[10px] text-[#8C857B] uppercase tracking-wider">{announcements.length} comunicados</span>
                  </div>

                  <div className="space-y-4">
                    {announcements.map((ann) => {
                      return (
                        <div 
                          key={ann.id}
                          onClick={() => setSelectedAnnouncement(ann)}
                          className="bg-white border border-[#E5E1DA] p-6 rounded-none hover:bg-[#F5F2ED] transition duration-155 cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4 text-left"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[9px] font-mono tracking-widest uppercase text-[#8C857B]">{ann.date}</span>
                              {ann.category === 'urgente' && (
                                <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border border-rose-300 bg-rose-50 text-[#1A1A1A]">Urgente</span>
                              )}
                              {ann.category === 'maintenance' && (
                                <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border border-[#CEC7BC] bg-[#F5F2ED] text-[#1A1A1A]">Mantenimiento</span>
                              )}
                              {ann.category === 'event' && (
                                <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border border-emerald-300 bg-emerald-50 text-[#1A1A1A]">Evento Social</span>
                              )}
                            </div>
                            <h3 className="font-serif italic text-lg leading-snug text-[#1A1A1A] hover:underline font-normal">{ann.title}</h3>
                            <p className="text-xs text-[#8C857B] leading-relaxed line-clamp-2 mt-1">{ann.content}</p>
                          </div>
                          
                          <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] hover:underline self-end md:self-start">Leer más →</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 3: RESUMEN / ADMINISTRACIÓN INFO */}
                <div className="space-y-8 border-l border-[#E5E1DA] pl-0 lg:pl-8">
                  {/* DIRECTIVA */}
                  <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 rounded-none space-y-4">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] border-b border-[#E5E1DA] pb-2">Administración y Soporte</h3>
                    
                    <div className="divide-y divide-[#E5E1DA]">
                      {/* Admin contact */}
                      <div className="py-3.5 first:pt-0 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-none bg-[#E5E1DA] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold font-mono border border-[#CEC7BC]">
                            AG
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">Ing. Manuel Esparza</span>
                            <span className="text-[10px] text-[#8C857B] block">Administrador Residente</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('+52 55 4501 2299');
                            alert('Teléfono de Administrador copiado.');
                          }}
                          className="text-[#1A1A1A] hover:bg-white p-2 border border-[#E5E1DA] bg-[#FDFCFB] transition"
                          title="Copiar teléfono"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Caseta 1 */}
                      <div className="py-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-none bg-[#E5E1DA] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold font-mono border border-[#CEC7BC]">
                            C1
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">Seguridad Principal</span>
                            <span className="text-[10px] text-[#8C857B] block">Seguridad Caseta 24 hrs</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('+52 55 9002 1100');
                            alert('Teléfono de Caseta copiado.');
                          }}
                          className="text-[#1A1A1A] hover:bg-white p-2 border border-[#E5E1DA] bg-[#FDFCFB] transition"
                          title="Copiar teléfono"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Maintenance team */}
                      <div className="py-3.5 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-none bg-[#E5E1DA] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold font-mono border border-[#CEC7BC]">
                            ST
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">Soporte Técnico</span>
                            <span className="text-[10px] text-[#8C857B] block">Guardia de Mantenimiento</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('+52 55 9002 1122');
                            alert('Teléfono de Guardia copiado.');
                          }}
                          className="text-[#1A1A1A] hover:bg-white p-2 border border-[#E5E1DA] bg-[#FDFCFB] transition"
                          title="Copiar teléfono"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COMODIDAD RESIDENTE BOX */}
                  <div className="bg-white border border-[#E5E1DA] p-6 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">Reglamento Interno</h4>
                      <p className="text-xs text-[#8C857B] leading-relaxed">
                        Recuerda que el volumen de la música exterior debe ser moderado a partir de las 22:00 horas. Mantengamos una vecindad pacífica y asertiva.
                      </p>
                    </div>
                    <button
                      onClick={() => alert(`REGLAMENTO FUNDACIONAL RESIDENSMART:\n\n` + 
                        '1. Mascotas deben portar correa en áreas verdes comunes.\n' + 
                        '2. Cada departamento dispone de 2 cajones numerados asignados.\n' + 
                        '3. Es obligatorio notificar mudanzas con 48 horas de anticipación.\n' + 
                        '4. Cuota ordinaria de mantenimiento expira el día 10 de cada mes.'
                      )}
                      className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A] hover:underline inline-flex items-center text-left"
                    >
                      <Info className="w-3.5 h-3.5 mr-1.5 text-[#8C857B]" />
                      Ver todos los estatutos
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {currentTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {isAdmin ? (
                <div className="space-y-8 pb-12 text-left">
                  <div className="border-b border-[#E5E1DA] pb-2">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Aprobación de Transferencias y Pagos</h2>
                    <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">Auditoría y control de comprobantes de pago subidos por los residentes.</p>
                  </div>

                  {/* Pagos por Aprobar */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">Pagos Bajo Revisión ({payments.filter(p => p.status === 'under_review').length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {payments.filter(p => p.status === 'under_review').map((pay) => (
                        <div key={pay.id} className="bg-white border border-[#E5E1DA] p-6 rounded-none space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-mono tracking-widest uppercase text-[#8C857B]">{pay.reference}</span>
                              <h4 className="font-serif italic text-lg leading-snug text-[#1A1A1A]">{pay.title}</h4>
                              <p className="text-xs text-[#8C857B] mt-1">Cargado por Residente (Luis Martínez)</p>
                            </div>
                            <span className="text-lg font-mono font-bold text-[#1A1A1A]">${pay.amount.toFixed(2)}</span>
                          </div>

                          <div className="p-3 bg-[#F5F2ED] border border-[#E5E1DA] text-[10px] text-[#8C857B] font-mono">
                            Comprobante adjunto: {pay.proofFile || 'comprobante_bancario_transferencia.pdf'}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprovePayment(pay.id)}
                              className="flex-1 bg-[#1A1A1A] text-white py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none cursor-pointer text-center"
                            >
                              Aprobar Pago
                            </button>
                            <button
                              onClick={() => handleRejectPayment(pay.id)}
                              className="flex-1 bg-white text-[#1A1A1A] border border-[#E5E1DA] py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-[#F5F2ED] transition-colors rounded-none cursor-pointer text-center"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                      {payments.filter(p => p.status === 'under_review').length === 0 && (
                        <div className="col-span-full border border-dashed border-[#E5E1DA] py-8 text-center text-[#8C857B] text-xs bg-white">
                          No hay comprobantes pendientes de aprobación en este momento.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Todos los Pagos del Condominio */}
                  <div className="space-y-4 pt-6 border-t border-[#E5E1DA]">
                    <div className="flex justify-between items-end">
                      <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">Todos los Cargos Generados</h3>
                      <button
                        onClick={() => {
                          const amountStr = prompt('Monto del cargo en MXN (ej: 1850):');
                          const title = prompt('Concepto del cargo (ej: Cuota mantenimiento Julio):');
                          if (amountStr && title) {
                            const amount = parseFloat(amountStr);
                            if (!isNaN(amount)) {
                              const newPay: Payment = {
                                id: `pay-custom-${Date.now()}`,
                                title,
                                description: `Cargo administrativo generado de manera extraordinaria.`,
                                amount,
                                dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().substring(0, 10),
                                status: 'pending',
                                category: 'maintenance',
                                reference: `REF-ADM-${Date.now().toString().substring(8, 12)}`
                              };
                              handleAddCustomPayment(newPay);
                              alert('Cargo agregado.');
                            }
                          }
                        }}
                        className="bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:bg-[#F5F2ED] px-4 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none transition"
                      >
                        Generar Nuevo Cargo
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-[#E5E1DA]">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="bg-[#F5F2ED] border-b border-[#E5E1DA] text-[9px] uppercase tracking-wider font-bold text-[#8C857B]">
                            <th className="p-3">Referencia</th>
                            <th className="p-3">Concepto</th>
                            <th className="p-3">Monto</th>
                            <th className="p-3">Vencimiento</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Residente</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E1DA]">
                          {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-[#FDFCFB]/50 bg-white">
                              <td className="p-3 font-mono text-[10px] text-[#8C857B]">{p.reference}</td>
                              <td className="p-3 font-medium text-[#1A1A1A]">{p.title}</td>
                              <td className="p-3 font-mono font-bold">${p.amount.toFixed(2)}</td>
                              <td className="p-3 text-[#8C857B]">{p.dueDate}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border ${
                                  p.status === 'paid'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : p.status === 'under_review'
                                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                                    : 'border-rose-200 bg-rose-50 text-rose-800'
                                }`}>
                                  {p.status === 'paid' ? 'Pagado' : p.status === 'under_review' ? 'Revisión' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="p-3 text-[#8C857B]">Luis Martínez (Apto 402)</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <PaymentsSection 
                  payments={payments}
                  resident={resident}
                  onPaySuccess={handlePaySuccess}
                  onAddCustomPayment={handleAddCustomPayment}
                />
              )}
            </motion.div>
          )}

          {currentTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {isAdmin ? (
                <div className="space-y-8 pb-12 text-left">
                  <div className="border-b border-[#E5E1DA] pb-2">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Administración de Áreas Comunes y Reservas</h2>
                    <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">Control y aprobación de reservaciones calendarizadas por los residentes.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">Reservas Registradas ({bookings.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookings.map((book) => (
                        <div key={book.id} className="bg-white border border-[#E5E1DA] p-6 rounded-none flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-mono tracking-widest uppercase text-[#8C857B]">{book.date}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border ${
                                book.status === 'confirmed'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : book.status === 'pending'
                                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                                  : 'border-rose-200 bg-rose-50 text-rose-800'
                              }`}>
                                {book.status === 'confirmed' ? 'Confirmado' : book.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                              </span>
                            </div>
                            
                            <h4 className="font-serif italic text-lg leading-snug text-[#1A1A1A]">{book.amenityName}</h4>
                            <p className="text-xs text-[#8C857B]">
                              Horario: <strong className="text-[#1A1A1A] font-medium">{book.timeSlot}</strong>
                            </p>
                            <p className="text-xs text-[#8C857B]">
                              Residente: <strong className="text-[#1A1A1A] font-medium">Luis Martínez (Apto 402)</strong>
                            </p>
                            <p className="text-xs text-[#8C857B]">
                              Invitados: <strong className="text-[#1A1A1A] font-medium">{book.guestCount} personas</strong>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#E5E1DA] flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#1A1A1A]">${book.totalCost.toFixed(2)}</span>
                            <div className="flex gap-1.5">
                              {book.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveBooking(book.id)}
                                  className="bg-[#1A1A1A] text-white px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase hover:bg-black rounded-none transition"
                                >
                                  Aprobar
                                </button>
                              )}
                              {book.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelBooking(book.id)}
                                  className="bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-none transition"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <BookingsSection 
                  amenities={INITIAL_AMENITIES}
                  bookings={bookings}
                  onAddBooking={handleAddBooking}
                  onCancelBooking={handleCancelBooking}
                />
              )}
            </motion.div>
          )}

          {currentTab === 'incidents' && (
            <motion.div
              key="incidents"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {isAdmin ? (
                <div className="space-y-8 pb-12 text-left">
                  <div className="border-b border-[#E5E1DA] pb-2">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Gestión de Reportes y Fallas</h2>
                    <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">Administre, asigne y responda a las incidencias levantadas por los condóminos.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Incidents List */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">Reportes Activos ({incidents.filter(i => i.status !== 'resolved').length})</h3>
                      <div className="space-y-3">
                        {incidents.map((inc) => {
                          const isSelected = selectedAdminIncidentId === inc.id;
                          return (
                            <div
                              key={inc.id}
                              onClick={() => setSelectedAdminIncidentId(inc.id)}
                              className={`border p-4 cursor-pointer transition ${
                                isSelected 
                                  ? 'bg-[#F5F2ED] border-[#1A1A1A]' 
                                  : 'bg-white border-[#E5E1DA] hover:bg-[#F5F2ED]/50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="text-[8px] font-mono tracking-wider uppercase text-[#8C857B]">{inc.createdAt.substring(0, 10)}</span>
                                <span className={`px-1.5 py-0.5 text-[7px] font-bold uppercase border ${
                                  inc.priority === 'high' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#CEC7BC] bg-[#F5F2ED] text-[#1A1A1A]'
                                }`}>
                                  {inc.priority === 'high' ? 'Alta' : 'Media'}
                                </span>
                              </div>
                              <h4 className="font-serif italic text-sm text-[#1A1A1A] leading-tight mb-1">{inc.title}</h4>
                              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold mt-2">
                                <span className="text-[#8C857B]">{inc.location.split(',')[0]}</span>
                                <span className={
                                  inc.status === 'resolved' ? 'text-emerald-700' : inc.status === 'in_progress' ? 'text-indigo-700' : 'text-amber-700'
                                }>
                                  {inc.status === 'resolved' ? 'Resuelto' : inc.status === 'in_progress' ? 'En Proceso' : inc.status === 'assigned' ? 'Asignado' : 'Reportado'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Selected Incident Detail */}
                    <div className="lg:col-span-2 space-y-6">
                      {selectedAdminIncidentId ? (() => {
                        const inc = incidents.find(i => i.id === selectedAdminIncidentId);
                        if (!inc) return <div className="border border-[#E5E1DA] bg-white p-8 text-center text-[#8C857B]">Selecciona un reporte de la lista para ver el seguimiento.</div>;
                        
                        return (
                          <div className="bg-white border border-[#E5E1DA] p-6 space-y-6">
                            <div className="border-b border-[#E5E1DA] pb-4 space-y-2">
                              <div className="flex flex-wrap justify-between items-center gap-2">
                                <span className="text-[10px] font-mono text-[#8C857B]">Reporte ID: {inc.id} • Creado el {inc.createdAt}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleChangeIncidentStatus(inc.id, 'in_progress')}
                                    className="bg-[#F5F2ED] border border-[#E5E1DA] hover:bg-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 text-[#1A1A1A] transition"
                                  >
                                    En Proceso
                                  </button>
                                  <button
                                    onClick={() => handleChangeIncidentStatus(inc.id, 'resolved')}
                                    className="bg-[#1A1A1A] text-white hover:bg-black text-[9px] font-bold tracking-widest uppercase px-3 py-1 transition"
                                  >
                                    Resolver
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-serif italic text-2xl text-[#1A1A1A] leading-tight font-normal">{inc.title}</h3>
                              <p className="text-xs text-[#8C857B]">
                                Ubicación: <strong className="text-[#1A1A1A] font-medium">{inc.location}</strong>
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Descripción del Residente</h4>
                              <p className="text-xs text-[#5A554F] bg-[#F5F2ED]/50 p-4 border border-[#E5E1DA] leading-relaxed">
                                {inc.description}
                              </p>
                            </div>

                            {/* Asignación de Técnico */}
                            <div className="p-4 bg-[#F5F2ED] border border-[#E5E1DA] space-y-3">
                              <h4 className="text-[9px] font-bold tracking-widest uppercase text-[#1A1A1A]">Asignación de Personal Técnico</h4>
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="text-xs text-[#8C857B]">
                                  Técnico Asignado: <strong className="text-[#1A1A1A] font-bold">{inc.technicianName || 'Ninguno'}</strong>
                                </div>
                                <select
                                  onChange={(e) => handleAssignTechnician(inc.id, e.target.value)}
                                  className="bg-white border border-[#E5E1DA] text-xs px-2.5 py-1.5 rounded-none outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                                  defaultValue={inc.technicianName || ''}
                                >
                                  <option value="">-- Asignar Técnico --</option>
                                  <option value="Ing. Carlos Gutiérrez (Plomería)">Ing. Carlos Gutiérrez (Plomería)</option>
                                  <option value="Sofía Alatorre (Electricidad)">Sofía Alatorre (Electricidad)</option>
                                  <option value="Ing. Pedro Ruiz (Otis Elevadores)">Ing. Pedro Ruiz (Otis Elevadores)</option>
                                  <option value="Personal de Seguridad Nocturno">Personal de Seguridad Nocturno</option>
                                </select>
                              </div>
                            </div>

                            {/* Chat Thread */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Mensajes de Seguimiento</h4>
                              <div className="border border-[#E5E1DA] p-4 bg-[#FDFCFB] space-y-4 max-h-60 overflow-y-auto">
                                {inc.comments.map((comm) => {
                                  const isSelf = comm.authorRole === 'admin';
                                  return (
                                    <div key={comm.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                                      <div className={`max-w-md p-3 border ${
                                        isSelf 
                                          ? 'bg-[#1A1A1A] border-[#1a1a1a] text-white' 
                                          : 'bg-white border-[#E5E1DA] text-[#1A1A1A]'
                                      }`}>
                                        <div className="flex justify-between items-baseline gap-4 mb-1">
                                          <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">
                                            {comm.authorName} ({comm.authorRole === 'resident' ? 'Residente' : comm.authorRole === 'technician' ? 'Técnico' : 'Admin'})
                                          </span>
                                          <span className="text-[7px] font-mono opacity-50">{comm.createdAt}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed">{comm.content}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Chat Input */}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const input = (e.currentTarget.elements.namedItem('replyText') as HTMLInputElement);
                                  if (input && input.value.trim()) {
                                    handleAddComment(inc.id, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="flex gap-2"
                              >
                                <input
                                  name="replyText"
                                  type="text"
                                  className="flex-1 bg-[#FDFCFB] border border-[#E5E1DA] px-4 py-2.5 text-xs outline-none focus:border-[#1A1A1A] placeholder-[#8C857B]/50"
                                  placeholder="Escribe una respuesta para el residente..."
                                  required
                                />
                                <button
                                  type="submit"
                                  className="bg-[#1A1A1A] text-white hover:bg-black px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer"
                                >
                                  Responder
                                </button>
                              </form>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="border border-[#E5E1DA] bg-white p-12 text-center text-[#8C857B] text-xs">
                          Selecciona un reporte de falla de la lista de la izquierda para ver su detalle, asignar técnicos e interactuar con el vecino.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <IncidentsSection 
                  incidents={incidents}
                  onAddIncident={handleAddIncident}
                  onAddComment={handleAddComment}
                />
              )}
            </motion.div>
          )}

          {currentTab === 'directory' && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              <DirectorySection isAdmin={false} />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </main>

      {/* POPUP FULL ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-none w-full max-w-lg shadow-none overflow-hidden relative z-10 border border-[#E5E1DA] p-6 space-y-4 text-left"
            >
              <div className="flex justify-between items-start border-b border-[#E5E1DA] pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#8C857B] font-mono block">COMUNICADO • {selectedAnnouncement.date}</span>
                  <span className="text-xs font-bold font-sans text-[#1A1A1A] block">Emitido por: {selectedAnnouncement.author}</span>
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1 text-[#8C857B] hover:text-[#1A1A1A] hover:bg-[#F5F2ED]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base md:text-lg font-serif italic text-[#1A1A1A] leading-tight">
                {selectedAnnouncement.title}
              </h3>

              <div className="text-xs md:text-sm text-[#5A554F] leading-relaxed space-y-2 whitespace-pre-line py-2">
                {selectedAnnouncement.content}
              </div>

              <div className="pt-4 border-t border-[#E5E1DA] flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-[#1A1A1A] text-white hover:bg-black font-bold text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-none transition"
                >
                  Entendido / Cerrar Aviso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DA] bg-white py-12 px-6 sm:px-10 text-[9px] font-bold tracking-widest uppercase text-[#8C857B] flex flex-col md:flex-row items-center justify-between gap-4 mt-16">
        <div>&copy; {new Date().getFullYear()} ResidenSmart</div>
        <div>Estatus de Servicios • Operativo</div>
        <div>Diseñado por ResidenSmart Digital</div>
      </footer>
    </div>
  );
}

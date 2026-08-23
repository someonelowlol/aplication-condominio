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
import { Payment, Booking, Incident, Announcement, Resident, PaymentStatus, Amenity } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

// Child components
import Navbar from './Navbar';
import PaymentsSection from './PaymentsSection';
import BookingsSection from './BookingsSection';
import IncidentsSection from './IncidentsSection';
import DirectorySection from './DirectorySection';

import { useLanguage } from './LanguageProvider';
// Admin modules
import AdminWorkspace from './admin/AdminWorkspace';

export default function DashboardClient({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useLanguage();
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
    const defaultVal: Resident = {
      id: '',
      name: 'Usuario Residente',
      apartment: 'Apto. --',
      tower: 'Torre --',
      email: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      balance: 0
    };
    if (typeof window === 'undefined') return defaultVal;
    const saved = localStorage.getItem('condo_resident');
    return saved ? JSON.parse(saved) : defaultVal;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('condo_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('condo_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('condo_incidents');
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('condo_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // Active announcement focus state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [condoId, setCondoId] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>(INITIAL_AMENITIES);

  // Load session from Supabase on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Fetch profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, unit_id, condominium_id')
            .eq('id', user.id)
            .single();

          if (profile) {
            const role = profile.role;
            const condoIdVal = profile.condominium_id;
            const unitId = profile.unit_id;
            setCondoId(condoIdVal);

            let residentName = profile.full_name || user.email?.split('@')[0] || 'Usuario';
            let residentEmail = profile.email || '';
            let apartment = 'N/A';
            let tower = 'N/A';
            let balance = 0;

            if (role === 'resident' && profile.unit_id) {
              // 2. Fetch unit details
              const { data: unit } = await supabase
                .from('units')
                .select('id, unit_number, balance, block_id')
                .eq('id', profile.unit_id)
                .single();

              if (unit) {
                apartment = `Apto. ${unit.unit_number}`;
                balance = Number(unit.balance);

                // Fetch block/tower details
                const { data: block } = await supabase
                  .from('blocks')
                  .select('name')
                  .eq('id', unit.block_id)
                  .single();

                if (block) {
                  tower = block.name;
                }
              }

              // Update state for resident
              setResident({
                id: user.id,
                name: residentName,
                email: residentEmail,
                apartment,
                tower,
                balance,
                phone: '',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
              });

              // 3. Fetch resident payments
              const { data: dbPayments } = await supabase
                .from('payments')
                .select('id, amount, status, date, receipt_url')
                .eq('unit_id', unitId);

              if (dbPayments && dbPayments.length > 0) {
                const formattedPayments: Payment[] = dbPayments.map((p) => ({
                  id: p.id,
                  title: `Cuota de Administración`,
                  description: `Pago registrado vía Supabase`,
                  amount: Number(p.amount),
                  dueDate: p.date.substring(0, 10),
                  status: p.status as PaymentStatus,
                  category: 'maintenance',
                  reference: `REF-SUPA-${p.id.substring(0, 4).toUpperCase()}`,
                  proofFile: p.receipt_url || undefined
                }));
                setPayments(formattedPayments);
              } else {
                setPayments([]);
              }

              // 4. Fetch resident bookings
              const { data: dbBookings } = await supabase
                .from('bookings')
                .select(`
                  id, 
                  start_time, 
                  end_time, 
                  status, 
                  amenity_id, 
                  amenities (
                    name
                  )
                `)
                .eq('unit_id', unitId);

              if (dbBookings && dbBookings.length > 0) {
                const formattedBookings: Booking[] = dbBookings.map((b) => ({
                  id: b.id,
                  amenityId: b.amenity_id,
                  amenityName: (b.amenities as any)?.name || 'Área Común',
                  date: b.start_time.substring(0, 10),
                  timeSlot: `${b.start_time.substring(11, 16)} - ${b.end_time.substring(11, 16)}`,
                  durationHours: 2,
                  totalCost: 0,
                  status: b.status as any,
                  residentId: user.id,
                  guestCount: 2,
                  createdAt: b.start_time,
                  qrCode: `QR-CODE-${b.id.substring(0, 4).toUpperCase()}`
                }));
                setBookings(formattedBookings);
              } else {
                setBookings([]);
              }
            } else if (role === 'admin' && condoIdVal) {
              setResident({
                id: user.id,
                name: residentName,
                email: residentEmail,
                apartment: 'Oficina',
                tower: 'Admin',
                balance: 0,
                phone: '',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
              });

              // Fetch blocks in condo
              const { data: blocks } = await supabase
                .from('blocks')
                .select('id')
                .eq('condominium_id', condoIdVal);

              if (blocks && blocks.length > 0) {
                const blockIds = blocks.map(b => b.id);
                const { data: condoUnits } = await supabase
                  .from('units')
                  .select('id, balance')
                  .in('block_id', blockIds);

                if (condoUnits && condoUnits.length > 0) {
                  const unitIds = condoUnits.map(u => u.id);

                  // Fetch all payments
                  const { data: adminPayments } = await supabase
                    .from('payments')
                    .select('id, amount, status, date, receipt_url, unit_id')
                    .in('unit_id', unitIds);

                  if (adminPayments && adminPayments.length > 0) {
                    const formattedPayments: Payment[] = adminPayments.map((p) => ({
                      id: p.id,
                      title: `Cuota de Administración`,
                      description: `Comprobante de pago cargado en Supabase`,
                      amount: Number(p.amount),
                      dueDate: p.date.substring(0, 10),
                      status: p.status as PaymentStatus,
                      category: 'maintenance',
                      reference: `REF-SUPA-${p.id.substring(0, 4).toUpperCase()}`,
                      proofFile: p.receipt_url || undefined
                    }));
                    setPayments(formattedPayments);
                  } else {
                    setPayments([]);
                  }

                  // Fetch all bookings
                  const { data: adminBookings } = await supabase
                    .from('bookings')
                    .select(`
                      id, 
                      start_time, 
                      end_time, 
                      status, 
                      amenity_id, 
                      unit_id,
                      amenities (
                        name
                      )
                    `)
                    .in('unit_id', unitIds);

                  if (adminBookings && adminBookings.length > 0) {
                    const formattedBookings: Booking[] = adminBookings.map((b) => ({
                      id: b.id,
                      amenityId: b.amenity_id,
                      amenityName: (b.amenities as any)?.name || 'Área Común',
                      date: b.start_time.substring(0, 10),
                      timeSlot: `${b.start_time.substring(11, 16)} - ${b.end_time.substring(11, 16)}`,
                      durationHours: 2,
                      totalCost: 0,
                      status: b.status as any,
                      residentId: b.unit_id,
                      guestCount: 2,
                      createdAt: b.start_time,
                      qrCode: `QR-CODE-${b.id.substring(0, 4).toUpperCase()}`
                    }));
                    setBookings(formattedBookings);
                  } else {
                    setBookings([]);
                  }
                } else {
                  setPayments([]);
                  setBookings([]);
                }
              } else {
                setPayments([]);
                setBookings([]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session data:', err);
      }
    }
    loadSession();
  }, [isAdmin, condoId]);

  // Sync state to localStorage (only runs in the browser)
  useEffect(() => {
    localStorage.setItem('condo_resident', JSON.stringify(resident));
    localStorage.setItem('condo_payments', JSON.stringify(payments));
    localStorage.setItem('condo_bookings', JSON.stringify(bookings));
    localStorage.setItem('condo_incidents', JSON.stringify(incidents));
    localStorage.setItem('condo_announcements', JSON.stringify(announcements));
  }, [resident, payments, bookings, incidents, announcements]);

  // ACTION: Record payment success
  const handlePaySuccess = async (paymentId: string, amount: number, paymentMethod: string, proofName?: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('unit_id')
          .eq('id', user.id)
          .single();

        if (profile?.unit_id) {
          if (paymentMethod !== 'cash') {
            // Call transaccional RPC for direct payment (credit card / transfer)
            const { error } = await supabase.rpc('process_administration_payment', {
              p_unit_id: profile.unit_id,
              p_amount: amount,
              p_receipt_url: proofName || 'comprobante_pago.pdf'
            });

            if (error) {
              alert(`Error al registrar el pago en Supabase: ${error.message}`);
              return;
            }
          } else {
            // For cash / review: insert a payment row with status 'pending' or 'under_review'
            const { error } = await supabase
              .from('payments')
              .insert({
                unit_id: profile.unit_id,
                amount: amount,
                status: 'under_review',
                receipt_url: proofName || 'comprobante_bancario_transferencia.pdf'
              });

            if (error) {
              alert(`Error al guardar comprobante en Supabase: ${error.message}`);
              return;
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Error en proceso de pago:', err);
    }

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
  const handleAddBooking = async (newBooking: Booking) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('unit_id')
          .eq('id', user.id)
          .single();

        if (profile?.unit_id) {
          // Format start and end times
          const [startStr, endStr] = newBooking.timeSlot.split(' - ');
          const dateStr = newBooking.date; // "YYYY-MM-DD"
          const startTime = `${dateStr}T${startStr}:00Z`;
          const endTime = `${dateStr}T${endStr}:00Z`;

          const { error } = await supabase
            .from('bookings')
            .insert({
              unit_id: profile.unit_id,
              amenity_id: newBooking.amenityId,
              start_time: startTime,
              end_time: endTime,
              status: 'confirmed'
            });

          if (error) {
            alert(`Error al registrar reservación en Supabase: ${error.message}`);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error('Error al registrar reserva:', err);
    }

    setBookings(prev => [newBooking, ...prev]);
    
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

  // Resident Join Condo states
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [searchingCondo, setSearchingCondo] = useState(false);
  const [foundCondo, setFoundCondo] = useState<{ id: string; name: string; nit: string; address: string } | null>(null);
  const [condoUnitsList, setCondoUnitsList] = useState<{ id: string; unit_number: string; block_name: string }[]>([]);
  const [selectedUnitIdForJoin, setSelectedUnitIdForJoin] = useState<string>('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);

  const handleSearchCondo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setSearchingCondo(true);
    setFoundCondo(null);
    setCondoUnitsList([]);
    
    try {
      const supabase = createClient();
      const code = joinCodeInput.trim();
      
      // Check if input matches UUID format to avoid Postgres casting errors
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
      
      let query = supabase
        .from('condominiums')
        .select('id, name, nit, address');
        
      if (isUuid) {
        query = query.or(`id.eq.${code},nit.eq.${code}`);
      } else {
        query = query.eq('nit', code);
      }

      const { data: condos, error } = await query;

      if (error || !condos || condos.length === 0) {
        alert('No se encontró ningún condominio registrado con este código de vinculación o NIT.');
        setSearchingCondo(false);
        return;
      }

      const condo = condos[0];
      setFoundCondo(condo);

      // Fetch blocks & units for this condo
      const { data: dbBlocks } = await supabase
        .from('blocks')
        .select('id, name')
        .eq('condominium_id', condo.id);

      if (dbBlocks && dbBlocks.length > 0) {
        const blockIds = dbBlocks.map(b => b.id);
        const { data: dbUnits } = await supabase
          .from('units')
          .select('id, unit_number, block_id')
          .in('block_id', blockIds)
          .order('unit_number', { ascending: true });

        if (dbUnits && dbUnits.length > 0) {
          const formatted = dbUnits.map(u => ({
            id: u.id,
            unit_number: u.unit_number,
            block_name: dbBlocks.find(b => b.id === u.block_id)?.name || 'Torre'
          }));
          setCondoUnitsList(formatted);
          setSelectedUnitIdForJoin(formatted[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Error buscando condominio.');
    } finally {
      setSearchingCondo(false);
    }
  };

  const handleConfirmJoinCondo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundCondo || !selectedUnitIdForJoin) return;

    setJoinSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Update resident's profile to link them to the condo and unit
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            condominium_id: foundCondo.id,
            unit_id: selectedUnitIdForJoin,
            role: 'resident'
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // 2. Redundantly attempt to update the unit's owner_id from the client side.
        // Even if RLS prevents this direct update, the backend trigger handles it.
        try {
          await supabase
            .from('units')
            .update({ owner_id: user.id })
            .eq('id', selectedUnitIdForJoin);
        } catch (unitErr) {
          console.warn('Direct unit owner update failed or blocked by RLS, relying on trigger:', unitErr);
        }

        alert(`¡Te has vinculado exitosamente al ${foundCondo.name}!`);
        setJoinModalOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      alert('Error vinculando cuenta a la unidad.');
    } finally {
      setJoinSubmitting(false);
    }
  };

  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;

  const handleUpdateResident = async (updated: Partial<Resident>) => {
    setResident(prev => {
      const newRes = { ...prev, ...updated };
      if (typeof window !== 'undefined') {
        localStorage.setItem('condo_resident', JSON.stringify(newRes));
      }
      return newRes;
    });

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && updated.name) {
        await supabase
          .from('profiles')
          .update({ full_name: updated.name })
          .eq('id', user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        onUpdateResident={handleUpdateResident}
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
            condoId={condoId}
            onCondoCreated={setCondoId}
          />
        ) : (
          <AnimatePresence mode="wait">
            {!condoId || resident.apartment === 'N/A' ? (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">¿Aún no estás vinculado a tu condominio?</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">Ingresa el código de vinculación único otorgado por tu administración para habilitar tu departamento.</p>
                </div>
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="px-4 py-2 bg-[#1A1A1A] text-white text-[9px] font-bold tracking-widest uppercase hover:bg-black transition whitespace-nowrap cursor-pointer"
                >
                  Vincularme con Código
                </button>
              </div>
            ) : null}
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
                        <span>{t('dashboard.welcome_admin_tag', 'Portal de Administración Activo')}</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-serif italic leading-tight text-[#1A1A1A] font-normal">
                        {t('dashboard.hello', 'Hola,')} <br />{t('login.new_admin', 'Administrador')}.
                      </h1>
                      <p className="text-xs md:text-sm text-[#8C857B] leading-relaxed max-w-md">
                        {t('dashboard.admin_desc', 'Bienvenido a la plataforma de administración de ResidenSmart. Aquí podrá publicar anuncios oficiales, coordinar reportes de fallas, auditar transferencias de cuotas y gestionar las reservas de amenidades.')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-xl text-left">
                      <div className="inline-flex items-center space-x-1.5 bg-[#F5F2ED] text-[#8C857B] px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-[#E5E1DA]/50">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('dashboard.welcome_resident_tag', 'Portal de Condóminos Activo')}</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-serif italic leading-tight text-[#1A1A1A] font-normal">
                        {t('dashboard.hello', 'Hola,')} <br />{resident.name}.
                      </h1>
                      <p className="text-xs md:text-sm text-[#8C857B] leading-relaxed max-w-md">
                        {t('dashboard.resident_desc', 'Bienvenido a su portal digital de ResidenSmart. Aquí podrá gestionar los servicios de su propiedad, agendar áreas comunes y consultar sus estados de cuenta de manera eficiente y transparente.')}
                      </p>
                    </div>
                  )}

                  {/* fast action cards */}
                  {isAdmin ? (
                    <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 space-y-6 w-full md:max-w-xs rounded-none shrink-0 text-left">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-0.5">{t('dashboard.recollection_june', 'Recaudación (Junio)')}</h2>
                          <div className="text-xl font-serif text-[#1A1A1A]">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                              payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E1DA]">
                          <div>
                            <h3 className="text-[8px] font-bold tracking-wider uppercase text-[#8C857B] mb-0.5">{t('dashboard.to_collect', 'Por Cobrar')}</h3>
                            <span className="text-xs font-bold text-rose-700">
                              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                                payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
                              )}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-[8px] font-bold tracking-wider uppercase text-[#8C857B] mb-0.5">{t('dashboard.to_approve', 'Por Aprobar')}</h3>
                            <span className="text-xs font-bold text-amber-700">
                              {payments.filter(p => p.status === 'under_review').length} {t('dashboard.payments', 'pagos')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => setCurrentTab('payments')}
                          className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none cursor-pointer text-center"
                        >
                          {t('dashboard.review_proofs', 'Revisar Comprobantes')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 space-y-6 w-full md:max-w-xs rounded-none shrink-0 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-1">{t('dashboard.account_balance', 'Estado de Cuenta')}</h2>
                          <div className="text-2xl md:text-3xl font-serif text-[#1A1A1A]">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(resident.balance)}
                          </div>
                        </div>
                        <span className="bg-white px-2 py-1 text-[9px] font-bold tracking-widest border border-[#E5E1DA] uppercase text-[#1A1A1A]">
                          {pendingPaymentsCount > 0 ? t('dashboard.balance_pending', 'Pendiente') : t('dashboard.balance_ok', 'Al día')}
                        </span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          id="btn-quick-pay"
                          onClick={() => setCurrentTab('payments')}
                          className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none cursor-pointer"
                        >
                          {t('dashboard.pay_maintenance', 'Pagar Mantenimiento')}
                        </button>
                        <p className="text-[10px] text-[#8C857B] italic text-center">
                          {t('dashboard.cutoff_notice', 'Próximo vencimiento ordinario: Día 10')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACCIONES DE ACCESO RÁPIDO */}
                <div className="mt-8 pt-8 border-t border-[#E5E1DA] flex flex-col space-y-3">
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] text-left">
                    {isAdmin ? t('dashboard.admin_actions', 'Acciones Administrativas') : t('dashboard.quick_services', 'Servicios Rápidos')}
                  </h2>
                  {isAdmin ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button
                        onClick={() => {
                          const title = prompt(t('dashboard.prompt_ann_title', 'Ingresa el título del comunicado:'));
                          const content = prompt(t('dashboard.prompt_ann_content', 'Ingresa el contenido del comunicado:'));
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
                            alert(t('dashboard.ann_success_alert', 'Comunicado publicado con éxito.'));
                          }
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Megaphone className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.create_announcement', 'Crear Comunicado')}</span>
                      </button>

                      <button
                        onClick={() => {
                          const amountStr = prompt(t('payments.admin_charge_amount_prompt', 'Monto del cargo en MXN (ej: 1850):'));
                          const title = prompt(t('payments.admin_charge_concept_prompt', 'Concepto del cargo (ej: Cuota mantenimiento Julio):'));
                          if (amountStr && title) {
                            const amount = parseFloat(amountStr);
                            if (!isNaN(amount)) {
                              const newPay: Payment = {
                                id: `pay-custom-${Date.now()}`,
                                title,
                                description: t('payments.admin_charge_desc', 'Cargo administrativo generado de manera extraordinaria.'),
                                amount,
                                dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().substring(0, 10),
                                status: 'pending',
                                category: 'maintenance',
                                reference: `REF-ADM-${Date.now().toString().substring(8, 12)}`
                              };
                              handleAddCustomPayment(newPay);
                              alert(t('payments.admin_charge_added', 'Cargo administrativo agregado con éxito.'));
                            }
                          }
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Plus className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.generate_charge', 'Generar Cargo')}</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('incidents')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.reported_defects', 'Fallas Reportadas')} ({incidents.filter(i => i.status !== 'resolved').length})</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('bookings')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Calendar className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.view_bookings', 'Ver Reservas')} ({bookings.length})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button
                        onClick={() => setCurrentTab('bookings')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Calendar className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.book_areas', 'Reservar Áreas')}</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('incidents')}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.report_defect', 'Reportar Falla')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab('incidents');
                          alert(t('dashboard.elevator_light_setup', 'Hemos preparado los campos para reportar una falla eléctrica en el elevador.'));
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Clock className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.elevator_light', 'Luz en Elevador')}</span>
                      </button>

                      <button
                        onClick={() => {
                          alert(t('dashboard.emergency_alert', 'TELÉFONOS DE EMERGENCIA DE RESIDENSMART:\n\n• Caseta de Vigilancia Principal: +52 55 9002 1100\n• Conserjería Nocturna: +52 55 9002 1122\n• Protección Civil Zona S.: 911 / 55 5658 1111\n\nHaga clic para copiar.'));
                        }}
                        className="border border-[#E5E1DA] p-4 hover:bg-[#F5F2ED] transition text-center flex flex-col items-center justify-center gap-2 bg-white rounded-none cursor-pointer text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase"
                      >
                        <PhoneCall className="w-4 h-4 text-[#8C857B]" />
                        <span>{t('dashboard.copy_security', 'Copiar Vigilancia')}</span>
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
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.admin_announcements_title', 'Avisos de la Administración')}</h2>
                    <span className="text-[10px] text-[#8C857B] uppercase tracking-wider">{announcements.length} {t('dashboard.announcements_count', 'comunicados')}</span>
                  </div>

                  <div className="space-y-4">
                    {announcements.length === 0 ? (
                      <div className="border border-dashed border-[#E5E1DA] py-12 text-center text-[#8C857B] text-xs bg-white">
                        {t('dashboard.no_announcements', 'No hay anuncios oficiales publicados por el momento en esta copropiedad.')}
                      </div>
                    ) : (
                      announcements.map((ann) => {
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
                                  <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border border-rose-300 bg-rose-50 text-[#1A1A1A]">{t('dashboard.ann_category_urgent', 'Urgente')}</span>
                                )}
                                {ann.category === 'maintenance' && (
                                  <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border border-[#CEC7BC] bg-[#F5F2ED] text-[#1A1A1A]">{t('dashboard.ann_category_maintenance', 'Mantenimiento')}</span>
                                )}
                                {ann.category === 'event' && (
                                  <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border border-emerald-300 bg-emerald-50 text-[#1A1A1A]">{t('dashboard.ann_category_event', 'Evento Social')}</span>
                                )}
                              </div>
                              <h3 className="font-serif italic text-lg leading-snug text-[#1A1A1A] hover:underline font-normal">{ann.title}</h3>
                              <p className="text-xs text-[#8C857B] leading-relaxed line-clamp-2 mt-1">{ann.content}</p>
                            </div>
                            
                            <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] hover:underline self-end md:self-start">{t('dashboard.read_more', 'Leer más →')}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* COLUMN 3: RESUMEN / ADMINISTRACIÓN INFO */}
                <div className="space-y-8 border-l border-[#E5E1DA] pl-0 lg:pl-8">
                  {/* DIRECTIVA */}
                  <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 rounded-none space-y-4">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] border-b border-[#E5E1DA] pb-2">{t('dashboard.admin_support_title', 'Administración y Soporte')}</h3>
                    
                    <div className="divide-y divide-[#E5E1DA]">
                      {/* Admin contact */}
                      <div className="py-3.5 first:pt-0 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-none bg-[#E5E1DA] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold font-mono border border-[#CEC7BC]">
                            AG
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">Ing. Manuel Esparza</span>
                            <span className="text-[10px] text-[#8C857B] block">{t('dashboard.admin_res_role', 'Administrador Residente')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('+52 55 4501 2299');
                            alert(t('dashboard.admin_phone_copied', 'Teléfono de Administrador copiado.'));
                          }}
                          className="text-[#1A1A1A] hover:bg-white p-2 border border-[#E5E1DA] bg-[#FDFCFB] transition"
                          title={t('dashboard.copy_phone_tooltip', 'Copiar teléfono')}
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
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">{t('dashboard.security_main_title', 'Seguridad Principal')}</span>
                            <span className="text-[10px] text-[#8C857B] block">{t('dashboard.security_24h_desc', 'Seguridad Caseta 24 hrs')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('+52 55 9002 1100');
                            alert(t('dashboard.security_phone_copied', 'Teléfono de Caseta copiado.'));
                          }}
                          className="text-[#1A1A1A] hover:bg-white p-2 border border-[#E5E1DA] bg-[#FDFCFB] transition"
                          title={t('dashboard.copy_phone_tooltip', 'Copiar teléfono')}
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
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">{t('dashboard.tech_support_title', 'Soporte Técnico')}</span>
                            <span className="text-[10px] text-[#8C857B] block">{t('dashboard.tech_guard_desc', 'Guardia de Mantenimiento')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('+52 55 9002 1122');
                            alert(t('dashboard.tech_phone_copied', 'Teléfono de Guardia copiado.'));
                          }}
                          className="text-[#1A1A1A] hover:bg-white p-2 border border-[#E5E1DA] bg-[#FDFCFB] transition"
                          title={t('dashboard.copy_phone_tooltip', 'Copiar teléfono')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COMODIDAD RESIDENTE BOX */}
                  <div className="bg-white border border-[#E5E1DA] p-6 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">{t('dashboard.rules_title', 'Reglamento Interno')}</h4>
                      <p className="text-xs text-[#8C857B] leading-relaxed">
                        {t('dashboard.rules_short_desc', 'Recuerda que el volumen de la música exterior debe ser moderado a partir de las 22:00 horas. Mantengamos una vecindad pacífica y asertiva.')}
                      </p>
                    </div>
                    <button
                      onClick={() => alert(t('dashboard.rules_modal_message', 'REGLAMENTO FUNDACIONAL RESIDENSMART:\n\n1. Mascotas deben portar correa en áreas verdes comunes.\n2. Cada departamento dispone de 2 cajones numerados asignados.\n3. Es obligatorio notificar mudanzas con 48 horas de anticipación.\n4. Cuota ordinaria de mantenimiento expira el día 10 de cada mes.'))}
                      className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A] hover:underline inline-flex items-center text-left"
                    >
                      <Info className="w-3.5 h-3.5 mr-1.5 text-[#8C857B]" />
                      {t('dashboard.rules_view_all', 'Ver todos los estatutos')}
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
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.admin_payments_title', 'Aprobación de Transferencias y Pagos')}</h2>
                    <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">{t('dashboard.admin_payments_subtitle', 'Auditoría y control de comprobantes de pago subidos por los residentes.')}</p>
                  </div>

                  {/* Pagos por Aprobar */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">{t('dashboard.payments_under_review', 'Pagos Bajo Revisión')} ({payments.filter(p => p.status === 'under_review').length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {payments.filter(p => p.status === 'under_review').map((pay) => (
                        <div key={pay.id} className="bg-white border border-[#E5E1DA] p-6 rounded-none space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-mono tracking-widest uppercase text-[#8C857B]">{pay.reference}</span>
                              <h4 className="font-serif italic text-lg leading-snug text-[#1A1A1A]">{pay.title}</h4>
                              <p className="text-xs text-[#8C857B] mt-1">{t('dashboard.uploaded_by_resident', 'Cargado por Residente (Luis Martínez)')}</p>
                            </div>
                            <span className="text-lg font-mono font-bold text-[#1A1A1A]">${pay.amount.toFixed(2)}</span>
                          </div>

                          <div className="p-3 bg-[#F5F2ED] border border-[#E5E1DA] text-[10px] text-[#8C857B] font-mono">
                            {t('dashboard.proof_attached', 'Comprobante adjunto')}: {pay.proofFile || 'comprobante_bancario_transferencia.pdf'}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprovePayment(pay.id)}
                              className="flex-1 bg-[#1A1A1A] text-white py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors rounded-none cursor-pointer text-center"
                            >
                              {t('dashboard.approve_payment_btn', 'Aprobar Pago')}
                            </button>
                            <button
                              onClick={() => handleRejectPayment(pay.id)}
                              className="flex-1 bg-white text-[#1A1A1A] border border-[#E5E1DA] py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-[#F5F2ED] transition-colors rounded-none cursor-pointer text-center"
                            >
                              {t('dashboard.reject_btn', 'Rechazar')}
                            </button>
                          </div>
                        </div>
                      ))}
                      {payments.filter(p => p.status === 'under_review').length === 0 && (
                        <div className="col-span-full border border-dashed border-[#E5E1DA] py-8 text-center text-[#8C857B] text-xs bg-white">
                          {t('dashboard.no_pending_proofs', 'No hay comprobantes pendientes de aprobación en este momento.')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Todos los Pagos del Condominio */}
                  <div className="space-y-4 pt-6 border-t border-[#E5E1DA]">
                    <div className="flex justify-between items-end">
                      <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">{t('dashboard.all_charges_title', 'Todos los Cargos Generados')}</h3>
                      <button
                        onClick={() => {
                          const amountStr = prompt(t('payments.admin_charge_amount_prompt', 'Monto del cargo en MXN (ej: 1850):'));
                          const title = prompt(t('payments.admin_charge_concept_prompt', 'Concepto del cargo (ej: Cuota mantenimiento Julio):'));
                          if (amountStr && title) {
                            const amount = parseFloat(amountStr);
                            if (!isNaN(amount)) {
                              const newPay: Payment = {
                                id: `pay-custom-${Date.now()}`,
                                title,
                                description: t('payments.admin_charge_desc', 'Cargo administrativo generado de manera extraordinaria.'),
                                amount,
                                dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().substring(0, 10),
                                status: 'pending',
                                category: 'maintenance',
                                reference: `REF-ADM-${Date.now().toString().substring(8, 12)}`
                              };
                              handleAddCustomPayment(newPay);
                              alert(t('payments.admin_charge_added', 'Cargo administrativo agregado con éxito.'));
                            }
                          }
                        }}
                        className="bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:bg-[#F5F2ED] px-4 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none transition"
                      >
                        {t('dashboard.generate_new_charge_btn', 'Generar Nuevo Cargo')}
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-[#E5E1DA]">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="bg-[#F5F2ED] border-b border-[#E5E1DA] text-[9px] uppercase tracking-wider font-bold text-[#8C857B]">
                            <th className="p-3">{t('payments.history_reference', 'Referencia')}</th>
                            <th className="p-3">{t('payments.history_concept', 'Concepto')}</th>
                            <th className="p-3">{t('payments.history_amount', 'Monto')}</th>
                            <th className="p-3">{t('payments.vence_el', 'Vence el:')}</th>
                            <th className="p-3">{t('payments.history_status', 'Estado')}</th>
                            <th className="p-3">{t('dashboard.table_resident', 'Residente')}</th>
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
                                  {p.status === 'paid' ? t('payments.status_paid', 'Pagado') : p.status === 'under_review' ? t('payments.status_review', 'En Revisión') : t('dashboard.balance_pending', 'Pendiente')}
                                </span>
                              </td>
                              <td className="p-3 text-[#8C857B]">{t('dashboard.table_resident_name', 'Luis Martínez (Apto 402)')}</td>
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
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.admin_bookings_title', 'Administración de Áreas Comunes y Reservas')}</h2>
                    <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">{t('dashboard.admin_bookings_subtitle', 'Control y aprobación de reservaciones calendarizadas por los residentes.')}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">{t('dashboard.registered_bookings', 'Reservas Registradas')} ({bookings.length})</h3>
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
                                {book.status === 'confirmed' ? t('bookings.status_confirmed', 'Confirmada') : book.status === 'pending' ? t('bookings.status_pending', 'Sujeto a Aprobación') : t('bookings.status_cancelled', 'Cancelada')}
                              </span>
                            </div>
                            
                            <h4 className="font-serif italic text-lg leading-snug text-[#1A1A1A]">{book.amenityName}</h4>
                            <p className="text-xs text-[#8C857B]">
                              {t('dashboard.schedule_label', 'Horario')}: <strong className="text-[#1A1A1A] font-medium">{book.timeSlot}</strong>
                            </p>
                            <p className="text-xs text-[#8C857B]">
                              {t('dashboard.table_resident', 'Residente')}: <strong className="text-[#1A1A1A] font-medium">{t('dashboard.table_resident_name', 'Luis Martínez (Apto 402)')}</strong>
                            </p>
                            <p className="text-xs text-[#8C857B]">
                              {t('dashboard.guests_label', 'Invitados')}: <strong className="text-[#1A1A1A] font-medium">{book.guestCount} {t('bookings.people', 'pers.')}</strong>
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
                                  {t('dashboard.approve_btn', 'Aprobar')}
                                </button>
                              )}
                              {book.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelBooking(book.id)}
                                  className="bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-none transition"
                                >
                                  {t('dashboard.cancel_btn', 'Cancelar')}
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
                  amenities={amenities}
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
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.admin_incidents_title', 'Gestión de Reportes y Fallas')}</h2>
                    <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">{t('dashboard.admin_incidents_subtitle', 'Administre, asigne y responda a las incidencias levantadas por los condóminos.')}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Incidents List */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#1A1A1A]">{t('dashboard.active_reports', 'Reportes Activos')} ({incidents.filter(i => i.status !== 'resolved').length})</h3>
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
                                  {inc.priority === 'high' ? t('incidents.priority_high', 'Alta Prioridad') : t('incidents.priority_medium', 'Media')}
                                </span>
                              </div>
                              <h4 className="font-serif italic text-sm text-[#1A1A1A] leading-tight mb-1">{inc.title}</h4>
                              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold mt-2">
                                <span className="text-[#8C857B]">{inc.location.split(',')[0]}</span>
                                <span className={
                                  inc.status === 'resolved' ? 'text-emerald-700' : inc.status === 'in_progress' ? 'text-indigo-700' : 'text-amber-700'
                                }>
                                  {inc.status === 'resolved' ? t('incidents.status_resolved', 'Solucionado ✓') : inc.status === 'in_progress' ? t('incidents.status_in_progress', 'Trabajo Iniciado') : inc.status === 'assigned' ? t('incidents.status_assigned', 'Técnico Asignado') : t('incidents.status_reported', 'Reportado')}
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
                        if (!inc) return <div className="border border-[#E5E1DA] bg-white p-8 text-center text-[#8C857B]">{t('dashboard.select_report_prompt', 'Selecciona un reporte de la lista para ver el seguimiento.')}</div>;
                        
                        return (
                          <div className="bg-white border border-[#E5E1DA] p-6 space-y-6">
                            <div className="border-b border-[#E5E1DA] pb-4 space-y-2">
                              <div className="flex flex-wrap justify-between items-center gap-2">
                                <span className="text-[10px] font-mono text-[#8C857B]">{t('dashboard.report_id_label', 'Reporte ID')}: {inc.id} • {t('incidents.entered_label', 'Ingresado')}: {inc.createdAt}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleChangeIncidentStatus(inc.id, 'in_progress')}
                                    className="bg-[#F5F2ED] border border-[#E5E1DA] hover:bg-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 text-[#1A1A1A] transition"
                                  >
                                    {t('dashboard.in_process_btn', 'En Proceso')}
                                  </button>
                                  <button
                                    onClick={() => handleChangeIncidentStatus(inc.id, 'resolved')}
                                    className="bg-[#1A1A1A] text-white hover:bg-black text-[9px] font-bold tracking-widest uppercase px-3 py-1 transition"
                                  >
                                    {t('dashboard.resolve_btn', 'Resolver')}
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-serif italic text-2xl text-[#1A1A1A] leading-tight font-normal">{inc.title}</h3>
                              <p className="text-xs text-[#8C857B]">
                                {t('incidents.modal_location_label', 'Ubicación Precisa')}: <strong className="text-[#1A1A1A] font-medium">{inc.location}</strong>
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.resident_desc_title', 'Descripción del Residente')}</h4>
                              <p className="text-xs text-[#5A554F] bg-[#F5F2ED]/50 p-4 border border-[#E5E1DA] leading-relaxed">
                                {inc.description}
                              </p>
                            </div>

                            {/* Asignación de Técnico */}
                            <div className="p-4 bg-[#F5F2ED] border border-[#E5E1DA] space-y-3">
                              <h4 className="text-[9px] font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.tech_assignment_title', 'Asignación de Personal Técnico')}</h4>
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="text-xs text-[#8C857B]">
                                  {t('dashboard.tech_assigned_label', 'Técnico Asignado')}: <strong className="text-[#1A1A1A] font-bold">{inc.technicianName || 'Ninguno'}</strong>
                                </div>
                                <select
                                  onChange={(e) => handleAssignTechnician(inc.id, e.target.value)}
                                  className="bg-white border border-[#E5E1DA] text-xs px-2.5 py-1.5 rounded-none outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                                  defaultValue={inc.technicianName || ''}
                                >
                                  <option value="">{t('dashboard.assign_tech_placeholder', '-- Asignar Técnico --')}</option>
                                  <option value="Ing. Carlos Gutiérrez (Plomería)">Ing. Carlos Gutiérrez (Plomería)</option>
                                  <option value="Sofía Alatorre (Electricidad)">Sofía Alatorre (Electricidad)</option>
                                  <option value="Ing. Pedro Ruiz (Otis Elevadores)">Ing. Pedro Ruiz (Otis Elevadores)</option>
                                  <option value="Personal de Seguridad Nocturno">Personal de Seguridad Nocturno</option>
                                </select>
                              </div>
                            </div>

                            {/* Chat Thread */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">{t('dashboard.follow_up_messages', 'Mensajes de Seguimiento')}</h4>
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
                                            {comm.authorName} ({comm.authorRole === 'resident' ? t('incidents.log_author_resident', 'Residente') : comm.authorRole === 'technician' ? t('incidents.log_author_tech', 'Técnico') : t('incidents.log_author_admin', 'Admin')})
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
                                  placeholder={t('dashboard.reply_placeholder', 'Escribe una respuesta para el residente...')}
                                  required
                                />
                                <button
                                  type="submit"
                                  className="bg-[#1A1A1A] text-white hover:bg-black px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer"
                                >
                                  {t('dashboard.reply_btn', 'Responder')}
                                </button>
                              </form>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="border border-[#E5E1DA] bg-white p-12 text-center text-[#8C857B] text-xs">
                          {t('dashboard.select_report_full_prompt', 'Selecciona un reporte de falla de la lista de la izquierda para ver su detalle, asignar técnicos e interactuar con el vecino.')}
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
                  <span className="text-[10px] text-[#8C857B] font-mono block">{t('dashboard.announcement_label', 'COMUNICADO')} • {selectedAnnouncement.date}</span>
                  <span className="text-xs font-bold font-sans text-[#1A1A1A] block">{t('dashboard.issued_by_label', 'Emitido por')}: {selectedAnnouncement.author}</span>
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
                  {t('dashboard.btn_understood_close', 'Entendido / Cerrar Aviso')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESIDENT JOIN CONDO MODAL */}
      <AnimatePresence>
        {joinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E5E1DA] max-w-md w-full p-6 text-left space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-3">
                <div>
                  <h3 className="text-base font-serif italic text-[#1A1A1A]">{t('dashboard.join_modal_title', 'Vincularse a un Condominio')}</h3>
                  <p className="text-[10px] text-[#8C857B] uppercase tracking-wider font-mono">{t('dashboard.join_modal_subtitle', 'Ingresa el Código de Vinculación o NIT')}</p>
                </div>
                <button onClick={() => setJoinModalOpen(false)} className="p-1 text-[#8C857B] hover:text-[#1A1A1A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!foundCondo ? (
                <form onSubmit={handleSearchCondo} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8C857B] mb-1.5">
                      {t('dashboard.join_code_label', 'Código de Vinculación / NIT del Condominio')}
                    </label>
                    <input
                      type="text"
                      required
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      placeholder="Ej: NIT-177386450"
                      className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3.5 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A] font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searchingCondo}
                    className="w-full py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
                  >
                    {searchingCondo ? t('dashboard.searching_condo', 'Buscando Condominio...') : t('dashboard.verify_code_btn', 'Verificar Código')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmJoinCondo} className="space-y-4">
                  <div className="p-3 bg-[#F5F2ED] border border-[#E5E1DA] space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#0D9488]">{t('dashboard.condo_found', 'Condominio Encontrado')}</span>
                    <h4 className="font-serif italic text-lg text-[#1A1A1A]">{foundCondo.name}</h4>
                    <p className="text-[10px] text-[#8C857B] font-mono">{foundCondo.address} • NIT: {foundCondo.nit}</p>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8C857B] mb-1.5">
                      {t('dashboard.select_unit_label', 'Selecciona tu Unidad / Departamento')}
                    </label>
                    {condoUnitsList.length > 0 ? (
                      <select
                        value={selectedUnitIdForJoin}
                        onChange={(e) => setSelectedUnitIdForJoin(e.target.value)}
                        className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                      >
                        {condoUnitsList.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.block_name} - {t('dashboard.unit_number_label', 'Departamento')} {u.unit_number}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-rose-700 italic">{t('dashboard.no_units_generated', 'Este condominio aún no tiene departamentos generados.')}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E5E1DA] flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFoundCondo(null)}
                      className="flex-1 py-2 border border-[#E5E1DA] text-[9px] font-bold uppercase tracking-widest text-[#8C857B] hover:bg-[#F5F2ED]"
                    >
                      {t('payments.btn_back', 'Atrás')}
                    </button>
                    <button
                      type="submit"
                      disabled={joinSubmitting || condoUnitsList.length === 0}
                      className="flex-1 py-2 bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest transition"
                    >
                      {joinSubmitting ? t('dashboard.joining_btn', 'Vinculando...') : t('dashboard.confirm_enter_btn', 'Confirmar y Entrar')}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DA] bg-white py-12 px-6 sm:px-10 text-[9px] font-bold tracking-widest uppercase text-[#8C857B] flex flex-col md:flex-row items-center justify-between gap-4 mt-16">
        <div>&copy; {new Date().getFullYear()} ResidenSmart</div>
        <div>{t('dashboard.footer_services_status', 'Estatus de Servicios • Operativo')}</div>
        <div>{t('dashboard.footer_designer', 'Diseñado por ResidenSmart Digital')}</div>
      </footer>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  X, 
  Check, 
  Trash2,
  ChevronRight,
  Sparkles,
  Waves,
  Laptop,
  PartyPopper,
  Flame,
  Dribbble,
  Info
} from 'lucide-react';
import { Amenity, Booking } from '@/lib/types';

interface BookingsSectionProps {
  amenities: Amenity[];
  bookings: Booking[];
  onAddBooking: (newBooking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

// Map string representation to beautiful Lucide components
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Waves: Waves,
  Laptop: Laptop,
  PartyPopper: PartyPopper,
  Flame: Flame,
  Dribbble: Dribbble
};

export default function BookingsSection({ 
  amenities, 
  bookings, 
  onAddBooking,
  onCancelBooking 
}: BookingsSectionProps) {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  
  // Form states
  const [bookingDate, setBookingDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [showQRBooking, setShowQRBooking] = useState<Booking | null>(null);

  // Quick lists of dates to reserve (today & next 4 days)
  const getSimulatedDates = () => {
    const dates = [];
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isostring = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      const dayNum = d.getDate();
      dates.push({ iso: isostring, label: `${dayName} ${dayNum}`, isToday: i === 0 });
    }
    return dates;
  };
  
  const dateOptions = getSimulatedDates();

  // Time slots template
  const TIME_SLOTS = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 17:00',
    '17:00 - 20:00',
    '20:00 - 22:00'
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const handleStartBooking = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setBookingDate(dateOptions[0].iso); // Default to today
    setSelectedSlot('');
    setGuests(1);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !selectedSlot) return;

    // Estimate duration
    const isThreeHourSlot = selectedSlot.includes('14:00') || selectedSlot.includes('17:00');
    const duration = isThreeHourSlot ? 3 : 2;
    const computedCost = selectedAmenity.hourlyRate * duration;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      amenityId: selectedAmenity.id,
      amenityName: selectedAmenity.name,
      date: bookingDate,
      timeSlot: selectedSlot,
      durationHours: duration,
      totalCost: computedCost,
      status: selectedAmenity.requiresReview ? 'pending' : 'confirmed',
      residentId: 'res-402',
      guestCount: guests,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      qrCode: `QR-ACC-${selectedAmenity.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    onAddBooking(newBooking);
    setSelectedAmenity(null);
  };

  // Check if a slot is already taken for a typical amenity and date
  const isSlotTaken = (amenityId: string, date: string, slot: string) => {
    return bookings.some(b => b.amenityId === amenityId && b.date === date && b.timeSlot === slot && b.status !== 'cancelled');
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN JUEGO: MIS RESERVAS VIGENTES */}
      <div className="space-y-4">
        <div className="border-b border-[#E5E1DA] pb-2 mb-4 text-left">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Mis Reservas Activas</h2>
        </div>
        
        {bookings.length === 0 ? (
          <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-8 text-center text-[#8C857B] rounded-none">
            <CalendarIcon className="w-8 h-8 text-[#8C857B] mx-auto mb-2" />
            <p className="text-xs font-serif italic text-[#8C857B]">No tienes ninguna reserva activa programada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b) => {
              const animName = b.amenityId === 'am-1' ? 'Waves' : b.amenityId === 'am-2' ? 'Laptop' : b.amenityId === 'am-3' ? 'PartyPopper' : b.amenityId === 'am-4' ? 'Flame' : 'Dribbble';
              const IconComp = IconMap[animName] || CalendarIcon;
              
              return (
                <motion.div 
                  key={b.id}
                  layoutId={`booking-${b.id}`}
                  className={`bg-white rounded-none p-6 border relative overflow-hidden transition ${
                    b.status === 'cancelled' ? 'border-[#E5E1DA] opacity-60' : 'border-[#E5E1DA]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#F5F2ED] text-[#1A1A1A] border border-[#E5E1DA]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif italic text-base text-[#1A1A1A]">{b.amenityName}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-[#8C857B] uppercase mt-1">
                          <span className="font-bold text-[#1A1A1A]">{b.date}</span>
                          <span>•</span>
                          <span>{b.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E5E1DA] flex items-center justify-between text-xs text-[#8C857B]">
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 mr-1 text-[#8C857B]" />
                      {b.guestCount} {b.guestCount === 1 ? 'Invitado' : 'Invitados'}
                    </div>

                    <div className="text-[#1A1A1A] font-serif font-bold">
                      {b.totalCost > 0 ? formatCurrency(b.totalCost) : 'Gratuito'}
                    </div>
                  </div>

                  {/* Status & Options */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E5E1DA] pt-4">
                    {b.status === 'confirmed' && (
                      <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase bg-[#E1EFE0] text-[#1D5E22] border border-[#C2E0C0]">
                        Confirmada
                      </span>
                    )}
                    {b.status === 'pending' && (
                      <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase bg-[#FDF3E1] text-[#7A5A18] border border-[#FBE3B8] animate-pulse">
                        Sujeto a Aprobación
                      </span>
                    )}
                    {b.status === 'cancelled' && (
                      <span className="px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase bg-slate-50 text-[#8C857B] border border-[#E5E1DA]">
                        Cancelada
                      </span>
                    )}

                    <div className="flex items-center space-x-1.5">
                      {b.status === 'confirmed' && (
                        <button
                          id={`btn-qr-${b.id}`}
                          onClick={() => setShowQRBooking(b)}
                          className="bg-white hover:bg-[#F5F2ED] border border-[#E5E1DA] text-[#1A1A1A] px-2.5 py-1.5 transition text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 rounded-none cursor-pointer"
                          title="Ver pase de acceso QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pase QR</span>
                        </button>
                      )}

                      {b.status !== 'cancelled' && (
                        <button
                          id={`btn-cancel-book-${b.id}`}
                          onClick={() => {
                            if (confirm('¿Estás seguro de cancelar esta reserva? El dinero o saldo cargado se reembolsará automáticamente.')) {
                              onCancelBooking(b.id);
                            }
                          }}
                          className="text-[#8C857B] hover:text-rose-700 hover:bg-[#F5F2ED] p-2 border border-[#E5E1DA] transition rounded-none cursor-pointer"
                          title="Cancelar reserva"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* CATÁLOGO DE ÁREAS COMUNES */}
      <div className="space-y-6">
        <div className="border-b border-[#E5E1DA] pb-2 text-left">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Áreas Comunes Disponibles</h2>
          <p className="text-[11px] text-[#8C857B] mt-0.5 italic font-serif">Planifica y reserva los mejores espacios de ResidenSmart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((am) => {
            const IconComponent = IconMap[am.iconName] || CalendarIcon;
            return (
              <div 
                key={am.id}
                className="bg-white border border-[#E5E1DA] rounded-none overflow-hidden flex flex-col justify-between group transition duration-300 text-left"
              >
                {/* Landscape Image */}
                <div className="relative h-44 overflow-hidden border-b border-[#E5E1DA]">
                  <img 
                    src={am.image} 
                    alt={am.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white border border-[#E5E1DA] px-2.5 py-1 flex items-center shadow-none">
                    <IconComponent className="w-3.5 h-3.5 text-[#1A1A1A] mr-1.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">{am.name}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#1A1A1A] text-white px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase">
                    {am.hourlyRate > 0 ? `${formatCurrency(am.hourlyRate)}/hr` : 'Gratuito'}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-[#8C857B] leading-relaxed line-clamp-2">{am.description}</p>
                    
                    <div className="flex items-center space-x-4 text-[10px] text-[#8C857B] font-bold uppercase tracking-wider pt-1">
                      <span className="flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1 text-[#8C857B]" />
                        Aforo máx: &nbsp;<strong className="text-[#1A1A1A]">{am.capacity} pers.</strong>
                      </span>
                      {am.requiresReview && (
                        <span className="flex items-center text-[#1D5E22] bg-[#E1EFE0] px-2 py-0.5 border border-[#C2E0C0]">
                          <Sparkles className="w-3 h-3 mr-1 text-[#1D5E22]" /> Requiere aprobación
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-[#E5E1DA]">
                    <button
                      id={`btn-rules-${am.id}`}
                      onClick={() => {
                        alert(`REGLAS DE SEGURIDAD - ${am.name}:\n\n` + am.rules.map((r, i) => `${i+1}. ${r}`).join('\n'));
                      }}
                      className="text-[10px] font-bold tracking-widest uppercase text-[#8C857B] hover:text-[#1A1A1A] flex items-center cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 mr-1 text-[#8C857B]" />
                      Reglas de uso
                    </button>

                    <button
                      id={`btn-book-start-${am.id}`}
                      onClick={() => handleStartBooking(am)}
                      className="bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-none transition flex items-center cursor-pointer"
                    >
                      Reservar
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP ACCESS QR ACCESS TOKEN */}
      <AnimatePresence>
        {showQRBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRBooking(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 relative z-10 border border-slate-100 text-center space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-800 text-sm">Pase de Acceso Digital</span>
                <button 
                  onClick={() => setShowQRBooking(null)}
                  className="p-1 text-slate-450 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{showQRBooking.amenityName}</h3>
                <p className="text-xs text-slate-500">{showQRBooking.date} de {showQRBooking.timeSlot}</p>
              </div>

              {/* Fake Interactive QR Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative max-w-[200px] mx-auto group">
                <div className="aspect-square bg-white border border-slate-200/80 rounded-xl p-3 shadow-inner flex flex-col justify-between items-center transition group-hover:scale-102">
                  {/* Styled fake pixelated QR grids using beautiful layout */}
                  <div className="w-full h-full flex flex-col justify-between opacity-80 font-mono">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 border-4 border-slate-800"></div>
                      <div className="w-2 h-2 bg-indigo-600"></div>
                      <div className="w-8 h-8 border-4 border-slate-800"></div>
                    </div>
                    <div className="flex justify-center space-x-1 text-[8px] tracking-tight bg-slate-100 mx-auto px-1 border select-none">
                      <span>[CONDOSCAN]</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 border-4 border-slate-800"></div>
                      <div className="w-3 h-3 bg-indigo-500"></div>
                      <div className="w-3 h-3 bg-slate-800"></div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-3 tracking-widest">{showQRBooking.qrCode}</div>
              </div>

              <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-100/60 text-xs text-left leading-relaxed font-sans">
                Aproxima esta pantalla en el escáner del pórtico de la amenidad. Asegura el aforo restringido de máximo {showQRBooking.guestCount} personas asociadas.
              </div>

              <button
                onClick={() => setShowQRBooking(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Cerrar Pase
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP BOOKING COMPOSER MODAL */}
      <AnimatePresence>
        {selectedAmenity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAmenity(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative z-10 border border-slate-100"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Reservar Espacio Común</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAmenity.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedAmenity(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
                {/* Date Picker Buttons */}
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-2 font-medium">1. Selecciona el Día</label>
                  <div className="grid grid-cols-5 gap-2">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.iso}
                        type="button"
                        onClick={() => {
                          setBookingDate(opt.iso);
                          setSelectedSlot(''); // Keep slot clean on day swap
                        }}
                        className={`py-2 rounded-xl border text-center transition flex flex-col justify-center items-center ${
                          bookingDate === opt.iso
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] opacity-75 font-medium">{opt.label.split(' ')[0]}</span>
                        <span className="text-sm font-bold">{opt.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot Picker */}
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-2 font-medium">2. Horario Disponible</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const taken = isSlotTaken(selectedAmenity.id, bookingDate, slot);
                      
                      return (
                        <button
                          key={slot}
                          disabled={taken}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition ${
                            taken 
                              ? 'bg-slate-100 border-slate-150 text-slate-400 cursor-not-allowed line-through'
                              : selectedSlot === slot
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600 font-semibold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="block">{slot}</span>
                          <span className="text-[9px] opacity-80">
                            {taken ? 'Ocupado' : 'Disponible'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guests counter */}
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1 font-medium">3. Número de Acompañantes</label>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <button
                      type="button"
                      disabled={guests <= 1}
                      onClick={() => setGuests(prev => prev - 1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center font-bold text-slate-600 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-800 w-6 text-center">{guests}</span>
                    <button
                      type="button"
                      disabled={guests >= selectedAmenity.capacity}
                      onClick={() => setGuests(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center font-bold text-slate-600 disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-400 font-sans">
                      Aforo máximo permitido: {selectedAmenity.capacity} de personas.
                    </span>
                  </div>
                </div>

                {/* Price Computation Summary */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-slate-500">
                    <span>Precio por Hora:</span>
                    <span>{selectedAmenity.hourlyRate > 0 ? `${formatCurrency(selectedAmenity.hourlyRate)}` : 'Gratuito'}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Duración estimada:</span>
                    <span>{selectedSlot ? (selectedSlot.includes('14:00') || selectedSlot.includes('17:00') ? '3 horas' : '2 horas') : '--'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 pt-1.5 border-t border-slate-200/50 text-xs">
                    <span>Costo total aproximado:</span>
                    <span className="text-indigo-600">
                      {selectedSlot 
                        ? (selectedAmenity.hourlyRate > 0 
                          ? formatCurrency(selectedAmenity.hourlyRate * (selectedSlot.includes('14:00') || selectedSlot.includes('17:00') ? 3 : 2)) 
                          : 'Gratuito') 
                        : '--'}
                    </span>
                  </div>
                </div>

                {selectedAmenity.requiresReview && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start space-x-2 text-[10px] leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      Esta amenidad de alta demanda (como el salón social) requiere la aprobación del administrador y un depósito reembolsable de limpieza. Te enviaremos un correo cuando sea confirmado.
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAmenity(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlot}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

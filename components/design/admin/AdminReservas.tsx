"use client";
import React, { useState } from 'react';
import { 
  CalendarRange, 
  Check, 
  X, 
  Settings, 
  ClipboardCheck, 
  AlertTriangle, 
  Clock, 
  User,
  Info 
} from 'lucide-react';
import { Booking, Payment } from '@/lib/types';

interface AdminReservasProps {
  bookings: Booking[];
  onApproveBooking: (id: string) => void;
  onCancelBooking: (id: string) => void;
  payments: Payment[];
}

interface AmenityRule {
  id: string;
  name: string;
  maxCapacity: number;
  cost: number;
  deposit: number;
  hoursAnticipation: number;
  restrictOnDelinquency: boolean;
}

const INITIAL_RULES: AmenityRule[] = [
  { id: 'am-1', name: 'Alberca de la Terraza', maxCapacity: 15, cost: 50.00, deposit: 0.00, hoursAnticipation: 24, restrictOnDelinquency: true },
  { id: 'am-2', name: 'Sala de Juntas / Co-working', maxCapacity: 8, cost: 0.00, deposit: 0.00, hoursAnticipation: 2, restrictOnDelinquency: false },
  { id: 'am-3', name: 'Salón de Eventos Sociales', maxCapacity: 80, cost: 150.00, deposit: 2000.00, hoursAnticipation: 72, restrictOnDelinquency: true },
  { id: 'am-4', name: 'Asadores de Jardín', maxCapacity: 12, cost: 40.00, deposit: 0.00, hoursAnticipation: 12, restrictOnDelinquency: true }
];

export default function AdminReservas({
  bookings,
  onApproveBooking,
  onCancelBooking,
  payments
}: AdminReservasProps) {
  const [resSubTab, setResSubTab] = useState<'pending' | 'rules' | 'checklist'>('pending');
  
  // Rules State
  const [rules, setRules] = useState<AmenityRule[]>(INITIAL_RULES);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editDeposit, setEditDeposit] = useState('');
  
  // Checklist State (check-list digital)
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(
    bookings.length > 0 ? bookings[0].id : null
  );
  const [checklistData, setChecklistData] = useState({
    cleanliness: false,
    noDamage: false,
    keysReturned: false,
    inventoryMatches: false,
    comments: ''
  });

  // Calculate if the resident has outstanding balance
  // In the simulator, the resident Luis Martínez (id: 'res-402') has pending balance if any payment is 'pending'
  const isResidentDelinquent = (residentId: string) => {
    return payments.some(p => p.status === 'pending');
  };

  // Edit Rules Action
  const handleSaveRule = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          maxCapacity: editCapacity ? parseInt(editCapacity) : r.maxCapacity,
          cost: editCost ? parseFloat(editCost) : r.cost,
          deposit: editDeposit ? parseFloat(editDeposit) : r.deposit
        };
      }
      return r;
    }));
    setEditingRuleId(null);
    alert('Regla de reservación actualizada con éxito.');
  };

  // Checklist Submit
  const handleChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChecklistId) return;
    
    alert(`Lista de verificación guardada para la reservación ID: ${activeChecklistId}.\n` +
      `Limpieza: ${checklistData.cleanliness ? 'OK' : 'Pte'}\n` +
      `Sin daños: ${checklistData.noDamage ? 'OK' : 'Pte'}\n` +
      `Llaves: ${checklistData.keysReturned ? 'OK' : 'Pte'}\n` +
      `Observaciones: ${checklistData.comments || 'Ninguna'}`
    );

    // Reset fields
    setChecklistData({
      cleanliness: false,
      noDamage: false,
      keysReturned: false,
      inventoryMatches: false,
      comments: ''
    });
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Áreas Comunes</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Gestión de Reservas</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'pending', label: 'Reservaciones Activas', icon: CalendarRange },
          { id: 'rules', label: 'Configuración de Reglas', icon: Settings },
          { id: 'checklist', label: 'Check-list de Entrega', icon: ClipboardCheck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setResSubTab(tab.id as any)}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                resSubTab === tab.id 
                  ? 'bg-[#1A1A1A] border-[#1a1a1a] text-white' 
                  : 'bg-white border-[#E5E1DA] text-[#8C857B] hover:text-[#1A1A1A] hover:bg-[#F5F2ED]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE VIEW */}
      <div className="bg-white border border-[#E5E1DA] p-6">
        
        {/* SUBTAB: PENDING */}
        {resSubTab === 'pending' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
              Validación y Aprobación de Reservaciones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((book) => {
                const delinquent = isResidentDelinquent(book.residentId);
                return (
                  <div key={book.id} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] text-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono tracking-widest text-[#8C857B]">{book.date}</span>
                        <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold border ${
                          book.status === 'confirmed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : book.status === 'pending'
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-rose-200 bg-rose-50 text-rose-800'
                        }`}>
                          {book.status === 'confirmed' ? 'Confirmado' : book.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </span>
                      </div>

                      <h4 className="font-serif italic text-base text-[#1A1A1A] mt-0.5">{book.amenityName}</h4>
                      
                      <div className="space-y-1 text-[#5A554F]">
                        <p>Horario: <strong className="text-[#1A1A1A]">{book.timeSlot}</strong></p>
                        <p>Residente: <strong className="text-[#1A1A1A]">Luis Martínez (Torre B, 402)</strong></p>
                        <p>Invitados: <strong className="text-[#1A1A1A]">{book.guestCount} personas</strong></p>
                      </div>

                      {/* Delinquency Warning */}
                      {delinquent && book.status === 'pending' && (
                        <div className="mt-2 border border-rose-200 bg-rose-50 text-rose-800 p-2.5 flex items-start space-x-1.5 leading-relaxed text-[10px]">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" />
                          <p>
                            <strong className="font-bold">Alerta:</strong> El residente registra adeudos pendientes de mantenimiento. Se sugiere congelación de reserva.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E5E1DA] flex justify-between items-center">
                      <span className="font-mono font-bold text-[#1A1A1A]">${book.totalCost.toFixed(2)}</span>
                      <div className="flex gap-1.5">
                        {book.status === 'pending' && (
                          <button
                            onClick={() => {
                              onApproveBooking(book.id);
                              alert('Reservación aprobada y confirmada.');
                            }}
                            className="bg-[#1A1A1A] hover:bg-black text-white px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer"
                          >
                            Aprobar
                          </button>
                        )}
                        {book.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              onCancelBooking(book.id);
                              alert('Reservación cancelada.');
                            }}
                            className="bg-white text-rose-750 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer"
                          >
                            Rechazar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB: RULES */}
        {resSubTab === 'rules' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
              Configuración de Amenidades y Condiciones de Uso
            </h3>

            <div className="overflow-x-auto border border-[#E5E1DA]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                    <th className="p-3">Amenidad</th>
                    <th className="p-3">Aforo Máximo</th>
                    <th className="p-3">Costo (Por Hora)</th>
                    <th className="p-3">Depósito de Limpieza</th>
                    <th className="p-3">Anticipación Requerida</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1DA] bg-white">
                  {rules.map((rule) => {
                    const isEditing = editingRuleId === rule.id;
                    return (
                      <tr key={rule.id}>
                        <td className="p-3 font-bold">{rule.name}</td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-16 border border-[#E5E1DA] px-2 py-1 outline-none text-xs"
                              value={editCapacity}
                              onChange={e => setEditCapacity(e.target.value)}
                            />
                          ) : (
                            <span>{rule.maxCapacity} personas</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#1A1A1A]">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-16 border border-[#E5E1DA] px-2 py-1 outline-none text-xs"
                              value={editCost}
                              onChange={e => setEditCost(e.target.value)}
                            />
                          ) : (
                            <span>${rule.cost.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-16 border border-[#E5E1DA] px-2 py-1 outline-none text-xs"
                              value={editDeposit}
                              onChange={e => setEditDeposit(e.target.value)}
                            />
                          ) : (
                            <span>${rule.deposit.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-3 text-[#8C857B] font-mono">{rule.hoursAnticipation} horas</td>
                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveRule(rule.id)}
                                className="bg-[#1A1A1A] text-white px-2 py-1 text-[9px] uppercase font-bold tracking-widest hover:bg-black"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingRuleId(null)}
                                className="border border-[#E5E1DA] bg-white text-[#8C857B] px-2 py-1 text-[9px] uppercase font-bold tracking-widest"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                setEditCapacity(rule.maxCapacity.toString());
                                setEditCost(rule.cost.toString());
                                setEditDeposit(rule.deposit.toString());
                              }}
                              className="text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:underline"
                            >
                              Editar Reglas
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB: CHECKLIST */}
        {resSubTab === 'checklist' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checklist Selector */}
            <div className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#FDFCFB] divide-y divide-[#E5E1DA]">
              <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#8C857B] pb-2">Seleccione una Entrega</h3>
              
              {bookings.filter(b => b.status === 'confirmed').map(book => {
                const isActive = activeChecklistId === book.id;
                return (
                  <div
                    key={book.id}
                    onClick={() => setActiveChecklistId(book.id)}
                    className={`py-3.5 cursor-pointer text-xs transition ${
                      isActive ? 'bg-[#F5F2ED] font-bold px-2' : 'hover:bg-[#F5F2ED]/50 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span>{book.amenityName}</span>
                      <span className="font-mono text-[9px] text-[#8C857B]">{book.date}</span>
                    </div>
                    <span className="text-[9px] text-[#8C857B]">Luis Martínez (Torre B, 402)</span>
                  </div>
                );
              })}
            </div>

            {/* Checklist Form */}
            <div className="lg:col-span-2">
              {activeChecklistId ? (() => {
                const book = bookings.find(b => b.id === activeChecklistId);
                if (!book) return null;
                
                return (
                  <form onSubmit={handleChecklistSubmit} className="border border-[#E5E1DA] p-6 bg-[#FDFCFB] space-y-6">
                    <div className="border-b border-[#E5E1DA] pb-3">
                      <span className="text-[9px] font-mono text-[#8C857B]">Checklist de Devolución / Entrega</span>
                      <h4 className="text-lg font-serif italic text-[#1A1A1A] font-normal mt-0.5">{book.amenityName}</h4>
                      <p className="text-xs text-[#8C857B] mt-1">Uso agendado para Luis Martínez el {book.date} ({book.timeSlot})</p>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Check cleanliness */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="chk-clean"
                          checked={checklistData.cleanliness}
                          onChange={e => setChecklistData({ ...checklistData, cleanliness: e.target.checked })}
                          className="w-4 h-4 border-[#E5E1DA]"
                        />
                        <label htmlFor="chk-clean" className="text-xs text-[#5A554F] select-none">
                          El área se encuentra perfectamente limpia, sin residuos de basura.
                        </label>
                      </div>

                      {/* Check no damage */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="chk-dmg"
                          checked={checklistData.noDamage}
                          onChange={e => setChecklistData({ ...checklistData, noDamage: e.target.checked })}
                          className="w-4 h-4 border-[#E5E1DA]"
                        />
                        <label htmlFor="chk-dmg" className="text-xs text-[#5A554F] select-none">
                          Mobiliario sin daños físicos aparentes (mesas, sillas, luminarias íntegras).
                        </label>
                      </div>

                      {/* Check keys returned */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="chk-keys"
                          checked={checklistData.keysReturned}
                          onChange={e => setChecklistData({ ...checklistData, keysReturned: e.target.checked })}
                          className="w-4 h-4 border-[#E5E1DA]"
                        />
                        <label htmlFor="chk-keys" className="text-xs text-[#5A554F] select-none">
                          Llaves de acceso y candados devueltos a caseta de seguridad.
                        </label>
                      </div>

                      {/* Check inventory matches */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="chk-inv"
                          checked={checklistData.inventoryMatches}
                          onChange={e => setChecklistData({ ...checklistData, inventoryMatches: e.target.checked })}
                          className="w-4 h-4 border-[#E5E1DA]"
                        />
                        <label htmlFor="chk-inv" className="text-xs text-[#5A554F] select-none">
                          Inventario de insumos (cristalería, asadores, extintor) completo.
                        </label>
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Comentarios u Observaciones de Entrega</label>
                        <textarea
                          placeholder="Reporte detalles extras..."
                          className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-2 outline-none text-xs resize-none h-20"
                          value={checklistData.comments}
                          onChange={e => setChecklistData({ ...checklistData, comments: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 px-6 rounded-none transition"
                    >
                      Registrar Devolución Conforme
                    </button>
                  </form>
                );
              })() : (
                <div className="border border-dashed border-[#E5E1DA] bg-white py-12 text-center text-[#8C857B] text-xs">
                  Seleccione una reservación confirmada a la izquierda para iniciar el checklist digital.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

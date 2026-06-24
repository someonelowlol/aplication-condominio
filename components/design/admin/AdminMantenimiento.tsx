"use client";
import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Star, 
  Plus, 
  Calendar, 
  FileText,
  Trash2
} from 'lucide-react';
import { Incident } from '@/lib/types';

interface AdminMantenimientoProps {
  incidents: Incident[];
  onChangeIncidentStatus: (id: string, status: 'reported' | 'assigned' | 'in_progress' | 'resolved') => void;
  onAssignTechnician: (id: string, name: string) => void;
  onAddComment: (id: string, content: string) => void;
}

interface Vendor {
  id: string;
  name: string;
  specialty: string;
  contactName: string;
  phone: string;
  rating: number;
  contractExpiry: string;
}

const INITIAL_VENDORS: Vendor[] = [
  { id: 'v-1', name: 'Otis Elevadores México', specialty: 'Elevadores y Montacargas', contactName: 'Ing. Pedro Ruiz', phone: '55 4500 2200', rating: 4, contractExpiry: '2026-07-08' },
  { id: 'v-2', name: 'Brillamax Soluciones', specialty: 'Limpieza y Conserjería', contactName: 'Lic. Laura Olivares', phone: '55 9012 1144', rating: 5, contractExpiry: '2026-12-31' },
  { id: 'v-3', name: 'Seguritec Global', specialty: 'Seguridad y Cámaras', contactName: 'Comandante Silva', phone: '55 5890 0011', rating: 4, contractExpiry: '2027-02-15' }
];

const INITIAL_PREVENTIVES = [
  { id: 'p-1', equipment: 'Elevadores Torre A & B', type: 'Semestral', lastDone: '2025-12-15', nextDue: '2026-06-16', status: 'pending', vendor: 'Otis Elevadores' },
  { id: 'p-2', equipment: 'Bombas e Hidroneumáticos Sótano', type: 'Trimestral', lastDone: '2026-03-24', nextDue: '2026-06-25', status: 'pending', vendor: 'Mantenimiento HidroFix' },
  { id: 'p-3', equipment: 'Recarga Extintores Pasillos', type: 'Anual', lastDone: '2025-10-10', nextDue: '2026-10-10', status: 'scheduled', vendor: 'FireStop Corp' }
];

export default function AdminMantenimiento({
  incidents,
  onChangeIncidentStatus,
  onAssignTechnician,
  onAddComment
}: AdminMantenimientoProps) {
  const [mantoSubTab, setMantoSubTab] = useState<'helpdesk' | 'preventive' | 'vendors'>('helpdesk');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    incidents.length > 0 ? incidents[0].id : null
  );

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [vendorName, setVendorName] = useState('');
  const [vendorSpecialty, setVendorSpecialty] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorRating, setVendorRating] = useState(5);

  // Preventives state
  const [preventives, setPreventives] = useState(INITIAL_PREVENTIVES);
  const [prevEquipment, setPrevEquipment] = useState('');
  const [prevType, setPrevType] = useState('Trimestral');
  const [prevNextDate, setPrevNextDate] = useState('');
  const [prevVendor, setPrevVendor] = useState('');

  // Selected incident details
  const activeIncident = incidents.find(i => i.id === selectedIncidentId);

  // Action: Add Vendor
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vendorSpecialty) return;

    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      name: vendorName,
      specialty: vendorSpecialty,
      contactName: vendorContact || 'N/A',
      phone: vendorPhone || 'N/A',
      rating: vendorRating,
      contractExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().substring(0, 10)
    };

    setVendors(prev => [...prev, newVendor]);
    setVendorName('');
    setVendorSpecialty('');
    setVendorContact('');
    setVendorPhone('');
    alert('Proveedor registrado en el directorio.');
  };

  // Action: Add Preventive Maintenance Task
  const handleAddPreventive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prevEquipment || !prevNextDate) return;

    const newPrev = {
      id: `p-${Date.now()}`,
      equipment: prevEquipment,
      type: prevType,
      lastDone: new Date().toISOString().substring(0, 10),
      nextDue: prevNextDate,
      status: 'scheduled',
      vendor: prevVendor || 'Proveedor Asignado'
    };

    setPreventives(prev => [...prev, newPrev]);
    setPrevEquipment('');
    setPrevNextDate('');
    setPrevVendor('');
    alert('Inspección preventiva agendada.');
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Operaciones Físicas</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Mantenimiento y Soporte</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'helpdesk', label: 'Tickets (Help Desk)', icon: Wrench },
          { id: 'preventive', label: 'Manto. Preventivo', icon: Calendar },
          { id: 'vendors', label: 'Proveedores y Contratos', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMantoSubTab(tab.id as any)}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                mantoSubTab === tab.id 
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
        
        {/* SUBTAB: HELPDESK */}
        {mantoSubTab === 'helpdesk' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left list */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Reportes Activos ({incidents.filter(i => i.status !== 'resolved').length})
              </h3>

              <div className="space-y-3">
                {incidents.map(inc => {
                  const isSelected = selectedIncidentId === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`border p-4 cursor-pointer transition flex flex-col justify-between ${
                        isSelected ? 'bg-[#F5F2ED] border-[#1A1A1A]' : 'bg-white border-[#E5E1DA] hover:bg-[#F5F2ED]/50'
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
                      <div className="flex justify-between items-center text-[8px] uppercase tracking-wider font-mono font-bold mt-2">
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

            {/* Right detail view */}
            <div className="lg:col-span-2 space-y-6 border-l border-[#E5E1DA] pl-0 lg:pl-6">
              {activeIncident ? (
                <div className="space-y-6">
                  {/* Top info and status controllers */}
                  <div className="border-b border-[#E5E1DA] pb-4 flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#8C857B]">Reporte ID: {activeIncident.id}</span>
                      <h3 className="text-xl font-serif italic text-[#1A1A1A] leading-tight font-normal mt-0.5">{activeIncident.title}</h3>
                      <p className="text-[11px] text-[#8C857B] mt-1">Ubicación: <strong className="text-[#1A1A1A] font-medium">{activeIncident.location}</strong></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onChangeIncidentStatus(activeIncident.id, 'in_progress');
                          alert('Estado cambiado a "En Proceso".');
                        }}
                        className="bg-white border border-[#E5E1DA] hover:bg-[#F5F2ED] text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 text-[#1A1A1A] transition"
                      >
                        En Proceso
                      </button>
                      <button
                        onClick={() => {
                          onChangeIncidentStatus(activeIncident.id, 'resolved');
                          alert('Estado cambiado a "Resuelto".');
                        }}
                        className="bg-[#1A1A1A] text-white hover:bg-black text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 transition"
                      >
                        Resolver
                      </button>
                    </div>
                  </div>

                  {/* Incident Description */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-bold tracking-widest uppercase text-[#1A1A1A]">Reporte del Vecino</h4>
                    <p className="text-xs text-[#5A554F] p-4 bg-[#F5F2ED]/30 border border-[#E5E1DA] leading-relaxed">
                      {activeIncident.description}
                    </p>
                  </div>

                  {/* Assign Technician Form */}
                  <div className="p-4 bg-[#F5F2ED] border border-[#E5E1DA] space-y-3">
                    <h4 className="text-[9px] font-bold tracking-widest uppercase text-[#1A1A1A]">Asignación de Personal Técnico</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="text-[#8C857B]">
                        Técnico Asignado: <strong className="text-[#1A1A1A]">{activeIncident.technicianName || 'Ninguno'}</strong>
                      </div>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            onAssignTechnician(activeIncident.id, e.target.value);
                            alert(`Se ha asignado a ${e.target.value} para atender este ticket.`);
                          }
                        }}
                        className="bg-white border border-[#E5E1DA] px-2.5 py-1.5 outline-none font-mono text-[11px] focus:border-[#1A1A1A]"
                        defaultValue={activeIncident.technicianName || ''}
                      >
                        <option value="">-- Cambiar Técnico --</option>
                        <option value="Ing. Carlos Gutiérrez (Plomería)">Ing. Carlos Gutiérrez (Plomería)</option>
                        <option value="Sofía Alatorre (Electricidad)">Sofía Alatorre (Electricidad)</option>
                        <option value="Ing. Pedro Ruiz (Otis Elevadores)">Ing. Pedro Ruiz (Otis Elevadores)</option>
                        <option value="Personal de Seguridad Nocturno">Personal de Seguridad Nocturno</option>
                      </select>
                    </div>
                  </div>

                  {/* Comments Thread */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                      Bitácora de Interacciones
                    </h4>

                    <div className="border border-[#E5E1DA] p-4 bg-[#FDFCFB] space-y-3 max-h-48 overflow-y-auto">
                      {activeIncident.comments.map(comm => {
                        const isSelf = comm.authorRole === 'admin';
                        return (
                          <div key={comm.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-md p-3 border text-xs leading-relaxed ${
                              isSelf 
                                ? 'bg-[#1A1A1A] border-black text-white' 
                                : 'bg-white border-[#E5E1DA] text-[#1A1A1A]'
                            }`}>
                              <div className="flex justify-between items-baseline gap-4 mb-1">
                                <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">
                                  {comm.authorName} ({comm.authorRole.toUpperCase()})
                                </span>
                                <span className="text-[7px] font-mono opacity-50">{comm.createdAt}</span>
                              </div>
                              <p>{comm.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Reply Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('replyText') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          onAddComment(activeIncident.id, input.value.trim());
                          input.value = '';
                          alert('Respuesta registrada en la bitácora del ticket.');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        name="replyText"
                        type="text"
                        className="flex-1 bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A]"
                        placeholder="Escriba mensaje para el residente y equipo técnico..."
                        required
                      />
                      <button
                        type="submit"
                        className="bg-[#1A1A1A] text-white hover:bg-black px-5 py-2 text-[10px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer"
                      >
                        Enviar
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#E5E1DA] bg-white py-12 text-center text-[#8C857B] text-xs">
                  Seleccione un ticket para ver el seguimiento contable/técnico.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB: PREVENTIVE */}
        {mantoSubTab === 'preventive' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create preventive form */}
            <form onSubmit={handleAddPreventive} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Agendar Inspección
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Equipo / Área Común</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Elevador principal Torre A"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={prevEquipment}
                    onChange={e => setPrevEquipment(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Periodicidad</label>
                    <select
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={prevType}
                      onChange={e => setPrevType(e.target.value)}
                    >
                      <option value="Semanal">Semanal</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Próxima Fecha</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={prevNextDate}
                      onChange={e => setPrevNextDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Proveedor Contratado</label>
                  <input
                    type="text"
                    placeholder="Ej: Otis Elevadores"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={prevVendor}
                    onChange={e => setPrevVendor(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Agendar Mantenimiento
                </button>
              </div>
            </form>

            {/* List of Scheduled tasks */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Calendario de Mantenimiento Preventivo
              </h3>

              <div className="overflow-x-auto border border-[#E5E1DA]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                      <th className="p-3">Equipo</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Próximo Venc.</th>
                      <th className="p-3">Proveedor</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DA]">
                    {preventives.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="p-3 font-bold">{item.equipment}</td>
                        <td className="p-3 font-mono text-[#8C857B]">{item.type}</td>
                        <td className="p-3 font-mono font-bold text-[#1A1A1A]">{item.nextDue}</td>
                        <td className="p-3 text-[#8C857B]">{item.vendor}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold border ${
                            item.status === 'pending'
                              ? 'border-amber-200 bg-amber-50 text-amber-800 animate-pulse'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.status === 'pending' ? 'Urgente' : 'Programado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: VENDORS */}
        {mantoSubTab === 'vendors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create vendor form */}
            <form onSubmit={handleAddVendor} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Registrar Proveedor
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pinturas Osel"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Especialidad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pintura e Impermeabilización"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={vendorSpecialty}
                    onChange={e => setVendorSpecialty(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Contacto</label>
                    <input
                      type="text"
                      placeholder="Ej: Ing. Martínez"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={vendorContact}
                      onChange={e => setVendorContact(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="Ej: 55902200"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={vendorPhone}
                      onChange={e => setVendorPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Evaluación de Desempeño</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={vendorRating}
                    onChange={e => setVendorRating(parseInt(e.target.value))}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                    <option value="4">⭐⭐⭐⭐☆ (Bueno)</option>
                    <option value="3">⭐⭐⭐☆☆ (Aceptable)</option>
                    <option value="2">⭐⭐☆☆☆ (Deficiente)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Registrar Contratista
                </button>
              </div>
            </form>

            {/* Vendors directory */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Directorio de Contratistas Autorizados
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vendors.map(v => (
                  <div key={v.id} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] text-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider font-mono text-[#8C857B]">{v.specialty}</span>
                      <h4 className="font-serif italic text-base text-[#1A1A1A] leading-tight font-normal">{v.name}</h4>
                      <p className="text-[#8C857B]">Contacto: <strong className="text-[#1A1A1A]">{v.contactName}</strong></p>
                      <p className="text-[#8C857B]">Tel: <strong className="text-[#1A1A1A]">{v.phone}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E1DA] flex justify-between items-center text-[10px] text-[#8C857B]">
                      <span>Contrato vence: <span className="font-bold text-[#1A1A1A]">{v.contractExpiry}</span></span>
                      <span className="text-amber-600 font-bold">
                        {Array.from({ length: v.rating }).map((_, idx) => '⭐').join('')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { 
  Shield, 
  QrCode, 
  Package, 
  ClipboardList, 
  Plus, 
  Check, 
  Search, 
  Info,
  Smartphone,
  Eye
} from 'lucide-react';

interface Visitor {
  id: string;
  name: string;
  idNumber: string;
  unit: string;
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'inside' | 'exited';
}

interface GuardLog {
  id: string;
  guardName: string;
  details: string;
  timestamp: string;
  category: 'round' | 'incident' | 'shift_change';
}

interface Parcel {
  id: string;
  carrier: string;
  trackingNumber: string;
  residentName: string;
  unit: string;
  status: 'received' | 'delivered';
  receivedAt: string;
  deliveredAt?: string;
}

const INITIAL_VISITORS: Visitor[] = [
  { id: 'vis-1', name: 'Pedro Domínguez (Repartidor Uber)', idNumber: 'INE-992211', unit: 'Torre B - 402', plate: 'MXN-45-88', entryTime: '2026-06-24 10:30', status: 'inside' },
  { id: 'vis-2', name: 'Laura Gómez (Visita Familiar)', idNumber: 'INE-112233', unit: 'Torre A - 101', plate: 'Sin auto', entryTime: '2026-06-24 08:00', exitTime: '2026-06-24 10:15', status: 'exited' },
];

const INITIAL_GUARD_LOGS: GuardLog[] = [
  { id: 'gl-1', guardName: 'Oficial Samuel Torres', details: 'Ronda nocturna 02:00 AM - Elevador Torre B operando sin novedad. Luces de estacionamiento encendidas.', timestamp: '2026-06-24 02:15', category: 'round' },
  { id: 'gl-2', guardName: 'Oficial Samuel Torres', details: 'Entrega de turno a Oficial Martínez. Reporte de visitas cerrado sin novedades extraordinarias.', timestamp: '2026-06-24 07:00', category: 'shift_change' }
];

const INITIAL_PARCELS: Parcel[] = [
  { id: 'par-1', carrier: 'Amazon Logistics', trackingNumber: 'AMZ-8899-22-MX', residentName: 'Luis Martínez', unit: 'Torre B - 402', status: 'received', receivedAt: '2026-06-24 09:45' },
  { id: 'par-2', carrier: 'DHL Express', trackingNumber: 'DHL-1122-334', residentName: 'Martha Gómez', unit: 'Torre A - 101', status: 'delivered', receivedAt: '2026-06-23 14:15', deliveredAt: '2026-06-23 18:30' }
];

export default function AdminSeguridad() {
  const [segSubTab, setSegSubTab] = useState<'visitors' | 'guards' | 'parcels'>('visitors');
  
  // Visitors state
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [visitorName, setVisitorName] = useState('');
  const [visitorIdCard, setVisitorIdCard] = useState('');
  const [visitorUnit, setVisitorUnit] = useState('Torre B - 402');
  const [visitorPlate, setVisitorPlate] = useState('');

  // Guard logs state
  const [guardLogs, setGuardLogs] = useState<GuardLog[]>(INITIAL_GUARD_LOGS);
  const [guardName, setGuardName] = useState('Oficial Martínez');
  const [guardDetails, setGuardDetails] = useState('');
  const [guardCategory, setGuardCategory] = useState<'round' | 'incident' | 'shift_change'>('round');

  // Parcels state
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [parcelCarrier, setParcelCarrier] = useState('Amazon');
  const [parcelTracking, setParcelTracking] = useState('');
  const [parcelResident, setParcelResident] = useState('Luis Martínez');
  const [parcelUnit, setParcelUnit] = useState('Torre B - 402');

  // QR invitation simulator state
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [qrResident, setQrResident] = useState('Luis Martínez');
  const [qrVisitor, setQrVisitor] = useState('Mariana Solís');

  // ACTION: Register Visitor Entry
  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName) return;

    const newVisitor: Visitor = {
      id: `vis-${Date.now()}`,
      name: visitorName,
      idNumber: visitorIdCard || 'INE-NoIdentificado',
      unit: visitorUnit,
      plate: visitorPlate || 'Sin auto',
      entryTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'inside'
    };

    setVisitors(prev => [newVisitor, ...prev]);
    setVisitorName('');
    setVisitorIdCard('');
    setVisitorPlate('');
    alert('Acceso registrado con éxito. Visitante ingresado al condominio.');
  };

  // ACTION: Register Visitor Exit
  const handleRegisterExit = (id: string) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'exited',
          exitTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return v;
    }));
    alert('Salida registrada con éxito.');
  };

  // ACTION: Add Guard Log
  const handleAddGuardLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardDetails) return;

    const newLog: GuardLog = {
      id: `gl-${Date.now()}`,
      guardName,
      details: guardDetails,
      category: guardCategory,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setGuardLogs(prev => [newLog, ...prev]);
    setGuardDetails('');
    alert('Entrada agregada a la bitácora de guardias.');
  };

  // ACTION: Register incoming Parcel & Notify
  const handleRegisterParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelTracking || !parcelResident) return;

    const newParcel: Parcel = {
      id: `par-${Date.now()}`,
      carrier: parcelCarrier,
      trackingNumber: parcelTracking,
      residentName: parcelResident,
      unit: parcelUnit,
      status: 'received',
      receivedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setParcels(prev => [newParcel, ...prev]);
    setParcelTracking('');
    
    // Simulate SMS notification
    alert(`[Simulación de Alerta Push/SMS]\n` +
      `Para: ${parcelResident} (${parcelUnit})\n` +
      `Mensaje: "Hola, ${parcelResident}. Paquetería ResidenSmart informa que recibimos un paquete de ${parcelCarrier} (Guía: ${parcelTracking}) en recepción. Pasa a recogerlo con tu firma."`
    );
  };

  // ACTION: Mark Parcel Delivered
  const handleDeliverParcel = (id: string) => {
    setParcels(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'delivered',
          deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return p;
    }));
    alert('Paquete entregado al residente. Se registró firma digital de recibido.');
  };

  // ACTION: Simulate QR Code Invitation
  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    const mockToken = `QR-INV-${Date.now().toString().substring(8, 12)}-${qrVisitor.substring(0, 3).toUpperCase()}`;
    setGeneratedQr(mockToken);
    alert(`Código de acceso QR generado para ${qrVisitor}.`);
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Control de Accesos</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Caseta de Seguridad y Control</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'visitors', label: 'Registro de Visitas', icon: Shield },
          { id: 'guards', label: 'Bitácora de Rondas', icon: ClipboardList },
          { id: 'parcels', label: 'Control de Paquetes', icon: Package }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSegSubTab(tab.id as any)}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                segSubTab === tab.id 
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
        
        {/* SUBTAB: VISITORS */}
        {segSubTab === 'visitors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Entry logs form */}
            <form onSubmit={handleRegisterVisitor} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Registrar Ingreso Vehicular/Peatonal
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Nombre del Visitante</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez (Mantenimiento)"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Identificación</label>
                    <input
                      type="text"
                      placeholder="Ej: INE-4455"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={visitorIdCard}
                      onChange={e => setVisitorIdCard(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Placas Auto</label>
                    <input
                      type="text"
                      placeholder="Ej: FFF-55-66"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={visitorPlate}
                      onChange={e => setVisitorPlate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Departamento Destino</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={visitorUnit}
                    onChange={e => setVisitorUnit(e.target.value)}
                  >
                    <option value="Torre A - 101">Torre A - 101 (Martha Gómez)</option>
                    <option value="Torre B - 402">Torre B - 402 (Luis Martínez)</option>
                    <option value="Torre B - 205">Torre B - 205 (Carlos Ruiz)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Registrar Entrada
                </button>
              </div>
            </form>

            {/* List of active visitors and QR Simulator */}
            <div className="lg:col-span-2 space-y-8">
              {/* QR Simulator */}
              <div className="border border-[#E5E1DA] p-4 bg-[#FDFCFB] space-y-4">
                <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-1.5">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Generador de Códigos QR para Invitados</h4>
                  <QrCode className="w-4 h-4 text-[#8C857B]" />
                </div>
                
                <form onSubmit={handleGenerateQR} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Residente Anfitrión</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={qrResident}
                      onChange={e => setQrResident(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Nombre Invitado</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={qrVisitor}
                      onChange={e => setQrVisitor(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] hover:bg-black text-white py-2 text-[9px] font-bold tracking-widest uppercase rounded-none transition"
                  >
                    Generar QR de Acceso
                  </button>
                </form>

                {generatedQr && (
                  <div className="p-4 bg-[#F5F2ED] border border-[#E5E1DA] flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white border border-[#CEC7BC] flex items-center justify-center text-[#1A1A1A] font-mono text-[9px] font-bold select-all leading-none text-center">
                      [QR CODE IMAGE]
                    </div>
                    <div className="text-xs space-y-1">
                      <strong className="text-[#1A1A1A]">Código QR Activo</strong>
                      <p className="text-[#8C857B]">Token: <span className="font-mono text-[10px] font-bold text-[#1A1A1A]">{generatedQr}</span></p>
                      <p className="text-[10px] text-[#8C857B]">Permite 1 ingreso. Vence en 24 hrs.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Visitors logs */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Bitácora de Visitantes Activos ({visitors.filter(v => v.status === 'inside').length})</h4>
                <div className="overflow-x-auto border border-[#E5E1DA]">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Destino</th>
                        <th className="p-3">Placas Auto</th>
                        <th className="p-3">Ingreso</th>
                        <th className="p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E1DA] bg-white">
                      {visitors.map((v) => (
                        <tr key={v.id}>
                          <td className="p-3 font-bold">{v.name}</td>
                          <td className="p-3 font-mono text-[10px]">{v.unit}</td>
                          <td className="p-3 font-mono">{v.plate}</td>
                          <td className="p-3 text-[#8C857B]">{v.entryTime}</td>
                          <td className="p-3">
                            {v.status === 'inside' ? (
                              <button
                                onClick={() => handleRegisterExit(v.id)}
                                className="bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:bg-[#F5F2ED] px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase transition rounded-none"
                              >
                                Registrar Salida
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">Salió {v.exitTime?.split(' ')[1]}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: GUARDS */}
        {segSubTab === 'guards' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create guard log form */}
            <form onSubmit={handleAddGuardLog} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Registrar Bitácora de Guardia
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Nombre Oficial de Turno</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={guardName}
                    onChange={e => setGuardName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Categoría</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={guardCategory}
                    onChange={e => setGuardCategory(e.target.value as any)}
                  >
                    <option value="round">Ronda de Vigilancia</option>
                    <option value="incident">Incidente Reportado</option>
                    <option value="shift_change">Entrega de Guardia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Detalles del Reporte</label>
                  <textarea
                    required
                    placeholder="Detalles sobre rondas, luminarias fundidas, vehículos sospechosos, etc."
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none h-28 resize-none"
                    value={guardDetails}
                    onChange={e => setGuardDetails(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Registrar en Bitácora
                </button>
              </div>
            </form>

            {/* List of guard logs */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Historial de Reportes de Seguridad
              </h3>

              <div className="space-y-3">
                {guardLogs.map((log) => (
                  <div key={log.id} className="border border-[#E5E1DA] p-4 bg-[#FDFCFB] text-xs space-y-2">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-[#1A1A1A]">{log.guardName}</strong>
                      <span className="text-[9px] font-mono text-[#8C857B]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#5A554F] leading-relaxed">{log.details}</p>
                    <span className="text-[8px] uppercase tracking-wider border border-[#E5E1DA] bg-[#F5F2ED] px-1.5 py-0.5 inline-block font-mono">
                      {log.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: PARCELS */}
        {segSubTab === 'parcels' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create parcel log form */}
            <form onSubmit={handleRegisterParcel} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Registrar Paquete Recibido
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Paquetería / Carrier</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={parcelCarrier}
                    onChange={e => setParcelCarrier(e.target.value)}
                  >
                    <option value="Amazon Logistics">Amazon Logistics</option>
                    <option value="Mercado Libre Flecha">Mercado Libre Flecha</option>
                    <option value="DHL Express">DHL Express</option>
                    <option value="FedEx México">FedEx México</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Número de Guía / Tracking</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: AMZ-992211"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={parcelTracking}
                    onChange={e => setParcelTracking(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Residente Destinatario</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={parcelResident}
                      onChange={e => setParcelResident(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Departamento</label>
                    <select
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={parcelUnit}
                      onChange={e => setParcelUnit(e.target.value)}
                    >
                      <option value="Torre B - 402">Torre B - 402</option>
                      <option value="Torre A - 101">Torre A - 101</option>
                      <option value="Torre B - 205">Torre B - 205</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Registrar Paquete y Notificar
                </button>
              </div>
            </form>

            {/* List of active packages */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Paquetes en Recepción
              </h3>

              <div className="overflow-x-auto border border-[#E5E1DA]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                      <th className="p-3">Mensajería</th>
                      <th className="p-3">Destinatario</th>
                      <th className="p-3">Guía</th>
                      <th className="p-3">Recibido</th>
                      <th className="p-3">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DA] bg-white">
                    {parcels.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-bold">{p.carrier}</td>
                        <td className="p-3">{p.residentName} ({p.unit})</td>
                        <td className="p-3 font-mono text-[#8C857B]">{p.trackingNumber}</td>
                        <td className="p-3 font-mono text-[10px] text-[#8C857B]">{p.receivedAt}</td>
                        <td className="p-3">
                          {p.status === 'received' ? (
                            <button
                              onClick={() => handleDeliverParcel(p.id)}
                              className="bg-[#1A1A1A] text-white hover:bg-black px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase rounded-none transition cursor-pointer"
                            >
                              Entregar Paquete
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] uppercase">
                              Entregado ({p.deliveredAt?.split(' ')[1]})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

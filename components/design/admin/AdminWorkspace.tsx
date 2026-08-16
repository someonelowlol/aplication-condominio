"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Layers, 
  CheckSquare, 
  Square,
  Activity,
  Copy,
  Check
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Admin modules
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminCrm from './AdminCrm';
import AdminFinanzas from './AdminFinanzas';
import AdminComunidad from './AdminComunidad';
import AdminMantenimiento from './AdminMantenimiento';
import AdminReservas from './AdminReservas';
import AdminSeguridad from './AdminSeguridad';
import AdminLegal from './AdminLegal';
import AdminConfig from './AdminConfig';
import AdminTecnologia from './AdminTecnologia';

import { Payment, Booking, Incident, Announcement } from '@/lib/types';

interface AdminWorkspaceProps {
  adminTab: string;
  onAdminTabChange: (tab: string) => void;
  payments: Payment[];
  bookings: Booking[];
  incidents: Incident[];
  announcements: Announcement[];
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
  onAddCustomPayment: (pay: Payment) => void;
  onApproveBooking: (id: string) => void;
  onCancelBooking: (id: string) => void;
  onChangeIncidentStatus: (id: string, status: 'reported' | 'assigned' | 'in_progress' | 'resolved') => void;
  onAssignTechnician: (id: string, name: string) => void;
  onAddComment: (id: string, content: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  condoId: string | null;
  onCondoCreated: (id: string) => void;
}

export default function AdminWorkspace({
  adminTab,
  onAdminTabChange,
  payments,
  bookings,
  incidents,
  announcements,
  onApprovePayment,
  onRejectPayment,
  onAddCustomPayment,
  onApproveBooking,
  onCancelBooking,
  onChangeIncidentStatus,
  onAssignTechnician,
  onAddComment,
  onAddAnnouncement,
  condoId,
  onCondoCreated
}: AdminWorkspaceProps) {
  const supabase = createClient();
  const [hasCondo, setHasCondo] = useState<boolean | null>(null);
  const [checkingCondo, setCheckingCondo] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // States to hold newly created condo details for the step 4 success screen
  const [createdCondoId, setCreatedCondoId] = useState<string | null>(null);
  const [createdCondoNit, setCreatedCondoNit] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedNit, setCopiedNit] = useState(false);

  // Setup Wizard State
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [condoName, setCondoName] = useState('');
  const [condoNit, setCondoNit] = useState('');
  const [condoAddress, setCondoAddress] = useState('');
  const [condoLogo, setCondoLogo] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop&q=80');

  // Step 2: Physical Structure
  const [towersCount, setTowersCount] = useState(2);
  const [floorsCount, setFloorsCount] = useState(5);
  const [unitsPerFloor, setUnitsPerFloor] = useState(4);
  const [baseCoefficient, setBaseCoefficient] = useState(0.01);
  const [initialBalance, setInitialBalance] = useState(0);

  // Step 3: Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Alberca de la Terraza',
    'Gimnasio Cardiovascular',
    'Salón de Eventos Sociales'
  ]);

  const amenitiesList = [
    'Alberca de la Terraza',
    'Gimnasio Cardiovascular',
    'Salón de Eventos Sociales',
    'Cancha de Pádel',
    'Asadores al Aire Libre',
    'Área de Co-working',
    'Sala de Cine Privada'
  ];

  // Check if current logged admin already has a condominium
  useEffect(() => {
    async function checkCondoStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data, error } = await supabase
            .from('condominiums')
            .select('id, name, nit, address, logo_url')
            .eq('created_by', user.id);

          if (data && data.length > 0) {
            setHasCondo(true);
            setCondoName(data[0].name || '');
            setCondoNit(data[0].nit || '');
            setCondoAddress(data[0].address || '');
            if (data[0].logo_url) {
              setCondoLogo(data[0].logo_url);
            }
            onCondoCreated(data[0].id);
          } else {
            setHasCondo(false);
          }
        } else {
          setHasCondo(false);
        }
      } catch (err) {
        console.error(err);
        setHasCondo(false);
      } finally {
        setCheckingCondo(false);
      }
    }
    checkCondoStatus();
  }, []);

  const handleToggleAmenity = (name: string) => {
    setSelectedAmenities(prev => 
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const handleFinishSetup = async () => {
    if (!userId) return;
    setIsSubmitting(true);

    try {
      // 0. Ensure profile exists in profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador',
          role: 'admin'
        }, { onConflict: 'id' });
      }

      // 1. Insert or reuse Condominium
      let condoId: string;

      const { data: existingCondo } = await supabase
        .from('condominiums')
        .select('id')
        .eq('created_by', userId)
        .limit(1);

      if (existingCondo && existingCondo.length > 0) {
        condoId = existingCondo[0].id;
      } else {
        const cleanNit = condoNit?.trim() || `NIT-${Date.now()}`;
        const { data: condoData, error: condoErr } = await supabase
          .from('condominiums')
          .insert({
            name: condoName || 'Condominio Residencial',
            nit: cleanNit,
            address: condoAddress || 'Dirección General',
            logo_url: condoLogo,
            created_by: userId
          })
          .select('id')
          .single();

        if (condoErr) {
          if (condoErr.code === '23505') {
            const fallbackNit = `${cleanNit}-${Math.floor(Math.random() * 10000)}`;
            const { data: condoData2, error: condoErr2 } = await supabase
              .from('condominiums')
              .insert({
                name: condoName || 'Condominio Residencial',
                nit: fallbackNit,
                address: condoAddress || 'Dirección General',
                logo_url: condoLogo,
                created_by: userId
              })
              .select('id')
              .single();

            if (condoErr2 || !condoData2) throw condoErr2;
            condoId = condoData2.id;
          } else {
            throw condoErr;
          }
        } else {
          condoId = condoData.id;
        }
      }

      // 2. Insert or reuse Blocks/Towers
      let blocksData: { id: string; name: string }[] = [];
      const { data: existingBlocks } = await supabase
        .from('blocks')
        .select('id, name')
        .eq('condominium_id', condoId);

      if (existingBlocks && existingBlocks.length > 0) {
        blocksData = existingBlocks;
      } else {
        const blocksToInsert = Array.from({ length: towersCount }, (_, i) => ({
          condominium_id: condoId,
          name: `Torre ${String.fromCharCode(65 + i)}`
        }));

        const { data: insertedBlocks, error: blocksErr } = await supabase
          .from('blocks')
          .insert(blocksToInsert)
          .select('id, name');

        if (blocksErr || !insertedBlocks) throw blocksErr;
        blocksData = insertedBlocks;
      }

      // 3. Generate Units array in memory
      const blockIds = blocksData.map(b => b.id);
      const { data: existingUnits } = await supabase
        .from('units')
        .select('id')
        .in('block_id', blockIds)
        .limit(1);

      if (!existingUnits || existingUnits.length === 0) {
        const unitsToInsert = [];
        for (const block of blocksData) {
          for (let floor = 1; floor <= floorsCount; floor++) {
            for (let unitIdx = 1; unitIdx <= unitsPerFloor; unitIdx++) {
              const unitNumber = `${floor}${unitIdx.toString().padStart(2, '0')}`;
              unitsToInsert.push({
                block_id: block.id,
                unit_number: unitNumber,
                floor: floor,
                coefficient: baseCoefficient,
                balance: initialBalance
              });
            }
          }
        }

        const { error: unitsErr } = await supabase
          .from('units')
          .insert(unitsToInsert);

        if (unitsErr) throw unitsErr;
      }

      // 4. Insert Selected Amenities
      const { data: existingAmenities } = await supabase
        .from('amenities')
        .select('id')
        .limit(1);

      if ((!existingAmenities || existingAmenities.length === 0) && selectedAmenities.length > 0) {
        const amenitiesToInsert = selectedAmenities.map(name => ({
          name,
          capacity: 15,
          rules: 'Uso exclusivo bajo reserva previa en el portal.'
        }));

        const { error: amenErr } = await supabase
          .from('amenities')
          .insert(amenitiesToInsert);
        if (amenErr) throw amenErr;
      }

      // Update local profile with condominium_id
      await supabase
        .from('profiles')
        .update({ condominium_id: condoId })
        .eq('id', userId);

      // Save details to display on Step 4 success screen
      setCreatedCondoId(condoId);
      setCreatedCondoNit(condoNit || `NIT-${Date.now()}`);
      setStep(4);
      onCondoCreated(condoId);
    } catch (err: any) {
      console.error(err);
      alert(`Error creando copropiedad: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingCondo) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#8C857B]" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#8C857B]">Comprobando Copropiedad...</span>
      </div>
    );
  }

  // If new admin has no condo, force the Setup Wizard
  if (hasCondo === false) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E5E1DA] p-8 md:p-10 text-[#1A1A1A] text-left">
        {/* Wizard Header */}
        {step < 4 ? (
          <>
            <div className="border-b border-[#E5E1DA] pb-6 mb-8 flex justify-between items-center">
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-[#F5F2ED] text-[#8C857B] px-3 py-1 text-[8px] font-bold tracking-widest uppercase border border-[#E5E1DA]/50 mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Configuración de Copropiedad</span>
                </div>
                <h1 className="text-2xl font-serif italic font-normal text-[#1A1A1A]">Paso {step} de 3</h1>
              </div>
              <Building2 className="w-8 h-8 text-[#8C857B]/40" />
            </div>

            {/* Step Indicators */}
            <div className="flex gap-2 mb-8">
              <div className={`h-1 flex-1 transition-colors ${step >= 1 ? 'bg-brand-blue' : 'bg-[#E5E1DA]'}`}></div>
              <div className={`h-1 flex-1 transition-colors ${step >= 2 ? 'bg-brand-blue' : 'bg-[#E5E1DA]'}`}></div>
              <div className={`h-1 flex-1 transition-colors ${step >= 3 ? 'bg-brand-blue' : 'bg-[#E5E1DA]'}`}></div>
            </div>
          </>
        ) : null}

        {/* STEP 1: CONDOS BASIC INFO */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">1. Identidad de la Copropiedad</h2>
            <p className="text-[11px] text-[#8C857B] leading-relaxed">Ingrese los datos fundamentales de su condominio para personalizar el portal.</p>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">Nombre Comercial del Conjunto</label>
                <input
                  type="text"
                  value={condoName}
                  onChange={(e) => setCondoName(e.target.value)}
                  placeholder="Ej: Residencial Arcos del Bosque"
                  className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none transition bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">NIT / RFC (ID Fiscal)</label>
                  <input
                    type="text"
                    value={condoNit}
                    onChange={(e) => setCondoNit(e.target.value)}
                    placeholder="Ej: 900.123.456-7"
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none transition bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">URL Logo del Conjunto</label>
                  <input
                    type="text"
                    value={condoLogo}
                    onChange={(e) => setCondoLogo(e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none transition bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">Dirección Física</label>
                <textarea
                  value={condoAddress}
                  onChange={(e) => setCondoAddress(e.target.value)}
                  placeholder="Ej: Av. Lomas Providencia #450, Guadalajara, Jal."
                  rows={2}
                  className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none transition bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A] resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E1DA] flex justify-end">
              <button
                onClick={() => {
                  if (!condoName || !condoNit) {
                    alert('Por favor complete el nombre y el NIT/RFC.');
                    return;
                  }
                  setStep(2);
                }}
                className="bg-[#1A1A1A] text-white hover:bg-black text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition flex items-center gap-2 rounded-none"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MATRIX STRUCTURE GENERATOR */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">2. Generador de Estructura Física</h2>
            <p className="text-[11px] text-[#8C857B] leading-relaxed">Defina la cantidad de torres, pisos y unidades para la base de datos estructural.</p>
            
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">N° de Torres</label>
                  <input
                    type="number"
                    value={towersCount}
                    min={1}
                    onChange={(e) => setTowersCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">Pisos por Torre</label>
                  <input
                    type="number"
                    value={floorsCount}
                    min={1}
                    onChange={(e) => setFloorsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">Unidades por Piso</label>
                  <input
                    type="number"
                    value={unitsPerFloor}
                    min={1}
                    onChange={(e) => setUnitsPerFloor(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">Coeficiente Base</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={baseCoefficient}
                    onChange={(e) => setBaseCoefficient(parseFloat(e.target.value) || 0.01)}
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-widest text-[#8C857B]">Saldo Inicial Base ($)</label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-none text-xs text-[#1A1A1A] outline-none bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#F5F2ED] border border-[#E5E1DA] text-xs space-y-1">
                <span className="font-bold block text-[10px] uppercase text-[#1A1A1A]">Resumen Estructural</span>
                <span className="text-[#8C857B] block">Se crearán automáticamente {towersCount} bloques y {towersCount * floorsCount * unitsPerFloor} apartamentos en Supabase.</span>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E1DA] flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-white border border-[#E5E1DA] hover:bg-[#F5F2ED] text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition rounded-none"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-[#1A1A1A] text-white hover:bg-black text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition flex items-center gap-2 rounded-none"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AMENITIES SELECTION */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">3. Configuración de Áreas Comunes</h2>
            <p className="text-[11px] text-[#8C857B] leading-relaxed">Seleccione los espacios que los residentes podrán reservar en tiempo real.</p>
            
            <div className="space-y-3 pt-2">
              {amenitiesList.map((name) => {
                const isSelected = selectedAmenities.includes(name);
                return (
                  <div
                    key={name}
                    onClick={() => handleToggleAmenity(name)}
                    className="flex items-center gap-3 p-3.5 border cursor-pointer hover:bg-[#F5F2ED]/50 transition bg-white"
                    style={{ borderColor: isSelected ? '#1A1A1A' : '#E5E1DA' }}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-blue" />
                    ) : (
                      <Square className="w-4 h-4 text-[#CEC7BC]" />
                    )}
                    <span className="text-xs font-medium text-[#1A1A1A]">{name}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-[#E5E1DA] flex justify-between">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="bg-white border border-[#E5E1DA] hover:bg-[#F5F2ED] text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition rounded-none"
              >
                Atrás
              </button>
              <button
                onClick={handleFinishSetup}
                disabled={isSubmitting}
                className="bg-[#0D305F] text-white hover:bg-[#0D305F]/90 text-[10px] font-bold tracking-widest uppercase px-8 py-3 transition flex items-center gap-2 rounded-none"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Procesando Estructura...</>
                ) : (
                  <>
                    <span>Finalizar Configuración</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS & CODE DISPLAY */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-fade-in py-4">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center rounded-none">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-serif italic font-normal text-[#1A1A1A]">¡Configuración Exitosa!</h1>
              <p className="text-xs text-[#8C857B] leading-relaxed max-w-sm mx-auto">
                Tu copropiedad <strong className="text-[#1A1A1A] font-bold">{condoName || 'Condominio'}</strong> ha sido registrada e inicializada en la nube correctamente.
              </p>
            </div>

            <div className="border border-[#E5E1DA] bg-[#F5F2ED]/30 p-5 text-left space-y-4 rounded-none">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Códigos de Vinculación para Residentes
              </h3>
              <p className="text-[10px] text-[#8C857B] leading-relaxed">
                Comparte cualquiera de estos códigos con los residentes de tu condominio para que puedan registrar sus departamentos y conectarse al portal.
              </p>

              <div className="space-y-3">
                {/* UUID CODE */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold tracking-wider text-[#8C857B] uppercase">Código del Condominio (UUID)</span>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 bg-white border border-[#E5E1DA] px-3 py-2 text-xs font-mono font-bold select-all break-all text-[#1A1A1A]">
                      {createdCondoId}
                    </span>
                    <button
                      onClick={() => {
                        if (createdCondoId) {
                          navigator.clipboard.writeText(createdCondoId);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }
                      }}
                      className="bg-[#1A1A1A] hover:bg-black text-white p-2.5 rounded-none transition shrink-0"
                      title="Copiar Código UUID"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* NIT CODE */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold tracking-wider text-[#8C857B] uppercase">NIT / RFC de Vinculación</span>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 bg-white border border-[#E5E1DA] px-3 py-2 text-xs font-mono font-bold select-all break-all text-[#1A1A1A]">
                      {createdCondoNit}
                    </span>
                    <button
                      onClick={() => {
                        if (createdCondoNit) {
                          navigator.clipboard.writeText(createdCondoNit);
                          setCopiedNit(true);
                          setTimeout(() => setCopiedNit(false), 2000);
                        }
                      }}
                      className="bg-[#1A1A1A] hover:bg-black text-white p-2.5 rounded-none transition shrink-0"
                      title="Copiar NIT/RFC"
                    >
                      {copiedNit ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  if (createdCondoId) {
                    onCondoCreated(createdCondoId);
                    setHasCondo(true);
                  }
                }}
                className="w-full bg-[#0D305F] hover:bg-[#0D305F]/95 text-white py-3.5 text-[10px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer text-center"
              >
                Comenzar a Administrar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // normal view
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Sidebar vertical */}
      <AdminSidebar activeTab={adminTab} onTabChange={onAdminTabChange} />

      {/* Area de contenido dinámico */}
      <div className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={adminTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
          >
            {adminTab === 'dashboard' && (
              <AdminDashboard 
                payments={payments}
                bookings={bookings}
                incidents={incidents}
                onTabChange={onAdminTabChange}
                initialBalance={initialBalance}
                condoId={condoId}
                condoName={condoName}
                condoNit={condoNit}
              />
            )}
            {adminTab === 'crm' && <AdminCrm condoId={condoId} />}
            {adminTab === 'finanzas' && (
              <AdminFinanzas 
                payments={payments}
                onApprovePayment={onApprovePayment}
                onRejectPayment={onRejectPayment}
                onAddCustomPayment={onAddCustomPayment}
              />
            )}
            {adminTab === 'comunidad' && (
              <AdminComunidad 
                announcements={announcements}
                onAddAnnouncement={onAddAnnouncement}
              />
            )}
            {adminTab === 'mantenimiento' && (
              <AdminMantenimiento 
                incidents={incidents}
                onChangeIncidentStatus={onChangeIncidentStatus}
                onAssignTechnician={onAssignTechnician}
                onAddComment={onAddComment}
              />
            )}
            {adminTab === 'reservas' && (
              <AdminReservas 
                bookings={bookings}
                onApproveBooking={onApproveBooking}
                onCancelBooking={onCancelBooking}
                payments={payments}
              />
            )}
            {adminTab === 'seguridad' && <AdminSeguridad />}
            {adminTab === 'legal' && (
              <AdminLegal onAddCustomPayment={onAddCustomPayment} />
            )}
            {adminTab === 'config' && (
              <AdminConfig 
                condoId={condoId}
                condoName={condoName}
                condoNit={condoNit}
                condoAddress={condoAddress}
              />
            )}
            {adminTab === 'ia_iot' && <AdminTecnologia />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

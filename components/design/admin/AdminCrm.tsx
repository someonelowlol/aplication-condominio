"use client";
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserPlus, 
  Trash2, 
  Car, 
  PawPrint, 
  Search, 
  Info,
  Calendar,
  Layers,
  Plus,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Unit {
  id: string;
  name: string; // e.g. "101"
  tower: string; // e.g. "Torre A"
  size: number; // m2
  storage: string; // e.g. "B-03"
  parking: string[]; // e.g. ["E-10", "E-11"]
  residents: {
    id: string;
    name: string;
    type: 'propietario' | 'arrendatario' | 'cohabitante';
    email: string;
    phone: string;
  }[];
  pets: {
    name: string;
    breed: string;
    vaccinesUpToDate: boolean;
  }[];
  vehicles: {
    plate: string;
    brand: string;
    color: string;
  }[];
  history: {
    name: string;
    period: string;
    role: string;
  }[];
}

const INITIAL_UNITS: Unit[] = [
  {
    id: 'u-101',
    name: '101',
    tower: 'Torre A',
    size: 85,
    storage: 'B-01',
    parking: ['E-01', 'E-02'],
    residents: [
      { id: 'res-1', name: 'Martha Gómez', type: 'propietario', email: 'martha.gomez@gmail.com', phone: '+52 55 1122 3344' }
    ],
    pets: [
      { name: 'Max', breed: 'Golden Retriever', vaccinesUpToDate: true }
    ],
    vehicles: [
      { plate: 'AAA-123-A', brand: 'Mazda 3', color: 'Rojo' }
    ],
    history: [
      { name: 'Ricardo Alarcón', period: '2020 - 2024', role: 'Arrendatario' }
    ]
  },
  {
    id: 'u-402',
    name: '402',
    tower: 'Torre B',
    size: 110,
    storage: 'B-14',
    parking: ['E-25'],
    residents: [
      { id: 'res-402', name: 'Luis Martínez', type: 'arrendatario', email: 'luis.martinez@condofeliz.com', phone: '+52 55 4321 0987' },
      { id: 'res-402-2', name: 'Sofía Martínez', type: 'cohabitante', email: 'sofia.mtz@gmail.com', phone: '+52 55 9876 5432' }
    ],
    pets: [
      { name: 'Luna', breed: 'Persa (Gato)', vaccinesUpToDate: true }
    ],
    vehicles: [
      { plate: 'XYZ-987-B', brand: 'Honda Civic', color: 'Gris' }
    ],
    history: [
      { name: 'Martha Espinoza', period: '2022 - 2025', role: 'Propietario anterior' }
    ]
  },
  {
    id: 'u-205',
    name: '205',
    tower: 'Torre B',
    size: 92,
    storage: 'B-09',
    parking: ['E-15', 'E-16'],
    residents: [
      { id: 'res-3', name: 'Carlos Ruiz', type: 'propietario', email: 'carlos.ruiz@gmail.com', phone: '+52 55 8899 0011' }
    ],
    pets: [],
    vehicles: [
      { plate: 'VVT-456-C', brand: 'Toyota RAV4', color: 'Negro' }
    ],
    history: []
  }
];

export default function AdminCrm({ condoId }: { condoId?: string | null }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTower, setFilterTower] = useState('all');

  // Database integration state
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<{ id: string; name: string }[]>([]);
  const [unassignedResidents, setUnassignedResidents] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [isManualResident, setIsManualResident] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Input states for adding new sub-items
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentRole, setNewResidentRole] = useState<'propietario' | 'arrendatario' | 'cohabitante'>('arrendatario');
  const [newResidentEmail, setNewResidentEmail] = useState('');
  const [newResidentPhone, setNewResidentPhone] = useState('');

  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleColor, setNewVehicleColor] = useState('');
  const [condoNit, setCondoNit] = useState<string>('');

  // Fetch dynamic structure from Supabase if condoId is active
  useEffect(() => {
    if (!condoId) {
      setUnits([]);
      setBlocks([]);
      setUnassignedResidents([]);
      setSelectedUnitId(null);
      return;
    }

    async function loadCrmData() {
      setLoading(true);
      try {
        const supabase = createClient();

        // 0. Fetch condo details for human readable NIT join code
        const { data: condoData } = await supabase
          .from('condominiums')
          .select('nit')
          .eq('id', condoId)
          .single();

        if (condoData?.nit) {
          setCondoNit(condoData.nit);
        }

        // 1. Fetch blocks
        const { data: dbBlocks, error: blocksErr } = await supabase
          .from('blocks')
          .select('id, name')
          .eq('condominium_id', condoId);

        if (blocksErr) throw blocksErr;
        setBlocks(dbBlocks || []);

        if (dbBlocks && dbBlocks.length > 0) {
          const blockIds = dbBlocks.map(b => b.id);

          // 2. Fetch units
          const { data: dbUnits, error: unitsErr } = await supabase
            .from('units')
            .select('id, block_id, unit_number, floor, coefficient, balance, owner_id')
            .in('block_id', blockIds)
            .order('unit_number', { ascending: true });

          if (unitsErr) throw unitsErr;

          // 3. Fetch residents (profiles)
          const { data: dbProfiles, error: profilesErr } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, unit_id')
            .eq('role', 'resident');

          if (profilesErr) throw profilesErr;

          // 4. Map DB units to CRM format
          const mappedUnits: Unit[] = (dbUnits || []).map(u => {
            const blockName = dbBlocks.find(b => b.id === u.block_id)?.name || 'Torre';
            
            // Find real profiles associated with this unit
            const unitResidents = (dbProfiles || [])
              .filter(p => p.unit_id === u.id)
              .map(p => ({
                id: p.id,
                name: p.full_name,
                type: (u.owner_id === p.id ? 'propietario' : 'arrendatario') as any,
                email: p.email,
                phone: '+52 55 0000 0000'
              }));

            // Load extra mock elements from localStorage
            const localData = localStorage.getItem(`crm_details_${u.id}`);
            const parsed = localData ? JSON.parse(localData) : { pets: [], vehicles: [], history: [] };

            return {
              id: u.id,
              name: u.unit_number,
              tower: blockName,
              size: Math.round(70 + Number(u.coefficient) * 2000) || 90,
              storage: `Bodega B-${u.unit_number}`,
              parking: [`Cajón C-${u.unit_number}`],
              residents: unitResidents.length > 0 ? unitResidents : (parsed.residents || []),
              pets: parsed.pets || [],
              vehicles: parsed.vehicles || [],
              history: parsed.history || []
            };
          });

          setUnits(mappedUnits);
          
          // Auto select first unit if none selected or selected doesn't exist anymore
          if (mappedUnits.length > 0) {
            setSelectedUnitId(prev => {
              const stillExists = mappedUnits.some(mu => mu.id === prev);
              return stillExists ? prev : mappedUnits[0].id;
            });
          } else {
            setSelectedUnitId(null);
          }
        } else {
          setUnits([]);
          setSelectedUnitId(null);
        }

        // Fetch unassigned resident profiles
        const { data: unassignedProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'resident')
          .is('unit_id', null);

        setUnassignedResidents(unassignedProfiles || []);

      } catch (err: any) {
        console.error('Error loading CRM data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCrmData();
  }, [condoId, reloadTrigger]);

  // Selected Unit info
  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Actions
  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) return;

    if (condoId && !isManualResident) {
      // Supabase Mode - Assign Real Resident Profile
      if (!selectedResidentId) {
        alert('Por favor seleccione un residente registrado de la lista.');
        return;
      }

      try {
        const supabase = createClient();
        
        // Update resident's profile unit & condo
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            unit_id: selectedUnitId,
            condominium_id: condoId
          })
          .eq('id', selectedResidentId);

        if (profileErr) throw profileErr;

        // If Owner, update unit owner_id
        if (newResidentRole === 'propietario') {
          const { error: unitErr } = await supabase
            .from('units')
            .update({
              owner_id: selectedResidentId
            })
            .eq('id', selectedUnitId);

          if (unitErr) throw unitErr;
        }

        setSelectedResidentId('');
        setReloadTrigger(prev => prev + 1);
      } catch (err: any) {
        console.error('Error assigning resident:', err);
        alert(`Error al asignar residente: ${err.message || err}`);
      }
    } else {
      // Local/Demo Mode or Simulated Ocupant
      if (!newResidentName) return;

      const newRes = {
        id: `res-manual-${Date.now()}`,
        name: newResidentName,
        type: newResidentRole,
        email: newResidentEmail || 'correo@simulado.com',
        phone: newResidentPhone || '+52 55 0000 0000'
      };

      setUnits(prev => prev.map(u => {
        if (u.id === selectedUnitId) {
          const updatedResidents = [...u.residents, newRes];
          
          // Save manual residents to localStorage for persistence
          const localData = localStorage.getItem(`crm_details_${u.id}`);
          const parsed = localData ? JSON.parse(localData) : { pets: [], vehicles: [], history: [] };
          localStorage.setItem(`crm_details_${u.id}`, JSON.stringify({
            ...parsed,
            residents: updatedResidents
          }));

          return {
            ...u,
            residents: updatedResidents
          };
        }
        return u;
      }));

      setNewResidentName('');
      setNewResidentEmail('');
      setNewResidentPhone('');
    }
  };

  const handleRemoveResident = async (residentId: string) => {
    if (!selectedUnitId) return;

    if (condoId && !residentId.startsWith('res-manual-') && !residentId.startsWith('res-crm-')) {
      // Real database resident!
      try {
        const supabase = createClient();
        
        // Clear unit_id on profile
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ unit_id: null, condominium_id: null })
          .eq('id', residentId);
        
        if (profileErr) throw profileErr;

        // Check if this resident was the owner
        const selectedUnitObj = units.find(u => u.id === selectedUnitId);
        if (selectedUnitObj && selectedUnitObj.residents.find(r => r.id === residentId)?.type === 'propietario') {
          const { error: unitErr } = await supabase
            .from('units')
            .update({ owner_id: null })
            .eq('id', selectedUnitId);
          if (unitErr) throw unitErr;
        }

        setReloadTrigger(prev => prev + 1);
      } catch (err: any) {
        console.error('Error removing resident from unit:', err);
        alert(`Error al remover residente: ${err.message || err}`);
      }
    } else {
      // Manual resident
      setUnits(prev => prev.map(u => {
        if (u.id === selectedUnitId) {
          const updatedResidents = u.residents.filter(r => r.id !== residentId);
          
          const localData = localStorage.getItem(`crm_details_${u.id}`);
          const parsed = localData ? JSON.parse(localData) : { pets: [], vehicles: [], history: [] };
          localStorage.setItem(`crm_details_${u.id}`, JSON.stringify({
            ...parsed,
            residents: updatedResidents
          }));

          const residentToRemove = u.residents.find(r => r.id === residentId);
          const historyEntry = residentToRemove ? {
            name: residentToRemove.name,
            period: `${new Date().getFullYear()} - Salida`,
            role: residentToRemove.type.toUpperCase()
          } : null;

          const updatedHistory = historyEntry ? [...u.history, historyEntry] : u.history;
          localStorage.setItem(`crm_details_${u.id}`, JSON.stringify({
            ...parsed,
            residents: updatedResidents,
            history: updatedHistory
          }));

          return {
            ...u,
            residents: updatedResidents,
            history: updatedHistory
          };
        }
        return u;
      }));
    }
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !newPetName) return;

    setUnits(prev => prev.map(u => {
      if (u.id === selectedUnitId) {
        const updatedPets = [...u.pets, { name: newPetName, breed: newPetBreed || 'Mixto', vaccinesUpToDate: true }];
        
        const localData = localStorage.getItem(`crm_details_${u.id}`);
        const parsed = localData ? JSON.parse(localData) : { pets: [], vehicles: [], history: [] };
        localStorage.setItem(`crm_details_${u.id}`, JSON.stringify({
          ...parsed,
          pets: updatedPets
        }));

        return {
          ...u,
          pets: updatedPets
        };
      }
      return u;
    }));

    setNewPetName('');
    setNewPetBreed('');
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !newVehiclePlate) return;

    setUnits(prev => prev.map(u => {
      if (u.id === selectedUnitId) {
        const updatedVehicles = [...u.vehicles, { plate: newVehiclePlate, brand: newVehicleBrand || 'Desconocido', color: newVehicleColor || 'Desconocido' }];
        
        const localData = localStorage.getItem(`crm_details_${u.id}`);
        const parsed = localData ? JSON.parse(localData) : { pets: [], vehicles: [], history: [] };
        localStorage.setItem(`crm_details_${u.id}`, JSON.stringify({
          ...parsed,
          vehicles: updatedVehicles
        }));

        return {
          ...u,
          vehicles: updatedVehicles
        };
      }
      return u;
    }));

    setNewVehiclePlate('');
    setNewVehicleBrand('');
    setNewVehicleColor('');
  };

  // Filter logic
  const filteredUnits = units.filter(u => {
    const matchesSearch = u.name.includes(search) || 
      u.residents.some(r => r.name.toLowerCase().includes(search.toLowerCase())) ||
      u.vehicles.some(v => v.plate.toLowerCase().includes(search.toLowerCase()));
    
    const matchesTower = filterTower === 'all' || u.tower === filterTower;
    return matchesSearch && matchesTower;
  });

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="border-b border-[#E5E1DA] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Gestión del Condominio</span>
          <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">CRM de Residentes y Unidades</h1>
        </div>
        {condoId && (
          <div className="bg-[#F5F2ED] border border-[#E5E1DA] p-3 text-left sm:text-right">
            <span className="text-[9px] font-mono tracking-widest text-[#8C857B] uppercase block">Código de Vinculación para Residentes:</span>
            <span className="text-sm font-mono font-bold text-[#0D9488] select-all cursor-pointer bg-white px-2.5 py-1 border border-[#CEC7BC] inline-block mt-1" title="Copia este código único y compártelo con tus condóminos">{condoNit || condoId}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unit Directory & Search (1 Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#8C857B]" />
              <input
                type="text"
                placeholder="Buscar unidad, nombre, placa..."
                className="w-full bg-[#FDFCFB] border border-[#E5E1DA] pl-9 pr-4 py-2.5 text-xs outline-none focus:border-[#1A1A1A]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filterTower}
              onChange={e => setFilterTower(e.target.value)}
              className="bg-white border border-[#E5E1DA] px-2 py-1 text-xs outline-none focus:border-[#1A1A1A]"
            >
              <option value="all">Todas</option>
              {condoId ? (
                blocks.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))
              ) : (
                <>
                  <option value="Torre A">Torre A</option>
                  <option value="Torre B">Torre B</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center gap-2 border border-dashed border-[#E5E1DA] bg-white">
                <Loader2 className="w-6 h-6 animate-spin text-[#8C857B]" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#8C857B]">Cargando inventario...</span>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="border border-dashed border-[#E5E1DA] bg-white py-12 text-center text-[#8C857B] text-xs">
                No se encontraron unidades con estos criterios.
              </div>
            ) : (
              filteredUnits.map(unit => {
                const isSelected = selectedUnitId === unit.id;
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    className={`border p-4 cursor-pointer transition flex justify-between items-center ${
                      isSelected ? 'bg-[#F5F2ED] border-[#1A1A1A]' : 'bg-white border-[#E5E1DA] hover:bg-[#F5F2ED]/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono tracking-wider text-[#8C857B] uppercase">{unit.tower}</span>
                      <h4 className="text-base font-serif italic text-[#1A1A1A] leading-none">Unidad {unit.name}</h4>
                      <p className="text-[10px] text-[#8C857B]">
                        {unit.residents.length > 0 ? unit.residents[0].name : 'Sin residentes'}
                      </p>
                    </div>
                    <Building2 className="w-4 h-4 text-[#8C857B]" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Unit Details & Forms (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedUnit ? (
            <div className="bg-white border border-[#E5E1DA] p-6 space-y-6">
              {/* Top Summary */}
              <div className="flex justify-between items-start border-b border-[#E5E1DA] pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#8C857B]">{selectedUnit.tower} • Propiedad Individual</span>
                  <h2 className="text-2xl font-serif italic text-[#1A1A1A] font-normal">Unidad {selectedUnit.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#8C857B] uppercase block">Área Total</span>
                  <span className="text-lg font-mono font-bold text-[#1A1A1A]">{selectedUnit.size} m²</span>
                </div>
              </div>

              {/* Specifications: Storage & Parking */}
              <div className="grid grid-cols-2 gap-4 bg-[#F5F2ED] p-4 border border-[#E5E1DA]">
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#8C857B] tracking-wider block">Bodega Asignada</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{selectedUnit.storage}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#8C857B] tracking-wider block">Cajones de Estacionamiento</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{selectedUnit.parking.join(', ')}</span>
                </div>
              </div>

              {/* Residents CRM Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-1.5">
                  <h4 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Directorio de Ocupantes</h4>
                  <span className="text-[10px] font-mono text-[#8C857B]">{selectedUnit.residents.length} registrados</span>
                </div>

                <div className="divide-y divide-[#E5E1DA]">
                  {selectedUnit.residents.map(res => (
                    <div key={res.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[#1A1A1A]">{res.name}</span>
                        <span className="ml-2 px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold bg-[#F5F2ED] border border-[#E5E1DA]">
                          {res.type}
                        </span>
                        <p className="text-[10px] text-[#8C857B] mt-0.5">{res.email} • {res.phone}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveResident(res.id)}
                        className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 p-1 border border-transparent hover:border-rose-200 transition"
                        title="Registrar Salida"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Resident Form */}
                <div className="pt-4 border-t border-[#E5E1DA] space-y-3">
                  {condoId && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#8C857B] uppercase font-bold">Tipo de Asignación:</span>
                      <button
                        type="button"
                        onClick={() => setIsManualResident(!isManualResident)}
                        className="text-[#0D9488] hover:underline font-bold"
                      >
                        {isManualResident ? "← Usar Residentes Registrados" : "+ Simular Ocupante Temporal"}
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleAddResident} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {condoId && !isManualResident ? (
                      <div className="sm:col-span-2">
                        {unassignedResidents.length > 0 ? (
                          <select
                            required
                            className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                            value={selectedResidentId}
                            onChange={e => setSelectedResidentId(e.target.value)}
                          >
                            <option value="">-- Seleccionar Residente --</option>
                            {unassignedResidents.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.full_name} ({r.email})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-[9px] text-[#8C857B] bg-[#F5F2ED] border border-dashed border-[#E5E1DA] p-2 text-center leading-normal">
                            No hay residentes registrados sin unidad. Pídales que se registren en el portal con su correo.
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="Nombre Completo"
                        className="sm:col-span-2 bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                        value={newResidentName}
                        onChange={e => setNewResidentName(e.target.value)}
                      />
                    )}

                    <select
                      className="bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                      value={newResidentRole}
                      onChange={e => setNewResidentRole(e.target.value as any)}
                    >
                      <option value="propietario">Propietario</option>
                      <option value="arrendatario">Arrendatario</option>
                      <option value="cohabitante">Cohabitante</option>
                    </select>

                    <button
                      type="submit"
                      disabled={Boolean(condoId && !isManualResident && unassignedResidents.length === 0)}
                      className="bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-1.5 rounded-none flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Pets & Vehicles grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pets Tracker */}
                <div className="border border-[#E5E1DA] p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-1.5">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Mascotas</h4>
                    <PawPrint className="w-3.5 h-3.5 text-[#8C857B]" />
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    {selectedUnit.pets.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-[#F5F2ED]/50 border border-[#E5E1DA]/50">
                        <div>
                          <strong className="text-[#1A1A1A]">{p.name}</strong>
                          <span className="text-[#8C857B] ml-2 font-serif italic">({p.breed})</span>
                        </div>
                        <span className="text-[8px] uppercase tracking-wider font-bold text-emerald-800 border border-emerald-200 bg-emerald-50 px-1.5">
                          Vacunas al día
                        </span>
                      </div>
                    ))}
                    {selectedUnit.pets.length === 0 && (
                      <p className="text-[10px] text-[#8C857B] italic">No hay mascotas registradas.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddPet} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      required
                      placeholder="Nombre mascota"
                      className="flex-1 bg-[#FDFCFB] border border-[#E5E1DA] px-2.5 py-1 text-[11px] outline-none"
                      value={newPetName}
                      onChange={e => setNewPetName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Raza"
                      className="w-20 bg-[#FDFCFB] border border-[#E5E1DA] px-2.5 py-1 text-[11px] outline-none"
                      value={newPetBreed}
                      onChange={e => setNewPetBreed(e.target.value)}
                    />
                    <button type="submit" className="bg-[#1A1A1A] text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest hover:bg-black">
                      +
                    </button>
                  </form>
                </div>

                {/* Vehicles Tracker */}
                <div className="border border-[#E5E1DA] p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-1.5">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Vehículos Autorizados</h4>
                    <Car className="w-3.5 h-3.5 text-[#8C857B]" />
                  </div>

                  <div className="space-y-2 text-xs">
                    {selectedUnit.vehicles.map((v, idx) => (
                      <div key={idx} className="p-2 bg-[#F5F2ED]/50 border border-[#E5E1DA]/50 flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-[#1A1A1A]">{v.plate}</span>
                          <span className="text-[#8C857B] ml-2">{v.brand} ({v.color})</span>
                        </div>
                      </div>
                    ))}
                    {selectedUnit.vehicles.length === 0 && (
                      <p className="text-[10px] text-[#8C857B] italic">No hay vehículos registrados.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddVehicle} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      required
                      placeholder="Placa"
                      className="w-16 bg-[#FDFCFB] border border-[#E5E1DA] px-2.5 py-1 text-[11px] outline-none"
                      value={newVehiclePlate}
                      onChange={e => setNewVehiclePlate(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Marca/Modelo"
                      className="flex-1 bg-[#FDFCFB] border border-[#E5E1DA] px-2.5 py-1 text-[11px] outline-none"
                      value={newVehicleBrand}
                      onChange={e => setNewVehicleBrand(e.target.value)}
                    />
                    <button type="submit" className="bg-[#1A1A1A] text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest hover:bg-black">
                      +
                    </button>
                  </form>
                </div>
              </div>

              {/* Tenancy History */}
              <div className="border border-[#E5E1DA] p-4 space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                  Historial de Habitantes
                </h4>
                
                <div className="space-y-2 text-xs">
                  {selectedUnit.history.map((hist, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="text-[#1A1A1A] font-medium">{hist.name} <span className="text-[9px] uppercase tracking-wider font-mono text-[#8C857B]">({hist.role})</span></span>
                      <span className="text-[#8C857B] font-mono">{hist.period}</span>
                    </div>
                  ))}
                  {selectedUnit.history.length === 0 && (
                    <p className="text-[10px] text-[#8C857B] italic">Sin registros de habitantes anteriores.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-[#E5E1DA] bg-white p-12 text-center text-[#8C857B] text-xs">
              Seleccione una unidad del inventario a la izquierda para administrar sus ocupantes, mascotas, autos e historial.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

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

export default function AdminCrm() {
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('u-402');
  const [search, setSearch] = useState('');
  const [filterTower, setFilterTower] = useState('all');

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

  // Selected Unit info
  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Actions
  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !newResidentName) return;

    setUnits(prev => prev.map(u => {
      if (u.id === selectedUnitId) {
        const newRes = {
          id: `res-crm-${Date.now()}`,
          name: newResidentName,
          type: newResidentRole,
          email: newResidentEmail || 'correo@simulado.com',
          phone: newResidentPhone || '+52 55 0000 0000'
        };
        return {
          ...u,
          residents: [...u.residents, newRes]
        };
      }
      return u;
    }));

    setNewResidentName('');
    setNewResidentEmail('');
    setNewResidentPhone('');
  };

  const handleRemoveResident = (residentId: string) => {
    if (!selectedUnitId) return;
    setUnits(prev => prev.map(u => {
      if (u.id === selectedUnitId) {
        const residentToRemove = u.residents.find(r => r.id === residentId);
        const historyEntry = residentToRemove ? {
          name: residentToRemove.name,
          period: `${new Date().getFullYear()} - Salida`,
          role: residentToRemove.type.toUpperCase()
        } : null;

        return {
          ...u,
          residents: u.residents.filter(r => r.id !== residentId),
          history: historyEntry ? [...u.history, historyEntry] : u.history
        };
      }
      return u;
    }));
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !newPetName) return;

    setUnits(prev => prev.map(u => {
      if (u.id === selectedUnitId) {
        return {
          ...u,
          pets: [...u.pets, { name: newPetName, breed: newPetBreed || 'Mixto', vaccinesUpToDate: true }]
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
        return {
          ...u,
          vehicles: [...u.vehicles, { plate: newVehiclePlate, brand: newVehicleBrand || 'Desconocido', color: newVehicleColor || 'Desconocido' }]
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
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Gestión del Condominio</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">CRM de Residentes y Unidades</h1>
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
              <option value="Torre A">Torre A</option>
              <option value="Torre B">Torre B</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredUnits.map(unit => {
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
            })}
            {filteredUnits.length === 0 && (
              <div className="border border-dashed border-[#E5E1DA] bg-white py-12 text-center text-[#8C857B] text-xs">
                No se encontraron unidades con estos criterios.
              </div>
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
                <form onSubmit={handleAddResident} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Nombre Completo"
                    className="sm:col-span-2 bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                    value={newResidentName}
                    onChange={e => setNewResidentName(e.target.value)}
                  />
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
                    className="bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-1.5 rounded-none flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </form>
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

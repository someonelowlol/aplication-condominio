"use client";
import React, { useState } from 'react';
import { 
  Scale, 
  FileText, 
  Upload, 
  Trash2, 
  Camera, 
  Plus, 
  AlertTriangle,
  Gavel,
  Download
} from 'lucide-react';
import { Payment } from '@/lib/types';

interface AdminLegalProps {
  onAddCustomPayment: (pay: Payment) => void;
}

interface LegalDoc {
  id: string;
  name: string;
  category: 'bylaws' | 'assembly' | 'plans' | 'insurance';
  fileSize: string;
  uploadedAt: string;
}

interface FineInfraction {
  id: string;
  unit: string;
  residentName: string;
  infractionType: string;
  description: string;
  amount: number;
  date: string;
  hasPhoto: boolean;
}

const INITIAL_DOCS: LegalDoc[] = [
  { id: 'doc-1', name: 'Reglamento_Interno_ResidenSmart_Edicion2026.pdf', category: 'bylaws', fileSize: '2.4 MB', uploadedAt: '2026-01-10' },
  { id: 'doc-2', name: 'Acta_Asamblea_Extraordinaria_Mayo2026.pdf', category: 'assembly', fileSize: '1.8 MB', uploadedAt: '2026-05-25' },
  { id: 'doc-3', name: 'Planos_Hidraulicos_Towers_A_y_B.zip', category: 'plans', fileSize: '45.0 MB', uploadedAt: '2026-02-15' },
  { id: 'doc-4', name: 'Poliza_Seguro_Multiriesgo_AXA_2026.pdf', category: 'insurance', fileSize: '3.1 MB', uploadedAt: '2026-03-01' }
];

const INITIAL_FINES: FineInfraction[] = [
  { id: 'fine-1', unit: 'Torre B - 402', residentName: 'Luis Martínez', infractionType: 'Obstrucción de Cajón de Estacionamiento', description: 'Vehículo bloqueando la salida de la unidad 401 el día 12 de Abril.', amount: 500.00, date: '2026-04-29', hasPhoto: true }
];

export default function AdminLegal({ onAddCustomPayment }: AdminLegalProps) {
  const [legalSubTab, setLegalSubTab] = useState<'docs' | 'fines'>('docs');
  
  // Documents State
  const [docs, setDocs] = useState<LegalDoc[]>(INITIAL_DOCS);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'bylaws' | 'assembly' | 'plans' | 'insurance'>('bylaws');

  // Fines State
  const [fines, setFines] = useState<FineInfraction[]>(INITIAL_FINES);
  const [fineUnit, setFineUnit] = useState('Torre B - 402');
  const [fineType, setFineType] = useState('Exceso de Ruido');
  const [fineDescription, setFineDescription] = useState('');
  const [fineAmount, setFineAmount] = useState('1000');
  const [finePhotoAttached, setFinePhotoAttached] = useState(false);

  // ACTION: Add Legal Document
  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const newDoc: LegalDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith('.pdf') || newDocName.endsWith('.zip') ? newDocName : `${newDocName}.pdf`,
      category: newDocCategory,
      fileSize: '1.2 MB',
      uploadedAt: new Date().toISOString().substring(0, 10)
    };

    setDocs(prev => [newDoc, ...prev]);
    setNewDocName('');
    alert('Documento legal subido con éxito al repositorio de la nube.');
  };

  // ACTION: Delete Legal Document
  const handleDeleteDoc = (id: string) => {
    if (confirm('¿Desea eliminar permanentemente este documento del repositorio?')) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  // ACTION: Apply Fine and automatic charge
  const handleApplyFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fineDescription || !fineAmount) return;

    const amount = parseFloat(fineAmount);
    if (isNaN(amount)) return;

    // 1. Create Fine Object for display
    const newFine: FineInfraction = {
      id: `fine-${Date.now()}`,
      unit: fineUnit,
      residentName: fineUnit === 'Torre B - 402' ? 'Luis Martínez' : fineUnit === 'Torre A - 101' ? 'Martha Gómez' : 'Carlos Ruiz',
      infractionType: fineType,
      description: fineDescription,
      amount,
      date: new Date().toISOString().substring(0, 10),
      hasPhoto: finePhotoAttached
    };

    setFines(prev => [newFine, ...prev]);

    // 2. Generate automatic payment fee (charge to resident outstanding balance!)
    const targetUnitSub = fineUnit.substring(fineUnit.lastIndexOf('-') + 2);
    const customPayment: Payment = {
      id: `pay-fine-${Date.now()}`,
      title: `Multa: ${fineType}`,
      description: `${fineDescription} Registrado formalmente el ${newFine.date} bajo folio ${newFine.id}.`,
      amount,
      dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().substring(0, 10),
      status: 'pending',
      category: 'fine',
      reference: `REF-FINE-${Date.now().toString().substring(8, 12)}`
    };

    onAddCustomPayment(customPayment);

    // Reset fields
    setFineDescription('');
    setFineAmount('1000');
    setFinePhotoAttached(false);
    
    alert(`Multa aplicada con éxito. Se ha cargado de manera automática $${amount.toFixed(2)} MXN al estado de cuenta de la unidad.`);
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Jurídico y Reglamentos</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Gestión Documental y Legal</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'docs', label: 'Repositorio en la Nube', icon: FileText },
          { id: 'fines', label: 'Gestión de Multas y Sanciones', icon: Gavel }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setLegalSubTab(tab.id as any)}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                legalSubTab === tab.id 
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
        
        {/* SUBTAB: DOCS */}
        {legalSubTab === 'docs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload form */}
            <form onSubmit={handleUploadDoc} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Subir Documento
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Nombre del Archivo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Reglamento_Interno.pdf"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Categoría Documental</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={newDocCategory}
                    onChange={e => setNewDocCategory(e.target.value as any)}
                  >
                    <option value="bylaws">Reglamentos de Copropiedad</option>
                    <option value="assembly">Actas de Asambleas</option>
                    <option value="plans">Planos de Construcción</option>
                    <option value="insurance">Pólizas de Seguros</option>
                  </select>
                </div>

                <div className="border border-dashed border-[#E5E1DA] p-4 text-center text-[#8C857B] bg-white">
                  <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px]">Arrastre archivo legal</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none animate-pulse"
                >
                  Registrar Documento
                </button>
              </div>
            </form>

            {/* List of files */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Repositorio Legal y Administrativo ({docs.length} archivos)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docs.map(doc => (
                  <div key={doc.id} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] text-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider font-mono text-[#8C857B]">{doc.category}</span>
                      <h4 className="font-sans font-bold text-sm text-[#1A1A1A] leading-tight break-all">{doc.name}</h4>
                      <p className="text-[10px] text-[#8C857B]">Tamaño: {doc.fileSize} • Subido el {doc.uploadedAt}</p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E1DA] flex justify-between items-center text-[10px]">
                      <button 
                        onClick={() => alert(`Iniciando descarga simulada de: ${doc.name}`)}
                        className="text-[#1A1A1A] font-bold uppercase tracking-wider text-[9px] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-rose-700 hover:text-rose-950 p-1 transition"
                        title="Borrar archivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: FINES */}
        {legalSubTab === 'fines' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Fine Form */}
            <form onSubmit={handleApplyFine} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Registrar Nueva Infracción
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Unidad Infractora</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={fineUnit}
                    onChange={e => setFineUnit(e.target.value)}
                  >
                    <option value="Torre B - 402">Torre B - 402 (Luis Martínez)</option>
                    <option value="Torre A - 101">Torre A - 101 (Martha Gómez)</option>
                    <option value="Torre B - 205">Torre B - 205 (Carlos Ruiz)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Tipo de Infracción</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={fineType}
                    onChange={e => setFineType(e.target.value)}
                  >
                    <option value="Exceso de Ruido / Fiesta Ext.">Exceso de Ruido / Fiesta Ext.</option>
                    <option value="Obstrucción de Estacionamiento">Obstrucción de Estacionamiento</option>
                    <option value="Mascota sin Correa en Comunes">Mascota sin Correa en Comunes</option>
                    <option value="Daños Físicos a Áreas Comunes">Daños Físicos a Áreas Comunes</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Monto de Multa (MXN)</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={fineAmount}
                      onChange={e => setFineAmount(e.target.value)}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFinePhotoAttached(!finePhotoAttached);
                      alert('Fotografía de evidencia adjuntada a la infracción (simulado).');
                    }}
                    className={`w-full py-2.5 border text-[9px] font-bold tracking-widest uppercase transition flex items-center justify-center gap-1.5 ${
                      finePhotoAttached ? 'bg-[#1A1A1A] border-black text-white' : 'bg-white border-[#E5E1DA] text-[#8C857B] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{finePhotoAttached ? 'Evidencia OK' : 'Subir Foto'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Descripción de la Infracción</label>
                  <textarea
                    required
                    placeholder="Escriba los detalles de la falta (hora, fecha y testigos si existen)..."
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none h-24 resize-none"
                    value={fineDescription}
                    onChange={e => setFineDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none flex items-center justify-center gap-1.5"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Aplicar Sanción</span>
                </button>
              </div>
            </form>

            {/* List of applied fines */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Registro Histórico de Infracciones
              </h3>

              <div className="space-y-3">
                {fines.map(fine => (
                  <div key={fine.id} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] text-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-[#8C857B]">{fine.date} • Folio: {fine.id}</span>
                        <h4 className="font-serif italic text-base text-[#1A1A1A] mt-0.5">{fine.infractionType}</h4>
                        <p className="text-[11px] text-[#8C857B] mt-1">Infractor: <strong className="text-[#1A1A1A]">{fine.residentName} ({fine.unit})</strong></p>
                      </div>
                      <span className="font-mono font-bold text-rose-700 text-base">${fine.amount.toFixed(2)}</span>
                    </div>

                    <p className="text-[#5A554F] leading-relaxed p-3 bg-[#F5F2ED]/45 border border-[#E5E1DA]">{fine.description}</p>
                    
                    {fine.hasPhoto && (
                      <div className="border border-dashed border-[#CEC7BC] p-2 bg-[#F5F2ED] font-mono text-[9px] text-[#8C857B] flex items-center gap-1.5 w-fit">
                        <Camera className="w-3.5 h-3.5 text-[#1A1A1A]" />
                        <span>evidencia_fotografica_infraccion.jpg</span>
                      </div>
                    )}
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

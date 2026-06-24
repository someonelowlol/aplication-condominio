"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Trash2, Plus, Briefcase, User, Phone } from 'lucide-react';

export interface JobService {
  id: string;
  serviceName: string;
  residentName: string;
  contact: string;
  createdAt: string;
}

interface DirectorySectionProps {
  isAdmin: boolean;
}

const initialJobs: JobService[] = [
  { id: '1', serviceName: 'Clases de Matemáticas', residentName: 'Ana López (Torre A - 201)', contact: '3001234567', createdAt: '2023-10-01' },
  { id: '2', serviceName: 'Paseo de Perros', residentName: 'Carlos Ruiz (Torre B - 105)', contact: '3129876543', createdAt: '2023-10-05' },
];

export default function DirectorySection({ isAdmin }: DirectorySectionProps) {
  const [jobs, setJobs] = useState<JobService[]>(initialJobs);
  const [showAdd, setShowAdd] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [residentName, setResidentName] = useState('');
  const [contact, setContact] = useState('');

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !residentName || !contact) return;
    
    const newJob: JobService = {
      id: Date.now().toString(),
      serviceName,
      residentName,
      contact,
      createdAt: new Date().toISOString()
    };
    
    setJobs([newJob, ...jobs]);
    setServiceName('');
    setResidentName('');
    setContact('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-editorial-text font-semibold">Directorio de Trabajos</h2>
          <p className="text-editorial-muted mt-1 text-sm">Servicios ofrecidos por residentes de la comunidad</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-2 bg-indigo-950 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-850 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showAdd ? 'Cancelar' : 'Nuevo Servicio'}
          </button>
        )}
      </div>

      {isAdmin && showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-editorial-border p-6 rounded-xl shadow-sm"
        >
          <h3 className="font-semibold text-editorial-text mb-4">Registrar Nuevo Servicio</h3>
          <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">Nombre del Servicio</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-editorial-muted">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  required
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-editorial-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-950/20 focus:border-indigo-950 outline-none"
                  placeholder="Ej: Plomería"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">Nombre del Residente</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-editorial-muted">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  required
                  value={residentName}
                  onChange={e => setResidentName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-editorial-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-950/20 focus:border-indigo-950 outline-none"
                  placeholder="Ej: Juan Pérez (T1-102)"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">Número de Contacto</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-editorial-muted">
                  <Phone className="w-4 h-4" />
                </div>
                <input 
                  type="tel" 
                  required
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-editorial-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-950/20 focus:border-indigo-950 outline-none"
                  placeholder="Ej: 3001234567"
                />
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button 
                type="submit"
                className="bg-indigo-950 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-850 transition-colors"
              >
                Guardar Servicio
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <motion.div 
            key={job.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-editorial-border p-6 rounded-xl shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-950 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(job.id)}
                  className="text-editorial-muted hover:text-rose-650 transition-colors p-1"
                  title="Eliminar trabajo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <h3 className="font-semibold text-editorial-text text-lg mb-1">{job.serviceName}</h3>
            <p className="text-editorial-muted text-sm mb-4 flex-grow">{job.residentName}</p>
            
            <a 
              href={`tel:${job.contact}`}
              className="inline-flex items-center justify-center gap-2 w-full bg-editorial-highlight text-indigo-950 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-205 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Llamar al {job.contact}
            </a>
          </motion.div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full py-12 text-center text-editorial-muted">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aún no hay servicios registrados en el directorio.</p>
          </div>
        )}
      </div>
    </div>
  );
}

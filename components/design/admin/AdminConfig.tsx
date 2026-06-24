"use client";
import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  History, 
  Globe, 
  Download, 
  CheckSquare, 
  RefreshCw,
  Info 
} from 'lucide-react';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', user: 'Ing. Manuel Esparza (Admin)', action: 'APROBACIÓN_PAGO', module: 'Finanzas', timestamp: '2026-06-24 10:15:32', details: 'Aprobó transferencia REF-2026-06-402 por $1,850.00 MXN' },
  { id: 'log-2', user: 'Oficial Martínez (Seguridad)', action: 'REGISTRO_INGRESO', module: 'Seguridad', timestamp: '2026-06-24 10:30:11', details: 'Ingresó visitante Pedro Domínguez a la unidad Torre B-402' },
  { id: 'log-3', user: 'Contador General (User)', action: 'REGISTRO_EGRESO', module: 'Finanzas', timestamp: '2026-06-24 09:05:40', details: 'Cargó egreso por servicio de limpieza Brillamax ($18,000.00 MXN)' }
];

export default function AdminConfig() {
  const [configSubTab, setConfigSubTab] = useState<'roles' | 'audit' | 'condos'>('roles');
  
  // Roles permissions mapping
  const [roles, setRoles] = useState([
    { name: 'Administrador Principal', viewCrm: true, manageFinance: true, viewSecurity: true, configureSystem: true },
    { name: 'Contador / Auxiliar Contable', viewCrm: true, manageFinance: true, viewSecurity: false, configureSystem: false },
    { name: 'Recepcionista / Guardia', viewCrm: true, manageFinance: false, viewSecurity: true, configureSystem: false },
    { name: 'Comité de Vigilancia', viewCrm: true, manageFinance: false, viewSecurity: true, configureSystem: false }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Condo switcher state
  const [currentCondo, setCurrentCondo] = useState('Cerro Verde Residencia');
  const condosList = [
    'Cerro Verde Residencia',
    'Valle Alto Towers',
    'Lomas Verdes Cotos',
    'Las Flores Condominios'
  ];

  // ACTION: Toggle Role permission
  const handleTogglePermission = (roleIdx: number, field: 'viewCrm' | 'manageFinance' | 'viewSecurity' | 'configureSystem') => {
    setRoles(prev => prev.map((r, idx) => {
      if (idx === roleIdx) {
        return {
          ...r,
          [field]: !r[field]
        };
      }
      return r;
    }));
    alert('Permiso de rol actualizado.');
  };

  // ACTION: Export Backup
  const handleExportBackup = () => {
    alert(`Generando respaldo unificado de la base de datos...\n` +
      `Sede: ${currentCondo}\n` +
      `Tamaño estimado: 154 MB (.ZIP)\n` +
      `El proceso se ejecutará en segundo plano. Recibirá un correo de confirmación.`
    );
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Control del Sistema</span>
          <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Configuración y Aspectos Técnicos</h1>
        </div>

        {/* Backup button */}
        <button
          onClick={handleExportBackup}
          className="border border-[#E5E1DA] bg-white hover:bg-[#F5F2ED] text-[#1A1A1A] px-4 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Respaldo (.ZIP)</span>
        </button>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'roles', label: 'Gestión de Roles', icon: Key },
          { id: 'audit', label: 'Logs de Auditoría', icon: History },
          { id: 'condos', label: 'Sedes Multi-Condominio', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setConfigSubTab(tab.id as 'roles' | 'audit' | 'condos')}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                configSubTab === tab.id 
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
        
        {/* SUBTAB: ROLES */}
        {configSubTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Roles y Permisos de Acceso al Portal
              </h3>
              <p className="text-[10px] text-[#8C857B] mt-0.5">Determine las capacidades y vistas habilitadas por nivel de jerarquía administrativa.</p>
            </div>

            <div className="overflow-x-auto border border-[#E5E1DA]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                    <th className="p-3">Rol del Personal</th>
                    <th className="p-3 text-center">Ver Ocupantes (CRM)</th>
                    <th className="p-3 text-center">Operar Finanzas</th>
                    <th className="p-3 text-center">Acceso Caseta</th>
                    <th className="p-3 text-center">Configurar Sistema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1DA] bg-white">
                  {roles.map((r, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-3 font-bold">{r.name}</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={r.viewCrm}
                          onChange={() => handleTogglePermission(rIdx, 'viewCrm')}
                          className="w-3.5 h-3.5"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={r.manageFinance}
                          onChange={() => handleTogglePermission(rIdx, 'manageFinance')}
                          className="w-3.5 h-3.5"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={r.viewSecurity}
                          onChange={() => handleTogglePermission(rIdx, 'viewSecurity')}
                          className="w-3.5 h-3.5"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={r.configureSystem}
                          onChange={() => handleTogglePermission(rIdx, 'configureSystem')}
                          className="w-3.5 h-3.5"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB: AUDIT */}
        {configSubTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-2">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">
                  Logs de Auditoría Contable y Operativa
                </h3>
                <p className="text-[10px] text-[#8C857B] mt-0.5">Bitácora inmutable de cambios en el sistema.</p>
              </div>
              <button 
                onClick={() => setAuditLogs(prev => [
                  { id: `log-${Date.now()}`, user: 'Ing. Manuel Esparza (Admin)', action: 'CONSULTA_AUDITORIA', module: 'Configuración', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), details: 'Consultó logs de auditoría contable' },
                  ...prev
                ])}
                className="bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:bg-[#F5F2ED] px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-none transition flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Actualizar Logs</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-[#E5E1DA]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                    <th className="p-3">Estampa de Tiempo</th>
                    <th className="p-3">Operario</th>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">Acción Código</th>
                    <th className="p-3">Detalle Cambiado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1DA] bg-white font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 text-[#8C857B]">{log.timestamp}</td>
                      <td className="p-3 font-sans text-xs">{log.user}</td>
                      <td className="p-3 font-sans">{log.module}</td>
                      <td className="p-3 text-[#1A1A1A] font-bold">{log.action}</td>
                      <td className="p-3 text-[#5A554F] font-sans text-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB: CONDOS */}
        {configSubTab === 'condos' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Gestión Multi-Condominio (Empresas de Administración)
              </h3>
              <p className="text-[10px] text-[#8C857B] mt-0.5">Cambie de desarrollo inmobiliario para auditar y operar en segundos.</p>
            </div>

            <div className="p-5 border border-[#E5E1DA] bg-[#F5F2ED]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#8C857B]">Condominio Seleccionado</span>
                <h4 className="font-serif italic text-xl text-[#1A1A1A] font-normal">{currentCondo}</h4>
              </div>

              <div className="flex gap-2">
                <select
                  value={currentCondo}
                  onChange={e => {
                    setCurrentCondo(e.target.value);
                    alert(`Cambiando entorno contable a: ${e.target.value}`);
                  }}
                  className="bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A]"
                >
                  {condosList.map((condo, idx) => (
                    <option key={idx} value={condo}>{condo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#E5E1DA] text-xs leading-relaxed flex items-start space-x-2 text-[#8C857B]">
              <Info className="w-4 h-4 text-[#1A1A1A] shrink-0 mt-0.5" />
              <p>
                Cada condominio cuenta con su propio repositorio en la nube, cuentas STP conciliadas, y padrón de residentes independiente. Su suscripción corporativa le permite hasta 10 condominios activos.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

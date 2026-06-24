"use client";
import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Plus, 
  Coins, 
  Upload, 
  Settings, 
  FileText, 
  TrendingUp, 
  User, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Payment, PaymentMethod } from '@/lib/types';

interface AdminFinanzasProps {
  payments: Payment[];
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
  onAddCustomPayment: (pay: Payment) => void;
}

interface Egress {
  id: string;
  concept: string;
  amount: number;
  date: string;
  category: 'payroll' | 'services' | 'vendors' | 'other';
  recipient: string;
}

const INITIAL_EGRESSES: Egress[] = [
  { id: 'eg-1', concept: 'Nómina Conserjes (Quincenal)', amount: 28500.00, date: '2026-06-15', category: 'payroll', recipient: 'Nómina Interna (5 empleados)' },
  { id: 'eg-2', concept: 'Suministro Eléctrico Áreas Comunes', amount: 14200.00, date: '2026-06-12', category: 'services', recipient: 'CFE Compañía Federal' },
  { id: 'eg-3', concept: 'Servicio Limpieza Brillamax', amount: 18000.00, date: '2026-06-10', category: 'vendors', recipient: 'Brillamax S.A. de C.V.' },
];

export default function AdminFinanzas({ 
  payments, 
  onApprovePayment, 
  onRejectPayment, 
  onAddCustomPayment 
}: AdminFinanzasProps) {
  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'aliquots' | 'conciliation' | 'egress' | 'reserve_fund' | 'gateways'>('approvals');
  
  // Egresses State
  const [egresses, setEgresses] = useState<Egress[]>(INITIAL_EGRESSES);
  
  // Egress inputs
  const [egressConcept, setEgressConcept] = useState('');
  const [egressAmount, setEgressAmount] = useState('');
  const [egressCategory, setEgressCategory] = useState<'payroll' | 'services' | 'vendors' | 'other'>('vendors');
  const [egressRecipient, setEgressRecipient] = useState('');

  // Reserve Fund State
  const [reserveFund, setReserveFund] = useState(340000.00);
  const [fundAdjustAmount, setFundAdjustAmount] = useState('');
  const [fundAdjustType, setFundAdjustType] = useState<'add' | 'remove'>('add');
  const [fundAdjustReason, setFundAdjustReason] = useState('');
  const [fundHistory, setFundHistory] = useState([
    { id: 'fh-1', amount: 25000.00, type: 'add', reason: 'Aportación mensual ordinaria Junio', date: '2026-06-10' },
    { id: 'fh-2', amount: 8000.00, type: 'remove', reason: 'Reparación bomba de agua Torre B', date: '2026-05-18' }
  ]);

  // Bank reconciliation simulator
  const [reconciledCount, setReconciledCount] = useState(0);
  const [isReconciling, setIsReconciling] = useState(false);
  const [matchedPayments, setMatchedPayments] = useState<{ id: string; ref: string; amount: number }[]>([]);

  // Stripe/PayPal Toggles
  const [stripeLive, setStripeLive] = useState(false);
  const [paypalLive, setPaypalLive] = useState(false);

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  // ACTION: Generar Alícuotas del Mes
  const handleGenerateMonthlyAliquots = () => {
    if (confirm('¿Desea generar los cargos automáticos de mantenimiento de $1,850.00 MXN para todos los departamentos? (Se simularán en la lista general)')) {
      const unitsList = ['u-101', 'u-201', 'u-205', 'u-301', 'u-402', 'u-501'];
      unitsList.forEach((unitId, idx) => {
        const customPayment: Payment = {
          id: `pay-auto-aliquot-${unitId}-${Date.now()}`,
          title: `Mantenimiento del Mes - Julio 2026`,
          description: `Cuota ordinaria de mantenimiento mensual correspondiente a Julio 2026. Generada de manera masiva.`,
          amount: 1850.00,
          dueDate: '2026-07-10',
          status: 'pending',
          category: 'maintenance',
          reference: `REF-2026-07-${unitId.substring(2)}`
        };
        onAddCustomPayment(customPayment);
      });
      alert('Se han generado con éxito 6 cargos de alícuotas del mes de Julio 2026.');
    }
  };

  // ACTION: Agregar Egreso
  const handleAddEgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!egressConcept || !egressAmount) return;

    const amount = parseFloat(egressAmount);
    if (isNaN(amount)) return;

    const newEgress: Egress = {
      id: `eg-${Date.now()}`,
      concept: egressConcept,
      amount,
      recipient: egressRecipient || 'Proveedor General',
      category: egressCategory,
      date: new Date().toISOString().substring(0, 10)
    };

    setEgresses(prev => [newEgress, ...prev]);
    
    // Auto withdraw from reserve fund if it is categorized under reserve emergencias (not simulated here but logical)
    setEgressConcept('');
    setEgressAmount('');
    setEgressRecipient('');
    alert('Egreso contable registrado con éxito.');
  };

  // ACTION: Ajustar Fondo Reserva
  const handleAdjustFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAdjustAmount || !fundAdjustReason) return;
    const amount = parseFloat(fundAdjustAmount);
    if (isNaN(amount)) return;

    if (fundAdjustType === 'remove' && amount > reserveFund) {
      alert('Error: No hay fondos suficientes para este retiro.');
      return;
    }

    const newFundVal = fundAdjustType === 'add' ? reserveFund + amount : reserveFund - amount;
    setReserveFund(newFundVal);

    const historyLog = {
      id: `fl-${Date.now()}`,
      amount,
      type: fundAdjustType,
      reason: fundAdjustReason,
      date: new Date().toISOString().substring(0, 10)
    };

    setFundHistory(prev => [historyLog, ...prev]);
    setFundAdjustAmount('');
    setFundAdjustReason('');
    alert('Ajuste contable aplicado al fondo de reserva.');
  };

  // ACTION: Conciliación Bancaria Automática
  const handleConciliationSimulate = () => {
    setIsReconciling(true);
    setMatchedPayments([]);
    
    setTimeout(() => {
      // Find all payments that are pending or under review and match them
      const matchCandidates = payments.filter(p => p.status === 'under_review' || (p.status === 'pending' && p.reference?.startsWith('REF-2026-06')));
      
      matchCandidates.forEach(p => {
        onApprovePayment(p.id);
      });

      setMatchedPayments(matchCandidates.map(p => ({
        id: p.id,
        ref: p.reference || 'REF-N/A',
        amount: p.amount
      })));

      setReconciledCount(matchCandidates.length);
      setIsReconciling(false);
      alert(`Conciliación bancaria finalizada. Se emparejaron y aprobaron ${matchCandidates.length} transferencias bancarias.`);
    }, 1500);
  };

  // Simulated Report Exports
  const handleReportDownload = (filename: string) => {
    alert(`Preparando base de datos contable de ResidenSmart...\nGenerando y compilando reporte: ${filename}\nLa descarga iniciará automáticamente en unos segundos.`);
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Contabilidad General</span>
          <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Gestión Financiera</h1>
        </div>

        {/* Report downloads */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleReportDownload('Balance_General_ResidenSmart_2026.pdf')}
            className="border border-[#E5E1DA] bg-white hover:bg-[#F5F2ED] text-[#1A1A1A] px-3.5 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Balance (PDF)</span>
          </button>
          <button 
            onClick={() => handleReportDownload('Estado_Resultados_ResidenSmart_Junio.xlsx')}
            className="border border-[#E5E1DA] bg-white hover:bg-[#F5F2ED] text-[#1A1A1A] px-3.5 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Resultados (XLS)</span>
          </button>
        </div>
      </div>

      {/* FINANCE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'approvals', label: 'Comprobantes' },
          { id: 'aliquots', label: 'Cuotas y Alícuotas' },
          { id: 'conciliation', label: 'Conciliación Bancaria' },
          { id: 'egress', label: 'Gestión Egresos' },
          { id: 'reserve_fund', label: 'Fondo Reserva' },
          { id: 'gateways', label: 'Config. Pasarelas' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border ${
              activeSubTab === tab.id 
                ? 'bg-[#1A1A1A] border-[#1a1a1a] text-white' 
                : 'bg-white border-[#E5E1DA] text-[#8C857B] hover:text-[#1A1A1A] hover:bg-[#F5F2ED]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="bg-white border border-[#E5E1DA] p-6">
        
        {/* TAB: APPROVALS */}
        {activeSubTab === 'approvals' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
              Aprobación de Transferencias y Comprobantes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {payments.filter(p => p.status === 'under_review').map((pay) => (
                <div key={pay.id} className="border border-[#E5E1DA] p-5 rounded-none space-y-4 bg-[#FDFCFB]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-[#8C857B]">{pay.reference}</span>
                      <h4 className="font-serif italic text-base leading-snug text-[#1A1A1A] mt-0.5">{pay.title}</h4>
                      <p className="text-[10px] text-[#8C857B]">Residente: Luis Martínez (Apto 402)</p>
                    </div>
                    <span className="text-base font-mono font-bold text-[#1A1A1A]">${pay.amount.toFixed(2)}</span>
                  </div>

                  <div className="p-2.5 bg-[#F5F2ED] border border-[#E5E1DA] text-[9px] text-[#8C857B] font-mono select-all">
                    Archivo comprobante: {pay.proofFile || 'transferencia_spei_628.pdf'}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onApprovePayment(pay.id);
                        alert('Pago aprobado y saldo contable conciliado.');
                      }}
                      className="flex-1 bg-[#1A1A1A] text-white py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition rounded-none cursor-pointer text-center"
                    >
                      Aprobar Transacción
                    </button>
                    <button
                      onClick={() => {
                        onRejectPayment(pay.id);
                        alert('Pago rechazado. Se notificó al residente para subir un comprobante legible.');
                      }}
                      className="bg-white text-rose-700 border border-rose-200 py-2 px-3 text-[10px] font-bold tracking-widest uppercase hover:bg-rose-50 transition rounded-none cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
              {payments.filter(p => p.status === 'under_review').length === 0 && (
                <div className="col-span-full border border-dashed border-[#E5E1DA] py-8 text-center text-[#8C857B] text-xs">
                  No hay pagos en revisión contable.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ALIQUOTS */}
        {activeSubTab === 'aliquots' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[#E5E1DA] pb-2">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">
                  Generación de Gastos Comunes (Alícuotas)
                </h3>
                <p className="text-[10px] text-[#8C857B] mt-0.5">Definición de montos fijos y generación de estados de cuenta masivos.</p>
              </div>
              <button
                onClick={handleGenerateMonthlyAliquots}
                className="bg-[#1A1A1A] text-white hover:bg-black px-4 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none transition"
              >
                Generar Alícuotas Julio
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Matriz de Coeficientes de Copropiedad</h4>
              <div className="overflow-x-auto border border-[#E5E1DA]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                      <th className="p-3">Unidad</th>
                      <th className="p-3">Copropietario</th>
                      <th className="p-3">Coeficiente</th>
                      <th className="p-3">Gasto Base (Ordinario)</th>
                      <th className="p-3">Estatus Financiero</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DA]">
                    <tr>
                      <td className="p-3 font-mono">Torre A - 101</td>
                      <td className="p-3 font-bold">Martha Gómez</td>
                      <td className="p-3 font-mono">1.25 %</td>
                      <td className="p-3 font-mono">$1,850.00 MXN</td>
                      <td className="p-3"><span className="text-emerald-700 font-bold border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] uppercase">Al día</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">Torre B - 402</td>
                      <td className="p-3 font-bold">Luis Martínez</td>
                      <td className="p-3 font-mono">1.50 %</td>
                      <td className="p-3 font-mono">$1,850.00 MXN</td>
                      <td className="p-3"><span className="text-rose-700 font-bold border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[8px] uppercase">Moroso (1)</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">Torre B - 205</td>
                      <td className="p-3 font-bold">Carlos Ruiz</td>
                      <td className="p-3 font-mono">1.30 %</td>
                      <td className="p-3 font-mono">$1,850.00 MXN</td>
                      <td className="p-3"><span className="text-emerald-700 font-bold border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] uppercase">Al día</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CONCILIATION */}
        {activeSubTab === 'conciliation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Conciliación Bancaria y Carga de Extractos
              </h3>
              <p className="text-[10px] text-[#8C857B] mt-0.5">Suba el archivo de estado de cuenta mensual (.XLSX) para procesar las transferencias en lote.</p>
            </div>

            <div className="border border-dashed border-[#E5E1DA] p-8 text-center flex flex-col items-center justify-center space-y-4 bg-[#FDFCFB]">
              <Upload className="w-8 h-8 text-[#8C857B] opacity-50 animate-bounce" />
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Cargar Estado de Cuenta</span>
                <p className="text-[10px] text-[#8C857B]">Arrastre o seleccione el reporte bancario (.xlsx, .csv)</p>
              </div>
              <button 
                onClick={handleConciliationSimulate}
                disabled={isReconciling}
                className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2 text-[9px] font-bold tracking-widest uppercase rounded-none transition disabled:opacity-50"
              >
                {isReconciling ? 'Conciliando transacciones...' : 'Autoconciliar pagos'}
              </button>
            </div>

            {matchedPayments.length > 0 && (
              <div className="space-y-3 p-4 bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <Check className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider">Conciliación exitosa</span>
                </div>
                <div className="divide-y divide-emerald-200 text-[11px] font-mono">
                  {matchedPayments.map((p, idx) => (
                    <div key={idx} className="py-1 flex justify-between text-emerald-900">
                      <span>Referencia: {p.ref}</span>
                      <span>Monto: {formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: EGRESS */}
        {activeSubTab === 'egress' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
              Gestión de Egresos, Nóminas y Servicios
            </h3>

            {/* Egress form */}
            <form onSubmit={handleAddEgress} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-[#E5E1DA] bg-[#F5F2ED]/50">
              <div className="md:col-span-2">
                <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Concepto / Descripción del Egreso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pintura de rejas exteriores"
                  className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                  value={egressConcept}
                  onChange={e => setEgressConcept(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Monto (MXN)</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 4200"
                  className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                  value={egressAmount}
                  onChange={e => setEgressAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Categoría</label>
                <select
                  className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                  value={egressCategory}
                  onChange={e => setEgressCategory(e.target.value as any)}
                >
                  <option value="vendors">Proveedores</option>
                  <option value="payroll">Nóminas / Sueldos</option>
                  <option value="services">Servicios Públicos</option>
                  <option value="other">Otros</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Proveedor / Beneficiario</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pinturas Comex S.A."
                  className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                  value={egressRecipient}
                  onChange={e => setEgressRecipient(e.target.value)}
                />
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2 rounded-none flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar</span>
                </button>
              </div>
            </form>

            {/* List of Egresses */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]">Historial de Gastos Registrados</h4>
              <div className="overflow-x-auto border border-[#E5E1DA]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2ED] text-[9px] uppercase tracking-wider font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3">Destinatario</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DA]">
                    {egresses.map((eg) => (
                      <tr key={eg.id} className="bg-white">
                        <td className="p-3 font-mono text-[#8C857B]">{eg.date}</td>
                        <td className="p-3 font-bold">{eg.concept}</td>
                        <td className="p-3 text-[#8C857B]">{eg.recipient}</td>
                        <td className="p-3 font-mono text-[10px] text-[#8C857B] uppercase">{eg.category}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-700">-{formatCurrency(eg.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESERVE_FUND */}
        {activeSubTab === 'reserve_fund' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[#E5E1DA] pb-2">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">
                  Fondo de Reserva del Condominio
                </h3>
                <p className="text-[10px] text-[#8C857B] mt-0.5">Control contable de la cuenta especial de emergencias y proyectos.</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-[#8C857B] uppercase block">Fondo Total Disponible</span>
                <span className="text-2xl font-serif font-bold text-[#1A1A1A]">{formatCurrency(reserveFund)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Adjust fund form */}
              <form onSubmit={handleAdjustFund} className="md:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                  Movimiento de Fondo
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Monto (MXN)</label>
                    <input
                      type="number"
                      required
                      placeholder="Ej: 5000"
                      className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                      value={fundAdjustAmount}
                      onChange={e => setFundAdjustAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Tipo de Operación</label>
                    <select
                      className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                      value={fundAdjustType}
                      onChange={e => setFundAdjustType(e.target.value as any)}
                    >
                      <option value="add">Depósito (Aportación)</option>
                      <option value="remove">Retiro (Gasto Extraordinario)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Razón / Justificación</label>
                    <textarea
                      required
                      placeholder="Ej: Aportación ordinaria mensual de copropiedad"
                      className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A] h-20 resize-none"
                      value={fundAdjustReason}
                      onChange={e => setFundAdjustReason(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                  >
                    Aplicar Ajuste Contable
                  </button>
                </div>
              </form>

              {/* Fund History */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                  Bitácora del Fondo de Emergencias
                </h4>
                
                <div className="divide-y divide-[#E5E1DA] border border-[#E5E1DA]">
                  {fundHistory.map((item) => (
                    <div key={item.id} className="p-3 bg-white flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <strong className="text-[#1A1A1A]">{item.reason}</strong>
                        <p className="text-[10px] text-[#8C857B] font-mono">{item.date}</p>
                      </div>
                      <span className={`font-mono font-bold ${item.type === 'add' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {item.type === 'add' ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: GATEWAYS */}
        {activeSubTab === 'gateways' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Integración de Pasarelas de Pago
              </h3>
              <p className="text-[10px] text-[#8C857B] mt-0.5">Configure las credenciales para que los residentes realicen transferencias automáticas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stripe Config */}
              <div className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Stripe Checkout</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-[#8C857B] uppercase font-mono">{stripeLive ? 'LIVE' : 'SANDBOX'}</span>
                    <button 
                      onClick={() => setStripeLive(!stripeLive)}
                      className={`w-10 h-5 border flex items-center p-0.5 cursor-pointer transition ${stripeLive ? 'bg-[#1A1A1A] border-black justify-end' : 'bg-gray-100 border-[#E5E1DA] justify-start'}`}
                    >
                      <span className="w-3.5 h-3.5 bg-white border border-[#E5E1DA]"></span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-[#8C857B] mb-0.5">Clave Pública (Public Key)</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={stripeLive ? 'pk_live_51Mzc28JResidenSmart2299' : 'pk_test_51Mzc28JResidenSmartSandbox'}
                      className="w-full bg-[#F5F2ED] border border-[#E5E1DA] px-2 py-1.5 font-mono text-[10px] text-[#8C857B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-[#8C857B] mb-0.5">Clave Secreta (Secret Key)</label>
                    <input 
                      type="password" 
                      readOnly 
                      value="sk_test_••••••••••••••••••••••••"
                      className="w-full bg-[#F5F2ED] border border-[#E5E1DA] px-2 py-1.5 font-mono text-[10px] text-[#8C857B] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PayPal Config */}
              <div className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">PayPal Commerce</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-[#8C857B] uppercase font-mono">{paypalLive ? 'LIVE' : 'SANDBOX'}</span>
                    <button 
                      onClick={() => setPaypalLive(!paypalLive)}
                      className={`w-10 h-5 border flex items-center p-0.5 cursor-pointer transition ${paypalLive ? 'bg-[#1A1A1A] border-black justify-end' : 'bg-gray-100 border-[#E5E1DA] justify-start'}`}
                    >
                      <span className="w-3.5 h-3.5 bg-white border border-[#E5E1DA]"></span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-[#8C857B] mb-0.5">Client ID</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={paypalLive ? 'PAYPAL-CLIENT-ID-LIVE-9922' : 'PAYPAL-CLIENT-ID-SANDBOX-8800'}
                      className="w-full bg-[#F5F2ED] border border-[#E5E1DA] px-2 py-1.5 font-mono text-[10px] text-[#8C857B] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

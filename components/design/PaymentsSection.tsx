"use client";
import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  Plus, 
  Upload, 
  X, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Payment, Resident } from '@/lib/types';

interface PaymentsSectionProps {
  payments: Payment[];
  resident: Resident;
  onPaySuccess: (paymentId: string, amount: number, paymentMethod: string, proofName?: string) => void;
  onAddCustomPayment: (newPayment: Payment) => void;
}

export default function PaymentsSection({ 
  payments, 
  resident, 
  onPaySuccess,
  onAddCustomPayment
}: PaymentsSectionProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Payment wizard state
  const [payStep, setPayStep] = useState<1 | 2 | 3>(1);
  const [payMethod, setPayMethod] = useState<'credit_card' | 'bank_transfer' | 'cash'>('credit_card');
  
  // Card input form
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<string | null>(null);

  // File Upload State (for proof of payment receipt)
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Payment (for simulation/testing)
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayTitle, setNewPayTitle] = useState('');
  const [newPayDesc, setNewPayDesc] = useState('');
  const [newPayAmount, setNewPayAmount] = useState('');
  const [newPayCategory, setNewPayCategory] = useState<'maintenance' | 'amenity' | 'fine' | 'other'>('other');

  // Filter payments
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const historyPayments = payments.filter(p => p.status === 'paid' || p.status === 'under_review');

  // Handle Drag & Drop behavior
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleResetWizards = () => {
    setSelectedPayment(null);
    setPayStep(1);
    setPayMethod('credit_card');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardErrors(null);
    setUploadedFile(null);
  };

  const handleStartPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPayStep(1);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setCardErrors(null);
    // Removemos la lógica del formulario y saltamos al step 3 (simulación de carga de Bancolombia)
    setPayStep(3); 
    
    // Simular carga y redireccionar a Bancolombia
    setTimeout(() => {
      window.open('https://www.bancolombia.com/personas', '_blank');
      handleCompletePayment();
    }, 2000);
  };

  const handleCompletePayment = () => {
    if (!selectedPayment) return;
    onPaySuccess(
      selectedPayment.id, 
      selectedPayment.amount, 
      payMethod,
      uploadedFile ? uploadedFile.name : undefined
    );
    handleResetWizards();
  };

  const handleCreateCustomPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newPayAmount);
    if (!newPayTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newPayment: Payment = {
      id: `custom-pay-${Date.now()}`,
      title: newPayTitle,
      description: newPayDesc || `Cargo creado autónomamente para simulación.`,
      amount: parsedAmount,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
      status: 'pending',
      category: newPayCategory,
      reference: `REF-SIM-${Math.floor(1000 + Math.random() * 9000)}`
    };

    onAddCustomPayment(newPayment);
    setShowAddPayment(false);
    setNewPayTitle('');
    setNewPayDesc('');
    setNewPayAmount('');
    setNewPayCategory('other');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <span className="px-2 py-1 text-xs rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">Mantenimiento</span>;
      case 'amenity':
        return <span className="px-2 py-1 text-xs rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">Amenidad</span>;
      case 'fine':
        return <span className="px-2 py-1 text-xs rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-100">Multa</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full font-medium bg-slate-50 text-slate-700 border border-slate-100">Otro</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estado Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div id="card-balance" className="bg-[#F5F2ED] border border-[#E5E1DA] p-6 flex flex-col justify-between relative overflow-hidden rounded-none">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-1">Tu deudor de mantenimiento</div>
            <div className="text-3xl font-serif text-[#1A1A1A]">
              {formatCurrency(resident.balance)}
            </div>
          </div>
          <div className="mt-4 flex items-center text-[9px] text-white bg-[#1A1A1A] px-3 py-1.5 font-bold tracking-widest uppercase w-fit rounded-none">
            <AlertTriangle className="w-3 h-3 mr-1.5" />
            {pendingPayments.length} cargos pendientes
          </div>
        </div>

        <div id="card-due-date" className="bg-white border border-[#E5E1DA] p-6 flex flex-col justify-between relative overflow-hidden rounded-none">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-1">Próximo Vencimiento</div>
            <div className="text-2xl font-serif text-[#1A1A1A]">
              {pendingPayments.length > 0 ? (
                <span>{pendingPayments[0].dueDate}</span>
              ) : (
                <span className="text-[#8C857B] font-normal italic">Sin pagos pendientes</span>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-bold tracking-widest uppercase text-[#8C857B]">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#8C857B]" />
            Corte ordinario: Día 10
          </div>
        </div>

        <div id="card-payment-secure" className="bg-[#1A1A1A] p-6 text-white flex flex-col justify-between relative overflow-hidden rounded-none">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C857B] mb-2 leading-none">Pagos 100% Seguros</div>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Sistema cifrado de procesamiento para tarjetas, CLABE interbancaria y validación de transferencias.
            </p>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-bold tracking-widest uppercase text-white/50">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Certificado SSL CondoSafe
          </div>
        </div>
      </div>

      {/* Tabs listados */}
      <div className="bg-white border border-[#E5E1DA] overflow-hidden rounded-none">
        <div className="px-6 py-4 border-b border-[#E5E1DA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#F5F2ED]/50">
          <div className="flex border border-[#E5E1DA] p-0.5 space-x-1 bg-white max-w-fit">
            <button
              id="tab-pending-payments"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150 ${activeTab === 'pending' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'text-[#8C857B] hover:text-[#1A1A1A]'}`}
            >
              Por Pagar ({pendingPayments.length})
            </button>
            <button
              id="tab-history-payments"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150 ${activeTab === 'history' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'text-[#8C857B] hover:text-[#1A1A1A]'}`}
            >
              Historial ({historyPayments.length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-simulate-charge"
              onClick={() => setShowAddPayment(true)}
              className="flex items-center text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] bg-white hover:bg-[#F5F2ED] border border-[#E5E1DA] px-4 py-2 transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Simular Cargo Admin
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'pending' ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {pendingPayments.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-[#8C857B] mx-auto mb-3" />
                    <h3 className="text-base font-serif italic text-[#1A1A1A]">¡Al día con tus pagos!</h3>
                    <p className="text-xs text-[#8C857B] mt-1">No tienes adeudos vigentes registrados a tu departamento.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E1DA]">
                    {pendingPayments.map((p) => (
                      <div key={p.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif italic text-base md:text-lg text-[#1A1A1A]">{p.title}</span>
                            <span className="text-[8px] font-bold tracking-widest uppercase border border-[#E5E1DA] bg-[#F5F2ED] px-2 py-0.5 text-[#1A1A1A]">{p.category === 'maintenance' ? 'Mantenimiento' : p.category === 'amenity' ? 'Amenidad' : p.category === 'fine' ? 'Multa' : 'Otro'}</span>
                          </div>
                          <p className="text-xs text-[#8C857B] leading-relaxed max-w-2xl">{p.description}</p>
                          <div className="flex items-center space-x-4 text-[10px] text-[#8C857B]">
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-[#8C857B]" />
                              Vence el: <strong className="ml-1 text-[#1A1A1A]">{p.dueDate}</strong>
                            </span>
                            <span>Ref: <strong className="text-[#1A1A1A] font-mono">{p.reference}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0 border-[#E5E1DA]">
                          <div className="text-left md:text-right">
                            <span className="text-[9px] font-bold tracking-widest uppercase text-[#8C857B] block">Total a pagar</span>
                            <span className="text-lg font-serif text-[#1A1A1A]">{formatCurrency(p.amount)}</span>
                          </div>
                          <button
                            id={`btn-pay-${p.id}`}
                            onClick={() => handleStartPayment(p)}
                            className="bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold tracking-widest uppercase px-5 py-3 transition flex items-center shrink-0 rounded-none cursor-pointer"
                          >
                            Pagar Ahora
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {historyPayments.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm">Aún no hay transacciones en tu historial.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-slate-150 text-slate-400 font-medium">
                          <th className="pb-3 font-medium">Concepto</th>
                          <th className="pb-3 font-medium">Referencia</th>
                          <th className="pb-3 font-medium">Método</th>
                          <th className="pb-3 font-medium">Fecha de Pago</th>
                          <th className="pb-3 font-medium">Monto</th>
                          <th className="pb-3 font-medium text-right font-medium">Estado / Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {historyPayments.map((p) => {
                          let methodText = 'Tarjeta de Crédito';
                          if (p.paymentMethod === 'bank_transfer') methodText = 'Transferencia SPEI';
                          if (p.paymentMethod === 'cash') methodText = 'Depósito validado';

                          return (
                            <tr key={p.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4">
                                <div className="font-semibold text-slate-800">{p.title}</div>
                                <div className="text-[11px] text-slate-400">{getCategoryBadge(p.category)}</div>
                              </td>
                              <td className="py-4 text-slate-500 font-mono">{p.reference || 'N/A'}</td>
                              <td className="py-4 text-slate-500 flex items-center h-[52px]">
                                <CreditCard className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                {methodText}
                              </td>
                              <td className="py-4 text-slate-500">{p.paidAt || 'Pendiente de procesar'}</td>
                              <td className="py-4 text-slate-900 font-semibold font-sans">{formatCurrency(p.amount)}</td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {p.status === 'under_review' ? (
                                    <span className="px-2.5 py-1 text-xs rounded-full font-semibold border bg-amber-50 text-amber-700 border-amber-200/60 inline-flex items-center">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                                      En Revisión
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 text-xs rounded-full font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/50 inline-flex items-center">
                                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                                      Pagado
                                    </span>
                                  )}
                                  
                                  <button
                                    id={`btn-receipt-${p.id}`}
                                    onClick={() => {
                                      alert(`Visualizando recibo fiscal en formato PDF para el folio: ${p.reference}. Descarga iniciada.`);
                                    }}
                                    className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold flex items-center transition"
                                    title="Descargar comprobante en PDF"
                                  >
                                    <Download className="w-3.5 h-3.5 mr-1" />
                                    PDF
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL: WIZARD DE PAGO */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleResetWizards}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative z-10 border border-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Procedimiento de Pago Seguro</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedPayment.title}</p>
                </div>
                <button 
                  onClick={handleResetWizards}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="px-6 py-3 border-b border-slate-100/75 bg-slate-50/50 flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${payStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
                  <span className={`text-xs font-semibold ${payStep >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>Método</span>
                </div>
                <div className="w-8 h-px bg-slate-200"></div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${payStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                  <span className={`text-xs font-semibold ${payStep >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>Detalles</span>
                </div>
                <div className="w-8 h-px bg-slate-200"></div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${payStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                  <span className={`text-xs font-semibold ${payStep >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>Comprobación</span>
                </div>
              </div>

              {/* Contenido Wizards */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {payStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100/60 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-xs text-indigo-500 font-semibold block">Total a Facturar:</span>
                        <span className="text-2xl font-bold text-indigo-900 font-sans">{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Ref: {selectedPayment.reference}</span>
                    </div>

                    <p className="text-xs text-slate-500">¿Cómo deseas efectuar tu pago de manera electrónica?</p>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Tarjeta */}
                      <button
                        type="button"
                        onClick={() => setPayMethod('credit_card')}
                        className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${payMethod === 'credit_card' 
                          ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600' 
                          : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <CreditCard className={`w-5 h-5 mt-0.5 ${payMethod === 'credit_card' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Tarjeta de Crédito o Débito</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Acreditación instantánea. Soporta Visa, Mastercard y Amex.</span>
                        </div>
                      </button>

                      {/* Transferencia */}
                      <button
                        type="button"
                        onClick={() => setPayMethod('bank_transfer')}
                        className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${payMethod === 'bank_transfer' 
                          ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600' 
                          : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <Receipt className={`w-5 h-5 mt-0.5 ${payMethod === 'bank_transfer' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Transferencia Interbancaria (SPEI CLABE)</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Transferencia directa sin comisiones. Aprobación en 5 minutos.</span>
                        </div>
                      </button>

                      {/* Depósito / Físico */}
                      <button
                        type="button"
                        onClick={() => setPayMethod('cash')}
                        className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${payMethod === 'cash' 
                          ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600' 
                          : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <Upload className={`w-5 h-5 mt-0.5 ${payMethod === 'cash' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Subir Ficha de Pago / Depósito Físico</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Si pagaste en ventanilla bancaria u OXXO. Requiere validación de administración.</span>
                        </div>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setPayStep(2)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center transition"
                      >
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                )}

                {payStep === 2 && (
                  <form onSubmit={handleProcessPayment} className="space-y-4">
                    {payMethod === 'credit_card' && (
                      <div className="space-y-3.5">
                        <div className="text-slate-500 text-xs mb-2">Ingresa de forma segura los datos de tu tarjeta bancaria:</div>
                        
                        <div>
                          <label className="text-slate-600 text-xs font-medium block mb-1">Nombre del Titular</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ej. Luis Martínez Rosales"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 text-xs font-medium block mb-1">Número de Tarjeta</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              required
                              maxLength={19}
                              placeholder="4152 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => {
                                // Simple formating of card numbers
                                const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCardNumber(val);
                              }}
                              className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition font-mono"
                            />
                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-600 text-xs font-medium block mb-1">Vencimiento (MM/AA)</label>
                            <input 
                              type="text" 
                              required
                              maxLength={5}
                              placeholder="09/29"
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) {
                                  val = val.substring(0,2) + '/' + val.substring(2,4);
                                }
                                setCardExpiry(val);
                              }}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-600 text-xs font-medium block mb-1">Código CVV</label>
                            <input 
                              type="password" 
                              required
                              maxLength={4}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {payMethod === 'bank_transfer' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-sans">
                          <span className="text-xs text-slate-500 font-medium block">Datos de transferencia (Destino):</span>
                          
                          <div className="grid grid-cols-3 text-xs gap-y-2 border-b border-slate-200/50 pb-2">
                            <span className="text-slate-400">Banco:</span>
                            <span className="text-slate-600 col-span-2 font-bold">STP / CondoSeguro Bank</span>

                            <span className="text-slate-400">Beneficiario:</span>
                            <span className="text-slate-600 col-span-2 font-bold">ResidenSmart AC</span>

                            <span className="text-slate-400">CLABE Interbancaria:</span>
                            <span className="text-indigo-600 col-span-2 font-mono font-bold flex items-center">
                              0121 8000 4022 5588 32
                            </span>
                          </div>

                          <div className="text-xs flex justify-between items-center text-[11px] pt-1 text-slate-500 leading-relaxed">
                            <span>Sugerencia de Concepto: <strong className="text-slate-700">Torre B 402</strong></span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('0121 8000 4022 5588 32');
                                alert('CLABE copiada al portapapeles.');
                              }}
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              Copiar CLABE
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Al hacer clic en confirmar, nuestro sistema verificará la recepción estética de los fondos de forma automática a través de nuestra API STP integrada. No necesitas enviar captura.
                          </p>
                        </div>
                      </div>
                    )}

                    {payMethod === 'cash' && (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-500 leading-relaxed">
                          Por favor, realiza tu pago en ventanilla o comercio corresponsal utilizando la referencia <strong className="text-slate-700 font-mono">{selectedPayment.reference}</strong>. Sube la foto o PDF del comprobante:
                        </div>

                        {/* DRAG AND DROP ZONE */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={triggerFileInput}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                            dragActive 
                              ? 'border-indigo-600 bg-indigo-50/50' 
                              : uploadedFile 
                                ? 'border-emerald-500 bg-emerald-50/20' 
                                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                          }`}
                        >
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                          />
                          
                          {uploadedFile ? (
                            <div className="space-y-2">
                              <FileCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                              <div className="text-xs font-bold text-slate-700">{uploadedFile.name}</div>
                              <div className="text-[11px] text-slate-400">Tamaño: {uploadedFile.size}</div>
                              <span className="text-xs text-indigo-600 inline-block font-semibold hover:underline">Reemplazar archivo</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                              <div className="text-xs font-semibold text-slate-700">Arrastra tu comprobante aquí o camina y búscalo</div>
                              <p className="text-[11px] text-slate-400 mt-1">Soporta imágenes JPG, PNG o PDF de hasta 8MB.</p>
                            </div>
                          )}
                        </div>

                        {uploadedFile && (
                          <div className="text-xs flex justify-between items-center text-slate-500 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                            <span>Comprobante listo</span>
                            <button 
                              type="button" 
                              onClick={() => setUploadedFile(null)}
                              className="text-rose-500 hover:text-rose-600 font-bold"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {cardErrors && (
                      <p className="text-xs text-rose-500 font-medium">{cardErrors}</p>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPayStep(1)}
                        className="text-slate-500 hover:text-slate-700 font-semibold text-sm"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center transition"
                      >
                        Confirmar y Finalizar Pago
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </form>
                )}

                {payStep === 3 && (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-spin">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-800">Redirigiendo...</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Te estamos enviando a la plataforma segura de Bancolombia para completar tu transacción.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs space-y-1.5 text-left max-w-sm mx-auto font-sans">
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5 mb-1.5 font-bold">
                        <span className="text-slate-500">Folio de Operación</span>
                        <span className="text-slate-800 font-mono">TX-{selectedPayment.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Concepto:</span>
                        <span className="text-slate-700 font-semibold">{selectedPayment.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cargado a:</span>
                        <span className="text-slate-700 font-medium">Torre B - Depto 402</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monto:</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Método de pago:</span>
                        <span className="text-slate-700 font-medium">
                          {payMethod === 'credit_card' ? 'Tarjeta bancaria' : payMethod === 'bank_transfer' ? 'Transferencia' : 'Carga de comprobante'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center space-x-3">
                      <button
                        onClick={() => {
                          alert('Descarga de factura digital PDF/XML iniciada con éxito.');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1.5 text-slate-500" />
                        Comprobante PDF
                      </button>
                      
                      <button
                        onClick={handleCompletePayment}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SIMULADOR CARGO ADMINISTRADOR */}
      <AnimatePresence>
        {showAddPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPayment(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative z-10 border border-slate-100"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-base">Crear Cargo de Prueba (Simulador)</h3>
                <button 
                  onClick={() => setShowAddPayment(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomPayment} className="p-6 space-y-4">
                <div className="p-3 bg-indigo-50 text-indigo-800 text-xs rounded-xl border border-indigo-150 leading-relaxed font-sans">
                  Usa esta herramienta para simular un cargo nuevo emitido por la administración. Esto incrementará tu monto pendiente de pago inmediatamente.
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">Título del Cargo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Multa por ruido / Cuota Extra de Gas"
                    value={newPayTitle}
                    onChange={(e) => setNewPayTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1 font-medium">Descripción</label>
                  <textarea 
                    rows={2}
                    placeholder="Escribe el justificante detallado del cobro..."
                    value={newPayDesc}
                    onChange={(e) => setNewPayDesc(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1 font-medium">Monto ($ MXN)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="1200"
                      value={newPayAmount}
                      onChange={(e) => setNewPayAmount(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">Categoría</label>
                    <select
                      value={newPayCategory}
                      onChange={(e: any) => setNewPayCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition bg-white"
                    >
                      <option value="maintenance">Mantenimiento</option>
                      <option value="amenity">Amenidad</option>
                      <option value="fine">Multa</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Crear Cargo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Droplet, 
  Zap, 
  PenTool, 
  Check, 
  Send, 
  Info,
  Lock 
} from 'lucide-react';

interface ChatMsg {
  sender: 'user' | 'ai';
  text: string;
}

interface Contract {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'signed';
  date: string;
}

export default function AdminTecnologia() {
  const [techSubTab, setTechSubTab] = useState<'ai' | 'iot' | 'signature'>('ai');
  
  // AI assistant states
  const [aiChat, setAiChat] = useState<ChatMsg[]>([
    { sender: 'ai', text: 'Hola, Manuel. Soy el Asistente AI de ResidenSmart. Puedo redactar circulares, analizar morosidad en tiempo real, o redactar multas según el reglamento. ¿En qué te ayudo hoy?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // IoT smart meters states
  const [iotUnits, setIotUnits] = useState([
    { unit: '101 (M. Gómez)', water: 12.4, power: 185, leakWarning: false },
    { unit: '402 (L. Martínez)', water: 25.8, power: 340, leakWarning: true }, // high water usage
    { unit: '205 (C. Ruiz)', water: 9.1, power: 142, leakWarning: false }
  ]);

  // Digital Signatures state
  const [contracts, setContracts] = useState<Contract[]>([
    { id: 'c-1', title: 'Acta de Asamblea Extraordinaria - Jun 2026', type: 'Asamblea Actas', status: 'pending', date: '2026-06-15' },
    { id: 'c-2', title: 'Contrato Mantenimiento Elevadores - Otis 2026', type: 'Contratos Proveedor', status: 'pending', date: '2026-06-24' }
  ]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>('c-2');
  const [typedSignature, setTypedSignature] = useState('');

  // ACTION: AI Query Answer Simulation
  const handleSendAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);

    setTimeout(() => {
      let aiResponse = '';
      const query = userMsg.toLowerCase();

      if (query.includes('moroso') || query.includes('morosidad')) {
        aiResponse = 'Analizando cartera vencida... El mayor moroso del condominio es la unidad Torre B-402 (Luis Martínez) con un adeudo de $2,150.00 MXN correspondiente a la cuota ordinaria de mantenimiento de Junio y la reservación del salón de eventos.';
      } else if (query.includes('multa') || query.includes('ruido')) {
        aiResponse = 'Para multar por ruido excesivo, te sugiero la siguiente redacción:\n\n"Por medio de la presente, se notifica la sanción correspondiente a la unidad X debido a la violación del artículo 12 del reglamento interno (exceso de ruido después de las 22:00 hrs) detectado el día DD/MM/AAAA. Se realiza un cargo automático de $1,000.00 MXN a su estado de cuenta."';
      } else if (query.includes('agua') || query.includes('fuga')) {
        aiResponse = 'De acuerdo a la telemetría IoT, la unidad Torre B-402 (Luis Martínez) registra un consumo de agua anormalmente alto de 25.8m³ en las últimas 24 horas. Sugiero enviar una brigada técnica para evaluar una fuga activa en sus tuberías internas.';
      } else {
        aiResponse = `Entendido. He registrado tu consulta sobre "${userMsg}". Actualmente puedo asistirte con análisis de telemetría de medidores de agua/luz, resúmenes de asambleas pasadas o estadísticas de cobros ordinarios.`;
      }

      setAiChat(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setAiLoading(false);
    }, 1200);
  };

  // ACTION: Sign Document
  const handleSignContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !typedSignature) return;

    setContracts(prev => prev.map(c => {
      if (c.id === selectedContractId) {
        return {
          ...c,
          status: 'signed'
        };
      }
      return c;
    }));

    setTypedSignature('');
    alert(`Contrato firmado digitalmente bajo el estándar ResidenSmart Sign. Firma encriptada de: ${typedSignature}`);
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Tecnología Inteligente</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Valor Agregado y Tendencias</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'ai', label: 'Asistente de IA', icon: Sparkles },
          { id: 'iot', label: 'Medidores IoT', icon: Cpu },
          { id: 'signature', label: 'Firma Digital', icon: PenTool }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTechSubTab(tab.id as any)}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                techSubTab === tab.id 
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
        
        {/* SUBTAB: AI CHATBOT */}
        {techSubTab === 'ai' && (
          <div className="border border-[#E5E1DA] p-4 bg-[#FDFCFB] flex flex-col justify-between min-h-[420px]">
            {/* Header info */}
            <div className="p-3 bg-[#F5F2ED] text-xs leading-relaxed flex items-center space-x-2 border-b border-[#E5E1DA] mb-4">
              <Sparkles className="w-4.5 h-4.5 text-[#1A1A1A] animate-pulse" />
              <p>
                <strong className="font-bold">ResidenSmart IA Engine:</strong> Asistente predictivo de morosidad y redacción inteligente de avisos.
              </p>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-60 px-2 py-4">
              {aiChat.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-md p-3 border text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1A1A1A] border-black text-white'
                      : 'bg-white border-[#E5E1DA] text-[#1A1A1A] whitespace-pre-wrap'
                  }`}>
                    {msg.sender === 'ai' && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C857B] block mb-1">
                        ResidenSmart AI Helper
                      </span>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center space-x-2 text-[10px] text-[#8C857B] font-mono animate-pulse">
                  <span>IA pensando respuestas...</span>
                </div>
              )}
            </div>

            {/* Suggestions buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E5E1DA] mb-3">
              <button 
                onClick={() => setAiInput('Quién es el moroso más grande?')}
                className="bg-[#F5F2ED] hover:bg-[#E5E1DA] text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 text-[#1A1A1A] border border-[#E5E1DA]"
              >
                ¿Quién es el moroso?
              </button>
              <button 
                onClick={() => setAiInput('Cómo redactar una multa por ruido?')}
                className="bg-[#F5F2ED] hover:bg-[#E5E1DA] text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 text-[#1A1A1A] border border-[#E5E1DA]"
              >
                ¿Redacción de multa por ruido?
              </button>
              <button 
                onClick={() => setAiInput('Alertas de fugas de agua')}
                className="bg-[#F5F2ED] hover:bg-[#E5E1DA] text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 text-[#1A1A1A] border border-[#E5E1DA]"
              >
                ¿Fugas detectadas?
              </button>
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendAiQuery} className="flex gap-2">
              <input
                type="text"
                placeholder="Pregunte a la IA sobre morosidad, consumos, reglamentos..."
                className="flex-1 bg-white border border-[#E5E1DA] px-3.5 py-2.5 text-xs outline-none focus:border-[#1A1A1A]"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-[#1A1A1A] hover:bg-black text-white px-6 py-2.5 text-[9px] font-bold tracking-widest uppercase transition rounded-none cursor-pointer border border-black disabled:opacity-50"
              >
                Preguntar
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB: IOT TELEMETRY */}
        {techSubTab === 'iot' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E1DA] pb-2 flex justify-between items-end">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">
                  Telemetría IoT de Consumos
                </h3>
                <p className="text-[10px] text-[#8C857B] mt-0.5">Lectura automatizada en tiempo real de medidores inteligentes integrados por departamento.</p>
              </div>
              <span className="text-[9px] font-mono text-emerald-600 font-bold animate-pulse">● Sensores IoT en línea</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {iotUnits.map((u, idx) => (
                <div key={idx} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-2">
                    <h4 className="font-serif italic text-base text-[#1A1A1A]">Unidad {u.unit}</h4>
                    <span className="text-[9px] font-mono text-[#8C857B] uppercase">ID: MET-0{idx+1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C857B] flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-sky-500" />
                        <span>Agua del Mes</span>
                      </span>
                      <strong className="text-sm font-mono text-[#1A1A1A]">{u.water} m³</strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C857B] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Electricidad</span>
                      </span>
                      <strong className="text-sm font-mono text-[#1A1A1A]">{u.power} kWh</strong>
                    </div>
                  </div>

                  {/* Leak Warning active */}
                  {u.leakWarning ? (
                    <div className="border border-rose-200 bg-rose-50 text-rose-800 p-2 text-[10px] leading-relaxed flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
                      <span><strong>Alerta:</strong> Consumo de agua inusual. Fuga detectada en cisternas internas.</span>
                    </div>
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 p-2 text-[10px] leading-relaxed flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Flujo y lectura estable.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB: DIGITAL SIGNATURE */}
        {techSubTab === 'signature' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Agreements Selector */}
            <div className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#FDFCFB] divide-y divide-[#E5E1DA]">
              <h3 className="text-[10px] font-bold tracking-wider uppercase text-[#8C857B] pb-2">Documentos por Firmar</h3>
              {contracts.map(c => {
                const isActive = selectedContractId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContractId(c.id)}
                    className={`py-3.5 cursor-pointer text-xs transition ${
                      isActive ? 'bg-[#F5F2ED] font-bold px-2' : 'hover:bg-[#F5F2ED]/50 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="truncate">{c.title}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-[#8C857B] mt-1">
                      <span>{c.type}</span>
                      <span className={c.status === 'signed' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {c.status === 'signed' ? 'FIRMADO' : 'PENDIENTE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Signature form console */}
            <div className="lg:col-span-2">
              {selectedContractId ? (() => {
                const contract = contracts.find(c => c.id === selectedContractId);
                if (!contract) return null;

                return (
                  <form onSubmit={handleSignContract} className="border border-[#E5E1DA] p-6 bg-[#FDFCFB] space-y-6">
                    <div className="border-b border-[#E5E1DA] pb-3">
                      <span className="text-[9px] font-mono text-[#8C857B]">Consola de Validez Legal • ResidenSmart Sign</span>
                      <h4 className="text-lg font-serif italic text-[#1A1A1A] font-normal mt-0.5">{contract.title}</h4>
                      <p className="text-xs text-[#8C857B] mt-1">Generado para firmar el {contract.date}</p>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed text-[#5A554F] p-4 bg-[#F5F2ED]/50 border border-[#E5E1DA]">
                      <p>
                        El firmante, actuando como Administrador General de ResidenSmart Condominios, certifica bajo firma electrónica que aprueba y ratifica todas las cláusulas, términos y estatutos descritos en el documento legal correspondiente.
                      </p>
                      <p className="text-[10px] text-[#8C857B] font-mono flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#1A1A1A]" />
                        <span>Firma protegida bajo leyes de Transparencia Digital</span>
                      </p>
                    </div>

                    {contract.status === 'pending' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Escriba su Nombre Completo para firmar</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Ing. Manuel Esparza"
                            className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3 py-2 text-xs outline-none font-serif italic text-lg"
                            value={typedSignature}
                            onChange={e => setTypedSignature(e.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 px-6 rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PenTool className="w-4 h-4" />
                          <span>Firma Electrónica Autorizada</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <Check className="w-5 h-5 shrink-0" />
                        <span>Documento firmado electrónicamente. Registro Hash SHA-256 inmutable guardado.</span>
                      </div>
                    )}
                  </form>
                );
              })() : (
                <div className="border border-dashed border-[#E5E1DA] bg-white py-12 text-center text-[#8C857B] text-xs">
                  Seleccione un acuerdo o acta de asamblea a la izquierda para proceder con la firma digital.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { 
  Megaphone, 
  MessageSquare, 
  Vote, 
  Calendar, 
  Send, 
  Image, 
  Plus, 
  Trash2, 
  User, 
  Lock 
} from 'lucide-react';
import { Announcement } from '@/lib/types';

interface Poll {
  id: string;
  title: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  expiresAt: string;
  isLegal: boolean;
  status: 'active' | 'closed';
}

interface ChatMessage {
  id: string;
  sender: 'admin' | 'resident';
  text: string;
  timestamp: string;
  image?: string;
}

const INITIAL_POLLS: Poll[] = [
  {
    id: 'p-1',
    title: 'Aprobación de Pintura Exterior - Fachada Principal 2026',
    options: [
      { text: 'Opción A: Gris Grafito y Blanco Marfil', votes: 14 },
      { text: 'Opción B: Arena Colonial y Café Tabaco', votes: 8 },
      { text: 'Abstención / No Aprobar Gasto', votes: 2 }
    ],
    totalVotes: 24,
    expiresAt: '2026-07-01',
    isLegal: true,
    status: 'active'
  },
  {
    id: 'p-2',
    title: 'Adquisición de Cámaras de Seguridad Adicionales para Sótano 2',
    options: [
      { text: 'Sí, autorizar presupuesto extraordinario ($15,000 MXN)', votes: 19 },
      { text: 'No, posponer hasta asamblea general presencial', votes: 3 }
    ],
    totalVotes: 22,
    expiresAt: '2026-06-20',
    isLegal: false,
    status: 'closed'
  }
];

const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  'Luis Martínez (402)': [
    { id: '1', sender: 'resident', text: 'Hola, administradores. Tienen alguna actualización sobre la humedad del pasillo?', timestamp: '2026-06-24 09:15' },
    { id: '2', sender: 'admin', text: 'Hola Luis. El plomero Ing. Carlos Gutiérrez ya inspeccionó. Se realizará el cambio de tubería mañana temprano.', timestamp: '2026-06-24 09:30' }
  ],
  'Martha Gómez (101)': [
    { id: '1', sender: 'resident', text: 'Buenos días. Quisiera reportar que la lámpara del pasillo exterior del 101 está fundida.', timestamp: '2026-06-23 10:00' },
    { id: '2', sender: 'admin', text: 'Enterado Martha. Hoy mismo va el electricista de guardia a cambiarla.', timestamp: '2026-06-23 10:15' }
  ]
};

const INITIAL_EVENTS = [
  { id: 'e-1', title: 'Fumigación General de Jardines', date: '2026-06-20', time: '10:00 - 15:00', type: 'maintenance' },
  { id: 'e-2', title: 'Asamblea General Ordinaria', date: '2026-07-05', time: '18:00 - 20:30', type: 'assembly' },
  { id: 'e-3', title: 'Corte Programado de Agua (Mantenimiento Cisternas)', date: '2026-06-28', time: '08:00 - 12:00', type: 'urgent' }
];

interface AdminComunidadProps {
  announcements: Announcement[];
  onAddAnnouncement: (ann: Announcement) => void;
}

export default function AdminComunidad({ announcements, onAddAnnouncement }: AdminComunidadProps) {
  const [comSubTab, setComSubTab] = useState<'wall' | 'chat' | 'polls' | 'calendar'>('wall');

  // Announcements State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'info' | 'maintenance' | 'urgente' | 'event'>('info');

  // Chat State
  const [activeChatUser, setActiveChatUser] = useState<string>('Luis Martínez (402)');
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_CHATS);
  const [chatInput, setChatInput] = useState('');
  const [chatImageName, setChatImageName] = useState<string | null>(null);

  // Polls State
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [newPollIsLegal, setNewPollIsLegal] = useState(false);

  // Events State
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState('maintenance');

  // Action: Add Announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: `ann-crm-${Date.now()}`,
      title: annTitle,
      content: annContent,
      date: new Date().toISOString().substring(0, 10),
      category: annCategory,
      author: 'Administrador Residente'
    };

    onAddAnnouncement(newAnn);
    setAnnTitle('');
    setAnnContent('');
    alert('Comunicado oficial publicado con éxito en el muro.');
  };

  // Action: Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatImageName) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: chatInput,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      image: chatImageName ? '/placeholder.png' : undefined // Simulated
    };

    setChats(prev => ({
      ...prev,
      [activeChatUser]: [...(prev[activeChatUser] || []), newMsg]
    }));

    setChatInput('');
    setChatImageName(null);

    // Simulate reply after 1.5s
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'resident',
        text: 'Enterado. Muchas gracias por la pronta respuesta.',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setChats(prev => ({
        ...prev,
        [activeChatUser]: [...(prev[activeChatUser] || []), autoReply]
      }));
    }, 1500);
  };

  // Action: Add Poll Option
  const handleAddPollOption = () => {
    setNewPollOptions(prev => [...prev, '']);
  };

  // Action: Create Poll
  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitle || newPollOptions.some(opt => !opt.trim())) return;

    const newPoll: Poll = {
      id: `p-${Date.now()}`,
      title: newPollTitle,
      options: newPollOptions.map(text => ({ text, votes: 0 })),
      totalVotes: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      isLegal: newPollIsLegal,
      status: 'active'
    };

    setPolls(prev => [newPoll, ...prev]);
    setNewPollTitle('');
    setNewPollOptions(['', '']);
    setNewPollIsLegal(false);
    alert('Nueva votación digital iniciada.');
  };

  // Action: Add Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;

    const newEvent = {
      id: `e-${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      time: eventTime || 'Todo el día',
      type: eventType
    };

    setEvents(prev => [newEvent, ...prev]);
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    alert('Evento de comunidad agendado y publicado.');
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[#E5E1DA] pb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8C857B] uppercase block">Canales Comunes</span>
        <h1 className="text-3xl font-serif italic text-[#1A1A1A] font-normal">Comunicación y Comunidad</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E1DA] pb-2">
        {[
          { id: 'wall', label: 'Muro de Anuncios', icon: Megaphone },
          { id: 'chat', label: 'Mensajería Directa', icon: MessageSquare },
          { id: 'polls', label: 'Encuestas y Votaciones', icon: Vote },
          { id: 'calendar', label: 'Calendario de Eventos', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setComSubTab(tab.id as 'wall' | 'chat' | 'polls' | 'calendar')}
              className={`py-1.5 px-3.5 text-[9px] font-bold tracking-widest uppercase transition-all border flex items-center gap-1.5 ${
                comSubTab === tab.id 
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
        
        {/* SUBTAB: WALL */}
        {comSubTab === 'wall' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Announcement Form */}
            <form onSubmit={handlePublishAnnouncement} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Redactar Comunicado
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Título del Comunicado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mantenimiento de cisternas"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A]"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Categoría</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A]"
                    value={annCategory}
                    onChange={e => setAnnCategory(e.target.value as 'info' | 'maintenance' | 'urgente' | 'event')}
                  >
                    <option value="info">Información General</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="urgente">Urgente / Alerta</option>
                    <option value="event">Evento Social</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Cuerpo del Comunicado</label>
                  <textarea
                    required
                    placeholder="Redacte las especificaciones y fechas del aviso aquí..."
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A] h-32 resize-none"
                    value={annContent}
                    onChange={e => setAnnContent(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Publicar en el Muro
                </button>
              </div>
            </form>

            {/* Announcements List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Anuncios Oficiales Activos ({announcements.length})
              </h3>
              
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] text-xs space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className={`px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase border ${
                        ann.category === 'urgente'
                          ? 'border-rose-200 bg-rose-50 text-rose-800'
                          : 'border-[#CEC7BC] bg-[#F5F2ED] text-[#1A1A1A]'
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#8C857B]">{ann.date}</span>
                    </div>
                    <h4 className="font-serif italic text-base text-[#1A1A1A]">{ann.title}</h4>
                    <p className="text-[#5A554F] leading-relaxed">{ann.content}</p>
                    <div className="pt-2 border-t border-[#E5E1DA] text-[9px] uppercase tracking-wider text-[#8C857B]">
                      Publicado por: {ann.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: CHAT */}
        {comSubTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 border border-[#E5E1DA] min-h-[450px]">
            {/* Direct messages directory */}
            <div className="lg:col-span-1 border-r border-[#E5E1DA] divide-y divide-[#E5E1DA] bg-[#FDFCFB]">
              <div className="p-3 bg-[#F5F2ED] text-[9px] uppercase tracking-widest font-bold text-[#8C857B] border-b border-[#E5E1DA]">
                Residentes con Hilos Activos
              </div>
              {Object.keys(chats).map(user => {
                const isActive = activeChatUser === user;
                const lastMsg = chats[user][chats[user].length - 1];
                return (
                  <div
                    key={user}
                    onClick={() => setActiveChatUser(user)}
                    className={`p-4 cursor-pointer text-xs transition-colors ${
                      isActive ? 'bg-[#F5F2ED] border-l-2 border-[#1A1A1A]' : 'hover:bg-[#F5F2ED]/50 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-[#1A1A1A]">{user}</span>
                      <span className="text-[8px] font-mono text-[#8C857B]">{lastMsg?.timestamp.split(' ')[1]}</span>
                    </div>
                    <p className="text-[10px] text-[#8C857B] truncate">{lastMsg?.text || 'Subió una foto...'}</p>
                  </div>
                );
              })}
            </div>

            {/* Chat thread */}
            <div className="lg:col-span-2 flex flex-col h-full bg-white justify-between">
              {/* Chat Header */}
              <div className="p-3 border-b border-[#E5E1DA] bg-[#FDFCFB] flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#1A1A1A]">{activeChatUser}</span>
                  <span className="text-[9px] text-emerald-600 block">En línea (Simulado)</span>
                </div>
              </div>

              {/* Thread box */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[300px]">
                {chats[activeChatUser]?.map(msg => {
                  const isSelf = msg.sender === 'admin';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-xs p-3 border text-xs leading-relaxed ${
                        isSelf 
                          ? 'bg-[#1A1A1A] border-black text-white' 
                          : 'bg-[#F5F2ED] border-[#E5E1DA] text-[#1A1A1A]'
                      }`}>
                        <p>{msg.text}</p>
                        {msg.image && (
                          <div className="mt-2 border border-dashed border-[#8C857B] p-2 bg-[#F5F2ED] text-[9px] text-[#8C857B] font-mono flex items-center gap-1.5">
                            <Image className="w-3.5 h-3.5" />
                            <span>comprobante_adjunto.png</span>
                          </div>
                        )}
                        <span className="text-[7px] opacity-60 block mt-1 text-right">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input section */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-[#E5E1DA] bg-[#FDFCFB] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChatImageName(chatImageName ? null : 'evidencia_foto.jpg');
                    alert('Imagen adjuntada al chat (simulado).');
                  }}
                  className={`p-2.5 border transition ${chatImageName ? 'bg-[#1A1A1A] border-black text-white' : 'bg-white border-[#E5E1DA] text-[#8C857B] hover:bg-[#F5F2ED]'}`}
                  title="Adjuntar Imagen"
                >
                  <Image className="w-4 h-4" />
                </button>
                
                <input
                  type="text"
                  placeholder={chatImageName ? 'Imagen adjuntada. Escribe pie de foto o presiona Enviar...' : 'Escribe un mensaje de respuesta directa...'}
                  className="flex-1 bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A]"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                
                <button
                  type="submit"
                  className="bg-[#1A1A1A] text-white hover:bg-black p-2.5 rounded-none flex items-center justify-center shrink-0 border border-black cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SUBTAB: POLLS */}
        {comSubTab === 'polls' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create poll form */}
            <form onSubmit={handleCreatePoll} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Lanzar Encuesta
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Título de la Consulta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pintura de la fachada central"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none focus:border-[#1A1A1A]"
                    value={newPollTitle}
                    onChange={e => setNewPollTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B]">Opciones de Respuesta</label>
                  {newPollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required
                      placeholder={`Opción ${idx + 1}`}
                      className="w-full bg-white border border-[#E5E1DA] px-3 py-1.5 text-xs outline-none focus:border-[#1A1A1A]"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...newPollOptions];
                        newOpts[idx] = e.target.value;
                        setNewPollOptions(newOpts);
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] hover:underline"
                  >
                    + Agregar Opción
                  </button>
                </div>

                {/* Legal signature checkbox */}
                <div className="flex items-center space-x-2 border-t border-[#E5E1DA] pt-3">
                  <input
                    type="checkbox"
                    id="legal-sig"
                    checked={newPollIsLegal}
                    onChange={e => setNewPollIsLegal(e.target.checked)}
                    className="w-3.5 h-3.5 border-[#E5E1DA]"
                  />
                  <label htmlFor="legal-sig" className="text-[10px] text-[#5A554F] leading-tight select-none">
                    Requiere Firma Digital / Validez Legal (Estatutos Copropiedad)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Lanzar Encuesta Activa
                </button>
              </div>
            </form>

            {/* Polls directory */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Consultas y Decisiones Comunes
              </h3>

              <div className="space-y-4">
                {polls.map(poll => (
                  <div key={poll.id} className="border border-[#E5E1DA] p-5 bg-[#FDFCFB] text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 border ${
                        poll.status === 'active' ? 'text-emerald-800 border-emerald-200 bg-emerald-50' : 'text-[#8C857B] border-[#E5E1DA] bg-gray-50'
                      }`}>
                        {poll.status === 'active' ? 'Consulta Activa' : 'Cerrada / Concluida'}
                      </span>
                      {poll.isLegal && (
                        <span className="text-[8px] font-mono text-[#8C857B] uppercase flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Firma Legal</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif italic text-base text-[#1A1A1A] leading-tight">{poll.title}</h4>

                    {/* Results lists */}
                    <div className="space-y-2 pt-2">
                      {poll.options.map((opt, idx) => {
                        const pct = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span>{opt.text}</span>
                              <span className="font-mono font-bold">{opt.votes} votos ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-[#F5F2ED] h-2 border border-[#E5E1DA] rounded-none overflow-hidden">
                              <div className="bg-[#1A1A1A] h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#E5E1DA] flex justify-between items-center text-[10px] text-[#8C857B]">
                      <span>Vence el: {poll.expiresAt}</span>
                      <span>Total de Participación: {poll.totalVotes} departamentos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: CALENDAR */}
        {comSubTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create event form */}
            <form onSubmit={handleAddEvent} className="lg:col-span-1 border border-[#E5E1DA] p-4 bg-[#F5F2ED]/40 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-1">
                Agendar Evento
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Nombre del Evento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lectura de medidores"
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Horario</label>
                    <input
                      type="text"
                      placeholder="Ej: 09:00 - 13:00"
                      className="w-full bg-white border border-[#E5E1DA] px-2.5 py-1.5 text-xs outline-none"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-[#8C857B] mb-1">Tipo de Evento</label>
                  <select
                    className="w-full bg-white border border-[#E5E1DA] px-3 py-2 text-xs outline-none"
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                  >
                    <option value="maintenance">Mantenimiento</option>
                    <option value="assembly">Asamblea Ordinaria</option>
                    <option value="urgent">Urgencia / Suspensión</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold tracking-widest uppercase py-2.5 rounded-none"
                >
                  Agendar Evento Oficial
                </button>
              </div>
            </form>

            {/* Events schedule */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                Calendario Operativo y Social
              </h3>

              <div className="divide-y divide-[#E5E1DA] border border-[#E5E1DA]">
                {events.map((evt) => (
                  <div key={evt.id} className="p-4 bg-white flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <strong className="text-sm text-[#1A1A1A]">{evt.title}</strong>
                      <p className="text-[10px] text-[#8C857B] uppercase tracking-wider">{evt.time}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-[10px] font-mono font-bold text-[#1A1A1A] block">{evt.date}</span>
                      <span className="text-[8px] uppercase tracking-wider border border-[#E5E1DA] bg-[#F5F2ED] px-1.5 py-0.5 mt-1 inline-block">
                        {evt.type}
                      </span>
                    </div>
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

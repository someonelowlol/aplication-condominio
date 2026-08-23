"use client";
import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Plus, 
  Upload, 
  Wrench, 
  Eye, 
  X,
  FileCheck,
  Zap,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Incident, IncidentComment, IncidentCategory, IncidentPriority } from '@/lib/types';
import { useLanguage } from './LanguageProvider';

interface IncidentsSectionProps {
  incidents: Incident[];
  onAddIncident: (newIncident: Incident) => void;
  onAddComment: (incidentId: string, commentContent: string) => void;
}

export default function IncidentsSection({ 
  incidents, 
  onAddIncident, 
  onAddComment 
}: IncidentsSectionProps) {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Form states for new incident
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('plumbing');
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [mockPhoto, setMockPhoto] = useState<string | null>(null);

  // Drag and drop photo upload
  const [dragActive, setDragActive] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New comment input
  const [newCommentText, setNewCommentText] = useState('');

  const formatDateTime = (val: string) => val;

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
      setSelectedPhotoName(file.name);
      // Use a mock fallback image based on category
      setMockPhoto(getCategoryMockPhoto(category));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoName(file.name);
      setMockPhoto(getCategoryMockPhoto(category));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getCategoryMockPhoto = (cat: IncidentCategory) => {
    switch (cat) {
      case 'plumbing':
        return 'https://images.unsplash.com/photo-1542013936693-8848e574047a?q=80&w=640&auto=format&fit=crop';
      case 'electricity':
        return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=640&auto=format&fit=crop';
      case 'elevator':
        return 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=640&auto=format&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=640&auto=format&fit=crop';
    }
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) return;

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: title,
      category: category,
      priority: priority,
      location: location,
      description: description,
      status: 'reported',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      images: mockPhoto ? [mockPhoto] : [],
      comments: [
        {
          id: `comm-init-${Date.now()}`,
          authorName: 'Luis Martínez',
          authorRole: 'resident',
          content: t('incidents.initial_comment', 'Se registra reporte de forma digital en el portal de condominos.'),
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    onAddIncident(newIncident);
    setShowAddModal(false);
    
    // Clear form
    setTitle('');
    setLocation('');
    setDescription('');
    setMockPhoto(null);
    setSelectedPhotoName(null);
  };

  const handlePostComment = (e: React.FormEvent, incidentId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment(incidentId, newCommentText.trim());
    setNewCommentText('');
  };

  const getPriorityBadge = (prio: IncidentPriority) => {
    switch (prio) {
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] rounded-sm font-bold bg-rose-50 text-rose-700 border border-rose-100">{t('incidents.priority_high', 'Alta Prioridad')}</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] rounded-sm font-bold bg-amber-50 text-amber-700 border border-amber-100">{t('incidents.priority_medium', 'Media')}</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] rounded-sm font-bold bg-slate-50 text-slate-700 border border-slate-100">{t('incidents.priority_low', 'Baja')}</span>;
    }
  };

  const getCategoryTheme = (cat: IncidentCategory) => {
    switch (cat) {
      case 'plumbing':
        return { label: t('incidents.modal_category_plumbing', 'Plomería'), color: 'text-indigo-650 bg-indigo-50/50 border-indigo-100' };
      case 'electricity':
        return { label: t('incidents.modal_category_electricity', 'Electricidad'), color: 'text-amber-700 bg-amber-50/50 border-amber-100' };
      case 'elevator':
        return { label: t('incidents.modal_category_elevator', 'Elevadores'), color: 'text-violet-650 bg-violet-50/50 border-violet-100' };
      case 'security':
        return { label: t('incidents.modal_category_security', 'Seguridad'), color: 'text-rose-700 bg-rose-50/50 border-rose-100' };
      case 'common_area':
        return { label: t('incidents.modal_category_common', 'Áreas Comunes'), color: 'text-emerald-700 bg-emerald-50/50 border-emerald-100' };
      default:
        return { label: t('incidents.modal_category_other', 'Otro'), color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

  // Status life cycle progress
  const getStatusStage = (status: Incident['status']) => {
    switch (status) {
      case 'reported': return 1;
      case 'assigned': return 2;
      case 'in_progress': return 3;
      case 'resolved': return 4;
      default: return 1;
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (activeFilter === 'pending') return inc.status !== 'resolved';
    if (activeFilter === 'resolved') return inc.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* TABLON DE ACCION RAPIDA */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('incidents.title', 'Centro de Reportes de Incidentes')}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('incidents.subtitle', 'Informa desperfectos de áreas o equipo común y mantente al tanto del mantenimiento correctivo.')}
          </p>
        </div>
        <button
          id="btn-report-incident-top"
          onClick={() => setShowAddModal(true)}
          className="bg-rose-650 hover:bg-rose-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition flex items-center shadow-xs self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t('incidents.report_btn', 'Reportar Incidente')}
        </button>
      </div>

      {/* FILTER CONTROL */}
      <div className="flex justify-between items-center bg-slate-55/70 p-1.5 rounded-xl border border-slate-100/50 max-w-fit space-x-1">
        <button
          id="tab-incident-all"
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {t('incidents.filter_all', 'Todos')} ({incidents.length})
        </button>
        <button
          id="tab-incident-pending"
          onClick={() => setActiveFilter('pending')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {t('incidents.filter_pending', 'En Proceso')} ({incidents.filter(i => i.status !== 'resolved').length})
        </button>
        <button
          id="tab-incident-resolved"
          onClick={() => setActiveFilter('resolved')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeFilter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {t('incidents.filter_resolved', 'Solucionados')} ({incidents.filter(i => i.status === 'resolved').length})
        </button>
      </div>

      {/* LIST OF INCIDENTS */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-550">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">{t('incidents.all_ok_title', '¡Todo en Orden!')}</h3>
            <p className="text-xs text-slate-550 mt-1">{t('incidents.no_incidents', 'No hay incidentes reportados en esta pestaña.')}</p>
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const theme = getCategoryTheme(inc.category);
            const isExpanded = expandedIncidentId === inc.id;
            const currentStage = getStatusStage(inc.status);

            return (
              <motion.div
                key={inc.id}
                layout
                className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
              >
                {/* Visual Card Trigger */}
                <div 
                  onClick={() => setExpandedIncidentId(isExpanded ? null : inc.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition duration-150"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm md:text-base">{inc.title}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${theme.color}`}>
                        {theme.label}
                      </span>
                      {getPriorityBadge(inc.priority)}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-550">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {inc.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {t('incidents.entered_label', 'Ingresado')}: {formatDateTime(inc.createdAt)}
                      </span>
                      {inc.technicianName && (
                        <span className="flex items-center font-semibold text-indigo-650">
                          <Wrench className="w-3.5 h-3.5 mr-1" />
                          {t('incidents.technician_label', 'Técnico')}: {inc.technicianName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">{t('incidents.status_header', 'Estado Técnico')}</span>
                      {inc.status === 'reported' && (
                        <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-205">{t('incidents.status_reported', 'Reportado')}</span>
                      )}
                      {inc.status === 'assigned' && (
                        <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-155">{t('incidents.status_assigned', 'Técnico Asignado')}</span>
                      )}
                      {inc.status === 'in_progress' && (
                        <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-155 animate-pulse">{t('incidents.status_in_progress', 'Trabajo Iniciado')}</span>
                      )}
                      {inc.status === 'resolved' && (
                        <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-155">{t('incidents.status_resolved', 'Solucionado ✓')}</span>
                      )}
                    </div>
                    
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition" title={t('incidents.view_details_tooltip', 'Ver detalle')}>
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE INCIDENT WORKSPACE */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="p-5 space-y-6">
                        {/* Description & Photo Attachment */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('incidents.desc_title', 'Descripción del Incidente')}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl shadow-inner font-sans">
                              {inc.description}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('incidents.photo_title', 'Archivo / Foto de Evidencia')}</h4>
                            {inc.images.length > 0 ? (
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                                <img 
                                  src={inc.images[0]} 
                                  alt="Evidencia"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <button 
                                    onClick={() => alert('Ampliando fotografía técnica...')}
                                    className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold shadow-md"
                                  >
                                    {t('incidents.photo_full', 'Ver Completa')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-xs bg-white">
                                <HelpCircle className="w-6 h-6 mx-auto mb-1 opacity-60" />
                                {t('incidents.no_photo', 'Sin fotografía adjunta')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Steps Tracker */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('incidents.progress_title', 'Trayectoria y Progreso')}</h4>
                          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center flex-1 text-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStage >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                1
                              </div>
                              <span className="text-xs font-bold text-slate-800 mt-2">{t('incidents.progress_step1', 'Reportado')}</span>
                              <span className="text-[10px] text-slate-400">{t('incidents.progress_step1_desc', 'Atendido por mesa')}</span>
                            </div>
                            <div className={`hidden sm:block h-0.5 flex-1 ${currentStage >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center flex-1 text-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStage >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                2
                              </div>
                              <span className="text-xs font-bold text-slate-800 mt-2">{t('incidents.progress_step2', 'Asignado')}</span>
                              <span className="text-[10px] text-slate-400">{inc.technicianName ? t('incidents.progress_step2_desc_notified', 'Técnico notificado') : t('incidents.progress_step2_desc_pending', 'En proceso')}</span>
                            </div>
                            <div className={`hidden sm:block h-0.5 flex-1 ${currentStage >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center flex-1 text-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStage >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                3
                              </div>
                              <span className="text-xs font-bold text-slate-800 mt-2">{t('incidents.progress_step3', 'Atención Activa')}</span>
                              <span className="text-[10px] text-slate-400">{t('incidents.progress_step3_desc', 'Visita técnica iniciada')}</span>
                            </div>
                            <div className={`hidden sm:block h-0.5 flex-1 ${currentStage >= 4 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center flex-1 text-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStage >= 4 ? 'bg-emerald-650 text-white animate-bounce' : 'bg-slate-100 text-slate-500'}`}>
                                ✓
                              </div>
                              <span className="text-xs font-bold text-slate-800 mt-2">{t('incidents.progress_step4', 'Resuelto')}</span>
                              <span className="text-[10px] text-slate-400">{t('incidents.progress_step4_desc', 'Conformidad recíproca')}</span>
                            </div>
                          </div>
                        </div>

                        {/* COMMENTS & INTERACTIVE DIRECT CHAT */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-slate-400" />
                            {t('incidents.log_title', 'Bitácora de Seguimiento')} ({inc.comments.length})
                          </h4>
                          
                          <div id="comments-box" className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 max-h-[300px] overflow-y-auto">
                            {inc.comments.map((comm) => {
                              const isMe = comm.authorRole === 'resident';
                              return (
                                <div key={comm.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-md rounded-2xl p-3 text-xs shadow-xs ${
                                    isMe 
                                      ? 'bg-indigo-600 text-white rounded-br-none' 
                                      : comm.authorRole === 'technician' 
                                        ? 'bg-amber-50 text-slate-800 rounded-bl-none border border-amber-200/50'
                                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                  }`}>
                                    <div className="flex items-center justify-between font-bold text-[10px] opacity-90 mb-1">
                                      <span>{comm.authorName} ({comm.authorRole === 'resident' ? t('incidents.log_author_resident', 'Residente') : comm.authorRole === 'technician' ? t('incidents.log_author_tech', 'Técnico') : t('incidents.log_author_admin', 'Admin')})</span>
                                      <span className="ml-4 font-normal text-[0.6rem] font-mono">{comm.createdAt}</span>
                                    </div>
                                    <p className="leading-relaxed font-sans">{comm.content}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Chat Form */}
                          <form onSubmit={(e) => handlePostComment(e, inc.id)} className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder={t('incidents.log_placeholder', 'Escribe un comentario o consulta para la administración...')}
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 transition shadow-inner bg-white"
                            />
                            <button
                              id={`btn-send-comm-${inc.id}`}
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-xs transition"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* POPUP: REPORT INCIDENT MODAL CREATOR */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative z-10 border border-slate-100"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm md:text-base">{t('incidents.modal_register_title', 'Registrar Nuevo Incidente')}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t('incidents.modal_register_subtitle', 'Por favor, detalla la falla de forma precisa.')}</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateIncident} className="p-6 space-y-4">
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1">{t('incidents.modal_title_label', 'Título del incidente / Falla')}</label>
                  <input 
                    type="text" 
                    required
                    placeholder={t('incidents.modal_title_placeholder', 'Ej. Fuga de gas en caldera #2 / Chapa de acceso descompuesta')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">{t('incidents.modal_location_label', 'Ubicación Precisa')}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={t('incidents.modal_location_placeholder', 'Ej. Torre B, Planta Baja Pasillo Izquierdo')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">{t('incidents.modal_category_label', 'Categoría')}</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition bg-white"
                    >
                      <option value="plumbing">{t('incidents.modal_category_plumbing', 'Plomería')}</option>
                      <option value="electricity">{t('incidents.modal_category_electricity', 'Electricidad / Luz')}</option>
                      <option value="elevator">{t('incidents.modal_category_elevator', 'Elevadores')}</option>
                      <option value="security">{t('incidents.modal_category_security', 'Seguridad / Acceso')}</option>
                      <option value="common_area">{t('incidents.modal_category_common', 'Área Común / Alberca')}</option>
                      <option value="other">{t('incidents.modal_category_other', 'Otro asunto')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-slate-600 text-xs font-semibold block mb-1">{t('incidents.modal_priority_label', 'Prioridad recomendada')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPriority('low')}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${priority === 'low' ? 'bg-slate-105 border-slate-350 text-slate-800' : 'border-slate-200 text-slate-500'}`}
                      >
                        {t('incidents.modal_priority_low_btn', 'Baja (Detalle estético)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('medium')}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${priority === 'medium' ? 'bg-amber-50 border-amber-350 text-amber-850' : 'border-slate-200 text-slate-500'}`}
                      >
                        {t('incidents.modal_priority_med_btn', 'Media (Afecta uso)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('high')}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${priority === 'high' ? 'bg-rose-50 border-rose-350 text-rose-850' : 'border-slate-200 text-slate-500'}`}
                      >
                        {t('incidents.modal_priority_high_btn', 'Alta (Peligro/Inundación)')}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1 font-medium">{t('incidents.modal_desc_label', 'Descripción Completa')}</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder={t('incidents.modal_desc_placeholder', 'Describe el inconveniente de manera detallada para guiar las herramientas del técnico...')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 transition resize-none"
                  />
                </div>

                {/* FILE ATTACHMENT WITH DRAG AND DROP */}
                <div>
                  <label className="text-slate-600 text-xs font-semibold block mb-1.5 font-medium">{t('incidents.modal_photo_label', 'Fotografía / Captura de Pantalla')}</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                      dragActive 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : selectedPhotoName 
                          ? 'border-emerald-500 bg-emerald-50/20' 
                          : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    
                    {selectedPhotoName ? (
                      <div className="flex items-center justify-center space-x-2 text-xs text-slate-700 font-bold">
                        <FileCheck className="w-5 h-5 text-emerald-500" />
                        <span>{selectedPhotoName} ({t('incidents.modal_photo_sim', 'Simulado listo')})</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <div className="text-xs font-semibold text-slate-600">{t('incidents.modal_photo_drop', 'Suelta tu foto aquí o haz clic para buscar')}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-555 hover:text-slate-700"
                  >
                    {t('lang.btn_cancel', 'Cancelar')}
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    {t('incidents.modal_submit', 'Ingresar Reporte')}
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

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, TranslationKeys } from './LanguageProvider';
import { Globe, Plus, Trash2, X, Check, AlertCircle, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LanguageSelector() {
  const {
    currentLanguage,
    languages,
    t,
    changeLanguage,
    addLanguage,
    deleteLanguage,
    getLanguageTranslations,
    getDefaultKeys
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form State for new language
  const [langName, setLangName] = useState('');
  const [langCode, setLangCode] = useState('');
  const [formTranslations, setFormTranslations] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize the translation form with Spanish defaults
  const openAddLanguageModal = () => {
    const keys = getDefaultKeys();
    const spanishTranslations = getLanguageTranslations('es');
    const initialFormValues: Record<string, string> = {};
    
    keys.forEach(key => {
      initialFormValues[key] = spanishTranslations[key] || '';
    });

    setLangName('');
    setLangCode('');
    setFormTranslations(initialFormValues);
    setValidationError(null);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleTranslationChange = (key: string, value: string) => {
    setFormTranslations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const code = langCode.trim().toLowerCase();
    const name = langName.trim();

    if (!code || !name) {
      setValidationError(t('lang.err_fields', 'Por favor completa el nombre y código del idioma.'));
      return;
    }

    // Check if code matches any existing language
    const exists = languages.some(l => l.code === code);
    if (exists) {
      setValidationError(t('lang.err_code_exists', 'Este código de idioma ya está en uso o es reservado.'));
      return;
    }

    // Save language
    const success = addLanguage(code, name, formTranslations);
    if (success) {
      setIsModalOpen(false);
      alert(t('lang.add_success', 'Idioma añadido exitosamente.'));
    } else {
      setValidationError(t('lang.err_code_exists', 'Este código de idioma ya está en uso o es reservado.'));
    }
  };

  // Group translations by domain to make the editor easier to navigate
  const groupKeysByDomain = (keys: string[]) => {
    const groups: Record<string, string[]> = {
      'General & Navigation': [],
      'Landing Page': [],
      'Login Page': [],
      'Messages & Errors': [],
      'System & Language': [],
      'Dashboard Home': [],
      'Payments & Finances': [],
      'Bookings & Spaces': [],
      'Incidents & Reports': [],
      'Work Directory': []
    };

    keys.forEach(key => {
      if (key.startsWith('nav.')) {
        groups['General & Navigation'].push(key);
      } else if (key.startsWith('landing.')) {
        groups['Landing Page'].push(key);
      } else if (key.startsWith('login.error.')) {
        groups['Messages & Errors'].push(key);
      } else if (key.startsWith('login.')) {
        groups['Login Page'].push(key);
      } else if (key.startsWith('lang.')) {
        groups['System & Language'].push(key);
      } else if (key.startsWith('dashboard.')) {
        groups['Dashboard Home'].push(key);
      } else if (key.startsWith('payments.')) {
        groups['Payments & Finances'].push(key);
      } else if (key.startsWith('bookings.')) {
        groups['Bookings & Spaces'].push(key);
      } else if (key.startsWith('incidents.')) {
        groups['Incidents & Reports'].push(key);
      } else if (key.startsWith('directory.')) {
        groups['Work Directory'].push(key);
      } else {
        groups['General & Navigation'].push(key);
      }
    });

    return groups;
  };

  const defaultKeys = getDefaultKeys();
  const spanishTranslations = getLanguageTranslations('es');
  const groupedKeys = groupKeysByDomain(defaultKeys);
  const activeLanguageObj = languages.find(l => l.code === currentLanguage);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase border border-[#E5E1DA] hover:bg-[#F5F2ED] bg-white text-[#1A1A1A] transition cursor-pointer select-none"
        title="Cambiar idioma / Change language"
      >
        <Globe className="w-3.5 h-3.5 text-brand-blue" />
        <span>{activeLanguageObj?.name || currentLanguage.toUpperCase()}</span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E5E1DA] shadow-lg rounded-none z-50 overflow-hidden"
          >
            <div className="py-1">
              {/* Header */}
              <div className="px-3 py-2 text-[8px] font-mono tracking-widest uppercase text-[#8C857B] border-b border-[#E5E1DA] bg-[#F5F2ED]/30">
                {t('lang.manage_title', 'Idiomas')}
              </div>

              {/* Language List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-[#F5F2ED]">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#F5F2ED] transition group"
                  >
                    <button
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left text-xs text-[#1A1A1A] font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {lang.name}
                        {lang.isCustom && (
                          <span className="text-[7px] font-bold tracking-wider uppercase px-1 bg-brand-teal/15 text-brand-teal border border-brand-teal/20">
                            {t('lang.custom_badge', 'Custom')}
                          </span>
                        )}
                      </span>
                      {currentLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      )}
                    </button>

                    {/* Delete button for custom languages */}
                    {lang.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar el idioma "${lang.name}"?`)) {
                            deleteLanguage(lang.code);
                          }
                        }}
                        className="ml-2 p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition shrink-0 opacity-0 group-hover:opacity-100"
                        title={t('lang.delete_btn', 'Eliminar')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Language Action */}
              <div className="border-t border-[#E5E1DA] bg-[#FDFCFB]">
                <button
                  onClick={openAddLanguageModal}
                  className="w-full text-left px-3 py-3 text-[9px] font-bold tracking-widest uppercase text-brand-blue hover:bg-brand-blue hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('lang.add_title', 'Agregar Idioma...')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Language Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E5E1DA] max-w-2xl w-full p-6 text-left shadow-2xl flex flex-col my-8 max-h-[85vh] rounded-none"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-serif italic text-[#1A1A1A] font-normal">
                    {t('lang.add_title', 'Añadir Nuevo Idioma')}
                  </h3>
                  <p className="text-[10px] text-[#8C857B] uppercase tracking-wider font-mono">
                    {t('lang.add_subtitle', 'Crea una traducción personalizada para la plataforma')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-[#8C857B] hover:text-[#1A1A1A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveLanguage} className="flex-1 overflow-hidden flex flex-col pt-4 space-y-4">
                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 font-medium shrink-0">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Identity Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                      {t('lang.name', 'Nombre del Idioma (ej. Français)')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Français, Italiano"
                      value={langName}
                      onChange={e => setLangName(e.target.value)}
                      className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                      {t('lang.code', 'Código del Idioma (ej. fr)')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. fr, it, pt"
                      maxLength={5}
                      value={langCode}
                      onChange={e => setLangCode(e.target.value.replace(/[^a-zA-Z-]/g, ''))}
                      className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>

                {/* Scrollable Translation Fields */}
                <div className="flex-1 overflow-y-auto border border-[#E5E1DA] bg-[#F5F2ED]/10 p-4 space-y-6">
                  {Object.entries(groupedKeys).map(([groupName, keys]) => {
                    if (keys.length === 0) return null;
                    
                    return (
                      <div key={groupName} className="space-y-3">
                        <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#8C857B] border-b border-[#E5E1DA] pb-1.5 sticky top-0 bg-[#FDFCFB] px-1 py-0.5">
                          {groupName}
                        </h4>
                        
                        <div className="space-y-4">
                          {keys.map(key => (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white p-3 border border-[#E5E1DA]">
                              <div>
                                <span className="block text-[9px] font-mono font-bold text-[#8C857B] mb-1">
                                  {key}
                                </span>
                                <p className="text-xs text-[#1A1A1A] italic font-serif">
                                  "{spanishTranslations[key]}"
                                </p>
                              </div>
                              <div className="flex flex-col justify-center">
                                <label htmlFor={`tr-${key}`} className="sr-only">Traducción para {key}</label>
                                <input
                                  id={`tr-${key}`}
                                  type="text"
                                  placeholder="Escribe la traducción aquí..."
                                  value={formTranslations[key] || ''}
                                  onChange={e => handleTranslationChange(key, e.target.value)}
                                  className="w-full bg-[#FDFCFB] border border-[#E5E1DA] px-3.5 py-1.5 text-xs text-[#1A1A1A] outline-none focus:border-brand-teal"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-[#E5E1DA] text-[10px] font-bold uppercase tracking-widest text-[#8C857B] hover:bg-[#F5F2ED] rounded-none cursor-pointer"
                  >
                    {t('lang.btn_cancel', 'Cancelar')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0D305F] hover:bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest transition rounded-none cursor-pointer"
                  >
                    {t('lang.btn_save', 'Guardar Idioma')}
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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TranslationKeys {
  [key: string]: string;
}

export interface Language {
  code: string;
  name: string;
  translations: TranslationKeys;
  isCustom?: boolean;
}

// Default Spanish and English translations
const DEFAULT_TRANSLATIONS: Record<string, TranslationKeys> = {
  es: {
    // Navigation & General
    "nav.home": "Inicio",
    "nav.payments": "Pagos",
    "nav.payments_admin": "Aprobar Pagos",
    "nav.bookings": "Reservar Área",
    "nav.bookings_admin": "Gestionar Reservas",
    "nav.incidents": "Incidentes",
    "nav.incidents_admin": "Ver Reportes",
    "nav.directory": "Directorio",
    "nav.notifications": "Notificaciones",
    "nav.profile": "Editar Perfil",
    "nav.logout": "Cerrar Sesión",
    "nav.back": "Volver",
    "nav.access_portal": "Acceder al Portal",
    "nav.enter_panel": "Ingresar al Panel",
    "nav.notifications_none": "No tienes notificaciones administrativas sin leer.",
    "nav.profile_edit_title": "Editar Perfil de Usuario",
    "nav.profile_edit_subtitle": "Personaliza tu nombre y foto de perfil",
    "nav.profile_name_label": "Nombre Completo",
    "nav.profile_name_placeholder": "Tu nombre completo",
    "nav.profile_avatar_select": "Seleccionar Foto de Perfil (Avatares)",
    "nav.profile_avatar_url": "O Ingresa una URL de Imagen Personalizada",
    "nav.profile_save": "Guardar Cambios",

    // Landing Page
    "landing.title": "Bienvenido a su plataforma digital.",
    "landing.subtitle": "Portal Inteligente de Gestión",
    "landing.description": "Tu condominio en la palma de tu mano. Gestiona pagos, reservas de áreas comunes e incidentes de forma simple y transparente.",
    "landing.footer_status": "Estatus de Servicios • Operativo",
    "landing.footer_designed": "Diseñado por ResidenSmart Digital",

    // Login Page
    "login.title": "Bienvenido",
    "login.subtitle": "Ingresa tus credenciales para acceder a tu panel de control.",
    "login.security_access": "Acceso de Seguridad",
    "login.email": "Correo electrónico",
    "login.email_placeholder": "tucorreo@ejemplo.com",
    "login.password": "Contraseña",
    "login.password_placeholder": "••••••••",
    "login.submit": "Iniciar Sesión",
    "login.submit_processing": "Procesando...",
    "login.or_create": "o crear cuenta de prueba",
    "login.new_resident": "Nuevo Residente",
    "login.new_admin": "Nuevo Admin",
    "login.copyright": "ResidenSmart Portal",
    "login.welcome_admin": "Bienvenido Administrador a la plataforma ResidenSmart.",
    "login.welcome_resident": "Bienvenido",
    "login.connected_from": "Estás conectado desde",
    
    // Login Errors & Validations
    "login.error.email_req": "Por favor, ingresa tu correo electrónico.",
    "login.error.pwd_req": "Por favor, ingresa tu contraseña.",
    "login.error.pwd_length": "La contraseña para registrarte debe tener al menos 6 caracteres.",
    "login.error.valid_email_req": "El registro requiere un correo electrónico válido.",
    "login.error.pwd_min": "La contraseña debe tener al menos 6 caracteres.",
    "login.error.already_registered": "El correo ya está registrado. Intenta iniciar sesión.",
    "login.error.invalid_credentials": "Correo o contraseña incorrectos. Intenta nuevamente.",
    "login.error.signup_failed": "No se pudo crear la cuenta. El correo ya puede estar registrado o la contraseña es muy corta.",

    // Language Selector & Add Dialog
    "lang.add_title": "Añadir Nuevo Idioma",
    "lang.add_subtitle": "Crea una traducción personalizada para la plataforma",
    "lang.name": "Nombre del Idioma (ej. Français)",
    "lang.code": "Código del Idioma (ej. fr)",
    "lang.btn_save": "Guardar Idioma",
    "lang.btn_cancel": "Cancelar",
    "lang.key_label": "Clave",
    "lang.original_label": "Texto Original (Español)",
    "lang.translation_label": "Traducción",
    "lang.add_success": "Idioma añadido exitosamente.",
    "lang.err_fields": "Por favor completa el nombre y código del idioma.",
    "lang.err_code_exists": "Este código de idioma ya está en uso o es reservado.",
    "lang.manage_title": "Gestionar Idiomas",
    "lang.custom_badge": "Personalizado",
    "lang.delete_btn": "Eliminar",

    // Dashboard Home
    "dashboard.welcome_admin_tag": "Portal de Administración Activo",
    "dashboard.welcome_resident_tag": "Portal de Condóminos Activo",
    "dashboard.hello": "Hola,",
    "dashboard.admin_desc": "Bienvenido a la plataforma de administración de ResidenSmart. Aquí podrá publicar anuncios oficiales, coordinar reportes de fallas, auditar transferencias de cuotas y gestionar las reservas de amenidades.",
    "dashboard.resident_desc": "Bienvenido a su portal digital de ResidenSmart. Aquí podrá gestionar los servicios de su propiedad, agendar áreas comunes y consultar sus estados de cuenta de manera eficiente y transparente.",
    "dashboard.recollection_june": "Recaudación (Junio)",
    "dashboard.to_collect": "Por Cobrar",
    "dashboard.to_approve": "Por Aprobar",
    "dashboard.payments": "pagos",
    "dashboard.review_proofs": "Revisar Comprobantes",
    "dashboard.account_balance": "Estado de Cuenta",
    "dashboard.balance_pending": "Pendiente",
    "dashboard.balance_ok": "Al día",
    "dashboard.pay_maintenance": "Pagar Mantenimiento",
    "dashboard.cutoff_notice": "Próximo vencimiento ordinario: Día 10",
    "dashboard.admin_actions": "Acciones Administrativas",
    "dashboard.quick_services": "Servicios Rápidos",
    "dashboard.create_announcement": "Crear Comunicado",
    "dashboard.generate_charge": "Generar Cargo",
    "dashboard.reported_defects": "Fallas Reportadas",
    "dashboard.view_bookings": "Ver Reservas",
    "dashboard.book_areas": "Reservar Áreas",
    "dashboard.report_defect": "Reportar Falla",
    "dashboard.elevator_light": "Luz en Elevador",
    "dashboard.copy_security": "Copiar Vigilancia",
    "dashboard.elevator_light_setup": "Hemos preparado los campos para reportar una falla eléctrica en el elevador.",
    "dashboard.emergency_alert": "TELÉFONOS DE EMERGENCIA DE RESIDENSMART:\n\n• Caseta de Vigilancia Principal: +52 55 9002 1100\n• Conserjería Nocturna: +52 55 9002 1122\n• Protección Civil Zona S.: 911 / 55 5658 1111\n\nHaga clic para copiar.",
    "dashboard.announcements_title": "Avisos de la Administración",
    "dashboard.announcements_count": "comunicados",
    "dashboard.announcements_no_notices": "No hay anuncios oficiales publicados por el momento en esta copropiedad.",
    "dashboard.announcements_read_more": "Leer más →",
    "dashboard.announcements_urgent": "Urgente",
    "dashboard.announcements_maintenance": "Mantenimiento",
    "dashboard.announcements_event": "Evento Social",
    "dashboard.support_title": "Administración y Soporte",
    "dashboard.support_admin": "Administrador Residente",
    "dashboard.support_security": "Seguridad Caseta 24 hrs",
    "dashboard.support_tech": "Guardia de Mantenimiento",
    "dashboard.support_copiado": "Teléfono copiado.",
    "dashboard.support_rules": "Reglamento Interno",
    "dashboard.support_rules_desc": "Recuerda que el volumen de la música exterior debe ser moderado a partir de las 22:00 horas. Mantengamos una vecindad pacífica y asertiva.",
    "dashboard.support_rules_btn": "Ver todos los estatutos",
    "dashboard.support_rules_alert": "REGLAMENTO FUNDACIONAL RESIDENSMART:\n\n1. Mascotas deben portar correa en áreas verdes comunes.\n2. Cada departamento dispone de 2 cajones numerados asignados.\n3. Es obligatorio notificar mudanzas con 48 horas de anticipación.\n4. Cuota ordinaria de mantenimiento expira el día 10 de cada mes.",
    "dashboard.announcement_modal_date": "COMUNICADO",
    "dashboard.announcement_modal_author": "Emitido por:",
    "dashboard.announcement_modal_close": "Entendido / Cerrar Aviso",
    "dashboard.join_modal_title": "Vincularse a un Condominio",
    "dashboard.join_modal_subtitle": "Ingresa el Código de Vinculación o NIT",
    "dashboard.join_code_label": "Código de Vinculación / NIT del Condominio",
    "dashboard.join_verify_btn": "Verificar Código",
    "dashboard.join_searching": "Buscando Condominio...",
    "dashboard.join_found": "Condominio Encontrado",
    "dashboard.join_select_unit": "Selecciona tu Unidad / Departamento",
    "dashboard.join_no_units": "Este condominio aún no tiene departamentos generados.",
    "dashboard.join_back": "Atrás",
    "dashboard.join_confirm": "Confirmar y Entrar",
    "dashboard.join_submitting": "Vinculando...",
    "dashboard.footer_status": "Estatus de Servicios • Operativo",
    "dashboard.footer_designed": "Diseñado por ResidenSmart Digital",

    // Payments Section
    "payments.deudor_title": "Tu deudor de mantenimiento",
    "payments.cargos_pendientes": "cargos pendientes",
    "payments.prox_vencimiento": "Próximo Vencimiento",
    "payments.no_pending": "Sin pagos pendientes",
    "payments.corte_ordinario": "Corte ordinario: Día 10",
    "payments.secure_title": "Pagos 100% Seguros",
    "payments.secure_desc": "Sistema cifrado de procesamiento para tarjetas, CLABE interbancaria y validación de transferencias.",
    "payments.secure_cert": "Certificado SSL CondoSafe",
    "payments.tab_pending": "Por Pagar",
    "payments.tab_history": "Historial",
    "payments.btn_simulate": "Simular Cargo Admin",
    "payments.simulate_success": "Cargo agregado.",
    "payments.no_pending_title": "¡Al día con tus pagos!",
    "payments.no_pending_desc": "No tienes adeudos vigentes registrados a tu departamento.",
    "payments.category_maintenance": "Mantenimiento",
    "payments.category_amenity": "Amenidad",
    "payments.category_fine": "Multa",
    "payments.category_other": "Otro",
    "payments.vence_el": "Vence el:",
    "payments.ref_label": "Ref:",
    "payments.total_pay": "Total a pagar",
    "payments.pay_now": "Pagar Ahora",
    "payments.history_no_transactions": "Aún no hay transacciones en tu historial.",
    "payments.history_concept": "Concepto",
    "payments.history_reference": "Referencia",
    "payments.history_method": "Método",
    "payments.history_date": "Fecha de Pago",
    "payments.history_amount": "Monto",
    "payments.history_status": "Estado / Comprobante",
    "payments.method_credit_card": "Tarjeta de Crédito",
    "payments.method_bank_transfer": "Transferencia SPEI",
    "payments.method_cash": "Depósito validado",
    "payments.history_pending_process": "Pendiente de procesar",
    "payments.status_review": "En Revisión",
    "payments.status_paid": "Pagado",
    "payments.receipt_view_pdf": "Visualizando recibo fiscal en formato PDF para el folio: {ref}. Descarga iniciada.",
    "payments.admin_title": "Aprobación de Transferencias y Pagos",
    "payments.admin_subtitle": "Auditoría y control de comprobantes de pago subidos por los residentes.",
    "payments.admin_under_review": "Pagos Bajo Revisión",
    "payments.admin_uploaded_by": "Cargado por Residente",
    "payments.admin_proof_attached": "Comprobante adjunto:",
    "payments.admin_approve": "Aprobar Pago",
    "payments.admin_reject": "Rechazar",
    "payments.admin_no_review": "No hay comprobantes pendientes de aprobación en este momento.",
    "payments.admin_all_charges": "Todos los Cargos Generados",
    "payments.admin_new_charge": "Generar Nuevo Cargo",
    "payments.admin_table_reference": "Referencia",
    "payments.admin_table_concept": "Concepto",
    "payments.admin_table_amount": "Monto",
    "payments.admin_table_due": "Vencimiento",
    "payments.admin_table_status": "Estado",
    "payments.admin_table_resident": "Residente",
    "payments.admin_charge_amount_prompt": "Monto del cargo en MXN (ej: 1850):",
    "payments.admin_charge_concept_prompt": "Concepto del cargo (ej: Cuota mantenimiento Julio):",
    "payments.admin_charge_desc": "Cargo administrativo generado de manera extraordinaria.",
    "payments.admin_charge_added": "Cargo administrativo agregado con éxito.",

    // Bookings Section
    "bookings.title": "Mis Reservas Activas",
    "bookings.no_bookings": "No tienes ninguna reserva activa programada.",
    "bookings.guest_count_single": "Invitado",
    "bookings.guest_count_plural": "Invitados",
    "bookings.cost_free": "Gratuito",
    "bookings.status_confirmed": "Confirmada",
    "bookings.status_pending": "Sujeto a Aprobación",
    "bookings.status_cancelled": "Cancelada",
    "bookings.qr_pass": "Pase QR",
    "bookings.cancel_btn": "Cancelar reserva",
    "bookings.cancel_confirm": "¿Estás seguro de cancelar esta reserva? El dinero o saldo cargado se reembolsará automáticamente.",
    "bookings.catalog_title": "Áreas Comunes Disponibles",
    "bookings.catalog_subtitle": "Planifica y reserva los mejores espacios de ResidenSmart",
    "bookings.max_capacity": "Aforo máx",
    "bookings.people": "pers.",
    "bookings.requires_review": "Requiere aprobación",
    "bookings.rules_btn": "Reglas de uso",
    "bookings.book_btn": "Reservar",
    "bookings.qr_modal_title": "Pase de Acceso Digital",
    "bookings.qr_scan_message": "Aproxima esta pantalla en el escáner del pórtico de la amenidad. Asegura el aforo restringido de máximo {count} personas asociadas.",
    "bookings.qr_close": "Cerrar Pase",
    "bookings.composer_title": "Reservar Espacio Común",
    "bookings.composer_step1": "1. Selecciona el Día",
    "bookings.composer_step2": "2. Horario Disponible",
    "bookings.composer_slot_taken": "Ocupado",
    "bookings.composer_slot_avail": "Disponible",
    "bookings.composer_step3": "3. Número de Acompañantes",
    "bookings.composer_capacity_limit": "Aforo máximo permitido: {capacity} de personas.",
    "bookings.composer_hourly_rate": "Precio por Hora:",
    "bookings.composer_duration": "Duración estimada:",
    "bookings.composer_duration_hours": "{hours} horas",
    "bookings.composer_duration_hour": "{hours} hora",
    "bookings.composer_total_cost": "Costo total aproximado:",
    "bookings.composer_review_notice": "Esta amenidad de alta demanda (como el salón social) requiere la aprobación del administrador y un depósito reembolsable de limpieza. Te enviaremos un correo cuando sea confirmado.",
    "bookings.composer_submit": "Confirmar Reserva",
    "bookings.admin_title": "Administración de Áreas Comunes y Reservas",
    "bookings.admin_subtitle": "Control y aprobación de reservaciones calendarizadas por los residentes.",
    "bookings.admin_registered": "Reservas Registradas",
    "bookings.admin_approve": "Aprobar",
    "bookings.admin_cancel": "Cancelar",

    // Incidents Section
    "incidents.title": "Centro de Reportes de Incidentes",
    "incidents.subtitle": "Informa desperfectos de áreas o equipo común y mantente al tanto del mantenimiento correctivo.",
    "incidents.report_btn": "Reportar Incidente",
    "incidents.filter_all": "Todos",
    "incidents.filter_pending": "En Proceso",
    "incidents.filter_resolved": "Solucionados",
    "incidents.status_reported": "Reportado",
    "incidents.status_assigned": "Técnico Asignado",
    "incidents.status_in_progress": "Trabajo Iniciado",
    "incidents.status_resolved": "Solucionado ✓",
    "incidents.priority_high": "Alta Prioridad",
    "incidents.priority_medium": "Media",
    "incidents.priority_low": "Baja",
    "incidents.location_label": "Ubicación",
    "incidents.entered_label": "Ingresado",
    "incidents.technician_label": "Técnico",
    "incidents.desc_title": "Descripción del Incidente",
    "incidents.photo_title": "Archivo / Foto de Evidencia",
    "incidents.photo_full": "Ver Completa",
    "incidents.no_photo": "Sin fotografía adjunta",
    "incidents.progress_title": "Trayectoria y Progreso",
    "incidents.progress_step1": "Reportado",
    "incidents.progress_step1_desc": "Atendido por mesa",
    "incidents.progress_step2": "Asignado",
    "incidents.progress_step2_desc_notified": "Técnico notificado",
    "incidents.progress_step2_desc_pending": "En proceso",
    "incidents.progress_step3": "Atención Activa",
    "incidents.progress_step3_desc": "Visita técnica iniciada",
    "incidents.progress_step4": "Resuelto",
    "incidents.progress_step4_desc": "Conformidad recíproca",
    "incidents.log_title": "Bitácora de Seguimiento",
    "incidents.log_placeholder": "Escribe un comentario o consulta para la administración...",
    "incidents.log_author_resident": "Residente",
    "incidents.log_author_tech": "Técnico",
    "incidents.log_author_admin": "Admin",
    "incidents.modal_register_title": "Registrar Nuevo Incidente",
    "incidents.modal_register_subtitle": "Por favor, detalla la falla de forma precisa.",
    "incidents.modal_title_label": "Título del incidente / Falla",
    "incidents.modal_title_placeholder": "Ej. Fuga de gas en caldera #2 / Chapa de acceso descompuesta",
    "incidents.modal_location_label": "Ubicación Precisa",
    "incidents.modal_location_placeholder": "Ej. Torre B, Planta Baja Pasillo Izquierdo",
    "incidents.modal_category_label": "Categoría",
    "incidents.modal_category_plumbing": "Plomería",
    "incidents.modal_category_electricity": "Electricidad / Luz",
    "incidents.modal_category_elevator": "Elevadores",
    "incidents.modal_category_security": "Seguridad / Acceso",
    "incidents.modal_category_common": "Área Común / Alberca",
    "incidents.modal_category_other": "Otro asunto",
    "incidents.modal_priority_label": "Prioridad recomendada",
    "incidents.modal_priority_low_btn": "Baja (Detalle estético)",
    "incidents.modal_priority_med_btn": "Media (Afecta uso)",
    "incidents.modal_priority_high_btn": "Alta (Peligro/Inundación)",
    "incidents.modal_desc_label": "Descripción Completa",
    "incidents.modal_desc_placeholder": "Describe el inconveniente de manera detallada para guiar las herramientas del técnico...",
    "incidents.modal_photo_label": "Fotografía / Captura de Pantalla",
    "incidents.modal_photo_drop": "Suelta tu foto aquí o haz clic para buscar",
    "incidents.modal_photo_sim": "Simulado listo",
    "incidents.no_incidents": "¡Todo en Orden! No hay incidentes reportados en esta pestaña.",
    "incidents.admin_title": "Gestión de Reportes y Fallas",
    "incidents.admin_subtitle": "Administre, asigne y responda a las incidencias levantadas por los condóminos.",
    "incidents.admin_active_reports": "Reportes Activos",
    "incidents.admin_select_placeholder": "Selecciona un reporte de la lista para ver el seguimiento.",
    "incidents.admin_report_id": "Reporte ID",
    "incidents.admin_created_at": "Creado el",
    "incidents.admin_change_in_progress": "En Proceso",
    "incidents.admin_change_resolve": "Resolver",
    "incidents.admin_desc_title": "Descripción del Residente",
    "incidents.admin_assignment_title": "Asignación de Personal Técnico",
    "incidents.admin_tech_assigned": "Técnico Asignado",
    "incidents.admin_tech_none": "Ninguno",
    "incidents.admin_assign_placeholder": "-- Asignar Técnico --",
    "incidents.admin_reply_placeholder": "Escribe una respuesta para el residente...",
    "incidents.admin_reply_btn": "Responder",

    // Directory Section
    "directory.title": "Directorio de Trabajos",
    "directory.subtitle": "Servicios ofrecidos por residentes de la comunidad",
    "directory.new_service": "Nuevo Servicio",
    "directory.register_title": "Registrar Nuevo Servicio",
    "directory.service_name": "Nombre del Servicio",
    "directory.resident_name": "Nombre del Residente",
    "directory.contact_number": "Número de Contacto",
    "directory.save_service": "Guardar Servicio",
    "directory.delete_tooltip": "Eliminar trabajo",
    "directory.call_resident": "Llamar al",
    "directory.no_services": "Aún no hay servicios registrados en el directorio."
  },
  en: {
    // Navigation & General
    "nav.home": "Home",
    "nav.payments": "Payments",
    "nav.payments_admin": "Approve Payments",
    "nav.bookings": "Book a Space",
    "nav.bookings_admin": "Manage Bookings",
    "nav.incidents": "Incidents",
    "nav.incidents_admin": "View Reports",
    "nav.directory": "Directory",
    "nav.notifications": "Notifications",
    "nav.profile": "Edit Profile",
    "nav.logout": "Sign Out",
    "nav.back": "Back",
    "nav.access_portal": "Access Portal",
    "nav.enter_panel": "Enter Panel",
    "nav.notifications_none": "You have no unread administrative notifications.",
    "nav.profile_edit_title": "Edit User Profile",
    "nav.profile_edit_subtitle": "Customize your name and profile picture",
    "nav.profile_name_label": "Full Name",
    "nav.profile_name_placeholder": "Your full name",
    "nav.profile_avatar_select": "Select Profile Photo (Avatars)",
    "nav.profile_avatar_url": "Or Enter a Custom Image URL",
    "nav.profile_save": "Save Changes",

    // Landing Page
    "landing.title": "Welcome to your digital platform.",
    "landing.subtitle": "Intelligent Management Portal",
    "landing.description": "Your condominium in the palm of your hand. Manage payments, common area bookings, and incident reports simply and transparently.",
    "landing.footer_status": "Service Status • Operational",
    "landing.footer_designed": "Designed by ResidenSmart Digital",

    // Login Page
    "login.title": "Welcome",
    "login.subtitle": "Enter your credentials to access your control panel.",
    "login.security_access": "Security Access",
    "login.email": "Email Address",
    "login.email_placeholder": "yourmail@example.com",
    "login.password": "Password",
    "login.password_placeholder": "••••••••",
    "login.submit": "Sign In",
    "login.submit_processing": "Processing...",
    "login.or_create": "or create trial account",
    "login.new_resident": "New Resident",
    "login.new_admin": "New Admin",
    "login.copyright": "ResidenSmart Portal",
    "login.welcome_admin": "Welcome Administrator to the ResidenSmart platform.",
    "login.welcome_resident": "Welcome",
    "login.connected_from": "You are connected from",

    // Login Errors & Validations
    "login.error.email_req": "Please enter your email address.",
    "login.error.pwd_req": "Please enter your password.",
    "login.error.pwd_length": "Password for signing up must be at least 6 characters.",
    "login.error.valid_email_req": "Sign up requires a valid email address.",
    "login.error.pwd_min": "Password must be at least 6 characters long.",
    "login.error.already_registered": "Email is already registered. Try signing in.",
    "login.error.invalid_credentials": "Incorrect email or password. Please try again.",
    "login.error.signup_failed": "Could not create account. The email may already be registered or the password is too short.",

    // Language Selector & Add Dialog
    "lang.add_title": "Add New Language",
    "lang.add_subtitle": "Create a custom translation for the platform",
    "lang.name": "Language Name (e.g. Français)",
    "lang.code": "Language Code (e.g. fr)",
    "lang.btn_save": "Save Language",
    "lang.btn_cancel": "Cancel",
    "lang.key_label": "Key",
    "lang.original_label": "Original Text (Spanish)",
    "lang.translation_label": "Translation",
    "lang.add_success": "Language added successfully.",
    "lang.err_fields": "Please fill in the language name and code.",
    "lang.err_code_exists": "This language code is already in use or reserved.",
    "lang.manage_title": "Manage Languages",
    "lang.custom_badge": "Custom",
    "lang.delete_btn": "Delete",

    // Dashboard Home
    "dashboard.welcome_admin_tag": "Active Administration Portal",
    "dashboard.welcome_resident_tag": "Active Co-owners Portal",
    "dashboard.hello": "Hello,",
    "dashboard.admin_desc": "Welcome to the ResidenSmart administration platform. Here you can publish official announcements, coordinate fault reports, audit fee transfers, and manage amenity bookings.",
    "dashboard.resident_desc": "Welcome to your ResidenSmart digital portal. Here you can manage your property services, schedule common areas, and consult your statements efficiently and transparently.",
    "dashboard.recollection_june": "Recollection (June)",
    "dashboard.to_collect": "To Collect",
    "dashboard.to_approve": "To Approve",
    "dashboard.payments": "payments",
    "dashboard.review_proofs": "Review Receipts",
    "dashboard.account_balance": "Account Statement",
    "dashboard.balance_pending": "Pending",
    "dashboard.balance_ok": "Up to date",
    "dashboard.pay_maintenance": "Pay Maintenance",
    "dashboard.cutoff_notice": "Next standard due date: Day 10",
    "dashboard.admin_actions": "Administrative Actions",
    "dashboard.quick_services": "Quick Services",
    "dashboard.create_announcement": "Create Announcement",
    "dashboard.generate_charge": "Generate Charge",
    "dashboard.reported_defects": "Reported Defects",
    "dashboard.view_bookings": "View Bookings",
    "dashboard.book_areas": "Book Areas",
    "dashboard.report_defect": "Report Defect",
    "dashboard.elevator_light": "Elevator Light",
    "dashboard.copy_security": "Copy Security",
    "dashboard.elevator_light_setup": "We have prepared the fields to report an electrical failure in the elevator.",
    "dashboard.emergency_alert": "RESIDENSMART EMERGENCY PHONES:\n\n• Main Security Gate: +52 55 9002 1100\n• Night Concierge: +52 55 9002 1122\n• South Zone Civil Protection: 911 / 55 5658 1111\n\nClick to copy.",
    "dashboard.announcements_title": "Administration Notices",
    "dashboard.announcements_count": "notices",
    "dashboard.announcements_no_notices": "There are no official announcements published at this time in this co-ownership.",
    "dashboard.announcements_read_more": "Read more →",
    "dashboard.announcements_urgent": "Urgent",
    "dashboard.announcements_maintenance": "Maintenance",
    "dashboard.announcements_event": "Social Event",
    "dashboard.support_title": "Administration & Support",
    "dashboard.support_admin": "Resident Administrator",
    "dashboard.support_security": "24 hr Gate Security",
    "dashboard.support_tech": "Maintenance Guard",
    "dashboard.support_copiado": "Phone copied.",
    "dashboard.support_rules": "Internal Regulations",
    "dashboard.support_rules_desc": "Remember that outdoor music volume must be moderate starting at 22:00. Let's maintain a peaceful and assertive neighborhood.",
    "dashboard.support_rules_btn": "View all bylaws",
    "dashboard.support_rules_alert": "RESIDENSMART FOUNDING REGULATIONS:\n\n1. Pets must be leashed in common green areas.\n2. Each apartment has 2 assigned numbered spots.\n3. It is mandatory to notify moves 48 hours in advance.\n4. Standard maintenance fee expires on the 10th of each month.",
    "dashboard.announcement_modal_date": "NOTICE",
    "dashboard.announcement_modal_author": "Issued by:",
    "dashboard.announcement_modal_close": "Understood / Close Notice",
    "dashboard.join_modal_title": "Join a Condominium",
    "dashboard.join_modal_subtitle": "Enter the Join Code or NIT",
    "dashboard.join_code_label": "Join Code / Condominium NIT",
    "dashboard.join_verify_btn": "Verify Code",
    "dashboard.join_searching": "Searching Condominium...",
    "dashboard.join_found": "Condominium Found",
    "dashboard.join_select_unit": "Select your Unit / Apartment",
    "dashboard.join_no_units": "This condominium has no apartments generated yet.",
    "dashboard.join_back": "Back",
    "dashboard.join_confirm": "Confirm and Enter",
    "dashboard.join_submitting": "Joining...",
    "dashboard.footer_status": "Service Status • Operational",
    "dashboard.footer_designed": "Designed by ResidenSmart Digital",

    // Payments Section
    "payments.deudor_title": "Your maintenance balance",
    "payments.cargos_pendientes": "pending charges",
    "payments.prox_vencimiento": "Next Due Date",
    "payments.no_pending": "No pending payments",
    "payments.corte_ordinario": "Standard cutoff: Day 10",
    "payments.secure_title": "100% Secure Payments",
    "payments.secure_desc": "Encrypted processing system for cards, bank transfers, and wire validation.",
    "payments.secure_cert": "CondoSafe SSL Certificate",
    "payments.tab_pending": "To Pay",
    "payments.tab_history": "History",
    "payments.btn_simulate": "Simulate Admin Charge",
    "payments.simulate_success": "Charge added.",
    "payments.no_pending_title": "Up to date with your payments!",
    "payments.no_pending_desc": "You have no outstanding debts registered to your apartment.",
    "payments.category_maintenance": "Maintenance",
    "payments.category_amenity": "Amenity",
    "payments.category_fine": "Fine",
    "payments.category_other": "Other",
    "payments.vence_el": "Due on:",
    "payments.ref_label": "Ref:",
    "payments.total_pay": "Total to pay",
    "payments.pay_now": "Pay Now",
    "payments.history_no_transactions": "No transactions in your history yet.",
    "payments.history_concept": "Concept",
    "payments.history_reference": "Reference",
    "payments.history_method": "Method",
    "payments.history_date": "Payment Date",
    "payments.history_amount": "Amount",
    "payments.history_status": "Status / Receipt",
    "payments.method_credit_card": "Credit Card",
    "payments.method_bank_transfer": "SPEI Transfer",
    "payments.method_cash": "Validated deposit",
    "payments.history_pending_process": "Pending processing",
    "payments.status_review": "Under Review",
    "payments.status_paid": "Paid",
    "payments.receipt_view_pdf": "Viewing tax receipt in PDF format for folio: {ref}. Download started.",
    "payments.admin_title": "Approval of Transfers & Payments",
    "payments.admin_subtitle": "Audit and control of payment receipts uploaded by residents.",
    "payments.admin_under_review": "Payments Under Review",
    "payments.admin_uploaded_by": "Uploaded by Resident",
    "payments.admin_proof_attached": "Attached proof:",
    "payments.admin_approve": "Approve Payment",
    "payments.admin_reject": "Reject",
    "payments.admin_no_review": "There are no proofs pending approval at this time.",
    "payments.admin_all_charges": "All Generated Charges",
    "payments.admin_new_charge": "Generate New Charge",
    "payments.admin_table_reference": "Reference",
    "payments.admin_table_concept": "Concept",
    "payments.admin_table_amount": "Amount",
    "payments.admin_table_due": "Due Date",
    "payments.admin_table_status": "Status",
    "payments.admin_table_resident": "Resident",
    "payments.admin_charge_amount_prompt": "Charge amount in MXN (e.g. 1850):",
    "payments.admin_charge_concept_prompt": "Charge concept (e.g. July maintenance fee):",
    "payments.admin_charge_desc": "Extraordinary administrative charge generated.",
    "payments.admin_charge_added": "Administrative charge successfully added.",

    // Bookings Section
    "bookings.title": "My Active Bookings",
    "bookings.no_bookings": "You don't have any active bookings scheduled.",
    "bookings.guest_count_single": "Guest",
    "bookings.guest_count_plural": "Guests",
    "bookings.cost_free": "Free",
    "bookings.status_confirmed": "Confirmed",
    "bookings.status_pending": "Pending Approval",
    "bookings.status_cancelled": "Cancelled",
    "bookings.qr_pass": "QR Pass",
    "bookings.cancel_btn": "Cancel booking",
    "bookings.cancel_confirm": "Are you sure you want to cancel this booking? The charged balance will be refunded automatically.",
    "bookings.catalog_title": "Available Common Areas",
    "bookings.catalog_subtitle": "Plan and reserve the best spaces in ResidenSmart",
    "bookings.max_capacity": "Max capacity",
    "bookings.people": "people",
    "bookings.requires_review": "Requires approval",
    "bookings.rules_btn": "Usage rules",
    "bookings.book_btn": "Book",
    "bookings.qr_modal_title": "Digital Access Pass",
    "bookings.qr_scan_message": "Scan this screen at the amenity's entrance scanner. Ensures restricted capacity of maximum {count} associated people.",
    "bookings.qr_close": "Close Pass",
    "bookings.composer_title": "Book Common Space",
    "bookings.composer_step1": "1. Select Day",
    "bookings.composer_step2": "2. Available Slot",
    "bookings.composer_slot_taken": "Occupied",
    "bookings.composer_slot_avail": "Available",
    "bookings.composer_step3": "3. Number of Guests",
    "bookings.composer_capacity_limit": "Maximum capacity allowed: {capacity} people.",
    "bookings.composer_hourly_rate": "Hourly Rate:",
    "bookings.composer_duration": "Estimated duration:",
    "bookings.composer_duration_hours": "{hours} hours",
    "bookings.composer_duration_hour": "{hours} hour",
    "bookings.composer_total_cost": "Approximate total cost:",
    "bookings.composer_review_notice": "This high-demand amenity (such as the social room) requires administrator approval and a refundable cleaning deposit. We will send you an email when confirmed.",
    "bookings.composer_submit": "Confirm Booking",
    "bookings.admin_title": "Common Areas & Bookings Administration",
    "bookings.admin_subtitle": "Control and approval of scheduled reservations by residents.",
    "bookings.admin_registered": "Registered Bookings",
    "bookings.admin_approve": "Approve",
    "bookings.admin_cancel": "Cancel",

    // Incidents Section
    "incidents.title": "Incident Reports Center",
    "incidents.subtitle": "Report defects in common areas or equipment and stay up to date with corrective maintenance.",
    "incidents.report_btn": "Report Incident",
    "incidents.filter_all": "All",
    "incidents.filter_pending": "In Progress",
    "incidents.filter_resolved": "Resolved",
    "incidents.status_reported": "Reported",
    "incidents.status_assigned": "Technician Assigned",
    "incidents.status_in_progress": "Work Started",
    "incidents.status_resolved": "Solved ✓",
    "incidents.priority_high": "High Priority",
    "incidents.priority_medium": "Medium",
    "incidents.priority_low": "Low",
    "incidents.location_label": "Location",
    "incidents.entered_label": "Reported",
    "incidents.technician_label": "Technician",
    "incidents.desc_title": "Incident Description",
    "incidents.photo_title": "Evidence File / Photo",
    "incidents.photo_full": "View Full",
    "incidents.no_photo": "No photo attached",
    "incidents.progress_title": "Trajectory & Progress",
    "incidents.progress_step1": "Reported",
    "incidents.progress_step1_desc": "Handled by helpdesk",
    "incidents.progress_step2": "Assigned",
    "incidents.progress_step2_desc_notified": "Technician notified",
    "incidents.progress_step2_desc_pending": "In progress",
    "incidents.progress_step3": "Active Attention",
    "incidents.progress_step3_desc": "Technical visit started",
    "incidents.progress_step4": "Resolved",
    "incidents.progress_step4_desc": "Mutual satisfaction",
    "incidents.log_title": "Follow-up Log",
    "incidents.log_placeholder": "Write a comment or query for administration...",
    "incidents.log_author_resident": "Resident",
    "incidents.log_author_tech": "Technician",
    "incidents.log_author_admin": "Admin",
    "incidents.modal_register_title": "Register New Incident",
    "incidents.modal_register_subtitle": "Please detail the defect accurately.",
    "incidents.modal_title_label": "Incident / Defect Title",
    "incidents.modal_title_placeholder": "e.g. Gas leak in boiler #2 / Broken access lock",
    "incidents.modal_location_label": "Precise Location",
    "incidents.modal_location_placeholder": "e.g. Tower B, Ground Floor Left Hallway",
    "incidents.modal_category_label": "Category",
    "incidents.modal_category_plumbing": "Plumbing",
    "incidents.modal_category_electricity": "Electricity / Light",
    "incidents.modal_category_elevator": "Elevators",
    "incidents.modal_category_security": "Security / Access",
    "incidents.modal_category_common": "Common Area / Pool",
    "incidents.modal_category_other": "Other issue",
    "incidents.modal_priority_label": "Recommended Priority",
    "incidents.modal_priority_low_btn": "Low (Cosmetic detail)",
    "incidents.modal_priority_med_btn": "Medium (Affects use)",
    "incidents.modal_priority_high_btn": "High (Danger/Flooding)",
    "incidents.modal_desc_label": "Full Description",
    "incidents.modal_desc_placeholder": "Describe the issue in detail to guide the technician's tools...",
    "incidents.modal_photo_label": "Photo / Screenshot",
    "incidents.modal_photo_drop": "Drop your photo here or click to browse",
    "incidents.modal_photo_sim": "Simulated ready",
    "incidents.no_incidents": "All in Order! No incidents reported in this tab.",
    "incidents.admin_title": "Reports & Defect Management",
    "incidents.admin_subtitle": "Manage, assign, and respond to incidents raised by co-owners.",
    "incidents.admin_active_reports": "Active Reports",
    "incidents.admin_select_placeholder": "Select a report from the list to view updates.",
    "incidents.admin_report_id": "Report ID",
    "incidents.admin_created_at": "Created on",
    "incidents.admin_change_in_progress": "In Progress",
    "incidents.admin_change_resolve": "Resolve",
    "incidents.admin_desc_title": "Resident's Description",
    "incidents.admin_assignment_title": "Technical Personnel Assignment",
    "incidents.admin_tech_assigned": "Assigned Technician",
    "incidents.admin_tech_none": "None",
    "incidents.admin_assign_placeholder": "-- Assign Technician --",
    "incidents.admin_reply_placeholder": "Write a response for the resident...",
    "incidents.admin_reply_btn": "Reply",

    // Directory Section
    "directory.title": "Jobs Directory",
    "directory.subtitle": "Services offered by community residents",
    "directory.new_service": "New Service",
    "directory.register_title": "Register New Service",
    "directory.service_name": "Service Name",
    "directory.resident_name": "Resident Name",
    "directory.contact_number": "Contact Number",
    "directory.save_service": "Save Service",
    "directory.delete_tooltip": "Delete job",
    "directory.call_resident": "Call",
    "directory.no_services": "No services registered in the directory yet."
  }
};

interface LanguageContextType {
  currentLanguage: string;
  languages: { code: string; name: string; isCustom?: boolean }[];
  t: (key: string, defaultValue?: string) => string;
  changeLanguage: (code: string) => void;
  addLanguage: (code: string, name: string, translations: TranslationKeys) => boolean;
  deleteLanguage: (code: string) => void;
  getLanguageTranslations: (code: string) => TranslationKeys;
  getDefaultKeys: () => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('es');
  const [customLanguages, setCustomLanguages] = useState<Record<string, Language>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language settings from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('residensmart_lang');
      if (savedLang) {
        setCurrentLanguage(savedLang);
      }

      const savedCustomLangs = localStorage.getItem('residensmart_custom_langs');
      if (savedCustomLangs) {
        try {
          setCustomLanguages(JSON.parse(savedCustomLangs));
        } catch (e) {
          console.error("Failed to parse custom languages", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const changeLanguage = (code: string) => {
    setCurrentLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('residensmart_lang', code);
    }
  };

  const addLanguage = (code: string, name: string, translations: TranslationKeys): boolean => {
    const formattedCode = code.toLowerCase().trim();
    if (!formattedCode || !name.trim()) return false;
    
    // Don't overwrite default languages
    if (DEFAULT_TRANSLATIONS[formattedCode]) return false;

    const newLang: Language = {
      code: formattedCode,
      name: name.trim(),
      translations,
      isCustom: true
    };

    const updated = {
      ...customLanguages,
      [formattedCode]: newLang
    };

    setCustomLanguages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('residensmart_custom_langs', JSON.stringify(updated));
    }
    
    changeLanguage(formattedCode);
    return true;
  };

  const deleteLanguage = (code: string) => {
    const formattedCode = code.toLowerCase().trim();
    if (DEFAULT_TRANSLATIONS[formattedCode]) return; // Cannot delete system defaults

    const updated = { ...customLanguages };
    delete updated[formattedCode];

    setCustomLanguages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('residensmart_custom_langs', JSON.stringify(updated));
    }

    if (currentLanguage === formattedCode) {
      changeLanguage('es'); // Fallback to Spanish
    }
  };

  const getLanguageTranslations = (code: string): TranslationKeys => {
    const formattedCode = code.toLowerCase().trim();
    if (DEFAULT_TRANSLATIONS[formattedCode]) {
      return DEFAULT_TRANSLATIONS[formattedCode];
    }
    if (customLanguages[formattedCode]) {
      return customLanguages[formattedCode].translations;
    }
    return DEFAULT_TRANSLATIONS.es;
  };

  // Compile list of all available languages
  const languagesList = [
    { code: 'es', name: 'Español', isCustom: false },
    { code: 'en', name: 'English', isCustom: false },
    ...Object.values(customLanguages).map(lang => ({
      code: lang.code,
      name: lang.name,
      isCustom: true
    }))
  ];

  // Translation function lookup
  const t = (key: string, defaultValue?: string): string => {
    if (!isLoaded) {
      // Return default Spanish during server-side render or hydration
      return DEFAULT_TRANSLATIONS.es[key] || defaultValue || key;
    }

    // Check current custom language first
    if (customLanguages[currentLanguage]?.translations[key] !== undefined) {
      return customLanguages[currentLanguage].translations[key];
    }
    
    // Check default languages
    if (DEFAULT_TRANSLATIONS[currentLanguage]?.[key] !== undefined) {
      return DEFAULT_TRANSLATIONS[currentLanguage][key];
    }

    // Fallback to Spanish
    if (DEFAULT_TRANSLATIONS.es[key] !== undefined) {
      return DEFAULT_TRANSLATIONS.es[key];
    }

    // Absolute fallback
    return defaultValue || key;
  };

  const getDefaultKeys = (): string[] => {
    return Object.keys(DEFAULT_TRANSLATIONS.es);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      languages: languagesList,
      t,
      changeLanguage,
      addLanguage,
      deleteLanguage,
      getLanguageTranslations,
      getDefaultKeys
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

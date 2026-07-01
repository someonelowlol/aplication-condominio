# Documentación Técnica de ResidentSmart

Esta documentación describe la arquitectura de configuración del portal **ResidentSmart**, detallando las variables de entorno, datos estáticos de simulación (mock data), tokens de diseño visual (CSS) y parámetros estructurados que pueden modificarse para adaptar la plataforma a diferentes condominios.

---

## 1. Variables de Entorno (`.env.local` / `.env.example`)

El portal utiliza Next.js y Supabase para el control de autenticación de usuarios (condóminos y administradores). Las variables configurables en el archivo de entorno son:

| Variable | Tipo / Valor | Propósito / Uso |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | La dirección del proyecto Supabase (API endpoint). Usada tanto en cliente como en servidor para iniciar sesión y registrar cuentas. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT anon key | Clave pública de acceso anónimo de Supabase para consultar recursos autorizados en la base de datos. |

---

## 2. Datos de Simulación y Configuración Local (`lib/mockData.ts`)

La plataforma cuenta con un potente motor de demostración interactiva que almacena en el estado de React (e inicializa/respalda en `localStorage`) la información del condominio. Modificar los valores exportados en [mockData.ts](file:///c:/programacion/app%20condominios/residensmart/lib/mockData.ts) alterará inmediatamente los datos predefinidos de la demostración.

### A. Perfil de Residente (`CURRENT_RESIDENT`)
Define los detalles del usuario con el que se inicia sesión por defecto en el panel de residente:
- **`id`**: Identificador único del residente (ej. `'res-402'`).
- **`name`**: Nombre completo visible en la barra de navegación y panel superior.
- **`apartment`** / **`tower`**: Identificadores de ubicación de la vivienda (ej. `'Apto. 402'`, `'Torre B'`).
- **`email`**: Dirección de correo electrónico asociada al perfil.
- **`phone`**: Teléfono de contacto.
- **`avatar`**: URL de la foto de perfil (Unsplash u otro servidor de imágenes).
- **`balance`**: Monto de deuda total pendiente visible en la tarjeta de estado financiero.

### B. Listado de Pagos de Cuotas (`INITIAL_PAYMENTS`)
Colección de facturas pendientes de cobro o ya cobradas. Cada objeto de pago contiene:
- **`id`**: Clave única (ej. `'pay-1'`).
- **`title`**: Título explicativo de la cuota (ej. `'Mantenimiento del Mes'`).
- **`description`**: Detalle del cobro que el residente puede inspeccionar al hacer clic.
- **`amount`**: Valor flotante del pago (ej. `1850.00`).
- **`dueDate`**: Fecha límite de pago en formato `AAAA-MM-DD`.
- **`status`**: Estado del pago:
  - `'pending'`: Pendiente, muestra el botón "Pagar Ahora" al residente.
  - `'under_review'`: En revisión por administración tras adjuntar un comprobante.
  - `'paid'`: Pagado y aprobado.
- **`category`**: Clasificación: `'maintenance'` (mantenimiento), `'amenity'` (reservas), `'fine'` (multas) u `'other'` (otros).
- **`reference`**: Código alfanumérico único para transferencias bancarias.

### C. Áreas Comunes / Amenidades (`INITIAL_AMENITIES`)
Define el catálogo de áreas del condominio disponibles para reserva en la pestaña **"Reservar Área"**:
- **`id`**: Identificador (ej. `'am-1'`).
- **`name`**: Nombre de la amenidad (ej. `'Alberca de la Terraza'`, `'Cancha de Pádel'`).
- **`description`**: Texto descriptivo de los servicios provistos en la zona.
- **`iconName`**: Nombre de la clase de icono de *Lucide React* que se dibujará en las tarjetas (ej. `'Waves'`, `'Laptop'`, `'PartyPopper'`, `'Flame'`, `'Dribbble'`).
- **`hourlyRate`**: Tarifa de renta por hora (ej. `50.00`). Poner en `0.00` para que sea gratuita.
- **`capacity`**: Aforo máximo de personas permitidas en la amenidad.
- **`rules`**: Vector de cadenas de texto (`string[]`) con las reglas específicas del área.
- **`image`**: Enlace a la fotografía de portada de la tarjeta.
- **`requiresReview`**: Booleano (`true` / `false`). Si es `true`, la reserva se guardará como pendiente de aprobación por el administrador en su consola. Si es `false`, se confirmará automáticamente.

### D. Reservas del Residente (`INITIAL_BOOKINGS`)
Contiene los registros de citas generados para las amenidades:
- **`status`**: Estado de la reserva: `'confirmed'` (aprobada), `'pending'` (pendiente) o `'cancelled'` (cancelada).
- **`timeSlot`**: Rango horario seleccionado (ej. `'13:00 - 16:00'`).
- **`totalCost`**: Costo total calculado en base a `durationHours` y la tarifa por hora.
- **`qrCode`**: Código simulado de acceso inteligente generado al confirmar la reserva.

### E. Tickets de Soporte / Incidentes (`INITIAL_INCIDENTS`)
Define los reportes de desperfectos en el condominio gestionados bajo la pestaña **"Incidentes"**:
- **`category`**: Tipo de reporte: `'plumbing'` (plomería), `'electricity'` (electricidad), `'elevator'` (elevadores), `'security'` (seguridad), `'common_area'` (área común) u `'other'`.
- **`priority`**: Urgencia del incidente: `'low'` (baja), `'medium'` (media) o `'high'` (alta). Determina el color de la tarjeta de alerta.
- **`status`**: Estado del flujo de reparación:
  - `'reported'`: Reportado inicialmente por el condómino.
  - `'assigned'`: Asignado a un técnico para revisión.
  - `'in_progress'`: Trabajo en progreso activo en el sitio.
  - `'resolved'`: Reparación terminada y validada.
- **`comments`**: Array de comentarios de seguimiento que permite la interacción por chat entre el residente y el administrador.
- **`technicianName`**: Nombre del especialista asignado al ticket (ej. `'Ing. Carlos Gutiérrez'`).

### F. Muro de Anuncios Oficiales (`INITIAL_ANNOUNCEMENTS`)
Mensajes o circulares que el administrador publica para todo el condominio y que aparecen en la sección de "Inicio":
- **`category`**: Tipo de circular: `'info'`, `'maintenance'`, `'urgente'` o `'event'`.
- **`author`**: Autor de la publicación (ej. `'Comité de Seguridad'`).

---

## 3. Variables de Estilo Visual y Diseño (`app/globals.css`)

El aspecto estético premium de ResidentSmart está definido mediante las variables personalizadas del tema en la hoja de estilos global [globals.css](file:///c:/programacion/app%20condominios/residensmart/app/globals.css).

### Colores de Marca y Logo
Agregados específicamente para el logotipo corporativo y elementos destacados:
- **`--color-brand-blue`**: `#0D305F` (Azul Marino del Isotipo).
- **`--color-brand-teal`**: `#0D9488` (Verde Azulado/Teal de Acento).

### Estilo Editorial
Define el fondo general limpio y el contraste de lectura:
- **`--color-editorial-bg`**: `#FDFCFB` (Blanco hueso suave de fondo).
- **`--color-editorial-text`**: `#1A1A1A` (Gris oscuro casi negro de lectura principal).
- **`--color-editorial-muted`**: `#8C857B` (Marrón grisáceo para subtítulos e información secundaria).
- **`--color-editorial-border`**: `#E5E1DA` (Gris claro premium para bordes sutiles y divisiones).
- **`--color-editorial-highlight`**: `#F5F2ED` (Fondo grisáceo de contraste interactivo).

### Fuentes Tipográficas
- **`--font-sans`**: `"Inter"`, tipografía limpia de interfaz.
- **`--font-serif`**: `"Playfair Display"`, fuente con serifas utilizada para títulos estilizados en cursivas.
- **`--font-mono`**: `"JetBrains Mono"`, tipografía monoespaciada para consolas, folios y referencias.

---

## 4. Estructura de Pestañas de la Administración (`components/design/admin/AdminSidebar.tsx`)

La barra lateral izquierda de la consola de administración obtiene su menú dinámico a partir del arreglo `ADMIN_TABS` definido en [AdminSidebar.tsx](file:///c:/programacion/app%20condominios/residensmart/components/design/admin/AdminSidebar.tsx). Cada elemento posee:
- **`id`**: Identificador interno que carga el componente de área de trabajo correspondiente en `AdminWorkspace.tsx` (ej. `'finanzas'`, `'seguridad'`, `'legal'`, `'ia_iot'`).
- **`label`**: Nombre principal de la pestaña (ej. `'Finanzas Core'`).
- **`sublabel`**: Breve descripción del área de gestión visible abajo del título.
- **`icon`**: Icono Lucide importado.

---

## 5. Simulación de APIs de Terceros y Configuración Extra

### Pasarela de Pagos (Stripe API)
En el módulo de contabilidad general [AdminFinanzas.tsx](file:///c:/programacion/app%20condominios/residensmart/components/design/admin/AdminFinanzas.tsx), la integración para procesar cobros automáticos utiliza variables de clave de demostración para alternar entre entornos:
- **Test Sandbox Key**: `'pk_test_51Mzc28JResidenSmartSandbox'`
- **Live Production Key**: `'pk_live_51Mzc28JResidenSmart2299'`

### Motor de Inteligencia Artificial (AI Engine)
En la sección **"Tecnología IA/IoT"** [AdminTecnologia.tsx](file:///c:/programacion/app%20condominios/residensmart/components/design/admin/AdminTecnologia.tsx), se puede alterar el mensaje de saludo del asistente virtual editando la propiedad `text` del primer mensaje en el historial del chatbot interactivo.

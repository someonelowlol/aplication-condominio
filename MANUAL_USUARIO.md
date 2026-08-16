# Guía y Manual de Usuario de ResidentSmart 🏢✨

¡Bienvenido a **ResidentSmart**! La plataforma premium e inteligente para la gestión y convivencia en tu condominio. Esta guía está diseñada para que tanto nuevos **residentes (condóminos)** como **administradores** puedan dominar todas las funcionalidades de la plataforma desde el primer día.

---

## 📌 Índice de Contenidos
1. [Introducción y Acceso](#1-introducción-y-acceso)
2. [Guía para el Residente (Condómino)](#2-guía-para-el-residente-condómino)
   - [Inicio / Panel Principal](#inicio--panel-principal)
   - [Finanzas y Pago de Cuotas](#finanzas-y-pago-de-cuotas)
   - [Reserva de Áreas Comunes (Amenidades)](#reserva-de-áreas-comunes-amenidades)
   - [Reporte de Incidentes / Soporte](#reporte-de-incidentes--soporte)
   - [Directorio Comunitario](#directorio-comunitario)
3. [Guía para el Administrador](#3-guía-para-el-administrador)
   - [Dashboard de Administración](#dashboard-de-administración)
   - [Finanzas Core e Integración con Stripe](#finanzas-core-e-integración-con-stripe)
   - [Control de Reservas y Aprobaciones](#control-de-reservas-y-aprobaciones)
   - [Gestión de Mantenimiento y Tickets](#gestión-de-mantenimiento-y-tickets)
   - [Seguridad, Accesos e IoT](#seguridad-accesos-e-iot)
   - [Módulo Legal y Documentación](#módulo-legal-y-documentación)
   - [Asistente IA y Chatbot Inteligente](#asistente-ia-y-chatbot-inteligente)
4. [Soporte Técnico y Solución de Problemas](#4-soporte-técnico-y-solución-de-problemas)

---

## 1. Introducción y Acceso

ResidentSmart es un portal responsivo integrado con servicios de autenticación y base de datos (Supabase). 

### 🔐 Cómo iniciar sesión:
1. Navega a la dirección del portal de tu condominio.
2. Ingresa tu correo electrónico registrado y contraseña en la pantalla de inicio de sesión.
3. Si eres un nuevo residente, solicita tu registro previo al administrador para que tu cuenta sea vinculada a tu unidad (departamento o casa).

---

## 2. Guía para el Residente (Condómino)

Al ingresar con el perfil de residente, tendrás acceso a tu barra lateral de navegación con las secciones principales de interacción.

### 🏠 Inicio / Panel Principal
El panel principal te da una vista rápida de tu estado en el condominio:
* **Tarjeta de Balance**: Muestra el monto total acumulado de tus deudas pendientes (mantenimiento, reservas, multas).
* **Muro de Anuncios**: Consulta circulares oficiales emitidas por la administración (avisos urgentes, eventos, mantenimientos programados).
* **Resumen de Actividad**: Vista rápida de tus próximas reservas y el estado de tus últimos incidentes.

### 💳 Finanzas y Pago de Cuotas
En la sección de **Pagos**, puedes llevar un control estricto de tus finanzas:
1. **Historial de Cuotas**: Clasificado por cuotas de mantenimiento (`maintenance`), reservas (`amenity`), multas (`fine`) u otros (`other`).
2. **Métodos de Pago**:
   * **Pago Digital (Stripe)**: Haz clic en **"Pagar Ahora"** en las cuotas pendientes para realizar una transacción segura e inmediata con tarjeta de crédito/débito.
   * **Transferencia Bancaria**: Copia la referencia alfanumérica única (`reference`) de la cuota, realiza la transferencia desde la app de tu banco y adjunta el comprobante digital en el portal.
3. **Estado de Pagos**:
   * `Pendiente`: Requiere pago.
   * `En Revisión`: Pago realizado mediante comprobante, esperando confirmación administrativa.
   * `Pagado`: Transacción completada con éxito.

### 📅 Reserva de Áreas Comunes (Amenidades)
Disfruta de los espacios recreativos de tu condominio reservando en línea:
1. Entra a la pestaña **"Reservar Área"**.
2. Explora las amenidades disponibles (Alberca, Cancha de Pádel, Salón de Eventos, Gimnasio, etc.). Cada tarjeta muestra el aforo máximo y las reglas específicas del área.
3. Selecciona la fecha y el bloque de horario deseado.
4. Si la amenidad tiene costo, el sistema calculará automáticamente la tarifa total basada en el valor por hora (`hourlyRate`).
5. **Acceso Inteligente (Código QR)**: Al confirmarse tu reserva (de forma automática o aprobada por administración), se generará un código QR dinámico. Descárgalo para escanearlo en las cerraduras inteligentes de acceso al área reservada.

### 🛠️ Reporte de Incidentes / Soporte
Si detectas algún fallo en el condominio o en tu unidad privada:
1. Ve a la pestaña **"Incidentes"** y haz clic en **"Reportar Incidente"**.
2. Completa los campos: Categoría (plomería, electricidad, elevadores, seguridad, áreas comunes), prioridad (baja, media o alta) y una descripción clara.
3. **Seguimiento Interactivo**: Dentro de la tarjeta de tu reporte, podrás ver qué técnico ha sido asignado (`technicianName`) y chatear directamente con el administrador para brindar detalles o fotos.
4. **Estados del Ticket**: Sigue el progreso desde `Reportado` ➡️ `Asignado` ➡️ `En Progreso` ➡️ `Resuelto`.

### 📞 Directorio Comunitario
Accede a los números de emergencia internos, datos de contacto de la mesa directiva y servicios autorizados (cerrajeros, fontaneros, servicios médicos locales) recomendados por el condominio.

---

## 3. Guía para el Administrador

El panel de administración cuenta con herramientas avanzadas para la gestión diaria y control operativo integral del desarrollo inmobiliario.

### 📊 Dashboard de Administración
Una consola de control global con métricas clave en tiempo real:
* Tasa de recaudación mensual (pagos recibidos vs. pendientes).
* Número de incidentes activos y solicitudes de reserva pendientes de aprobación.
* Gráficos dinámicos de flujo de caja y estatus ocupacional.

### 💰 Finanzas Core e Integración con Stripe
Administra las cuentas del condominio con total transparencia:
* **Conciliación**: Revisa los comprobantes de transferencia adjuntados por los residentes, compáralos con el estado de cuenta y apruébalos o recházalos con un solo clic.
* **Cargos manuales**: Genera nuevas cuotas mensuales, cargos extraordinarios o multas individualmente o de forma masiva para todos los condóminos.
* **Pasarela de Pagos**: Cambia entre entornos de desarrollo/pruebas (`Test Sandbox`) y producción (`Live Production`) en la configuración del conector Stripe para asegurar que los depósitos en línea lleguen correctamente a la cuenta bancaria del condominio.

### 📝 Control de Reservas y Aprobaciones
* **Reglas de Aprobación**: Ciertas amenidades críticas (ej. Salón de Eventos) requieren tu validación para evitar sobrecupos o conflictos de calendario. Revisa las solicitudes entrantes, confirma el pago de la tarifa (si aplica) y apruébalas para detonar la generación automática del código QR de acceso del residente.
* **Bloqueos de Calendario**: Reserva horarios específicos para tareas de mantenimiento preventivo, impidiendo que los residentes los seleccionen.

### 🔧 Gestión de Mantenimiento y Tickets
Mantén el condominio en óptimas condiciones operativas:
1. Revisa la bandeja de **Incidentes**.
2. Asigna un técnico del staff (ej. electricista, plomero) al ticket.
3. Actualiza el estado a `En Progreso` para informar al residente.
4. Comunícate mediante el chat interno del ticket para pedir más información o coordinar la hora de visita.
5. Marca como `Resuelto` una vez terminados los trabajos.

### 🛡️ Seguridad, Accesos e IoT
* **Bitácora de Accesos**: Monitorea los ingresos de visitantes, proveedores de servicio y entregas a domicilio autorizadas.
* **Videovigilancia**: Acceso directo al streaming de las cámaras de seguridad instaladas en los puntos críticos de acceso y áreas comunes.
* **Dispositivos IoT**: Monitoreo en tiempo real del estado de bombas de agua, iluminación automatizada y sensores de humo de las áreas comunes.

### ⚖️ Módulo Legal y Documentación
* **Repositorio de Documentos**: Sube actas de asambleas, reglamentos de convivencia y contratos con proveedores para que estén siempre accesibles.
* **Gestión de Contratos**: Alertas automáticas de vencimiento de contratos de pólizas de mantenimiento de elevadores, jardinería y seguros contra catástrofes.

### 🤖 Asistente IA y Chatbot Inteligente
* El portal cuenta con un **Asistente Virtual con Inteligencia Artificial** incorporado para los residentes.
* Como administrador, puedes modificar el mensaje de bienvenida y las reglas de operación básicas en la pestaña **"Tecnología IA/IoT"** para enseñarle al chatbot a responder preguntas frecuentes (reglamento interno, horarios de recolección de basura, etc.) de forma autónoma.

---

## 4. Soporte Técnico y Solución de Problemas

> [!IMPORTANT]
> **El portal no carga la información correcta o está lento:**
> Intenta refrescar el navegador. Los datos de demostración interactiva se guardan en el almacenamiento local (`localStorage`) de tu navegador; si persisten problemas, puedes limpiar la caché o reestablecer la sesión.

> [!WARNING]
> **Error de Autenticación / Registro de nuevo usuario:**
> Si un residente no puede registrarse, verifica que su correo esté debidamente dado de alta en la base de datos de Supabase y que las claves `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas correctamente en el servidor.

> [!TIP]
> **Integración Stripe:**
> Asegúrate de usar siempre la clave de Sandbox (`pk_test_...`) para pruebas de desarrollo antes de pasar al modo de producción (`pk_live_...`).

---
*ResidentSmart — Conectando comunidades, simplificando la administración.*

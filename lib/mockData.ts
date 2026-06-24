import { Resident, Payment, Amenity, Booking, Incident, Announcement } from './types';

export const CURRENT_RESIDENT: Resident = {
  id: 'res-402',
  name: 'Luis Martínez',
  apartment: 'Apto. 402',
  tower: 'Torre B',
  email: 'luis.martinez@condofeliz.com',
  phone: '+52 55 4321 0987',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  balance: 2150.00
};

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    title: 'Mantenimiento del Mes - Junio 2026',
    description: 'Cuota de mantenimiento ordinaria correspondiente al mes de Junio 2026. Incluye seguridad 24/7, limpieza, agua de áreas comunes y mantenimiento general.',
    amount: 1850.00,
    dueDate: '2026-06-10',
    status: 'pending',
    category: 'maintenance',
    reference: 'REF-2026-06-402'
  },
  {
    id: 'pay-2',
    title: 'Reserva de Salón de Eventos',
    description: 'Cargo por uso de Salón de Eventos el día 23 de Mayo de 2026.',
    amount: 300.00,
    dueDate: '2026-06-15',
    status: 'pending',
    category: 'amenity',
    reference: 'REF-BOOK-882'
  },
  {
    id: 'pay-3',
    title: 'Mantenimiento del Mes - Mayo 2026',
    description: 'Cuota de mantenimiento ordinaria correspondiente al mes de Mayo 2026.',
    amount: 1850.00,
    dueDate: '2026-05-10',
    status: 'paid',
    category: 'maintenance',
    reference: 'REF-2026-05-402',
    paidAt: '2026-05-08 14:32',
    paymentMethod: 'bank_transfer'
  },
  {
    id: 'pay-4',
    title: 'Multa por Obstrucción de Estacionamiento',
    description: 'Sanción administrativa estipulada en reglamento interno. Obstrucción de cajón ajeno el día 12 de Abril.',
    amount: 500.00,
    dueDate: '2026-05-01',
    status: 'paid',
    category: 'fine',
    reference: 'REF-FINE-042',
    paidAt: '2026-04-29 09:15',
    paymentMethod: 'credit_card'
  },
  {
    id: 'pay-5',
    title: 'Mantenimiento del Mes - Abril 2026',
    description: 'Cuota de mantenimiento ordinaria correspondiente al mes de Abril 2026.',
    amount: 1850.00,
    dueDate: '2026-04-10',
    status: 'paid',
    category: 'maintenance',
    reference: 'REF-2026-04-402',
    paidAt: '2026-04-05 18:22',
    paymentMethod: 'bank_transfer'
  }
];

export const INITIAL_AMENITIES: Amenity[] = [
  {
    id: 'am-1',
    name: 'Alberca de la Terraza',
    description: 'Alberca templada ubicada en el Roof Garden. Cuenta con camastros, sombrillas y baños equipados. Excelente para pasar la tarde.',
    iconName: 'Waves',
    hourlyRate: 50.00,
    capacity: 15,
    rules: [
      'Prohibido el uso de envases de vidrio en el área.',
      'Uso obligatorio de traje de baño.',
      'Los niños deben estar acompañados de un adulto en todo momento.',
      'Máximo 5 invitados por departamento.'
    ],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=640&auto=format&fit=crop',
    requiresReview: false
  },
  {
    id: 'am-2',
    name: 'Sala de Juntas / Co-working',
    description: 'Espacio acondicionado con mesa de juntas, Internet de alta velocidad, pintarrón y pantalla para presentaciones. Aire acondicionado disponible.',
    iconName: 'Laptop',
    hourlyRate: 0.00, // Gratuito para residentes
    capacity: 8,
    rules: [
      'Reservar con al menos 2 horas de anticipación.',
      'Mantener un volumen de voz moderado.',
      'Prohibido alimentos pesados que dejen olor.',
      'Dejar el espacio limpio al terminar la reserva.'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=640&auto=format&fit=crop',
    requiresReview: false
  },
  {
    id: 'am-3',
    name: 'Salón de Eventos Sociales',
    description: 'Salón amplio de doble altura con cocina integrada, baños independientes, aire acondicionado y barra para bar. Espacio techado elegante.',
    iconName: 'PartyPopper',
    hourlyRate: 150.00,
    capacity: 80,
    rules: [
      'La música debe moderarse a partir de las 22:00 hrs y apagarse a las 00:00 hrs.',
      'Costo de limpieza de $500 MXN obligatorio si no se entrega en el mismo estado.',
      'Depósito en garantía requerido de $2,000 MXN re-embolsable.'
    ],
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=640&auto=format&fit=crop',
    requiresReview: true
  },
  {
    id: 'am-4',
    name: 'Asadores de Jardín',
    description: 'Asadores de carbón de acero inoxidable, tarja con agua corriente, mesa de madera y bancas tipo picnic bajo pérgola.',
    iconName: 'Flame',
    hourlyRate: 40.00,
    capacity: 12,
    rules: [
      'El residente debe suministrar carbón e implementos de encendido.',
      'Apagar completamente las brasas antes de retirarse.',
      'Utilizar bolsas de basura para los residuos en el contenedor indicado.'
    ],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=640&auto=format&fit=crop',
    requiresReview: false
  },
  {
    id: 'am-5',
    name: 'Cancha de Pádel',
    description: 'Cancha exterior acristalada con iluminación LED para partidos nocturnos. Superficie de césped sintético de alta densidad.',
    iconName: 'Dribbble',
    hourlyRate: 80.00,
    capacity: 4,
    rules: [
      'Uso obligatorio de calzado deportivo de suela lisa (no tachuelas).',
      'Reservar máximo 2 horas consecutivas.',
      'La iluminación nocturna se apaga automáticamente a las 22:30 hrs.'
    ],
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=640&auto=format&fit=crop',
    requiresReview: false
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    amenityId: 'am-4',
    amenityName: 'Asadores de Jardín',
    date: '2026-06-14',
    timeSlot: '13:00 - 16:00',
    durationHours: 3,
    totalCost: 120.00,
    status: 'confirmed',
    residentId: 'res-402',
    guestCount: 6,
    createdAt: '2026-06-11 10:20',
    qrCode: 'RESERV-ASADOR-B402-8a9d'
  },
  {
    id: 'book-2',
    amenityId: 'am-2',
    amenityName: 'Sala de Juntas / Co-working',
    date: '2026-06-16',
    timeSlot: '09:00 - 11:00',
    durationHours: 2,
    totalCost: 0.00,
    status: 'confirmed',
    residentId: 'res-402',
    guestCount: 2,
    createdAt: '2026-06-12 15:45',
    qrCode: 'RESERV-SALA-B402-3c2f'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Filtración de agua en pasillo del piso 4',
    category: 'plumbing',
    priority: 'high',
    location: 'Torre B, pasillo común enfrente del elevador',
    description: 'Hay una mancha de humedad activa que gotea constantemente y está humedeciendo la alfombra. Parece venir del departamento superior o del desagüe de aire acondicionado de la torre.',
    status: 'in_progress',
    createdAt: '2026-06-10 08:30',
    updatedAt: '2026-06-12 11:20',
    images: ['https://images.unsplash.com/photo-1585773898144-802521d96bd5?q=80&w=640&auto=format&fit=crop'],
    technicianName: 'Ing. Carlos Gutiérrez (Plomería)',
    comments: [
      {
        id: 'inc-comm-1',
        authorName: 'Luis Martínez',
        authorRole: 'resident',
        content: 'Reporto esto con carácter urgente para evitar daños al piso del pasillo.',
        createdAt: '2026-06-10 08:33'
      },
      {
        id: 'inc-comm-2',
        authorName: 'Soporte Administración',
        authorRole: 'admin',
        content: 'Hemos recibido su reporte. Ya se le asignó un plomero certificado para diagnosticar el origen.',
        createdAt: '2026-06-10 10:15'
      },
      {
        id: 'inc-comm-3',
        authorName: 'Ing. Carlos Gutiérrez',
        authorRole: 'technician',
        content: 'Visité la zona el día de hoy. Detecté una fisura en el tubo de drenaje pluvial que pasa por el ducto del piso 5. Mañana temprano realizaremos el reemplazo del segmento de PVC dañado.',
        createdAt: '2026-06-12 11:20'
      }
    ]
  },
  {
    id: 'inc-2',
    title: 'Luz intermitente en elevador principal',
    category: 'electricity',
    priority: 'medium',
    location: 'Torre B, elevador de pasajeros #1',
    description: 'La bombilla/tubo LED principal del techo parpadea constantemente durante el viaje. Es muy molesto y causa desorientación.',
    status: 'reported',
    createdAt: '2026-06-12 19:40',
    updatedAt: '2026-06-12 19:40',
    images: [],
    comments: [
      {
        id: 'inc-comm-4',
        authorName: 'Luis Martínez',
        authorRole: 'resident',
        content: 'Ocurre sobre todo cuando el elevador está subiendo del piso 2 al 6.',
        createdAt: '2026-06-12 19:41'
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mantenimiento Preventivo de Elevadores de Torre A y B',
    content: 'Estimados residentes, les informamos que el próximo martes 16 de Junio de 2026 se realizará el mantenimiento semestral preventivo a los elevadores. Los elevadores de Torre A estarán fuera de servicio de 09:00 a 13:00 hrs y los de Torre B de 13:30 a 17:30 hrs. Agradecemos su paciencia y comprensión.',
    date: '2026-06-12',
    category: 'maintenance',
    author: 'Administrador General'
  },
  {
    id: 'ann-2',
    title: 'Corte Programado por Fumigación de Áreas Verdes',
    content: 'Se informa que el sábado 20 de Junio de 10:00 a 15:00 se llevará a cabo la fumigación periódica contra plagas en todos los jardines de áreas comunes y exteriores. Se solicita no pasear mascotas por el césped durante ese periodo y mantener cerradas ventanas frontales de los primeros tres pisos.',
    date: '2026-06-11',
    category: 'urgente',
    author: 'Comité de Seguridad e Higiene'
  },
  {
    id: 'ann-3',
    title: '¡Clases Gratuitas de Yoga por las Mañanas!',
    content: 'A partir del próximo lunes, todos los residentes están formalmente invitados a las sesiones de Hatha Yoga grupales en el jardín central. Horario: lunes, miércoles y viernes de 07:00 a 08:00 AM. Entrada libre, solo requieres traer un tapete propio y muchas ganas de empezar el día con la mejor energía.',
    date: '2026-06-08',
    category: 'event',
    author: 'Comisión de Bienestar'
  }
];

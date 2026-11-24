import type { BudgetCategoryKey, ProjectDocument } from '../types/set';

export const DEFAULT_SMMLV_COP = 1423500;
export const MAX_SMMLV_PER_PROJECT = 63;

export const SENA_REGIONALES: string[] = [
  'Regional Amazonas',
  'Regional Antioquia',
  'Regional Arauca',
  'Regional Atlántico',
  'Regional Bolívar',
  'Regional Boyacá',
  'Regional Caldas',
  'Regional Caquetá',
  'Regional Casanare',
  'Regional Cauca',
  'Regional Cesar',
  'Regional Chocó',
  'Regional Córdoba',
  'Regional Cundinamarca',
  'Regional Distrito Capital',
  'Regional Guainía',
  'Regional Guaviare',
  'Regional Huila',
  'Regional La Guajira',
  'Regional Magdalena',
  'Regional Meta',
  'Regional Nariño',
  'Regional Norte de Santander',
  'Regional Putumayo',
  'Regional Quindío',
  'Regional Risaralda',
  'Regional San Andrés',
  'Regional Santander',
  'Regional Sucre',
  'Regional Tolima',
  'Regional Valle del Cauca',
  'Regional Vaupés',
  'Regional Vichada',
];

export const GOLDEN_RULES = [
  {
    id: 'techo',
    label: 'Techo Financiero',
    value: '63 SMMLV',
    detail: 'Tope máximo por proyecto regional (Art. 15, Par. 3). Incluye impuestos y GMF.',
  },
  {
    id: 'cofinanciacion',
    label: 'Cofinanciación',
    value: '100% SENA / 0% Contrapartida',
    detail: 'Financiado totalmente con recursos DECT (10% del fondo); sin aportes de empresas.',
  },
  {
    id: 'mecanismo',
    label: 'Mecanismo Legal',
    value: 'Traslado Directo',
    detail: 'Ejecución institucional directa SENA (Art. 10). No suscribe convenios especiales.',
  },
  {
    id: 'hito',
    label: 'Hito Perentorio RP',
    value: '31 de Agosto',
    detail: '100% de recursos con Registro Presupuestal (RP) perfeccionado o serán centralizados.',
  },
];

export const RACI_MATRIX = [
  {
    activity: 'Expedición de lineamientos y techos de mercado',
    dsnft: 'R / A',
    regional: 'I',
    subdirector: 'I',
    coordinador: 'I',
    apoyo: 'I',
  },
  {
    activity: 'Mesas territoriales e identificación de brechas',
    dsnft: 'I',
    regional: 'A',
    subdirector: 'C',
    coordinador: 'R',
    apoyo: 'I',
  },
  {
    activity: 'Formulación técnica y presupuestal del proyecto',
    dsnft: 'I',
    regional: 'A',
    subdirector: 'C',
    coordinador: 'R',
    apoyo: 'C',
  },
  {
    activity: 'Evaluación, viabilización y traslado presupuestal',
    dsnft: 'R / A',
    regional: 'I',
    subdirector: 'I',
    coordinador: 'I',
    apoyo: 'I',
  },
  {
    activity: 'Estudios previos y contratación pública',
    dsnft: 'I',
    regional: 'I',
    subdirector: 'A',
    coordinador: 'R (Téc.)',
    apoyo: 'R (Jur./Fin.)',
  },
  {
    activity: 'Compromiso presupuestal (CDP / RP antes 31-ago)',
    dsnft: 'I',
    regional: 'C',
    subdirector: 'A',
    coordinador: 'C',
    apoyo: 'R',
  },
  {
    activity: 'Ejecución académica y control de asistencia',
    dsnft: 'I',
    regional: 'I',
    subdirector: 'A',
    coordinador: 'R',
    apoyo: 'I',
  },
  {
    activity: 'Seguimiento, cierre y gestión del conocimiento',
    dsnft: 'A',
    regional: 'C',
    subdirector: 'A',
    coordinador: 'R',
    apoyo: 'C',
  },
];

export const BUDGET_CATEGORIES: Array<{
  key: BudgetCategoryKey;
  title: string;
  authorized: string[];
  prohibited: string[];
}> = [
  {
    key: 'talento_experto',
    title: 'Talento Experto e Interpretación',
    authorized: [
      'Honorarios de expertos y líderes nacionales e internacionales.',
      'Honorarios de expertos internos (cuando aplique según normativa vigente).',
      'Honorarios por interpretación simultánea en conferencias/foros y alquiler de equipos asociados.',
    ],
    prohibited: [
      'Salarios o prestaciones sociales de personal administrativo permanente del Centro o Regional.',
      'Bonificaciones no autorizadas en los lineamientos DSNFT.',
    ],
  },
  {
    key: 'movilidad_expertos',
    title: 'Movilidad y Manutención de Expertos',
    authorized: [
      'Tiquetes aéreos nacionales e internacionales para expertos externos e internos.',
      'Transporte intermunicipal terrestre o fluvial.',
      'Alojamiento, alimentación y transporte local para expertos externos e internos.',
    ],
    prohibited: [
      'Gastos de representación, eventos sociales o viáticos que excedan tarifas oficiales y techos del estudio de mercado.',
    ],
  },
  {
    key: 'logistica_trabajadores',
    title: 'Logística de Trabajadores Beneficiarios',
    authorized: [
      'Alimentación (refrigerios/almuerzos según jornada), transporte local e intermunicipal terrestre/fluvial de trabajadores.',
      'Costos de Inmersión Especializada Internacional o competencias de habilidades técnicas (solo si DSNFT habilita).',
    ],
    prohibited: [
      'Actividades turísticas, recreativas, comerciales o de representación empresarial (Art. 11, Par. 2).',
      'Subsidios de sostenimiento o pagos directos en efectivo a trabajadores.',
    ],
  },
  {
    key: 'materiales_ambientes',
    title: 'Materiales, Insumos y Ambientes',
    authorized: [
      'Materiales para la experiencia de aprendizaje e insumos para actividades prácticas.',
      'Experiencia de aprendizaje virtual.',
      'Alquiler de salones, espacios físicos, herramientas tecnológicas y conectividad de alta velocidad.',
      'Alquiler de equipos especializados, herramientas prácticas, licencias de software y equipos de transmisión.',
    ],
    prohibited: [
      'Compra de activos fijos, maquinaria permanente, mobiliario o adecuaciones de infraestructura física de los Centros.',
      'Dotación general no vinculada a la práctica formativa.',
    ],
  },
  {
    key: 'divulgacion_garantias',
    title: 'Divulgación, Gestión y Garantías',
    authorized: [
      'Promoción, divulgación (materiales de apoyo) y gestión del conocimiento de la experiencia.',
      'Pólizas de seguro requeridas para la ejecución del proyecto.',
    ],
    prohibited: [
      'Publicidad comercial, mercadeo de productos/servicios (Art. 24).',
      'Gastos de operación del 15% o 20% ni Transferencia de Conocimiento del 1% (exclusivos de Líneas 1 y 2).',
    ],
  },
];

export const AUDIT_CHECKLIST_DEFINITION = [
  {
    id: 'formulacion',
    fase: 'Formulación',
    puntoControl: 'Acta de mesa territorial con actores productivos y alineación con CRCI / ArCo / CONPES 4129.',
    responsableDefault: 'Dir. Regional / Enlace SET',
  },
  {
    id: 'pertinencia',
    fase: 'Pertinencia',
    puntoControl: 'Verificación de que las experiencias de aprendizaje no corresponden a oferta regular SENA ni formación básica.',
    responsableDefault: 'Coordinación Académica',
  },
  {
    id: 'presupuesto',
    fase: 'Presupuesto',
    puntoControl: 'Presupuesto ≤ 63 SMMLV, 0% contrapartida, sin gastos de operación y ajustado al estudio de mercado DSNFT (impuestos incluidos).',
    responsableDefault: 'Enlace SET / Presupuesto',
  },
  {
    id: 'contratacion',
    fase: 'Contratación',
    puntoControl: '100% de los recursos trasladados cuentan con Registro Presupuestal (RP) perfeccionado a más tardar el 31 de agosto.',
    responsableDefault: 'Subdirector / Contratación',
  },
  {
    id: 'ejecucion',
    fase: 'Ejecución',
    puntoControl: 'Listados de asistencia, autorizaciones de datos personales (Ley 1581 de 2012) y garantía de gratuidad verificada.',
    responsableDefault: 'Supervisión / Coord. Acad.',
  },
  {
    id: 'juridica',
    fase: 'Jurídica',
    puntoControl: 'Todos los contratos incluyen cláusulas de Gratuidad (Art. 12), Tratamiento de Datos (Art. 23) y Propiedad Intelectual (Art. 22).',
    responsableDefault: 'Apoyo Jurídico / Subdirector',
  },
  {
    id: 'cierre',
    fase: 'Cierre',
    puntoControl: 'Certificaciones emitidas, cláusulas de propiedad intelectual salvaguardadas, contratos liquidados e informe final entregado a DSNFT.',
    responsableDefault: 'Subdirector / Enlace SET',
  },
];

export const LEGAL_DIRECTIVES = [
  {
    article: 'Art. 12 — Gratuidad Absoluta',
    summary: 'La capacitación bajo DECT es estrictamente gratuita. Prohibido cualquier cobro, pago o contraprestación económica a los trabajadores beneficiarios.',
  },
  {
    article: 'Art. 22 — Propiedad Intelectual',
    summary: 'Cláusula obligatoria en todo contrato: el SENA retiene el derecho de usar libremente materiales didácticos, metodologías y software sin costo adicional.',
  },
  {
    article: 'Art. 23 — Protección de Datos (Ley 1581 de 2012)',
    summary: 'La recolección y manejo de bases de datos de trabajadores y empresas requiere autorización previa firmada y políticas de seguridad SENA.',
  },
  {
    article: 'Art. 24 — Imagen Corporativa y Austeridad',
    summary: 'Toda pieza de divulgación debe identificar la participación del SENA y financiación pública; prohibido promover mercadeo privado.',
  },
];

export const REFERENCE_DOCUMENTS = [
  {
    id: 'manual-set',
    title: 'Manual de Operación: Línea 3 – SENA Especializa Territorios (SET)',
    subtitle: 'Guía técnica, presupuestal y administrativa (9 páginas · DSNFT / GGPC)',
    url: '/assets/aistudio/AAAAA_Manual_de_Operaci_n_L_nea_SENA_Especializa_Territorios__SET__a7018cc2.pdf',
  },
  {
    id: 'presentacion-set',
    title: 'Presentación Ejecutiva: Manual Operativo Línea SET',
    subtitle: 'Síntesis visual del ciclo operativo, RACI, reglas de oro y auditoría (15 láminas)',
    url: '/assets/aistudio/PRESENTACION_Manual_Operativo_L_nea_SET_a89c3c45.pdf',
  },
];

export function createEmptyProject(params: {
  id: string;
  ownerId: string;
  ownerName: string;
  regional: string;
  centroFormacion: string;
  title?: string;
}): ProjectDocument {
  const now = new Date().toISOString();
  const auditChecklist: ProjectDocument['auditoriaChecklist'] = {};
  for (const item of AUDIT_CHECKLIST_DEFINITION) {
    auditChecklist[item.id] = {
      checked: false,
      evidencia: '',
      responsable: item.responsableDefault,
    };
  }

  return {
    id: params.id,
    ownerId: params.ownerId,
    ownerName: params.ownerName,
    regional: params.regional,
    centroFormacion: params.centroFormacion,
    vigencia: 2026,
    smmlvValueCOP: DEFAULT_SMMLV_COP,
    title: params.title || `Proyecto Regional SET — ${params.centroFormacion}`,
    status: 'borrador',
    radicadoCode: null,
    integrityHash: null,
    createdAt: now,
    updatedAt: now,
    lastSavedAt: null,
    finalizedAt: null,
    saveHistory: [],
    etapa1: {
      comiteInstalado: false,
      fechaComite: '',
      actaComiteRef: '',
      agendasCruzadas: {
        crciArCo: false,
        conpes4129: false,
        planTecnologicoCentro: false,
      },
      sectoresPriorizados: '',
      mesasActores: '',
      brechaIdentificada: '',
      filtroElegibilidad: {
        noOfertaRegularNiBasica: false,
        exclusionCajasCompensacion: false,
        noConcurrenciaLineas1y2: false,
      },
    },
    etapa2: {
      comp1Diagnostico: '',
      comp2ObjetivoGeneral: '',
      comp3Experiencias: [],
      comp4Poblacion: {
        totalTrabajadores: 0,
        empresasOrganizaciones: '',
        caracterizacion: '',
        vinculacionVerificada: false,
      },
      comp5Presupuesto: {
        items: [],
        contrapartidaPct: 0,
        gastosOperacionPct: 0,
        transferenciaConocimientoPct: 0,
        notasEstudioMercado: '',
      },
      comp6Indicadores: {
        metaCapacitados: 0,
        metaCertificados: 0,
        eficaciaAcademicaPct: 85,
        metricasAplicacion: '',
      },
      comp7GestionConocimiento: '',
    },
    etapa3: {
      avalRegionalObtenido: false,
      fechaRadicacionDSNFT: '',
      observacionesSubsanadas: false,
      conceptoViabilidadArt19: '',
      actoTrasladoPresupuestal: '',
      montoTrasladadoCOP: 0,
    },
    etapa4: {
      planeacionParalelaIniciada: false,
      cdpExpedidos: [],
      pluralidadOferentesVerificada: false,
      rpsPerfeccionados: [],
    },
    etapa5: {
      convocatoriaCompletada: false,
      sesionesPlaneadas: 0,
      sesionesEjecutadas: 0,
      asistentesVerificados: 0,
      custodiaEvidencias: {
        listadosAsistencia: false,
        evaluaciones: false,
        actasInsumos: false,
        registroFotografico: false,
      },
      reportesDSNFTArt20: '',
    },
    etapa6: {
      constanciasEmitidas: 0,
      liquidacionContractualCompleta: false,
      saldosLiberadosCOP: 0,
      bovedaConocimientoCargada: false,
      enlaceRepositorioDSNFT: '',
      informeFinalResultadosArt21: '',
    },
    juridico: {
      gratuidadAbsolutaArt12: false,
      propiedadIntelectualArt22: false,
      proteccionDatosLey1581Art23: false,
      imagenAusteridadArt24: false,
    },
    auditoriaChecklist: auditChecklist,
  };
}

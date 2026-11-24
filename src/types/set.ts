export type RaciRole =
  | 'Subdirector de Centro'
  | 'Coordinador Académico / Enlace SET'
  | 'Dirección Regional'
  | 'Apoyo Administrativo Mixto'
  | 'DSNFT (GGPC)';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  regional: string;
  centroFormacion: string;
  role: RaciRole;
  createdAt: string;
}

export type BudgetCategoryKey =
  | 'talento_experto'
  | 'movilidad_expertos'
  | 'logistica_trabajadores'
  | 'materiales_ambientes'
  | 'divulgacion_garantias';

export interface BudgetItem {
  id: string;
  category: BudgetCategoryKey;
  concept: string;
  learningExperienceRef: string;
  quantity: number;
  unitValueCOP: number;
  marketCeilingCOP: number;
  includesTaxesAndGMF: boolean;
  providerType: string;
}

export type LearningFocusKey =
  | 'capacidades_gerenciales'
  | 'capacidades_trabajo'
  | 'inmersion_internacional';

export interface LearningExperience {
  id: string;
  title: string;
  enfoque: LearningFocusKey;
  modules: string;
  hours: number;
  methodology: string;
  learningOutcomes: string;
  expertProfile: string;
  modality: 'Presencial' | 'Práctica en Ambiente Especializado' | 'Virtual' | 'Mixta';
}

export interface CdpRecord {
  id: string;
  numeroCDP: string;
  objeto: string;
  valorCOP: number;
  fecha: string;
}

export interface RpRecord {
  id: string;
  numeroRP: string;
  contrato: string;
  proveedor: string;
  valorCOP: number;
  fechaRP: string;
  polizasAprobadas: boolean;
  actaInicio: boolean;
}

export interface AuditCheckItem {
  checked: boolean;
  evidencia: string;
  responsable: string;
}

export interface SaveHistoryEntry {
  id: string;
  timestamp: string;
  action: 'avance' | 'finalizacion' | 'reapertura';
  savedBy: string;
  summary: string;
  progressPct: number;
}

export type ProjectStatus = 'borrador' | 'en_progreso' | 'finalizado';

export interface ProjectDocument {
  id: string;
  ownerId: string;
  ownerName: string;
  regional: string;
  centroFormacion: string;
  vigencia: number;
  smmlvValueCOP: number;
  title: string;
  status: ProjectStatus;
  radicadoCode: string | null;
  integrityHash: string | null;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
  finalizedAt: string | null;
  saveHistory: SaveHistoryEntry[];

  etapa1: {
    comiteInstalado: boolean;
    fechaComite: string;
    actaComiteRef: string;
    agendasCruzadas: {
      crciArCo: boolean;
      conpes4129: boolean;
      planTecnologicoCentro: boolean;
    };
    sectoresPriorizados: string;
    mesasActores: string;
    brechaIdentificada: string;
    filtroElegibilidad: {
      noOfertaRegularNiBasica: boolean;
      exclusionCajasCompensacion: boolean;
      noConcurrenciaLineas1y2: boolean;
    };
  };

  etapa2: {
    comp1Diagnostico: string;
    comp2ObjetivoGeneral: string;
    comp3Experiencias: LearningExperience[];
    comp4Poblacion: {
      totalTrabajadores: number;
      empresasOrganizaciones: string;
      caracterizacion: string;
      vinculacionVerificada: boolean;
    };
    comp5Presupuesto: {
      items: BudgetItem[];
      contrapartidaPct: number;
      gastosOperacionPct: number;
      transferenciaConocimientoPct: number;
      notasEstudioMercado: string;
    };
    comp6Indicadores: {
      metaCapacitados: number;
      metaCertificados: number;
      eficaciaAcademicaPct: number;
      metricasAplicacion: string;
    };
    comp7GestionConocimiento: string;
  };

  etapa3: {
    avalRegionalObtenido: boolean;
    fechaRadicacionDSNFT: string;
    observacionesSubsanadas: boolean;
    conceptoViabilidadArt19: string;
    actoTrasladoPresupuestal: string;
    montoTrasladadoCOP: number;
  };

  etapa4: {
    planeacionParalelaIniciada: boolean;
    cdpExpedidos: CdpRecord[];
    pluralidadOferentesVerificada: boolean;
    rpsPerfeccionados: RpRecord[];
  };

  etapa5: {
    convocatoriaCompletada: boolean;
    sesionesPlaneadas: number;
    sesionesEjecutadas: number;
    asistentesVerificados: number;
    custodiaEvidencias: {
      listadosAsistencia: boolean;
      evaluaciones: boolean;
      actasInsumos: boolean;
      registroFotografico: boolean;
    };
    reportesDSNFTArt20: string;
  };

  etapa6: {
    constanciasEmitidas: number;
    liquidacionContractualCompleta: boolean;
    saldosLiberadosCOP: number;
    bovedaConocimientoCargada: boolean;
    enlaceRepositorioDSNFT: string;
    informeFinalResultadosArt21: string;
  };

  juridico: {
    gratuidadAbsolutaArt12: boolean;
    propiedadIntelectualArt22: boolean;
    proteccionDatosLey1581Art23: boolean;
    imagenAusteridadArt24: boolean;
  };

  auditoriaChecklist: Record<string, AuditCheckItem>;
}

export interface ValidationIssue {
  section: string;
  message: string;
}

import {
  AUDIT_CHECKLIST_DEFINITION,
  MAX_SMMLV_PER_PROJECT,
} from '../data/setManualData';
import type { ProjectDocument, ValidationIssue } from '../types/set';

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function computeBudgetMetrics(project: ProjectDocument) {
  const smmlv = project.smmlvValueCOP > 0 ? project.smmlvValueCOP : 1423500;
  const ceilingCOP = smmlv * MAX_SMMLV_PER_PROJECT;
  const items = project.etapa2.comp5Presupuesto.items || [];
  const totalCOP = items.reduce((sum, item) => {
    const qty = Number.isFinite(item.quantity) ? Math.max(0, item.quantity) : 0;
    const unit = Number.isFinite(item.unitValueCOP) ? Math.max(0, item.unitValueCOP) : 0;
    return sum + qty * unit;
  }, 0);
  const totalSMMLV = totalCOP / smmlv;
  const exceedsCeiling = totalSMMLV > MAX_SMMLV_PER_PROJECT + 0.0001;
  const itemsExceedingMarket = items.filter(
    (it) => it.marketCeilingCOP > 0 && it.unitValueCOP > it.marketCeilingCOP
  );
  const itemsMissingTaxes = items.filter((it) => !it.includesTaxesAndGMF);

  const totalCDP = (project.etapa4.cdpExpedidos || []).reduce(
    (sum, c) => sum + (Number.isFinite(c.valorCOP) ? c.valorCOP : 0),
    0
  );
  const totalRP = (project.etapa4.rpsPerfeccionados || []).reduce(
    (sum, r) => sum + (Number.isFinite(r.valorCOP) ? r.valorCOP : 0),
    0
  );
  const rpCoveragePct = totalCOP > 0 ? Math.min(100, Math.round((totalRP / totalCOP) * 100)) : 0;

  return {
    smmlv,
    ceilingCOP,
    totalCOP,
    totalSMMLV,
    exceedsCeiling,
    itemsExceedingMarket,
    itemsMissingTaxes,
    totalCDP,
    totalRP,
    rpCoveragePct,
  };
}

export function computeProjectProgress(project: ProjectDocument): number {
  const checks: boolean[] = [
    // Etapa 1 (5)
    project.etapa1.comiteInstalado,
    project.etapa1.agendasCruzadas.crciArCo && project.etapa1.agendasCruzadas.conpes4129,
    project.etapa1.brechaIdentificada.trim().length > 10,
    project.etapa1.filtroElegibilidad.noOfertaRegularNiBasica &&
      project.etapa1.filtroElegibilidad.exclusionCajasCompensacion &&
      project.etapa1.filtroElegibilidad.noConcurrenciaLineas1y2,
    project.etapa1.mesasActores.trim().length > 5,
    // Etapa 2 - 7 componentes (7)
    project.etapa2.comp1Diagnostico.trim().length > 15,
    project.etapa2.comp2ObjetivoGeneral.trim().length > 15,
    project.etapa2.comp3Experiencias.length > 0,
    project.etapa2.comp4Poblacion.totalTrabajadores > 0 &&
      project.etapa2.comp4Poblacion.vinculacionVerificada,
    project.etapa2.comp5Presupuesto.items.length > 0 &&
      !computeBudgetMetrics(project).exceedsCeiling,
    project.etapa2.comp6Indicadores.metaCapacitados > 0 &&
      project.etapa2.comp6Indicadores.metaCertificados > 0,
    project.etapa2.comp7GestionConocimiento.trim().length > 10,
    // Etapa 3 (3)
    project.etapa3.avalRegionalObtenido,
    project.etapa3.observacionesSubsanadas && project.etapa3.conceptoViabilidadArt19.trim().length > 3,
    project.etapa3.actoTrasladoPresupuestal.trim().length > 2,
    // Etapa 4 (3)
    project.etapa4.planeacionParalelaIniciada,
    project.etapa4.cdpExpedidos.length > 0 && project.etapa4.pluralidadOferentesVerificada,
    project.etapa4.rpsPerfeccionados.length > 0 &&
      project.etapa4.rpsPerfeccionados.every((r) => r.polizasAprobadas && r.fechaRP <= `${project.vigencia}-08-31`),
    // Etapa 5 (3)
    project.etapa5.convocatoriaCompletada,
    project.etapa5.sesionesEjecutadas > 0,
    project.etapa5.custodiaEvidencias.listadosAsistencia &&
      project.etapa5.custodiaEvidencias.evaluaciones,
    // Etapa 6 (3)
    project.etapa6.constanciasEmitidas > 0,
    project.etapa6.liquidacionContractualCompleta,
    project.etapa6.bovedaConocimientoCargada &&
      project.etapa6.informeFinalResultadosArt21.trim().length > 10,
    // Jurídico y Auditoría (2)
    project.juridico.gratuidadAbsolutaArt12 &&
      project.juridico.propiedadIntelectualArt22 &&
      project.juridico.proteccionDatosLey1581Art23 &&
      project.juridico.imagenAusteridadArt24,
    AUDIT_CHECKLIST_DEFINITION.every((c) => project.auditoriaChecklist[c.id]?.checked),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function validateForFinalization(project: ProjectDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const budget = computeBudgetMetrics(project);

  // Etapa 1
  if (!project.etapa1.comiteInstalado) {
    issues.push({
      section: 'Etapa 1 · Alistamiento',
      message: 'Debe confirmar la instalación del Comité Técnico Regional SET.',
    });
  }
  if (
    !project.etapa1.filtroElegibilidad.noOfertaRegularNiBasica ||
    !project.etapa1.filtroElegibilidad.exclusionCajasCompensacion ||
    !project.etapa1.filtroElegibilidad.noConcurrenciaLineas1y2
  ) {
    issues.push({
      section: 'Etapa 1 · Filtro Obligatorio',
      message:
        'Debe aprobar los tres controles de elegibilidad y no duplicidad (pertinencia temática, exclusión de Cajas de Compensación y no concurrencia Líneas 1 y 2).',
    });
  }

  // Etapa 2 (7 componentes)
  if (project.etapa2.comp1Diagnostico.trim().length < 15) {
    issues.push({
      section: 'Etapa 2 · Componente 1',
      message: 'Complete el Diagnóstico de Necesidades de Capacitación.',
    });
  }
  if (project.etapa2.comp2ObjetivoGeneral.trim().length < 15) {
    issues.push({
      section: 'Etapa 2 · Componente 2',
      message: 'Defina el Objetivo General orientado al cierre de brechas.',
    });
  }
  if (project.etapa2.comp3Experiencias.length === 0) {
    issues.push({
      section: 'Etapa 2 · Componente 3',
      message: 'Agregue al menos una Experiencia de Aprendizaje a la medida (Art. 11).',
    });
  }
  if (
    project.etapa2.comp4Poblacion.totalTrabajadores <= 0 ||
    !project.etapa2.comp4Poblacion.vinculacionVerificada
  ) {
    issues.push({
      section: 'Etapa 2 · Componente 4',
      message: 'Registre la Población Beneficiaria y verifique su vinculación laboral o productiva.',
    });
  }

  // Presupuesto
  if (project.etapa2.comp5Presupuesto.items.length === 0) {
    issues.push({
      section: 'Presupuesto · Componente 5',
      message: 'Incluya al menos un rubro financiable autorizado (Art. 17).',
    });
  }
  if (budget.exceedsCeiling) {
    issues.push({
      section: 'Presupuesto · Tope 63 SMMLV',
      message: `El presupuesto (${budget.totalSMMLV.toFixed(2)} SMMLV) supera el tope innegociable de 63 SMMLV (Art. 15, Par. 3).`,
    });
  }
  if (
    project.etapa2.comp5Presupuesto.contrapartidaPct !== 0 ||
    project.etapa2.comp5Presupuesto.gastosOperacionPct !== 0 ||
    project.etapa2.comp5Presupuesto.transferenciaConocimientoPct !== 0
  ) {
    issues.push({
      section: 'Presupuesto · Reglas de Oro',
      message:
        'La Línea SET exige 0% contrapartida, 0% gastos de operación y 0% transferencia de conocimiento.',
    });
  }
  if (budget.itemsExceedingMarket.length > 0) {
    issues.push({
      section: 'Presupuesto · Estudio de Mercado',
      message:
        'Existen rubros cuyo valor unitario excede el tope del Estudio de Mercado DSNFT (Art. 17, Par. 3).',
    });
  }
  if (budget.itemsMissingTaxes.length > 0) {
    issues.push({
      section: 'Presupuesto · Impuestos y GMF',
      message:
        'Todos los rubros deben incluir IVA, estampillas territoriales y GMF dentro de su valor unitario (Art. 17, Par. 2).',
    });
  }

  if (
    project.etapa2.comp6Indicadores.metaCapacitados <= 0 ||
    project.etapa2.comp6Indicadores.metaCertificados <= 0
  ) {
    issues.push({
      section: 'Etapa 2 · Componente 6',
      message: 'Defina las metas verificables de trabajadores capacitados y certificados.',
    });
  }
  if (project.etapa2.comp7GestionConocimiento.trim().length < 10) {
    issues.push({
      section: 'Etapa 2 · Componente 7',
      message: 'Registre la estrategia de Gestión y Apropiación del Conocimiento.',
    });
  }

  // Etapa 3 y 4
  if (!project.etapa3.avalRegionalObtenido || !project.etapa3.actoTrasladoPresupuestal.trim()) {
    issues.push({
      section: 'Etapa 3 · Radicación y Traslado',
      message: 'Confirme el Aval Regional y registre el acto administrativo de traslado presupuestal.',
    });
  }
  if (project.etapa4.rpsPerfeccionados.length === 0) {
    issues.push({
      section: 'Etapa 4 · Compromiso RP',
      message: 'Registre al menos un Registro Presupuestal (RP) perfeccionado.',
    });
  } else {
    const lateRps = project.etapa4.rpsPerfeccionados.filter(
      (r) => !r.fechaRP || r.fechaRP > `${project.vigencia}-08-31` || !r.polizasAprobadas
    );
    if (lateRps.length > 0) {
      issues.push({
        section: 'Etapa 4 · Alerta 31 de Agosto',
        message:
          'Todos los RP deben contar con pólizas aprobadas y fecha de perfeccionamiento igual o anterior al 31 de agosto.',
      });
    }
  }

  // Etapa 5 y 6
  if (
    !project.etapa5.custodiaEvidencias.listadosAsistencia ||
    !project.etapa5.custodiaEvidencias.evaluaciones
  ) {
    issues.push({
      section: 'Etapa 5 · Ejecución y Evidencias',
      message: 'Confirme la custodia de listados de asistencia y evaluaciones de aprendizaje.',
    });
  }
  if (
    !project.etapa6.liquidacionContractualCompleta ||
    !project.etapa6.bovedaConocimientoCargada ||
    project.etapa6.informeFinalResultadosArt21.trim().length < 10
  ) {
    issues.push({
      section: 'Etapa 6 · Cierre del Proceso',
      message:
        'Para el guardado final debe confirmar la liquidación contractual, entrega a bóveda de conocimiento e informe final (Art. 21).',
    });
  }

  // Jurídico y Auditoría
  if (
    !project.juridico.gratuidadAbsolutaArt12 ||
    !project.juridico.propiedadIntelectualArt22 ||
    !project.juridico.proteccionDatosLey1581Art23 ||
    !project.juridico.imagenAusteridadArt24
  ) {
    issues.push({
      section: 'Lineamientos Jurídicos',
      message: 'Debe verificar los 4 lineamientos obligatorios (Art. 12, 22, 23 y 24).',
    });
  }
  const missingAudit = AUDIT_CHECKLIST_DEFINITION.filter(
    (c) => !project.auditoriaChecklist[c.id]?.checked
  );
  if (missingAudit.length > 0) {
    issues.push({
      section: 'Auditoría Territorial',
      message: `Faltan ${missingAudit.length} punto(s) de control de la Lista de Chequeo de Auditoría Territorial.`,
    });
  }

  return issues;
}

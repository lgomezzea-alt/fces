import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { GOLDEN_RULES, REFERENCE_DOCUMENTS } from '../data/setManualData';
import type { ProjectDocument } from '../types/set';
import { computeBudgetMetrics, computeProjectProgress, formatCOP } from '../utils/setValidation';

interface ModuleOverviewProps {
  project: ProjectDocument;
  onNavigateTab: (tab: string) => void;
  onUpdateProjectMeta: (patch: Partial<Pick<ProjectDocument, 'title' | 'regional' | 'centroFormacion' | 'vigencia'>>) => void;
  isLocked: boolean;
}

export const ModuleOverview: React.FC<ModuleOverviewProps> = ({
  project,
  onNavigateTab,
  onUpdateProjectMeta,
  isLocked,
}) => {
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const progressPct = computeProjectProgress(project);
  const budget = computeBudgetMetrics(project);

  const stageRows = [
    {
      id: 'etapa1',
      name: 'Etapa 1 · Alistamiento e Inteligencia Territorial',
      window: 'Enero – Febrero',
      done:
        project.etapa1.comiteInstalado &&
        project.etapa1.filtroElegibilidad.noOfertaRegularNiBasica &&
        project.etapa1.filtroElegibilidad.exclusionCajasCompensacion &&
        project.etapa1.filtroElegibilidad.noConcurrenciaLineas1y2,
      detail: project.etapa1.comiteInstalado
        ? 'Comité instalado y filtro de elegibilidad validado'
        : 'Pendiente acta de Comité Regional y filtro de elegibilidad',
    },
    {
      id: 'etapa2',
      name: 'Etapa 2 · Formulación Técnica (7 Componentes Art. 14)',
      window: 'Febrero – Marzo',
      done:
        project.etapa2.comp1Diagnostico.trim().length > 15 &&
        project.etapa2.comp2ObjetivoGeneral.trim().length > 15 &&
        project.etapa2.comp3Experiencias.length > 0 &&
        project.etapa2.comp4Poblacion.totalTrabajadores > 0,
      detail: `${project.etapa2.comp3Experiencias.length} experiencia(s) de aprendizaje · ${project.etapa2.comp4Poblacion.totalTrabajadores} trabajadores`,
    },
    {
      id: 'presupuesto',
      name: 'Presupuesto Detallado y Rubros Financiables (Art. 17)',
      window: 'Tope 63 SMMLV',
      done:
        project.etapa2.comp5Presupuesto.items.length > 0 &&
        !budget.exceedsCeiling &&
        budget.itemsMissingTaxes.length === 0,
      detail: `${formatCOP(budget.totalCOP)} (${budget.totalSMMLV.toFixed(2)} / 63 SMMLV)`,
    },
    {
      id: 'etapas3a6',
      name: 'Etapas 3 y 4 · Radicación Q1 y Compromiso RP (31 de Agosto)',
      window: 'Marzo – 31 Agosto',
      done:
        project.etapa3.avalRegionalObtenido &&
        project.etapa4.rpsPerfeccionados.length > 0 &&
        project.etapa4.rpsPerfeccionados.every((r) => r.polizasAprobadas),
      detail: `${project.etapa4.rpsPerfeccionados.length} RP(s) perfeccionado(s) · Cobertura ${budget.rpCoveragePct}%`,
    },
    {
      id: 'etapas3a6_exec',
      targetTab: 'etapas3a6',
      name: 'Etapas 5 y 6 · Ejecución Académica, Cierre y Bóveda',
      window: 'Mayo – Diciembre',
      done:
        project.etapa5.custodiaEvidencias.listadosAsistencia &&
        project.etapa6.liquidacionContractualCompleta &&
        project.etapa6.bovedaConocimientoCargada,
      detail: `${project.etapa6.constanciasEmitidas} constancias emitidas · Liquidación ${project.etapa6.liquidacionContractualCompleta ? 'completa' : 'pendiente'}`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado y metadatos editables del proyecto */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              Programa DECT · Dirección del Sistema Nacional de Formación para el Trabajo (DSNFT)
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Tablero Operativo — Línea 3 SENA Especializa Territorios (SET)
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Ejecución institucional directa SENA para diagnosticar brechas productivas locales y
              ejecutar soluciones de capacitación especializada sin convenios empresariales ni
              contrapartida.
            </p>
          </div>
          <div className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 lg:items-end">
            <span className="text-xs font-medium text-slate-500">Avance Global del Ciclo</span>
            <span className="mt-0.5 font-mono text-2xl font-bold text-[#0B5D2B] tabular-nums">
              {progressPct}%
            </span>
            <div className="mt-2 h-2 w-44 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#0B5D2B] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="project-title" className="block text-xs font-semibold text-slate-700">
              Nombre del Proyecto Regional SET
            </label>
            <input
              id="project-title"
              type="text"
              disabled={isLocked}
              value={project.title}
              onChange={(e) => onUpdateProjectMeta({ title: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>
          <div>
            <label htmlFor="project-vigencia" className="block text-xs font-semibold text-slate-700">
              Vigencia Fiscal
            </label>
            <input
              id="project-vigencia"
              type="number"
              min={2025}
              max={2035}
              disabled={isLocked}
              value={project.vigencia}
              onChange={(e) =>
                onUpdateProjectMeta({ vigencia: Number(e.target.value) || 2026 })
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* Reglas de Oro Financieras y Operativas (4 columnas) */}
      <section aria-label="Reglas de Oro de la Línea SET">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Parámetros Innegociables del Programa DECT — Línea SET
          </h2>
          <span className="text-xs text-slate-500">Artículos 10, 15, 16 y 17</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {GOLDEN_RULES.map((rule) => {
            const isDeadline = rule.id === 'hito';
            return (
              <div
                key={rule.id}
                className={`rounded-xl border p-4 ${
                  isDeadline
                    ? 'border-amber-300 bg-amber-50/60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="text-xs font-medium text-slate-500">{rule.label}</p>
                <p
                  className={`mt-1 font-mono text-lg font-bold tabular-nums ${
                    isDeadline ? 'text-amber-900' : 'text-slate-900'
                  }`}
                >
                  {rule.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{rule.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Alerta crítica presupuesto / RP */}
      {budget.exceedsCeiling && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <p className="font-semibold">
              Alerta Presupuestal: El total formulado ({budget.totalSMMLV.toFixed(2)} SMMLV) supera
              el tope máximo de 63 SMMLV.
            </p>
            <p className="mt-1 text-xs text-red-800">
              Ajuste los rubros en el módulo de Presupuesto antes de radicar o realizar el guardado
              final del proceso.
            </p>
          </div>
        </div>
      )}

      {/* Resumen del Ciclo Operativo */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Estado del Ciclo Operativo (6 Etapas)
            </h2>
            <p className="text-xs text-slate-500">
              Seleccione cualquier fase para diligenciar evidencias, formularios y controles.
            </p>
          </div>
          {project.radicadoCode && (
            <div className="text-right">
              <span className="text-xs text-slate-500">Radicado Final</span>
              <p className="font-mono text-sm font-bold text-[#0B5D2B] tabular-nums">
                {project.radicadoCode}
              </p>
            </div>
          )}
        </div>
        <div className="divide-y divide-slate-200">
          {stageRows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col justify-between gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                {row.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0B5D2B]" />
                ) : (
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                  <p className="text-xs text-slate-500">
                    {row.window} · {row.detail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab(row.targetTab || row.id)}
                className="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:self-auto"
              >
                Abrir módulo
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Documentos Oficiales de Referencia (PDF Anexos) */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-[#0B5D2B]" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Documentación Oficial de Soporte (Anexos Normativos)
              </h2>
              <p className="text-xs text-slate-500">
                Manual de Operación y Presentación Ejecutiva de la Línea 3 SET para consulta directa
                del Centro de Formación.
              </p>
            </div>
          </div>
          {activePdfUrl && (
            <button
              type="button"
              onClick={() => setActivePdfUrl(null)}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar visor
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {REFERENCE_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#0B5D2B]" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{doc.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{doc.subtitle}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActivePdfUrl((prev) => (prev === doc.url ? null : doc.url))
                  }
                  className="whitespace-nowrap rounded-lg bg-[#0B5D2B] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#094a22]"
                >
                  {activePdfUrl === doc.url ? 'Ocultar en pantalla' : 'Visualizar aquí'}
                </button>
                <a
                  href={doc.url}
                  download
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Descargar PDF
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {activePdfUrl && (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <iframe
              src={activePdfUrl}
              title="Visor de Documento Oficial SENA Línea SET"
              className="h-[540px] w-full"
            />
          </div>
        )}
      </section>
    </div>
  );
};

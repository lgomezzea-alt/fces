import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import type { LearningExperience, LearningFocusKey, ProjectDocument } from '../types/set';
import { computeBudgetMetrics, formatCOP } from '../utils/setValidation';

interface ModuleEtapa2Props {
  project: ProjectDocument;
  onChange: (next: ProjectDocument['etapa2']) => void;
  onOpenBudget: () => void;
  isLocked: boolean;
}

const FOCUS_LABELS: Record<LearningFocusKey, string> = {
  capacidades_gerenciales: '1. Desarrollo de capacidades gerenciales y estratégicas',
  capacidades_trabajo: '2. Desarrollo de capacidades en el trabajo',
  inmersion_internacional: '3. Inmersión especializada internacional o competencias técnicas',
};

export const ModuleEtapa2: React.FC<ModuleEtapa2Props> = ({
  project,
  onChange,
  onOpenBudget,
  isLocked,
}) => {
  const etapa2 = project.etapa2;
  const budget = computeBudgetMetrics(project);

  const [newTitle, setNewTitle] = useState('');
  const [newFocus, setNewFocus] = useState<LearningFocusKey>('capacidades_trabajo');
  const [newHours, setNewHours] = useState(40);
  const [newModality, setNewModality] = useState<LearningExperience['modality']>(
    'Práctica en Ambiente Especializado'
  );
  const [newModules, setNewModules] = useState('');
  const [newMethodology, setNewMethodology] = useState('');
  const [newOutcomes, setNewOutcomes] = useState('');
  const [newExpertProfile, setNewExpertProfile] = useState('');

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isLocked) return;
    const exp: LearningExperience = {
      id: `exp-${Date.now().toString(36)}`,
      title: newTitle.trim(),
      enfoque: newFocus,
      modules: newModules.trim() || 'Módulo técnico especializado a la medida',
      hours: Math.max(1, Number(newHours) || 16),
      methodology: newMethodology.trim() || 'Teórico-práctica en ambiente especializado',
      learningOutcomes: newOutcomes.trim() || 'Cierre de brecha técnica en el entorno laboral',
      expertProfile: newExpertProfile.trim() || 'Experto técnico nacional/internacional',
      modality: newModality,
    };
    onChange({
      ...etapa2,
      comp3Experiencias: [...etapa2.comp3Experiencias, exp],
    });
    setNewTitle('');
    setNewModules('');
    setNewMethodology('');
    setNewOutcomes('');
    setNewExpertProfile('');
  };

  const handleRemoveExperience = (id: string) => {
    if (isLocked) return;
    onChange({
      ...etapa2,
      comp3Experiencias: etapa2.comp3Experiencias.filter((e) => e.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium text-slate-500">Etapa 2 · Febrero – Marzo</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Formulación Técnica y Presupuestal (7 Componentes Obligatorios · Art. 14)
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Estructuración del documento de Proyecto Regional integrando los siete componentes
          exigidos por el Proyecto de Acuerdo DECT.
        </p>
      </header>

      {/* Componentes 1 y 2 */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-5">
          <div>
            <label htmlFor="comp1-diag" className="block text-sm font-bold text-slate-900">
              1. Diagnóstico de Necesidades de Capacitación
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Sustento técnico y económico de la brecha identificada en la cadena productiva
              territorial, soportado en datos locales y actas de concertación.
            </p>
            <textarea
              id="comp1-diag"
              rows={3}
              disabled={isLocked}
              value={etapa2.comp1Diagnostico}
              onChange={(e) => onChange({ ...etapa2, comp1Diagnostico: e.target.value })}
              placeholder="Describa el sustento técnico, económico y territorial de la necesidad de capacitación..."
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div className="border-t border-slate-200 pt-5">
            <label htmlFor="comp2-obj" className="block text-sm font-bold text-slate-900">
              2. Objetivo General
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Propósito transformador orientado al cierre de brechas de capacidades y al
              mejoramiento de la productividad y competitividad regional.
            </p>
            <textarea
              id="comp2-obj"
              rows={2}
              disabled={isLocked}
              value={etapa2.comp2ObjetivoGeneral}
              onChange={(e) => onChange({ ...etapa2, comp2ObjetivoGeneral: e.target.value })}
              placeholder="Ej. Fortalecer las capacidades técnicas especializadas de 120 trabajadores del sector..."
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* Componente 3: Experiencias de Aprendizaje */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3. Experiencias de Aprendizaje Propuestas (Enfoques Art. 11)
            </h3>
            <p className="text-xs text-slate-500">
              Diseño curricular a la medida: módulos, intensidad horaria, metodología, resultados de
              aprendizaje y perfil del experto.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
            {etapa2.comp3Experiencias.length} experiencia(s)
          </span>
        </div>

        {etapa2.comp3Experiencias.length > 0 && (
          <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {etapa2.comp3Experiencias.map((exp, idx) => (
              <div
                key={exp.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start"
              >
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    0{idx + 1} · {FOCUS_LABELS[exp.enfoque]} · {exp.modality} ·{' '}
                    <span className="font-mono tabular-nums">{exp.hours} horas</span>
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">{exp.title}</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    <strong>Módulos:</strong> {exp.modules} · <strong>Perfil Experto:</strong>{' '}
                    {exp.expertProfile}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    <strong>Resultados:</strong> {exp.learningOutcomes}
                  </p>
                </div>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="inline-flex items-center gap-1 self-start whitespace-nowrap rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLocked && (
          <form
            onSubmit={handleAddExperience}
            className="mt-5 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-bold text-slate-800">
              Agregar Experiencia de Aprendizaje a la Medida
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Nombre de la Experiencia
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Automatización y control PLC industrial"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Enfoque Art. 11</label>
                <select
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value as LearningFocusKey)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none"
                >
                  <option value="capacidades_trabajo">Capacidades en el trabajo</option>
                  <option value="capacidades_gerenciales">Capacidades gerenciales y estratégicas</option>
                  <option value="inmersion_internacional">Inmersión internacional / Habilidades</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Intensidad (Horas)
                </label>
                <input
                  type="number"
                  min={4}
                  max={400}
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            {newFocus === 'inmersion_internacional' && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Nota Art. 11: La inmersión especializada internacional solo procede cuando la DSNFT
                habilite su pertinencia para la vigencia. Está prohibido financiar actividades
                turísticas, comerciales o de representación.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Modalidad</label>
                <select
                  value={newModality}
                  onChange={(e) =>
                    setNewModality(e.target.value as LearningExperience['modality'])
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="Práctica en Ambiente Especializado">
                    Práctica en Ambiente Especializado
                  </option>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Módulos y Metodología
                </label>
                <input
                  type="text"
                  value={newModules}
                  onChange={(e) => setNewModules(e.target.value)}
                  placeholder="Ej. 3 módulos teórico-prácticos"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Perfil del Experto Requerido
                </label>
                <input
                  type="text"
                  value={newExpertProfile}
                  onChange={(e) => setNewExpertProfile(e.target.value)}
                  placeholder="Ej. Ingeniero especialista con 5 años exp."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Resultados de Aprendizaje Esperados
                </label>
                <input
                  type="text"
                  value={newOutcomes}
                  onChange={(e) => setNewOutcomes(e.target.value)}
                  placeholder="Ej. Operación autónoma de celda robotizada bajo norma..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#0B5D2B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#094a22]"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Experiencia
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* Componente 4: Población Beneficiaria y Componente 5 Resumen */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-bold text-slate-900">4. Población Beneficiaria</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Caracterización cuantitativa y cualitativa de trabajadores vinculados laboralmente o
            mediante relación productiva.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="pob-total" className="block text-xs font-semibold text-slate-700">
                Total Trabajadores Beneficiarios
              </label>
              <input
                id="pob-total"
                type="number"
                min={0}
                disabled={isLocked}
                value={etapa2.comp4Poblacion.totalTrabajadores}
                onChange={(e) =>
                  onChange({
                    ...etapa2,
                    comp4Poblacion: {
                      ...etapa2.comp4Poblacion,
                      totalTrabajadores: Math.max(0, Number(e.target.value) || 0),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label htmlFor="pob-emp" className="block text-xs font-semibold text-slate-700">
                Empresas, Asociaciones o Cadenas Productivas Vinculadas
              </label>
              <input
                id="pob-emp"
                type="text"
                disabled={isLocked}
                value={etapa2.comp4Poblacion.empresasOrganizaciones}
                onChange={(e) =>
                  onChange({
                    ...etapa2,
                    comp4Poblacion: {
                      ...etapa2.comp4Poblacion,
                      empresasOrganizaciones: e.target.value,
                    },
                  })
                }
                placeholder="Ej. 18 MiPymes del corredor industrial y 2 asociaciones rurales"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label htmlFor="pob-caract" className="block text-xs font-semibold text-slate-700">
                Caracterización Ocupacional y Territorial
              </label>
              <textarea
                id="pob-caract"
                rows={2}
                disabled={isLocked}
                value={etapa2.comp4Poblacion.caracterizacion}
                onChange={(e) =>
                  onChange({
                    ...etapa2,
                    comp4Poblacion: {
                      ...etapa2.comp4Poblacion,
                      caracterizacion: e.target.value,
                    },
                  })
                }
                placeholder="Niveles ocupacionales, municipios de procedencia y perfil productivo..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa2.comp4Poblacion.vinculacionVerificada}
                onChange={(e) =>
                  onChange({
                    ...etapa2,
                    comp4Poblacion: {
                      ...etapa2.comp4Poblacion,
                      vinculacionVerificada: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
              />
              <span className="text-xs text-slate-700">
                Vinculación laboral o productiva verificada (sin Cajas de Compensación ni
                concurrencia con Líneas 1 y 2).
              </span>
            </label>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              5. Presupuesto Detallado (Resumen)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Desagregación por experiencia y rubro financiable respetando el tope máximo de 63
              SMMLV y el estudio de mercado DSNFT.
            </p>

            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Formulado (Impuestos incluidos)</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatCOP(budget.totalCOP)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Equivalente en SMMLV</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    budget.exceedsCeiling ? 'text-red-700' : 'text-[#0B5D2B]'
                  }`}
                >
                  {budget.totalSMMLV.toFixed(2)} / 63.00 SMMLV
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Contrapartida / Gastos Operación</span>
                <span className="font-mono font-medium text-slate-800 tabular-nums">
                  {etapa2.comp5Presupuesto.contrapartidaPct}% /{' '}
                  {etapa2.comp5Presupuesto.gastosOperacionPct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Rubros registrados</span>
                <span className="font-mono font-medium text-slate-800 tabular-nums">
                  {etapa2.comp5Presupuesto.items.length}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBudget}
            className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0B5D2B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#094a22]"
          >
            Gestionar Presupuesto y Rubros Art. 17
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </div>

      {/* Componentes 6 y 7 */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">
          6. Indicadores de Resultados y 7. Gestión del Conocimiento
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="ind-cap" className="block text-xs font-semibold text-slate-700">
              Meta Trabajadores Capacitados
            </label>
            <input
              id="ind-cap"
              type="number"
              min={0}
              disabled={isLocked}
              value={etapa2.comp6Indicadores.metaCapacitados}
              onChange={(e) =>
                onChange({
                  ...etapa2,
                  comp6Indicadores: {
                    ...etapa2.comp6Indicadores,
                    metaCapacitados: Math.max(0, Number(e.target.value) || 0),
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="ind-cert" className="block text-xs font-semibold text-slate-700">
              Meta Trabajadores Certificados
            </label>
            <input
              id="ind-cert"
              type="number"
              min={0}
              disabled={isLocked}
              value={etapa2.comp6Indicadores.metaCertificados}
              onChange={(e) =>
                onChange({
                  ...etapa2,
                  comp6Indicadores: {
                    ...etapa2.comp6Indicadores,
                    metaCertificados: Math.max(0, Number(e.target.value) || 0),
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="ind-efic" className="block text-xs font-semibold text-slate-700">
              Meta Eficacia Académica (%)
            </label>
            <input
              id="ind-efic"
              type="number"
              min={0}
              max={100}
              disabled={isLocked}
              value={etapa2.comp6Indicadores.eficaciaAcademicaPct}
              onChange={(e) =>
                onChange({
                  ...etapa2,
                  comp6Indicadores: {
                    ...etapa2.comp6Indicadores,
                    eficaciaAcademicaPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="ind-apl" className="block text-xs font-semibold text-slate-700">
            Métricas de Aplicación de Aprendizajes en el Entorno Laboral
          </label>
          <input
            id="ind-apl"
            type="text"
            disabled={isLocked}
            value={etapa2.comp6Indicadores.metricasAplicacion}
            onChange={(e) =>
              onChange({
                ...etapa2,
                comp6Indicadores: {
                  ...etapa2.comp6Indicadores,
                  metricasAplicacion: e.target.value,
                },
              })
            }
            placeholder="Ej. Reducción de mermas productivas en 15%, adopción de protocolo de calidad..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
          />
        </div>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <label htmlFor="comp7-gc" className="block text-sm font-bold text-slate-900">
            7. Estrategia de Gestión y Apropiación del Conocimiento en el Centro
          </label>
          <p className="mt-0.5 text-xs text-slate-500">
            Sistematización, documentación y apropiación de materiales didácticos, metodologías y
            lecciones aprendidas (Art. 14 y Art. 22).
          </p>
          <textarea
            id="comp7-gc"
            rows={3}
            disabled={isLocked}
            value={etapa2.comp7GestionConocimiento}
            onChange={(e) => onChange({ ...etapa2, comp7GestionConocimiento: e.target.value })}
            placeholder="Describa cómo el Centro sistematizará guías técnicas, contenidos y transferencias internas..."
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
          />
        </div>
      </section>
    </div>
  );
};

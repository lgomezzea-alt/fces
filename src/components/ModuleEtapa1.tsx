import React from 'react';
import { AlertCircle, CheckSquare, ShieldAlert } from 'lucide-react';
import type { ProjectDocument } from '../types/set';

interface ModuleEtapa1Props {
  etapa1: ProjectDocument['etapa1'];
  onChange: (next: ProjectDocument['etapa1']) => void;
  isLocked: boolean;
}

export const ModuleEtapa1: React.FC<ModuleEtapa1Props> = ({ etapa1, onChange, isLocked }) => {
  const filterPassed =
    etapa1.filtroElegibilidad.noOfertaRegularNiBasica &&
    etapa1.filtroElegibilidad.exclusionCajasCompensacion &&
    etapa1.filtroElegibilidad.noConcurrenciaLineas1y2;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium text-slate-500">Etapa 1 · Enero – Febrero</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Alistamiento e Inteligencia Territorial
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Asegurar que el proyecto responda a una falla de mercado o brecha tecnológica real del
          territorio y no a una oferta institucional aislada.
        </p>
      </header>

      {/* 1. Comité Técnico Regional y Agendas Territoriales */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">
          01. Instalación del Comité Técnico Regional SET y Lectura de Agendas
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          El Director Regional convoca a los Subdirectores de Centro y planeación para definir la
          ejecución según vocación tecnológica y capacidad administrativa.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa1.comiteInstalado}
              onChange={(e) => onChange({ ...etapa1, comiteInstalado: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B] focus:ring-[#0B5D2B]"
            />
            <span className="text-sm font-medium text-slate-800">
              Comité Técnico Regional SET instalado formalmente
            </span>
          </label>

          <div>
            <label htmlFor="fecha-comite" className="block text-xs font-semibold text-slate-700">
              Fecha de Sesión del Comité
            </label>
            <input
              id="fecha-comite"
              type="date"
              disabled={isLocked}
              value={etapa1.fechaComite}
              onChange={(e) => onChange({ ...etapa1, fechaComite: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div>
            <label htmlFor="acta-comite" className="block text-xs font-semibold text-slate-700">
              Número o Referencia de Acta
            </label>
            <input
              id="acta-comite"
              type="text"
              disabled={isLocked}
              value={etapa1.actaComiteRef}
              onChange={(e) => onChange({ ...etapa1, actaComiteRef: e.target.value })}
              placeholder="Ej. Acta CTR-SET-001-2026"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold text-slate-700">
            Cruce de Agendas Territoriales y Política Pública
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa1.agendasCruzadas.crciArCo}
                onChange={(e) =>
                  onChange({
                    ...etapa1,
                    agendasCruzadas: { ...etapa1.agendasCruzadas, crciArCo: e.target.checked },
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
              />
              <span className="text-xs leading-relaxed text-slate-700">
                <strong className="block text-slate-900">CRCI / Metodología ArCo</strong>
                Decreto 2212 de 2023 · Apuestas del Sistema Nacional de Competitividad e Innovación.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa1.agendasCruzadas.conpes4129}
                onChange={(e) =>
                  onChange({
                    ...etapa1,
                    agendasCruzadas: { ...etapa1.agendasCruzadas, conpes4129: e.target.checked },
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
              />
              <span className="text-xs leading-relaxed text-slate-700">
                <strong className="block text-slate-900">CONPES 4129 de 2023</strong>
                Política Nacional de Reindustrialización · Acción 1.6 del PAS.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa1.agendasCruzadas.planTecnologicoCentro}
                onChange={(e) =>
                  onChange({
                    ...etapa1,
                    agendasCruzadas: {
                      ...etapa1.agendasCruzadas,
                      planTecnologicoCentro: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
              />
              <span className="text-xs leading-relaxed text-slate-700">
                <strong className="block text-slate-900">Plan Tecnológico del Centro</strong>
                Pertinencia según vocación tecnológica y capacidad instalada del Centro.
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* 2. Mesas de Trabajo con Actores Productivos */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">
          02. Mesas de Trabajo con Actores Productivos e Identificación de Brechas
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="sectores-priorizados" className="block text-xs font-semibold text-slate-700">
              Sectores y Cadenas Productivas Priorizadas
            </label>
            <input
              id="sectores-priorizados"
              type="text"
              disabled={isLocked}
              value={etapa1.sectoresPriorizados}
              onChange={(e) => onChange({ ...etapa1, sectoresPriorizados: e.target.value })}
              placeholder="Ej. Agroindustria sostenible, metalmecánica, transición energética..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="mesas-actores" className="block text-xs font-semibold text-slate-700">
              Actores Productivos Participantes (Gremios, Asociaciones, Clústeres)
            </label>
            <input
              id="mesas-actores"
              type="text"
              disabled={isLocked}
              value={etapa1.mesasActores}
              onChange={(e) => onChange({ ...etapa1, mesasActores: e.target.value })}
              placeholder="Ej. Asociación de Caficultores, Clúster Textil, Sindicato..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="brecha-identificada" className="block text-xs font-semibold text-slate-700">
            Brecha de Capacidades Identificada (Diferencia entre capacidades actuales y requeridas)
          </label>
          <textarea
            id="brecha-identificada"
            rows={3}
            disabled={isLocked}
            value={etapa1.brechaIdentificada}
            onChange={(e) => onChange({ ...etapa1, brechaIdentificada: e.target.value })}
            placeholder="Describa la brecha productiva, organizacional, ocupacional o tecnológica concertada en las mesas territoriales..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none disabled:bg-slate-50"
          />
        </div>
      </section>

      {/* 3. Filtro de Elegibilidad y No Duplicidad (Control Obligatorio) */}
      <section
        className={`rounded-xl border p-6 ${
          filterPassed
            ? 'border-emerald-300 bg-emerald-50/40'
            : 'border-amber-300 bg-amber-50/50'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            {filterPassed ? (
              <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-[#0B5D2B]" />
            ) : (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                03. Filtro Innegociable de Elegibilidad y No Duplicidad (Control Obligatorio)
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Los tres controles normativos son requisito indispensable para avanzar a Formulación
                y para el Guardado Final del Proceso.
              </p>
            </div>
          </div>
          <span
            className={`whitespace-nowrap text-xs font-bold ${
              filterPassed ? 'text-[#0B5D2B]' : 'text-amber-800'
            }`}
          >
            {filterPassed ? 'Filtro Aprobado' : 'Validación Pendiente'}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa1.filtroElegibilidad.noOfertaRegularNiBasica}
              onChange={(e) =>
                onChange({
                  ...etapa1,
                  filtroElegibilidad: {
                    ...etapa1.filtroElegibilidad,
                    noOfertaRegularNiBasica: e.target.checked,
                  },
                })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                Pertinencia temática (Art. 11, Par. 1)
              </p>
              <p className="text-xs text-slate-600">
                Confirmo que la capacitación NO corresponde a formación básica ni a programas de la
                oferta titulada o complementaria regular del SENA.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa1.filtroElegibilidad.exclusionCajasCompensacion}
              onChange={(e) =>
                onChange({
                  ...etapa1,
                  filtroElegibilidad: {
                    ...etapa1.filtroElegibilidad,
                    exclusionCajasCompensacion: e.target.checked,
                  },
                })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                Exclusión de Cajas de Compensación Familiar (Art. 8, Par.)
              </p>
              <p className="text-xs text-slate-600">
                Verificado que las Cajas de Compensación Familiar no participan como proponentes ni
                público objeto del proyecto.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa1.filtroElegibilidad.noConcurrenciaLineas1y2}
              onChange={(e) =>
                onChange({
                  ...etapa1,
                  filtroElegibilidad: {
                    ...etapa1.filtroElegibilidad,
                    noConcurrenciaLineas1y2: e.target.checked,
                  },
                })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                Regla de No Concurrencia de Líneas (Art. 10, Par. 2)
              </p>
              <p className="text-xs text-slate-600">
                Validado que las empresas cuyos trabajadores serán beneficiados no reciben
                cofinanciación simultánea en las Líneas 1 (AESP) o 2 (API) durante la vigencia.
              </p>
            </div>
          </label>
        </div>

        {!filterPassed && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Prohibida la duplicidad con oferta regular SENA o concurrencia con otras líneas DECT.
          </p>
        )}
      </section>
    </div>
  );
};

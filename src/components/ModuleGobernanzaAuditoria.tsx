import React from 'react';
import { Download, History, Printer, ShieldCheck } from 'lucide-react';
import {
  AUDIT_CHECKLIST_DEFINITION,
  LEGAL_DIRECTIVES,
  RACI_MATRIX,
} from '../data/setManualData';
import type { ProjectDocument } from '../types/set';

interface ModuleGobernanzaAuditoriaProps {
  project: ProjectDocument;
  onUpdateJuridico: (next: ProjectDocument['juridico']) => void;
  onUpdateAudit: (next: ProjectDocument['auditoriaChecklist']) => void;
  isLocked: boolean;
}

export const ModuleGobernanzaAuditoria: React.FC<ModuleGobernanzaAuditoriaProps> = ({
  project,
  onUpdateJuridico,
  onUpdateAudit,
  isLocked,
}) => {
  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.radicadoCode || project.id}_expediente_set.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Matriz RACI */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-medium text-slate-500">Sección 4 del Manual Operativo</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Gobernanza y Matriz de Roles (RACI Territorial)
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            R: Responsable de ejecutar · A: Aprobador / Dueño del proceso · C: Consultado · I:
            Informado
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="px-4 py-3 font-semibold">Actividad Clave del Ciclo</th>
                <th className="px-3 py-3 text-center font-semibold">DSNFT (GGPC)</th>
                <th className="px-3 py-3 text-center font-semibold">Dir. Regional</th>
                <th className="px-3 py-3 text-center font-semibold">Subdir. Centro</th>
                <th className="px-3 py-3 text-center font-semibold">Coord. Acad. / Enlace</th>
                <th className="px-3 py-3 text-center font-semibold">Apoyo Admin.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {RACI_MATRIX.map((row) => (
                <tr key={row.activity} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.activity}</td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-800">
                    {row.dsnft}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-800">
                    {row.regional}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-800">
                    {row.subdirector}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-800">
                    {row.coordinador}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-800">
                    {row.apoyo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lineamientos Jurídicos */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          Directrices Jurídicas, Éticas y de Control Innegociables
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              key: 'gratuidadAbsolutaArt12' as const,
              title: LEGAL_DIRECTIVES[0].article,
              desc: LEGAL_DIRECTIVES[0].summary,
            },
            {
              key: 'propiedadIntelectualArt22' as const,
              title: LEGAL_DIRECTIVES[1].article,
              desc: LEGAL_DIRECTIVES[1].summary,
            },
            {
              key: 'proteccionDatosLey1581Art23' as const,
              title: LEGAL_DIRECTIVES[2].article,
              desc: LEGAL_DIRECTIVES[2].summary,
            },
            {
              key: 'imagenAusteridadArt24' as const,
              title: LEGAL_DIRECTIVES[3].article,
              desc: LEGAL_DIRECTIVES[3].summary,
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <input
                type="checkbox"
                disabled={isLocked}
                checked={project.juridico[item.key]}
                onChange={(e) =>
                  onUpdateJuridico({ ...project.juridico, [item.key]: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Lista de Chequeo de Auditoría Territorial */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Lista de Chequeo Definitiva de Auditoría Territorial
            </h2>
            <p className="text-xs text-slate-500">
              Verificación obligatoria del Subdirector de Centro y Enlace Regional SET antes de
              cerrar el proyecto.
            </p>
          </div>
          <div className="no-print flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar Expediente JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir Acta
            </button>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-200">
          {AUDIT_CHECKLIST_DEFINITION.map((item) => {
            const current = project.auditoriaChecklist[item.id] || {
              checked: false,
              evidencia: '',
              responsable: item.responsableDefault,
            };
            return (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 py-3.5 md:grid-cols-12 md:items-center"
              >
                <div className="flex items-start gap-3 md:col-span-6">
                  <input
                    type="checkbox"
                    disabled={isLocked}
                    checked={current.checked}
                    onChange={(e) =>
                      onUpdateAudit({
                        ...project.auditoriaChecklist,
                        [item.id]: { ...current, checked: e.target.checked },
                      })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.fase}</p>
                    <p className="text-xs text-slate-600">{item.puntoControl}</p>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    disabled={isLocked}
                    value={current.responsable}
                    onChange={(e) =>
                      onUpdateAudit({
                        ...project.auditoriaChecklist,
                        [item.id]: { ...current, responsable: e.target.value },
                      })
                    }
                    placeholder="Responsable"
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    disabled={isLocked}
                    value={current.evidencia}
                    onChange={(e) =>
                      onUpdateAudit({
                        ...project.auditoriaChecklist,
                        [item.id]: { ...current, evidencia: e.target.value },
                      })
                    }
                    placeholder="Ref. evidencia (Acta/Folio)"
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bitácora de Guardado de Avances y Guardado Final */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#0B5D2B]" />
            <h2 className="text-base font-bold text-slate-900">
              Historial de Guardado de Avances y Cierre Final
            </h2>
          </div>
          {project.integrityHash && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#0B5D2B]">
              <ShieldCheck className="h-4 w-4" />
              Sello SHA-256: {project.integrityHash.slice(0, 14)}…
            </span>
          )}
        </div>

        {project.saveHistory.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            Aún no se han registrado guardados en servidor. Use los botones{' '}
            <strong>Guardar Avances</strong> o <strong>Guardado Final del Proceso</strong> en la
            barra superior.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-slate-200">
            {project.saveHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col justify-between gap-2 py-2.5 text-xs sm:flex-row sm:items-center"
              >
                <div>
                  <span className="font-semibold text-slate-900">
                    {entry.action === 'finalizacion'
                      ? 'Guardado Final del Proceso'
                      : entry.action === 'reapertura'
                        ? 'Reapertura de Proceso'
                        : 'Guardado de Avance'}
                  </span>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span className="text-slate-600">{entry.summary}</span>
                </div>
                <div className="font-mono text-slate-500 tabular-nums">
                  {entry.savedBy} · {new Date(entry.timestamp).toLocaleString('es-CO')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

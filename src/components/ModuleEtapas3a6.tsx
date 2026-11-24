import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { CdpRecord, ProjectDocument, RpRecord } from '../types/set';
import { computeBudgetMetrics, formatCOP } from '../utils/setValidation';

interface ModuleEtapas3a6Props {
  project: ProjectDocument;
  onUpdateEtapa3: (next: ProjectDocument['etapa3']) => void;
  onUpdateEtapa4: (next: ProjectDocument['etapa4']) => void;
  onUpdateEtapa5: (next: ProjectDocument['etapa5']) => void;
  onUpdateEtapa6: (next: ProjectDocument['etapa6']) => void;
  isLocked: boolean;
}

export const ModuleEtapas3a6: React.FC<ModuleEtapas3a6Props> = ({
  project,
  onUpdateEtapa3,
  onUpdateEtapa4,
  onUpdateEtapa5,
  onUpdateEtapa6,
  isLocked,
}) => {
  const { etapa3, etapa4, etapa5, etapa6 } = project;
  const budget = computeBudgetMetrics(project);
  const rpDeadline = `${project.vigencia}-08-31`;

  const [cdpNum, setCdpNum] = useState('');
  const [cdpObj, setCdpObj] = useState('');
  const [cdpVal, setCdpVal] = useState(0);
  const [cdpDate, setCdpDate] = useState(`${project.vigencia}-04-15`);

  const [rpNum, setRpNum] = useState('');
  const [rpContrato, setRpContrato] = useState('');
  const [rpProveedor, setRpProveedor] = useState('');
  const [rpVal, setRpVal] = useState(0);
  const [rpDate, setRpDate] = useState(`${project.vigencia}-07-15`);
  const [rpPolizas, setRpPolizas] = useState(true);
  const [rpActa, setRpActa] = useState(true);

  const handleAddCdp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdpNum.trim() || cdpVal <= 0 || isLocked) return;
    const rec: CdpRecord = {
      id: `cdp-${Date.now().toString(36)}`,
      numeroCDP: cdpNum.trim(),
      objeto: cdpObj.trim() || 'Contratación servicios Línea SET',
      valorCOP: Math.max(0, Number(cdpVal) || 0),
      fecha: cdpDate,
    };
    onUpdateEtapa4({ ...etapa4, cdpExpedidos: [...etapa4.cdpExpedidos, rec] });
    setCdpNum('');
    setCdpObj('');
    setCdpVal(0);
  };

  const handleAddRp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rpNum.trim() || rpVal <= 0 || isLocked) return;
    const rec: RpRecord = {
      id: `rp-${Date.now().toString(36)}`,
      numeroRP: rpNum.trim(),
      contrato: rpContrato.trim() || 'Contrato de prestación / suministro',
      proveedor: rpProveedor.trim() || 'Proveedor adjudicado',
      valorCOP: Math.max(0, Number(rpVal) || 0),
      fechaRP: rpDate,
      polizasAprobadas: rpPolizas,
      actaInicio: rpActa,
    };
    onUpdateEtapa4({ ...etapa4, rpsPerfeccionados: [...etapa4.rpsPerfeccionados, rec] });
    setRpNum('');
    setRpContrato('');
    setRpProveedor('');
    setRpVal(0);
  };

  const lateRps = etapa4.rpsPerfeccionados.filter((r) => !r.fechaRP || r.fechaRP > rpDeadline);

  return (
    <div className="space-y-6">
      {/* Etapa 3 */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium text-slate-500">Etapa 3 · Marzo (Primer Trimestre Q1)</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Radicación, Viabilización y Traslado Presupuestal
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa3.avalRegionalObtenido}
              onChange={(e) =>
                onUpdateEtapa3({ ...etapa3, avalRegionalObtenido: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <span className="text-xs font-medium text-slate-800">
              Aval Regional otorgado por Dirección Regional
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa3.observacionesSubsanadas}
              onChange={(e) =>
                onUpdateEtapa3({ ...etapa3, observacionesSubsanadas: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <span className="text-xs font-medium text-slate-800">
              Observaciones GGPC subsanadas y viabilidad declarada (Art. 19)
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Fecha Radicación DSNFT (Q1)
            </label>
            <input
              type="date"
              disabled={isLocked}
              value={etapa3.fechaRadicacionDSNFT}
              onChange={(e) =>
                onUpdateEtapa3({ ...etapa3, fechaRadicacionDSNFT: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Concepto de Viabilidad GGPC (Art. 19)
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={etapa3.conceptoViabilidadArt19}
              onChange={(e) =>
                onUpdateEtapa3({ ...etapa3, conceptoViabilidadArt19: e.target.value })
              }
              placeholder="Ej. Viable · Oficio GGPC-2026-041"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Acto Administrativo de Traslado Presupuestal
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={etapa3.actoTrasladoPresupuestal}
              onChange={(e) =>
                onUpdateEtapa3({ ...etapa3, actoTrasladoPresupuestal: e.target.value })
              }
              placeholder="Ej. Resolución Traslado No. 0324"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Monto Trasladado Incorporado (COP)
            </label>
            <input
              type="number"
              min={0}
              disabled={isLocked}
              value={etapa3.montoTrasladadoCOP || ''}
              onChange={(e) =>
                onUpdateEtapa3({
                  ...etapa3,
                  montoTrasladadoCOP: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 tabular-nums"
            />
          </div>
        </div>
      </section>

      {/* Etapa 4: Alerta Crítica 31 de Agosto */}
      <section className="rounded-xl border border-amber-300 bg-white p-6">
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
            <div>
              <p className="text-xs font-bold text-amber-950">
                Etapa 4 (Abril – 31 de Agosto) · ALERTA CRÍTICA DE GESTIÓN CONTRACTUAL
              </p>
              <p className="mt-0.5 text-xs text-amber-900">
                A más tardar el <strong>31 de agosto de {project.vigencia}</strong>, el 100% de los
                recursos asignados deben contar con Registro Presupuestal (RP) perfeccionado y
                pólizas aprobadas. Los saldos sin comprometer serán centralizados por la DSNFT.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] text-amber-900">Cobertura RP</span>
            <p className="font-mono text-lg font-bold text-amber-950 tabular-nums">
              {budget.rpCoveragePct}% ({formatCOP(budget.totalRP)})
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa4.planeacionParalelaIniciada}
              onChange={(e) =>
                onUpdateEtapa4({ ...etapa4, planeacionParalelaIniciada: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <span className="text-xs text-slate-700">
              <strong className="block text-slate-900">Planeación Contractual Paralela</strong>
              Estudios previos, análisis del sector y especificaciones técnicas estructuradas desde
              la radicación en Q1.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={etapa4.pluralidadOferentesVerificada}
              onChange={(e) =>
                onUpdateEtapa4({ ...etapa4, pluralidadOferentesVerificada: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
            />
            <span className="text-xs text-slate-700">
              <strong className="block text-slate-900">Pluralidad y Transparencia</strong>
              Objetos contractuales segregados por especialidad técnica evitando concentrar la
              ejecución en un único proveedor.
            </span>
          </label>
        </div>

        {/* Registro de CDPs y RPs */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Certificados de Disponibilidad (CDP)
              </h3>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                {formatCOP(budget.totalCDP)}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {etapa4.cdpExpedidos.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-mono font-bold text-slate-900">CDP {c.numeroCDP}</p>
                    <p className="text-slate-600">
                      {c.objeto} · {c.fecha}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCOP(c.valorCOP)}
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateEtapa4({
                            ...etapa4,
                            cdpExpedidos: etapa4.cdpExpedidos.filter((x) => x.id !== c.id),
                          })
                        }
                        className="text-red-700 hover:text-red-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!isLocked && (
              <form onSubmit={handleAddCdp} className="mt-3 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="No. CDP"
                  value={cdpNum}
                  onChange={(e) => setCdpNum(e.target.value)}
                  className="rounded border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Valor COP"
                  value={cdpVal || ''}
                  onChange={(e) => setCdpVal(Number(e.target.value) || 0)}
                  className="rounded border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
                />
                <input
                  type="text"
                  placeholder="Objeto del CDP"
                  value={cdpObj}
                  onChange={(e) => setCdpObj(e.target.value)}
                  className="rounded border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={cdpDate}
                    onChange={(e) => setCdpDate(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1.5 font-mono text-xs"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    CDP
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Registros Presupuestales (RP ≤ 31-Ago)
              </h3>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                {formatCOP(budget.totalRP)}
              </span>
            </div>
            {lateRps.length > 0 && (
              <p className="mt-2 rounded bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800">
                Advertencia: {lateRps.length} RP(s) tienen fecha posterior al 31 de agosto.
              </p>
            )}
            <div className="mt-3 space-y-2">
              {etapa4.rpsPerfeccionados.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-mono font-bold text-slate-900">
                      RP {r.numeroRP} · {r.contrato}
                    </p>
                    <p className="text-slate-600">
                      {r.proveedor} · {r.fechaRP} · Pólizas:{' '}
                      {r.polizasAprobadas ? 'Aprobadas' : 'Pendientes'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCOP(r.valorCOP)}
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateEtapa4({
                            ...etapa4,
                            rpsPerfeccionados: etapa4.rpsPerfeccionados.filter(
                              (x) => x.id !== r.id
                            ),
                          })
                        }
                        className="text-red-700 hover:text-red-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!isLocked && (
              <form onSubmit={handleAddRp} className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="No. RP"
                    value={rpNum}
                    onChange={(e) => setRpNum(e.target.value)}
                    className="rounded border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Valor COP"
                    value={rpVal || ''}
                    onChange={(e) => setRpVal(Number(e.target.value) || 0)}
                    className="rounded border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
                  />
                  <input
                    type="text"
                    placeholder="Contrato / Objeto"
                    value={rpContrato}
                    onChange={(e) => setRpContrato(e.target.value)}
                    className="rounded border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Proveedor"
                    value={rpProveedor}
                    onChange={(e) => setRpProveedor(e.target.value)}
                    className="rounded border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <input
                      type="date"
                      value={rpDate}
                      onChange={(e) => setRpDate(e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={rpPolizas}
                        onChange={(e) => setRpPolizas(e.target.checked)}
                      />
                      Pólizas
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={rpActa}
                        onChange={(e) => setRpActa(e.target.checked)}
                      />
                      Acta Inicio
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded bg-[#0B5D2B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#094a22]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar RP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Etapas 5 y 6 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">Etapa 5 · Mayo – Noviembre</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Ejecución Académica y Seguimiento Operativo
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Sesiones Planeadas
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={etapa5.sesionesPlaneadas}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    sesionesPlaneadas: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Sesiones Ejecutadas
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={etapa5.sesionesEjecutadas}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    sesionesEjecutadas: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Asistentes Verificados
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={etapa5.asistentesVerificados}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    asistentesVerificados: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa5.convocatoriaCompletada}
                onChange={(e) =>
                  onUpdateEtapa5({ ...etapa5, convocatoriaCompletada: e.target.checked })
                }
              />
              Alistamiento logístico y convocatoria formal verificada con empresas/actores
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa5.custodiaEvidencias.listadosAsistencia}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    custodiaEvidencias: {
                      ...etapa5.custodiaEvidencias,
                      listadosAsistencia: e.target.checked,
                    },
                  })
                }
              />
              Custodia de listados de asistencia firmados y autorizaciones Ley 1581
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa5.custodiaEvidencias.evaluaciones}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    custodiaEvidencias: {
                      ...etapa5.custodiaEvidencias,
                      evaluaciones: e.target.checked,
                    },
                  })
                }
              />
              Evaluaciones de aprendizaje custodiadas
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa5.custodiaEvidencias.actasInsumos}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    custodiaEvidencias: {
                      ...etapa5.custodiaEvidencias,
                      actasInsumos: e.target.checked,
                    },
                  })
                }
              />
              Actas de entrega de materiales e insumos prácticos
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa5.custodiaEvidencias.registroFotografico}
                onChange={(e) =>
                  onUpdateEtapa5({
                    ...etapa5,
                    custodiaEvidencias: {
                      ...etapa5.custodiaEvidencias,
                      registroFotografico: e.target.checked,
                    },
                  })
                }
              />
              Registros fotográficos institucionales
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700">
              Cortes de Reporte a Seguimiento DSNFT/GGPC (Art. 20)
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={etapa5.reportesDSNFTArt20}
              onChange={(e) =>
                onUpdateEtapa5({ ...etapa5, reportesDSNFTArt20: e.target.value })
              }
              placeholder="Ej. Corte 1 (Jul) y Corte 2 (Oct) radicados sin novedades"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">Etapa 6 · Noviembre – Diciembre</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Cierre Técnico, Financiero y Bóveda de Conocimiento
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Constancias / Certificados Emitidos
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={etapa6.constanciasEmitidas}
                onChange={(e) =>
                  onUpdateEtapa6({
                    ...etapa6,
                    constanciasEmitidas: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Saldos Sobrantes Liberados (COP)
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={etapa6.saldosLiberadosCOP}
                onChange={(e) =>
                  onUpdateEtapa6({
                    ...etapa6,
                    saldosLiberadosCOP: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa6.liquidacionContractualCompleta}
                onChange={(e) =>
                  onUpdateEtapa6({
                    ...etapa6,
                    liquidacionContractualCompleta: e.target.checked,
                  })
                }
              />
              Liquidación contractual y fenecimiento presupuestal completados dentro de la vigencia
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-slate-800">
              <input
                type="checkbox"
                disabled={isLocked}
                checked={etapa6.bovedaConocimientoCargada}
                onChange={(e) =>
                  onUpdateEtapa6({ ...etapa6, bovedaConocimientoCargada: e.target.checked })
                }
              />
              Contenidos, guías y desarrollos cargados al repositorio del Centro y remitidos a DSNFT
            </label>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Referencia / Enlace Repositorio Bóveda de Conocimiento
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={etapa6.enlaceRepositorioDSNFT}
                onChange={(e) =>
                  onUpdateEtapa6({ ...etapa6, enlaceRepositorioDSNFT: e.target.value })
                }
                placeholder="Ej. Repositorio Institucional Centro / DSNFT 2026"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Informe Final de Resultados e Impacto (Art. 21)
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={etapa6.informeFinalResultadosArt21}
                onChange={(e) =>
                  onUpdateEtapa6({ ...etapa6, informeFinalResultadosArt21: e.target.value })
                }
                placeholder="Balance de cierre con cumplimiento de indicadores de cobertura, eficacia y transferencia..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { BUDGET_CATEGORIES, MAX_SMMLV_PER_PROJECT } from '../data/setManualData';
import type { BudgetCategoryKey, BudgetItem, ProjectDocument } from '../types/set';
import { computeBudgetMetrics, formatCOP } from '../utils/setValidation';

interface ModulePresupuestoProps {
  project: ProjectDocument;
  onUpdateSmmlv: (smmlv: number) => void;
  onUpdatePresupuesto: (next: ProjectDocument['etapa2']['comp5Presupuesto']) => void;
  isLocked: boolean;
}

export const ModulePresupuesto: React.FC<ModulePresupuestoProps> = ({
  project,
  onUpdateSmmlv,
  onUpdatePresupuesto,
  isLocked,
}) => {
  const pres = project.etapa2.comp5Presupuesto;
  const metrics = computeBudgetMetrics(project);

  const [category, setCategory] = useState<BudgetCategoryKey>('talento_experto');
  const [concept, setConcept] = useState('');
  const [expRef, setExpRef] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitValueCOP, setUnitValueCOP] = useState(0);
  const [marketCeilingCOP, setMarketCeilingCOP] = useState(0);
  const [includesTaxesAndGMF, setIncludesTaxesAndGMF] = useState(true);
  const [providerType, setProviderType] = useState('Experto / Proveedor Especializado');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || unitValueCOP <= 0 || isLocked) return;
    const item: BudgetItem = {
      id: `rub-${Date.now().toString(36)}`,
      category,
      concept: concept.trim(),
      learningExperienceRef: expRef.trim() || 'Transversal al proyecto',
      quantity: Math.max(1, Number(quantity) || 1),
      unitValueCOP: Math.max(0, Number(unitValueCOP) || 0),
      marketCeilingCOP: Math.max(0, Number(marketCeilingCOP) || 0),
      includesTaxesAndGMF,
      providerType: providerType.trim() || 'Contratación directa SENA',
    };
    onUpdatePresupuesto({
      ...pres,
      items: [...pres.items, item],
    });
    setConcept('');
    setUnitValueCOP(0);
    setMarketCeilingCOP(0);
  };

  const handleRemoveItem = (id: string) => {
    if (isLocked) return;
    onUpdatePresupuesto({
      ...pres,
      items: pres.items.filter((it) => it.id !== id),
    });
  };

  const pctUsed = Math.min(100, Math.round((metrics.totalSMMLV / MAX_SMMLV_PER_PROJECT) * 100));

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Guía de Gestión Presupuestal · Artículos 15, 16, 17 y 18
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Presupuesto Detallado y Rubros Financiables (Tope 63 SMMLV)
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              100% financiado con recursos DECT, 0% contrapartida, sin gastos de operación (15–20%)
              ni transferencia de conocimiento (1%). Todos los valores incluyen IVA, estampillas y
              GMF.
            </p>
          </div>
          <div className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <label htmlFor="smmlv-input" className="block text-xs font-semibold text-slate-700">
              Valor SMMLV Vigencia {project.vigencia} (COP)
            </label>
            <input
              id="smmlv-input"
              type="number"
              min={500000}
              disabled={isLocked}
              value={project.smmlvValueCOP}
              onChange={(e) => onUpdateSmmlv(Math.max(100000, Number(e.target.value) || 1423500))}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-900 tabular-nums"
            />
            <p className="mt-1.5 font-mono text-xs text-slate-500 tabular-nums">
              Techo 63 SMMLV: {formatCOP(metrics.ceilingCOP)}
            </p>
          </div>
        </div>

        {/* Barra de consumo presupuestal */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Total Formulado</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-slate-900 tabular-nums">
              {formatCOP(metrics.totalCOP)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Consumo vs. Tope 63 SMMLV</p>
            <p
              className={`mt-0.5 font-mono text-lg font-bold tabular-nums ${
                metrics.exceedsCeiling ? 'text-red-700' : 'text-[#0B5D2B]'
              }`}
            >
              {metrics.totalSMMLV.toFixed(2)} / 63.00 SMMLV
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Saldo Disponible en Techo</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-slate-900 tabular-nums">
              {formatCOP(Math.max(0, metrics.ceilingCOP - metrics.totalCOP))}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Reglas Especiales Línea 3</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800 tabular-nums">
              0% Contrapartida · 0% Operación
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.exceedsCeiling ? 'bg-red-600' : 'bg-[#0B5D2B]'
              }`}
              style={{ width: `${pctUsed}%` }}
            />
          </div>
        </div>

        {(metrics.exceedsCeiling ||
          metrics.itemsExceedingMarket.length > 0 ||
          metrics.itemsMissingTaxes.length > 0) && (
          <div className="mt-4 space-y-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-900">
            {metrics.exceedsCeiling && (
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                El presupuesto supera el tope innegociable de 63 SMMLV (Art. 15, Par. 3).
              </p>
            )}
            {metrics.itemsExceedingMarket.length > 0 && (
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {metrics.itemsExceedingMarket.length} rubro(s) superan el valor máximo del Estudio de
                Mercado DSNFT (Art. 17, Par. 3).
              </p>
            )}
            {metrics.itemsMissingTaxes.length > 0 && (
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {metrics.itemsMissingTaxes.length} rubro(s) no confirman inclusión de IVA,
                estampillas y GMF (Art. 17, Par. 2).
              </p>
            )}
          </div>
        )}
      </header>

      {/* Tabla de rubros presupuestados */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Desagregación de Rubros Financiables Autorizados (Art. 17)
            </h3>
            <p className="text-xs text-slate-500">
              Cada rubro debe responder a una experiencia de aprendizaje y ajustarse al estudio de
              mercado DSNFT.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
            {pres.items.length} rubro(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-4 py-3 font-semibold">Categoría Art. 17</th>
                <th className="px-4 py-3 font-semibold">Concepto / Detalle</th>
                <th className="px-4 py-3 text-right font-semibold">Cant.</th>
                <th className="px-4 py-3 text-right font-semibold">V. Unitario (c/Imp.)</th>
                <th className="px-4 py-3 text-right font-semibold">Tope Mercado</th>
                <th className="px-4 py-3 text-right font-semibold">Subtotal COP</th>
                <th className="px-4 py-3 text-center font-semibold">Imp./GMF</th>
                {!isLocked && <th className="px-4 py-3 text-right font-semibold">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pres.items.length === 0 ? (
                <tr>
                  <td colSpan={isLocked ? 7 : 8} className="px-6 py-8 text-center text-slate-500">
                    No hay rubros registrados todavía. Agregue el primer rubro financiable abajo.
                  </td>
                </tr>
              ) : (
                pres.items.map((item) => {
                  const catTitle =
                    BUDGET_CATEGORIES.find((c) => c.key === item.category)?.title || item.category;
                  const subtotal = item.quantity * item.unitValueCOP;
                  const overMarket =
                    item.marketCeilingCOP > 0 && item.unitValueCOP > item.marketCeilingCOP;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{catTitle}</td>
                      <td className="px-4 py-2.5 text-slate-700">
                        <p className="font-semibold text-slate-900">{item.concept}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.learningExperienceRef} · {item.providerType}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                        {item.quantity}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                          overMarket ? 'font-bold text-red-700' : 'text-slate-900'
                        }`}
                      >
                        {formatCOP(item.unitValueCOP)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500 tabular-nums">
                        {item.marketCeilingCOP > 0 ? formatCOP(item.marketCeilingCOP) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCOP(subtotal)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {item.includesTaxesAndGMF ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-[#0B5D2B]" />
                        ) : (
                          <AlertTriangle className="mx-auto h-4 w-4 text-red-600" />
                        )}
                      </td>
                      {!isLocked && (
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="inline-flex items-center rounded p-1 text-red-700 hover:bg-red-50"
                            aria-label="Eliminar rubro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario agregar rubro */}
        {!isLocked && (
          <form
            onSubmit={handleAddItem}
            className="space-y-4 border-t border-slate-200 bg-slate-50 p-6"
          >
            <p className="text-xs font-bold text-slate-800">
              Agregar Rubro Financiable (Art. 17)
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BudgetCategoryKey)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Concepto del Gasto (Según Catálogo Art. 17)
                </label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Honorarios experto nacional módulo PLC (40 horas)"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Experiencia Asociada
                </label>
                <input
                  type="text"
                  value={expRef}
                  onChange={(e) => setExpRef(e.target.value)}
                  placeholder="Ej. Experiencia 1"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Valor Unitario COP
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={unitValueCOP || ''}
                  onChange={(e) => setUnitValueCOP(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="Incl. IVA/GMF"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tope Estudio Mercado
                </label>
                <input
                  type="number"
                  min={0}
                  value={marketCeilingCOP || ''}
                  onChange={(e) => setMarketCeilingCOP(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="Opcional COP"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Objeto Contractual
                </label>
                <input
                  type="text"
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B5D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094a22]"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Rubro
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={includesTaxesAndGMF}
                onChange={(e) => setIncludesTaxesAndGMF(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#0B5D2B]"
              />
              Confirmo que el valor unitario incluye impuestos, tasas, estampillas territoriales y
              GMF (Art. 17, Par. 2).
            </label>
          </form>
        )}
      </section>

      {/* Catálogo de Rubros Autorizados vs No Financiables */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">
          Catálogo Normativo: Lo Permitido (Art. 17) vs. Lo Prohibido (Art. 18)
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold text-emerald-900">
                  Rubros Financiables Autorizados (Art. 17)
                </th>
                <th className="px-4 py-3 font-semibold text-red-900">
                  Rubros No Financiables / Prohibidos (Art. 18)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {BUDGET_CATEGORIES.map((cat) => (
                <tr key={cat.key}>
                  <td className="px-4 py-3 align-top font-semibold text-slate-900">{cat.title}</td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    <ul className="list-disc space-y-1 pl-4">
                      {cat.authorized.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 align-top text-red-900">
                    <ul className="list-disc space-y-1 pl-4">
                      {cat.prohibited.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

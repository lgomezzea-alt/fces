import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FolderPlus,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { ModuleEtapa1 } from './components/ModuleEtapa1';
import { ModuleEtapa2 } from './components/ModuleEtapa2';
import { ModuleEtapas3a6 } from './components/ModuleEtapas3a6';
import { ModuleGobernanzaAuditoria } from './components/ModuleGobernanzaAuditoria';
import { ModuleOverview } from './components/ModuleOverview';
import { ModulePresupuesto } from './components/ModulePresupuesto';
import { InstallGuideModal, UninstallConfirmModal } from './components/PWAModals';
import { createEmptyProject } from './data/setManualData';
import { usePWAInstall } from './hooks/usePWAInstall';
import type { ProjectDocument, UserProfile, ValidationIssue } from './types/set';
import {
  computeBudgetMetrics,
  computeProjectProgress,
  formatCOP,
  validateForFinalization,
} from './utils/setValidation';

type ActiveModuleId =
  | 'overview'
  | 'etapa1'
  | 'etapa2'
  | 'presupuesto'
  | 'etapas3a6'
  | 'auditoria';

const SIDEBAR_MODULES: Array<{
  id: ActiveModuleId;
  label: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'overview',
    label: '01. Tablero del Proyecto',
    subtitle: 'Reglas de oro y anexos PDF',
    icon: LayoutDashboard,
  },
  {
    id: 'etapa1',
    label: '02. Alistamiento (Etapa 1)',
    subtitle: 'Comité, CRCI/ArCo y filtro',
    icon: ShieldCheck,
  },
  {
    id: 'etapa2',
    label: '03. Formulación (Etapa 2)',
    subtitle: '7 componentes Art. 14',
    icon: Layers,
  },
  {
    id: 'presupuesto',
    label: '04. Presupuesto y Rubros',
    subtitle: 'Tope 63 SMMLV · Art. 17-18',
    icon: Calculator,
  },
  {
    id: 'etapas3a6',
    label: '05. Radicación, RP y Cierre',
    subtitle: 'Hito 31-Ago · Etapas 3 a 6',
    icon: FileCheck2,
  },
  {
    id: 'auditoria',
    label: '06. RACI y Auditoría',
    subtitle: 'Jurídico, chequeo e historial',
    icon: ClipboardCheck,
  },
];

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [projects, setProjects] = useState<ProjectDocument[]>(() => [
    createEmptyProject({
      id: 'local-preview',
      ownerId: 'preview',
      ownerName: 'Centro de Formación SENA',
      regional: 'Regional Antioquia',
      centroFormacion: 'Centro de Formación Profesional Integral',
    }),
  ]);
  const [activeProjectId, setActiveProjectId] = useState<string>('local-preview');
  const [activeTab, setActiveTab] = useState<ActiveModuleId>('overview');

  const [savingDraft, setSavingDraft] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const {
    status: pwaStatus,
    installApp,
    uninstallApp,
    showInstallGuideModal,
    setShowInstallGuideModal,
    clearMessage: clearPwaMessage,
  } = usePWAInstall();
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];
  const isLocked = activeProject.status === 'finalizado';
  const progressPct = computeProjectProgress(activeProject);
  const budgetMetrics = computeBudgetMetrics(activeProject);

  const fetchUserProjects = async (token: string) => {
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { projects?: ProjectDocument[] };
      if (res.ok && Array.isArray(data.projects) && data.projects.length > 0) {
        setProjects(data.projects);
        setActiveProjectId(data.projects[0].id);
        setHasUnsavedChanges(false);
      }
    } catch {
      setFeedbackBanner({
        type: 'error',
        text: 'No se pudieron cargar los proyectos del Centro desde el servidor.',
      });
    }
  };

  const handleAuthenticated = (token: string, profile: UserProfile) => {
    setAuthToken(token);
    setUser(profile);
    setFeedbackBanner({
      type: 'success',
      text: `Sesión iniciada como ${profile.fullName} (${profile.centroFormacion}).`,
    });
    void fetchUserProjects(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    const fallback = createEmptyProject({
      id: 'local-preview',
      ownerId: 'preview',
      ownerName: 'Centro de Formación SENA',
      regional: 'Regional Antioquia',
      centroFormacion: 'Centro de Formación Profesional Integral',
    });
    setProjects([fallback]);
    setActiveProjectId(fallback.id);
    setHasUnsavedChanges(false);
    setValidationIssues(null);
    setFeedbackBanner({
      type: 'info',
      text: 'Sesión cerrada correctamente.',
    });
  };

  const updateActiveProject = (updater: (prev: ProjectDocument) => ProjectDocument) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? updater(p) : p))
    );
    setHasUnsavedChanges(true);
    setValidationIssues(null);
  };

  const handleCreateNewProject = async () => {
    if (!authToken || !user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: `Proyecto SET ${activeProject.vigencia} — ${user.centroFormacion}`,
          regional: user.regional,
          centroFormacion: user.centroFormacion,
          vigencia: activeProject.vigencia,
        }),
      });
      const data = (await res.json()) as { project?: ProjectDocument; error?: string };
      if (res.ok && data.project) {
        setProjects((prev) => [data.project!, ...prev]);
        setActiveProjectId(data.project.id);
        setActiveTab('overview');
        setFeedbackBanner({
          type: 'success',
          text: 'Nuevo expediente de Proyecto Regional SET creado.',
        });
      }
    } catch {
      setFeedbackBanner({
        type: 'error',
        text: 'No fue posible crear el nuevo proyecto.',
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!authToken) {
      setFeedbackBanner({
        type: 'info',
        text: 'Ingrese con su Nombre y Clave para guardar avances en el servidor del Centro.',
      });
      setAuthModalOpen(true);
      return;
    }
    if (isLocked) {
      setFeedbackBanner({
        type: 'info',
        text: 'Este proceso ya tiene Guardado Final. Reabra el expediente si requiere ajustes.',
      });
      return;
    }
    setSavingDraft(true);
    setFeedbackBanner(null);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          project: activeProject,
          progressPct,
        }),
      });
      const data = (await res.json()) as { project?: ProjectDocument; error?: string };
      if (!res.ok || !data.project) {
        setFeedbackBanner({
          type: 'error',
          text: data.error || 'Error al guardar los avances del proyecto.',
        });
        return;
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === data.project!.id ? data.project! : p))
      );
      setHasUnsavedChanges(false);
      setFeedbackBanner({
        type: 'success',
        text: `Avances guardados (${progressPct}% completado) · ${new Date(
          data.project.lastSavedAt || Date.now()
        ).toLocaleTimeString('es-CO')}.`,
      });
    } catch {
      setFeedbackBanner({
        type: 'error',
        text: 'Error de red al guardar los avances.',
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleFinalizeProcess = async () => {
    if (!authToken) {
      setFeedbackBanner({
        type: 'info',
        text: 'Ingrese con su Nombre y Clave para realizar el Guardado Final del Proceso.',
      });
      setAuthModalOpen(true);
      return;
    }
    const clientIssues = validateForFinalization(activeProject);
    if (clientIssues.length > 0) {
      setValidationIssues(clientIssues);
      setFeedbackBanner({
        type: 'error',
        text: `Faltan ${clientIssues.length} requisito(s) normativo(s) antes de sellar el Guardado Final del Proceso.`,
      });
      return;
    }

    setFinalizing(true);
    setFeedbackBanner(null);
    setValidationIssues(null);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ project: activeProject }),
      });
      const data = (await res.json()) as {
        project?: ProjectDocument;
        error?: string;
        issues?: ValidationIssue[];
      };
      if (!res.ok || !data.project) {
        if (Array.isArray(data.issues)) {
          setValidationIssues(data.issues);
        }
        setFeedbackBanner({
          type: 'error',
          text: data.error || 'No fue posible completar el Guardado Final.',
        });
        return;
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === data.project!.id ? data.project! : p))
      );
      setHasUnsavedChanges(false);
      setFeedbackBanner({
        type: 'success',
        text: `Guardado Final completado y sellado · Código de Radicado: ${data.project.radicadoCode}.`,
      });
    } catch {
      setFeedbackBanner({
        type: 'error',
        text: 'Error de red al intentar finalizar el proceso.',
      });
    } finally {
      setFinalizing(false);
    }
  };

  const handleReopenProcess = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/reopen`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = (await res.json()) as { project?: ProjectDocument; error?: string };
      if (res.ok && data.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === data.project!.id ? data.project! : p))
        );
        setFeedbackBanner({
          type: 'info',
          text: 'Proceso reabierto a estado En Progreso para ajustes.',
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'No se pudo reabrir el proceso.' });
    }
  };

  const handleConfirmUninstall = async () => {
    setShowUninstallConfirm(false);
    await uninstallApp();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: exactamente 3 zonas en una fila */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
          {/* Zona 1: Wordmark único */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="font-display text-lg font-bold tracking-tight text-[#0B5D2B] whitespace-nowrap shrink-0"
          >
            SENA · Línea SET
          </button>

          {/* Zona 2: 5 enlaces de navegación en una línea */}
          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex"
          >
            {[
              { id: 'overview' as const, label: 'Resumen' },
              { id: 'etapa1' as const, label: 'Alistamiento' },
              { id: 'etapa2' as const, label: 'Formulación' },
              { id: 'presupuesto' as const, label: 'Presupuesto' },
              { id: 'auditoria' as const, label: 'Auditoría' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors ${
                  activeTab === item.id
                    ? 'border-[#0B5D2B] font-semibold text-slate-900'
                    : 'border-transparent hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zona 3: 1 botón de acción primario */}
          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir ({user.username})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-[#0B5D2B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#094a22]"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Ingresar por Nombre y Clave
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Barra de Control del Espacio de Trabajo */}
      <div className="no-print border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 px-6 py-3 xl:flex-row xl:items-center">
          {/* Contexto del Centro y Selector de Proyecto */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {user ? (
              <>
                <span className="font-semibold text-slate-900">{user.centroFormacion}</span>
                <span aria-hidden="true">·</span>
                <span>{user.regional}</span>
                <span aria-hidden="true">·</span>
                <span>{user.role}</span>
              </>
            ) : (
              <span>
                Modo consulta previa · Inicie sesión con Nombre y Clave para guardar y radicar
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span
              className={`font-semibold ${
                activeProject.status === 'finalizado'
                  ? 'text-[#0B5D2B]'
                  : activeProject.status === 'en_progreso'
                    ? 'text-amber-800'
                    : 'text-slate-700'
              }`}
            >
              Estado:{' '}
              {activeProject.status === 'finalizado'
                ? `Finalizado (${activeProject.radicadoCode})`
                : activeProject.status === 'en_progreso'
                  ? 'En progreso'
                  : 'Borrador'}
            </span>
            {hasUnsavedChanges && !isLocked && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-amber-800">Cambios sin guardar</span>
              </>
            )}
          </div>

          {/* Botones operativos solicitados: Instalación, Desinstalación, Guardar Avances, Guardado Final */}
          <div className="flex flex-wrap items-center gap-2">
            {user && projects.length > 0 && (
              <select
                aria-label="Seleccionar proyecto SET"
                value={activeProject.id}
                onChange={(e) => {
                  setActiveProjectId(e.target.value);
                  setValidationIssues(null);
                  setHasUnsavedChanges(false);
                }}
                className="max-w-[210px] truncate rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}

            {user && (
              <button
                type="button"
                onClick={handleCreateNewProject}
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Nuevo
              </button>
            )}

            <button
              type="button"
              onClick={() => void installApp()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5 text-[#0B5D2B]" />
              {pwaStatus.isStandalone ? 'App Instalada' : 'Instalar App'}
            </button>

            <button
              type="button"
              onClick={() => setShowUninstallConfirm(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Desinstalar
            </button>

            {!isLocked ? (
              <>
                <button
                  type="button"
                  disabled={savingDraft}
                  onClick={() => void handleSaveDraft()}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-[#0B5D2B] bg-white px-3.5 py-2 text-xs font-semibold text-[#0B5D2B] transition-colors hover:bg-emerald-50 disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingDraft ? 'Guardando...' : 'Guardar Avances'}
                </button>

                <button
                  type="button"
                  disabled={finalizing}
                  onClick={() => void handleFinalizeProcess()}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-[#0B5D2B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#094a22] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {finalizing ? 'Validando...' : 'Guardado Final del Proceso'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void handleReopenProcess()}
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-amber-400 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reabrir Proceso
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Banners informativos y de validación */}
      <div className="mx-auto max-w-[1440px] px-6 pt-5">
        {!isOnline && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-950">
            <WifiOff className="h-4 w-4 shrink-0" />
            Modo sin conexión activo. Puede revisar los módulos y manuales locales; reconéctese para
            sincronizar el guardado en servidor.
          </div>
        )}

        {pwaStatus.lastActionMessage && (
          <div className="no-print mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800">
            <span>{pwaStatus.lastActionMessage}</span>
            <button
              type="button"
              onClick={clearPwaMessage}
              className="rounded p-1 text-slate-400 hover:text-slate-700"
              aria-label="Cerrar notificación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {feedbackBanner && (
          <div
            role="status"
            className={`no-print mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-medium ${
              feedbackBanner.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                : feedbackBanner.type === 'error'
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-slate-300 bg-white text-slate-800'
            }`}
          >
            <span>{feedbackBanner.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="rounded p-1 opacity-70 hover:opacity-100"
              aria-label="Cerrar mensaje"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {validationIssues && validationIssues.length > 0 && (
          <div
            role="alert"
            className="no-print mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-950"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                Requisitos pendientes para el Guardado Final del Proceso ({validationIssues.length})
              </div>
              <button
                type="button"
                onClick={() => setValidationIssues(null)}
                className="text-red-700 hover:underline"
              >
                Ocultar
              </button>
            </div>
            <ul className="mt-2.5 grid grid-cols-1 gap-1.5 md:grid-cols-2">
              {validationIssues.map((issue, idx) => (
                <li key={`${issue.section}-${idx}`} className="leading-relaxed">
                  <strong>{issue.section}:</strong> {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Layout principal: Sidebar 260px + Contenido */}
      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-4 lg:flex-row">
        <aside className="no-print w-full shrink-0 lg:w-[264px]">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="px-3 pb-2 text-xs font-semibold text-slate-500">
              Módulos del Ciclo SET
            </p>
            <div className="space-y-1">
              {SIDEBAR_MODULES.map((mod) => {
                const Icon = mod.icon;
                const active = activeTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveTab(mod.id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-[#0B5D2B] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        active ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{mod.label}</p>
                      <p
                        className={`truncate text-[11px] ${
                          active ? 'text-emerald-100' : 'text-slate-500'
                        }`}
                      >
                        {mod.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Resumen métrico lateral */}
            <div className="mt-4 space-y-2.5 border-t border-slate-200 px-3 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Avance del Ciclo</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {progressPct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Presupuesto</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    budgetMetrics.exceedsCeiling ? 'text-red-700' : 'text-slate-900'
                  }`}
                >
                  {budgetMetrics.totalSMMLV.toFixed(1)} / 63 SMMLV
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total COP</span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {formatCOP(budgetMetrics.totalCOP)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Compromiso RP</span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {budgetMetrics.rpCoveragePct}%
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-12">
          {activeTab === 'overview' && (
            <ModuleOverview
              project={activeProject}
              onNavigateTab={(t) => setActiveTab(t as ActiveModuleId)}
              onUpdateProjectMeta={(patch) =>
                updateActiveProject((prev) => ({ ...prev, ...patch }))
              }
              isLocked={isLocked}
            />
          )}

          {activeTab === 'etapa1' && (
            <ModuleEtapa1
              etapa1={activeProject.etapa1}
              onChange={(etapa1) => updateActiveProject((prev) => ({ ...prev, etapa1 }))}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'etapa2' && (
            <ModuleEtapa2
              project={activeProject}
              onChange={(etapa2) => updateActiveProject((prev) => ({ ...prev, etapa2 }))}
              onOpenBudget={() => setActiveTab('presupuesto')}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'presupuesto' && (
            <ModulePresupuesto
              project={activeProject}
              onUpdateSmmlv={(smmlvValueCOP) =>
                updateActiveProject((prev) => ({ ...prev, smmlvValueCOP }))
              }
              onUpdatePresupuesto={(comp5Presupuesto) =>
                updateActiveProject((prev) => ({
                  ...prev,
                  etapa2: { ...prev.etapa2, comp5Presupuesto },
                }))
              }
              isLocked={isLocked}
            />
          )}

          {activeTab === 'etapas3a6' && (
            <ModuleEtapas3a6
              project={activeProject}
              onUpdateEtapa3={(etapa3) => updateActiveProject((prev) => ({ ...prev, etapa3 }))}
              onUpdateEtapa4={(etapa4) => updateActiveProject((prev) => ({ ...prev, etapa4 }))}
              onUpdateEtapa5={(etapa5) => updateActiveProject((prev) => ({ ...prev, etapa5 }))}
              onUpdateEtapa6={(etapa6) => updateActiveProject((prev) => ({ ...prev, etapa6 }))}
              isLocked={isLocked}
            />
          )}

          {activeTab === 'auditoria' && (
            <ModuleGobernanzaAuditoria
              project={activeProject}
              onUpdateJuridico={(juridico) =>
                updateActiveProject((prev) => ({ ...prev, juridico }))
              }
              onUpdateAudit={(auditoriaChecklist) =>
                updateActiveProject((prev) => ({ ...prev, auditoriaChecklist }))
              }
              isLocked={isLocked}
            />
          )}
        </div>
      </main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>
            Servicio Nacional de Aprendizaje – SENA · Dirección del Sistema Nacional de Formación
            para el Trabajo (DSNFT)
          </span>
          <span>
            Línea 3: SENA Especializa Territorios (SET) · Proyecto de Acuerdo DECT (Rad.
            01-9-2026097348)
          </span>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
      <InstallGuideModal
        open={showInstallGuideModal}
        isIOS={pwaStatus.isIOS}
        onClose={() => setShowInstallGuideModal(false)}
      />
      <UninstallConfirmModal
        open={showUninstallConfirm}
        onCancel={() => setShowUninstallConfirm(false)}
        onConfirm={() => void handleConfirmUninstall()}
      />
    </div>
  );
}

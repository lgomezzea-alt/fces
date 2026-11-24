import React from 'react';
import { Download, Trash2, X } from 'lucide-react';

interface InstallGuideModalProps {
  open: boolean;
  isIOS: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  open,
  isIOS,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-[#0B5D2B]" />
            <h3 id="pwa-install-title" className="text-base font-bold text-slate-900">
              Instalación de la Plataforma SENA SET
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar guía de instalación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>
            Los recursos locales y manuales normativos quedaron preparados para trabajo sin conexión.
          </p>
          {isIOS ? (
            <ol className="list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-slate-600">
              <li>
                Toque el botón <strong>Compartir</strong> en la barra inferior de Safari.
              </li>
              <li>
                Deslice hacia abajo y seleccione <strong>Agregar a pantalla de inicio</strong>.
              </li>
              <li>
                Confirme con <strong>Agregar</strong> para crear el acceso directo SENA SET.
              </li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-slate-600">
              <li>
                En Chrome o Edge, haga clic en el icono de <strong>Instalar aplicación</strong> en
                la barra de direcciones (o abra el menú <strong>⋮</strong> →{' '}
                <strong>Guardar y compartir</strong> → <strong>Instalar página como app</strong>).
              </li>
              <li>
                Confirme en <strong>Instalar</strong> para ejecutar la plataforma como aplicación de
                escritorio independiente en el Centro de Formación.
              </li>
            </ol>
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-lg bg-[#0B5D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094a22]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

interface UninstallConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const UninstallConfirmModal: React.FC<UninstallConfirmModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-uninstall-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-700" />
            <h3 id="pwa-uninstall-title" className="text-base font-bold text-slate-900">
              Desinstalar Plataforma Local
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cancelar desinstalación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Esta acción desregistrará los Service Workers locales y limpiará la caché sin conexión en
          este navegador. Sus proyectos guardados en el servidor permanecerán intactos.
        </p>

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="whitespace-nowrap rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
          >
            Confirmar Desinstalación
          </button>
        </div>
      </div>
    </div>
  );
};

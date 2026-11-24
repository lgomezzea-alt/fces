import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAStatus {
  isStandalone: boolean;
  isInstallable: boolean;
  isOfflineReady: boolean;
  isIOS: boolean;
  swCount: number;
  cacheCount: number;
  lastActionMessage: string | null;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [swCount, setSwCount] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  const refreshEnvironmentState = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    let registrationsCount = 0;
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        registrationsCount = regs.length;
      } catch {
        registrationsCount = 0;
      }
    }
    setSwCount(registrationsCount);

    let cachesLen = 0;
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        cachesLen = keys.length;
      } catch {
        cachesLen = 0;
      }
    }
    setCacheCount(cachesLen);
    setIsOfflineReady(standalone || registrationsCount > 0 || cachesLen > 0);
  }, []);

  useEffect(() => {
    void refreshEnvironmentState();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsOfflineReady(true);
      setDeferredPrompt(null);
      setLastActionMessage('Plataforma instalada en el dispositivo correctamente.');
      void refreshEnvironmentState();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [refreshEnvironmentState]);

  const installApp = useCallback(async () => {
    setLastActionMessage(null);
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
        setIsOfflineReady(true);
        setDeferredPrompt(null);
        setLastActionMessage('Aplicación instalada en su equipo / pantalla de inicio.');
        await refreshEnvironmentState();
        return { mode: 'native' as const };
      }
      setLastActionMessage('Instalación nativa cancelada por el usuario.');
      return { mode: 'dismissed' as const };
    }

    // Activate local offline cache & Service Worker when native prompt is unavailable (e.g. iframe / Safari)
    if ('caches' in window) {
      try {
        const cache = await caches.open('sena-set-offline-v1');
        await cache.addAll([
          '/',
          '/icon.svg',
          '/assets/aistudio/AAAAA_Manual_de_Operaci_n_L_nea_SENA_Especializa_Territorios__SET__a7018cc2.pdf',
        ]);
      } catch {
        // Non-blocking if individual asset fails in sandbox
      }
    }

    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.ready;
      } catch {
        // Ignore if dev SW not ready yet
      }
    }

    await refreshEnvironmentState();
    setIsOfflineReady(true);
    setShowInstallGuideModal(true);
    setLastActionMessage(
      'Caché local y manuales habilitados. Siga el paso indicado para crear el acceso directo en escritorio o móvil.'
    );
    return { mode: 'guided' as const };
  }, [deferredPrompt, refreshEnvironmentState]);

  const uninstallApp = useCallback(async () => {
    let removedSW = 0;
    let removedCaches = 0;

    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          const ok = await reg.unregister();
          if (ok) removedSW += 1;
        }
      } catch {
        // ignore
      }
    }

    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          const ok = await caches.delete(key);
          if (ok) removedCaches += 1;
        }
      } catch {
        // ignore
      }
    }

    setDeferredPrompt(null);
    setIsOfflineReady(false);
    await refreshEnvironmentState();

    const detail = isStandalone
      ? `Se eliminaron ${removedSW} Service Worker(s) y ${removedCaches} caché(s) local(es). Para quitar el icono del escritorio, abra el menú del navegador (⋮) y seleccione "Desinstalar SENA SET".`
      : `Desinstalación local completada: ${removedSW} Service Worker(s) desregistrados y ${removedCaches} caché(s) offline eliminados.`;
    setLastActionMessage(detail);
    return { removedSW, removedCaches };
  }, [isStandalone, refreshEnvironmentState]);

  return {
    status: {
      isStandalone,
      isInstallable: !!deferredPrompt,
      isOfflineReady,
      isIOS,
      swCount,
      cacheCount,
      lastActionMessage,
    } satisfies PWAStatus,
    installApp,
    uninstallApp,
    showInstallGuideModal,
    setShowInstallGuideModal,
    clearMessage: () => setLastActionMessage(null),
  };
}

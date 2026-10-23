"use client";

import { useEffect, useState } from "react";
import { Check, Download, Share2, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function AppInstallButton({ variant }: { variant: "hero" | "section" }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const openInstall = async () => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    setIsIOS(ios);
    setIsInstalled(standalone || isInstalled);

    if (installPrompt && !ios) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setInstallPrompt(null);
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          return;
        }
      } catch {
        // The manual browser instructions remain available if the native prompt fails.
      }
    }

    setInstructionsOpen(true);
  };

  const buttonClass = variant === "hero"
    ? "inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
    : "inline-flex items-center justify-center gap-2 rounded-xl bg-green-400 px-6 py-3 font-semibold text-slate-950 shadow-lg transition hover:bg-green-300";

  return (
    <>
      <button type="button" onClick={openInstall} className={buttonClass}>
        <Download size={18} />
        Installer l’application
      </button>

      {instructionsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer les instructions"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setInstructionsOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-install-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setInstructionsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {isInstalled ? (
              <>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Check className="h-6 w-6" />
                </div>
                <h2 id="app-install-title" className="pr-8 text-xl font-bold text-slate-950 dark:text-white">Application installée</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Sedhiou-connect est ajoutée à votre appareil.</p>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Share2 className="h-6 w-6" />
                </div>
                <h2 id="app-install-title" className="pr-8 text-xl font-bold text-slate-950 dark:text-white">Installer Sedhiou-connect</h2>
                {isIOS ? (
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <li><span className="font-semibold text-slate-900 dark:text-white">1.</span> Dans Safari, touchez le bouton Partager <Share2 className="mx-1 inline h-4 w-4" />.</li>
                    <li><span className="font-semibold text-slate-900 dark:text-white">2.</span> Choisissez « Sur l’écran d’accueil ».</li>
                    <li><span className="font-semibold text-slate-900 dark:text-white">3.</span> Touchez « Ajouter » pour installer l’application.</li>
                  </ol>
                ) : (
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <li><span className="font-semibold text-slate-900 dark:text-white">1.</span> Ouvrez le menu de votre navigateur.</li>
                    <li><span className="font-semibold text-slate-900 dark:text-white">2.</span> Choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».</li>
                    <li><span className="font-semibold text-slate-900 dark:text-white">3.</span> Confirmez l’installation.</li>
                  </ol>
                )}
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  L’installation ajoute le site à l’écran d’accueil; elle ne télécharge pas de fichier APK.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

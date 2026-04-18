'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus } from 'lucide-react'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('pwa-banner-dismissed')

    if (standalone || dismissed) return

    setIsIOS(ios)

    if (ios) {
      setShow(true)
      return
    }

    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') handleDismiss()
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  if (!show) return null

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-halal-green flex items-center justify-center text-white text-xs font-bold shrink-0">
          HF
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Installer Halal France</p>
          {isIOS ? (
            <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              Appuyez sur
              <span className="inline-flex items-center gap-0.5 bg-gray-100 rounded px-1 py-0.5">
                <Share className="w-3 h-3" />
              </span>
              puis
              <span className="inline-flex items-center gap-0.5 bg-gray-100 rounded px-1 py-0.5">
                <Plus className="w-3 h-3" />
                Sur l&apos;écran d&apos;accueil
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-500">Accès rapide depuis votre écran d&apos;accueil</p>
          )}
        </div>

        {!isIOS && (
          <button
            onClick={handleInstall}
            className="shrink-0 bg-halal-green text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Installer
          </button>
        )}

        <button onClick={handleDismiss} className="shrink-0 text-gray-400 hover:text-gray-600 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

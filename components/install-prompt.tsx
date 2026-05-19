"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Download } from "lucide-react"

export function InstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Check if app is already installed/running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone || 
        document.referrer.includes("android-app://");
      
      setIsStandalone(isStandaloneMode)
    }

    checkStandalone()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for display mode changes (e.g., when the app is installed and opened)
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches)
    }
    
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Automatic installation is not supported by your browser. Please look for the 'Install' icon in your address bar or browser menu.")
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }

  // Prevent hydration mismatch by returning null until mounted
  if (!isMounted || isStandalone) {
    return null
  }

  return (
    <Button 
      onClick={handleInstallClick}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Install App
    </Button>
  )
}

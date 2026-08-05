import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-10 overflow-hidden transform transition-all animate-scale-in my-8`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto text-xs sm:text-sm">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-slate-50/80 border-t border-slate-100">{footer}</div>}
      </div>
    </div>
  )
}

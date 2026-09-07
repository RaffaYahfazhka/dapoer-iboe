'use client'

import { useEffect } from 'react'
import Icon from '@/components/m3/Icon'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'success'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onCancel()
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onCancel])

  if (!open) return null

  const variantConfig = {
    default: {
      icon: 'help',
      iconBg: 'bg-[#FFB59E]/15 text-[#FFB59E]',
      btnBg: 'bg-[#B8421E] hover:bg-[#8C2C10] text-white',
    },
    danger: {
      icon: 'delete',
      iconBg: 'bg-red-500/20 text-red-400',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white',
    },
    success: {
      icon: 'check_circle',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  }

  const currentVariant = variantConfig[variant] || variantConfig.default

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative bg-[#1E2124] rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[#3A3E43] animate-slide-up-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`p-2.5 rounded-2xl ${currentVariant.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon name={currentVariant.icon} size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#E1E3E5]">{title}</h3>
        </div>

        <p className="text-[#8E9196] text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 ${currentVariant.btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

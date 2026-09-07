'use client'

import React from 'react'
import Icon from '@/components/m3/Icon'
import { DeliveryStatus, DeliveryStep } from '@/lib/types'

interface DeliveryProgressBarProps {
  status: DeliveryStatus
  step?: DeliveryStep
  showLabels?: boolean
  interactive?: boolean
  onSelectStep?: (step: DeliveryStep) => void
  size?: 'sm' | 'md'
}

const STEPS_CONFIG: { step: DeliveryStep; label: string; shortLabel: string; icon: string }[] = [
  { step: 1, label: 'Diterima', shortLabel: 'Order', icon: 'receipt_long' },
  { step: 2, label: 'Dimasak', shortLabel: 'Masak', icon: 'soup_kitchen' },
  { step: 3, label: 'Siap Kirim', shortLabel: 'Kemas', icon: 'inventory_2' },
  { step: 4, label: 'Di Jalan', shortLabel: 'Antar', icon: 'two_wheeler' },
  { step: 5, label: 'Sampai', shortLabel: 'Selesai', icon: 'task_alt' },
]

export default function DeliveryProgressBar({
  status,
  step,
  showLabels = true,
  interactive = false,
  onSelectStep,
  size = 'md',
}: DeliveryProgressBarProps) {
  const currentStep: DeliveryStep = step || (status === 'sudah' ? 5 : status === 'sedang' ? 4 : 2)
  const percent = Math.round(((currentStep - 1) / 4) * 100)

  const statusLabel =
    status === 'sudah'
      ? 'Sudah Selesai'
      : status === 'sedang'
      ? 'Sedang Diantar'
      : currentStep === 3
      ? 'Siap Dikirim'
      : currentStep === 2
      ? 'Sedang Dimasak'
      : 'Pesanan Diterima'

  return (
    <div className="w-full space-y-1.5">
      {/* Top indicator: Badge and Percentage */}
      {showLabels && (
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'sudah'
                  ? 'bg-emerald-400'
                  : status === 'sedang'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-orange-400'
              }`}
            />
            <span
              className={
                status === 'sudah'
                  ? 'text-emerald-400'
                  : status === 'sedang'
                  ? 'text-amber-400'
                  : 'text-[#FFB59E]'
              }
            >
              {statusLabel}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-[#8E9196]">{percent}%</span>
        </div>
      )}

      {/* Modern Multi-Segment Bar Progress */}
      <div className="relative">
        <div
          className={`w-full bg-[#202326] border border-[#3A3E43]/60 rounded-full overflow-hidden flex ${
            size === 'sm' ? 'h-2' : 'h-2.5'
          }`}
        >
          {STEPS_CONFIG.map((s) => {
            const isFilled = currentStep >= s.step
            const isCurrent = currentStep === s.step

            return (
              <div
                key={s.step}
                className={`flex-1 transition-all duration-500 border-r border-[#191C1E]/60 last:border-r-0 ${
                  isFilled
                    ? isCurrent && status === 'sedang'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 animate-pulse'
                      : status === 'sudah'
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-[#FFB59E] to-amber-500'
                    : 'bg-transparent'
                }`}
                title={`Tahap ${s.step}: ${s.label}`}
              />
            )
          })}
        </div>
      </div>

      {/* Interactive Step Buttons / Milestones */}
      {interactive && onSelectStep && (
        <div className="grid grid-cols-5 gap-1 pt-1">
          {STEPS_CONFIG.map((s) => {
            const isSelected = currentStep === s.step
            const isPast = currentStep > s.step

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onSelectStep(s.step)}
                className={`py-1 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-[#FFB59E] text-[#3C0A00] shadow-md ring-2 ring-[#FFB59E]/40 font-black'
                    : isPast
                    ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30]'
                }`}
                title={`Ubah ke tahap ${s.step}: ${s.label}`}
              >
                <Icon name={s.icon} size={13} filled={isSelected} />
                <span className="truncate w-full text-center text-[9px] sm:text-[10px]">
                  {s.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

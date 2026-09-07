'use client'

import React from 'react'
import Icon from '@/components/m3/Icon'
import { PelangganStatus } from '@/lib/types'

interface CustomerStatusProgressBarProps {
  status: PelangganStatus
  size?: 'sm' | 'md'
}

export default function CustomerStatusProgressBar({
  status,
  size = 'md',
}: CustomerStatusProgressBarProps) {
  const percent = status === 'aktif' ? 100 : status === 'pending' ? 50 : 100

  const config = {
    pending: {
      label: 'Menunggu Approval (50%)',
      color: 'from-amber-500 to-amber-400',
      textColor: 'text-amber-400',
      dotColor: 'bg-amber-400',
      icon: 'hourglass_top',
    },
    aktif: {
      label: 'Aktif Berlangganan (100%)',
      color: 'from-emerald-500 to-emerald-400',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      icon: 'check_circle',
    },
    nonaktif: {
      label: 'Nonaktif / Berhenti',
      color: 'from-red-500 to-red-400',
      textColor: 'text-red-400',
      dotColor: 'bg-red-400',
      icon: 'cancel',
    },
  }[status]

  return (
    <div className="w-full min-w-[130px] space-y-1">
      <div className="flex items-center justify-between gap-1.5 text-[11px] font-bold">
        <span className={`flex items-center gap-1 ${config.textColor}`}>
          <Icon name={config.icon} size={12} filled={status === 'aktif'} />
          {status === 'pending' ? 'Pending' : status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </span>
        <span className="text-[10px] text-[#8E9196] font-semibold">
          {status === 'pending' ? '50%' : status === 'aktif' ? '100%' : '0%'}
        </span>
      </div>

      <div
        className={`w-full bg-[#202326] border border-[#3A3E43]/60 rounded-full overflow-hidden ${
          size === 'sm' ? 'h-1.5' : 'h-2'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${config.color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

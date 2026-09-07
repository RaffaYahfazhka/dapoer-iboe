import { DeliveryStatus } from '@/lib/types'
import Icon from '@/components/m3/Icon'

interface StatusBadgeProps {
  status: DeliveryStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<DeliveryStatus, {
  label: string
  bg: string
  text: string
  border: string
  icon: string
}> = {
  belum: {
    label: 'Belum Diantar',
    bg: 'bg-red-500/10 dark:bg-red-950/40',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20 dark:border-red-500/30',
    icon: 'schedule',
  },
  sedang: {
    label: 'Sedang Diantar',
    bg: 'bg-amber-500/10 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    icon: 'local_shipping',
  },
  sudah: {
    label: 'Sudah Selesai',
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    icon: 'check_circle',
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.belum

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs'
      } font-semibold`}
    >
      <Icon name={config.icon} size={size === 'sm' ? 14 : 16} filled={status === 'sudah'} />
      {config.label}
    </span>
  )
}

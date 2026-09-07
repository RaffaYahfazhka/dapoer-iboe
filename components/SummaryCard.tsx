import React from 'react'
import Icon from '@/components/m3/Icon'

interface SummaryCardProps {
  title: string
  value: number | string
  iconName: string
  color: 'terracotta' | 'red' | 'amber' | 'emerald' | 'blue'
  subtitle?: string
  pulse?: boolean
}

const colorMap = {
  terracotta: {
    container: 'bg-[#202326] hover:bg-[#282C30] border-[#3A3E43]',
    iconBg: 'bg-[#FFB59E]/15 text-[#FFB59E]',
    text: 'text-[#E1E3E5]',
    subtext: 'text-[#8E9196]',
  },
  red: {
    container: 'bg-[#2D1616] hover:bg-[#381B1B] border-red-500/30',
    iconBg: 'bg-red-500/20 text-red-400',
    text: 'text-red-200',
    subtext: 'text-red-300/70',
  },
  amber: {
    container: 'bg-[#292212] hover:bg-[#332A17] border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400',
    text: 'text-amber-200',
    subtext: 'text-amber-300/70',
  },
  emerald: {
    container: 'bg-[#15271A] hover:bg-[#1B3322] border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    text: 'text-emerald-200',
    subtext: 'text-emerald-300/70',
  },
  blue: {
    container: 'bg-[#17222F] hover:bg-[#1D2B3B] border-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
    text: 'text-blue-200',
    subtext: 'text-blue-300/70',
  },
}

export default function SummaryCard({
  title,
  value,
  iconName,
  color,
  subtitle,
  pulse,
}: SummaryCardProps) {
  const c = colorMap[color] || colorMap.terracotta

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border ${c.container} p-3 sm:p-5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between`}
    >
      {pulse && (
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider hidden md:inline">
            Perhatian
          </span>
        </div>
      )}

      <div className="flex items-start gap-2.5 sm:gap-4">
        <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={iconName} size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-[#8E9196] truncate mb-0.5 sm:mb-1">
            {title}
          </p>
          <p className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight ${c.text}`}>
            {value}
          </p>
        </div>
      </div>

      {subtitle && (
        <p className={`text-[10px] sm:text-xs mt-2 truncate ${c.subtext}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

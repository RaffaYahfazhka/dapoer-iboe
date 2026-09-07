'use client'

import React from 'react'
import Icon from './Icon'

export interface FilterOption {
  key: string
  label: string
  icon?: string
  count?: number
}

interface FilterChipsProps {
  options: FilterOption[]
  selectedKey: string
  onSelect: (key: string) => void
  darkTheme?: boolean
  className?: string
}

export default function FilterChips({
  options,
  selectedKey,
  onSelect,
  darkTheme = false,
  className = '',
}: FilterChipsProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none ${className}`}>
      {options.map((opt) => {
        const isSelected = selectedKey === opt.key

        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelect(opt.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? darkTheme
                  ? 'bg-[#70260D] text-[#FFB59E] border border-[#FFB59E]/40 shadow-sm'
                  : 'bg-[#FFDBD1] text-[#3C0A00] border border-[#B8421E]/30 shadow-sm'
                : darkTheme
                ? 'bg-[#202326] text-[#8E9196] border border-[#3A3E43] hover:bg-[#282C30] hover:text-[#E1E3E5]'
                : 'bg-[#F5ECE8] text-[#785A28] border border-[#E8E0DC] hover:bg-[#EFE6E2] hover:text-[#221916]'
            }`}
          >
            {isSelected ? (
              <Icon name="check" size={16} className="text-current" />
            ) : opt.icon ? (
              <Icon name={opt.icon} size={16} className="opacity-70 text-current" />
            ) : null}

            <span>{opt.label}</span>

            {opt.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? darkTheme
                      ? 'bg-[#FFB59E]/20 text-[#FFB59E]'
                      : 'bg-[#B8421E]/15 text-[#3C0A00]'
                    : darkTheme
                    ? 'bg-[#282C30] text-[#8E9196]'
                    : 'bg-[#E8E0DC] text-[#785A28]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

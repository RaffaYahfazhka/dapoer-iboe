'use client'

import React from 'react'

interface RoundCheckboxProps {
  checked: boolean
  onChange: () => void
  title?: string
  id?: string
  ariaLabel?: string
  className?: string
  size?: 'sm' | 'md'
}

export default function RoundCheckbox({
  checked,
  onChange,
  title,
  id,
  ariaLabel,
  className = '',
  size = 'md',
}: RoundCheckboxProps) {
  const isSm = size === 'sm'
  const dimClass = isSm ? 'w-4 h-4' : 'w-5 h-5'
  const iconSizeClass = isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel || title || 'Pilih item'}
      title={title}
      id={id}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#FFB59E]/40 focus:ring-offset-2 focus:ring-offset-[#191C1E] ${dimClass} ${
        checked
          ? 'bg-[#B8421E] border border-[#FFB59E]/80 shadow-[0_0_8px_rgba(184,66,30,0.5)] scale-100'
          : 'bg-[#282C30] border border-[#3A3E43] hover:border-[#8E9196] hover:bg-[#33373B]'
      } ${className}`}
    >
      <svg
        className={`${iconSizeClass} text-white transition-all duration-200 transform ${
          checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
      </svg>
    </button>
  )
}

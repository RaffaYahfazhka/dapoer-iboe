'use client'

import React from 'react'
import Icon from './Icon'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  darkTheme?: boolean
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Cari nama, WhatsApp, alamat...',
  className = '',
  darkTheme = false,
}: SearchBarProps) {
  return (
    <div
      className={`relative flex items-center w-full rounded-full transition-all duration-200 ${
        darkTheme
          ? 'bg-[#202326] text-[#E1E3E5] border border-[#3A3E43] focus-within:border-[#FFB59E] focus-within:bg-[#282C30]'
          : 'bg-[#F5ECE8] text-[#221916] border border-transparent focus-within:border-[#B8421E] focus-within:bg-white focus-within:shadow-md'
      } ${className}`}
    >
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-60">
        <Icon name="search" size={20} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full py-3 pl-11 pr-10 text-sm bg-transparent rounded-full focus:outline-none placeholder:opacity-50 ${
          darkTheme ? 'placeholder:text-[#8E9196]' : 'placeholder:text-[#785A28]'
        }`}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
          title="Hapus pencarian"
          aria-label="Hapus pencarian"
        >
          <Icon name="close" size={18} />
        </button>
      )}
    </div>
  )
}

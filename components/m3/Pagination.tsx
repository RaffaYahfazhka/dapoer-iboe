'use client'

import React from 'react'
import Icon from './Icon'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  darkTheme?: boolean
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  darkTheme = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 rounded-2xl transition-all ${
        darkTheme
          ? 'bg-[#191C1E] text-[#E1E3E5] border border-[#3A3E43]'
          : 'bg-[#FBF2EF] text-[#221916] border border-[#E8E0DC]'
      }`}
    >
      {/* Left info & Page Size */}
      <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
        <span className={darkTheme ? 'text-[#8E9196]' : 'text-[#785A28]'}>
          {totalItems > 0 ? (
            <>
              Menampilkan <strong className="font-semibold text-current">{startItem}–{endItem}</strong> dari <strong className="font-semibold text-current">{totalItems}</strong> data
            </>
          ) : (
            'Tidak ada data'
          )}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className={darkTheme ? 'text-[#8E9196]' : 'text-[#785A28]'}>Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              className={`text-xs rounded-lg px-2 py-1 focus:outline-none transition-colors ${
                darkTheme
                  ? 'bg-[#282C30] text-[#E1E3E5] border border-[#3A3E43]'
                  : 'bg-white text-[#221916] border border-[#E8E0DC]'
              }`}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`p-1.5 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            darkTheme
              ? 'hover:bg-[#282C30] text-[#E1E3E5]'
              : 'hover:bg-[#E8E0DC] text-[#221916]'
          }`}
          title="Halaman sebelumnya"
          aria-label="Halaman sebelumnya"
        >
          <Icon name="chevron_left" size={20} />
        </button>

        {/* Page numbers (Desktop / Tablet) */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className={`px-2 text-xs ${darkTheme ? 'text-[#8E9196]' : 'text-[#785A28]'}`}
                >
                  …
                </span>
              )
            }
            const isCurrent = page === currentPage
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(Number(page))}
                className={`min-w-[32px] h-8 px-2 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? darkTheme
                      ? 'bg-[#FFB59E] text-[#3C0A00] shadow-sm'
                      : 'bg-[#B8421E] text-white shadow-sm'
                    : darkTheme
                    ? 'text-[#E1E3E5] hover:bg-[#282C30]'
                    : 'text-[#221916] hover:bg-[#EFE6E2]'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Mobile current page indicator */}
        <span className={`sm:hidden text-xs font-semibold px-2 ${darkTheme ? 'text-[#FFB59E]' : 'text-[#B8421E]'}`}>
          {currentPage} / {totalPages}
        </span>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`p-1.5 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            darkTheme
              ? 'hover:bg-[#282C30] text-[#E1E3E5]'
              : 'hover:bg-[#E8E0DC] text-[#221916]'
          }`}
          title="Halaman berikutnya"
          aria-label="Halaman berikutnya"
        >
          <Icon name="chevron_right" size={20} />
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { DeliveryRecord, DeliveryStatus, DeliveryStep } from '@/lib/types'
import {
  updateDeliveryStatus,
  updateDeliveryStep,
  bulkUpdateDeliveryStatus,
  bulkDeleteDeliveryRecords,
  deleteDeliveryRecord,
  isOverdue,
} from '@/lib/store'
import DeliveryProgressBar from './DeliveryProgressBar'
import ConfirmDialog from './ConfirmDialog'
import Icon from '@/components/m3/Icon'
import SearchBar from '@/components/m3/SearchBar'
import FilterChips, { FilterOption } from '@/components/m3/FilterChips'
import Pagination from '@/components/m3/Pagination'
import RoundCheckbox from '@/components/m3/RoundCheckbox'

interface DeliveryTrackerProps {
  records: DeliveryRecord[]
  onUpdate: () => void
}

// Grouped structure for 1 row per customer
interface GroupedDeliveryCustomer {
  pelangganId: string
  pelangganNama: string
  pelangganAlamat: string
  pelangganWhatsapp?: string
  records: DeliveryRecord[] // May contain 'siang', 'malam', or both
}

export default function DeliveryTracker({ records, onUpdate }: DeliveryTrackerProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Bulk Selection by Customer ID (or by delivery IDs)
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])

  // Single Confirm State
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    recordId: string
    newStatus: DeliveryStatus
    pelangganNama: string
    shiftLabel?: string
  }>({
    open: false,
    recordId: '',
    newStatus: 'belum',
    pelangganNama: '',
  })

  // Bulk Confirm State
  const [bulkConfirmState, setBulkConfirmState] = useState<{
    open: boolean
    action: 'selesai' | 'sedang' | 'belum' | 'delete'
    targetShift?: 'all' | 'pagi' | 'siang' | 'malam'
  }>({
    open: false,
    action: 'selesai',
  })

  // 1. Group records by Customer (One Row Per Customer Name)
  const groupedCustomers: GroupedDeliveryCustomer[] = useMemo(() => {
    const map = new Map<string, GroupedDeliveryCustomer>()

    for (const r of records) {
      // Key can be pelangganId or trimmed name to be 100% consistent
      const key = r.pelangganId || r.pelangganNama.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          pelangganId: r.pelangganId || key,
          pelangganNama: r.pelangganNama,
          pelangganAlamat: r.pelangganAlamat,
          pelangganWhatsapp: r.pelangganWhatsapp,
          records: [r],
        })
      } else {
        const existing = map.get(key)!
        // Ensure no duplicate schedule for same customer
        const alreadyHasSchedule = existing.records.some((ex) => ex.jadwal === r.jadwal)
        if (!alreadyHasSchedule) {
          existing.records.push(r)
        }
      }
    }

    // Sort shift inside each group: 'pagi' -> 'siang' -> 'malam'
    const shiftOrder: Record<string, number> = { pagi: 1, siang: 2, malam: 3 }
    for (const group of map.values()) {
      group.records.sort((a, b) => (shiftOrder[a.jadwal] || 99) - (shiftOrder[b.jadwal] || 99))
    }

    return Array.from(map.values())
  }, [records])

  // Filter options with counts
  const filterOptions: FilterOption[] = useMemo(() => {
    return [
      { key: 'all', label: 'Semua Pelanggan', icon: 'groups', count: groupedCustomers.length },
      {
        key: 'pagi',
        label: 'Ada Pagi',
        icon: 'wb_twilight',
        count: groupedCustomers.filter((g) => g.records.some((r) => r.jadwal === 'pagi')).length,
      },
      {
        key: 'siang',
        label: 'Ada Siang',
        icon: 'wb_sunny',
        count: groupedCustomers.filter((g) => g.records.some((r) => r.jadwal === 'siang')).length,
      },
      {
        key: 'malam',
        label: 'Ada Malam',
        icon: 'bedtime',
        count: groupedCustomers.filter((g) => g.records.some((r) => r.jadwal === 'malam')).length,
      },
      {
        key: 'belum',
        label: 'Belum Selesai',
        icon: 'schedule',
        count: groupedCustomers.filter((g) => g.records.some((r) => r.status !== 'sudah')).length,
      },
      {
        key: 'sedang',
        label: 'Sedang Diantar',
        icon: 'local_shipping',
        count: groupedCustomers.filter((g) => g.records.some((r) => r.status === 'sedang')).length,
      },
      {
        key: 'sudah',
        label: 'Semua Selesai',
        icon: 'check_circle',
        count: groupedCustomers.filter((g) => g.records.every((r) => r.status === 'sudah')).length,
      },
    ]
  }, [groupedCustomers])

  // Filter & Search Grouped Customers
  const filteredCustomers = useMemo(() => {
    return groupedCustomers.filter((group) => {
      // Filter match
      const matchFilter = (() => {
        if (filter === 'all') return true
        if (filter === 'siang') return group.records.some((r) => r.jadwal === 'siang')
        if (filter === 'malam') return group.records.some((r) => r.jadwal === 'malam')
        if (filter === 'belum') return group.records.some((r) => r.status !== 'sudah')
        if (filter === 'sedang') return group.records.some((r) => r.status === 'sedang')
        if (filter === 'sudah') return group.records.every((r) => r.status === 'sudah')
        return true
      })()

      if (!matchFilter) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        group.pelangganNama.toLowerCase().includes(q) ||
        group.pelangganAlamat.toLowerCase().includes(q) ||
        (group.pelangganWhatsapp && group.pelangganWhatsapp.includes(q))
      )
    })
  }, [groupedCustomers, filter, search])

  // Paginated customers
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, currentPage, pageSize])

  // Bulk selection logic
  const isAllPaginatedSelected =
    paginatedCustomers.length > 0 &&
    paginatedCustomers.every((g) => selectedCustomerIds.includes(g.pelangganId))

  const handleSelectAll = () => {
    if (isAllPaginatedSelected) {
      const pageIds = new Set(paginatedCustomers.map((g) => g.pelangganId))
      setSelectedCustomerIds((prev) => prev.filter((id) => !pageIds.has(id)))
    } else {
      const combined = new Set([...selectedCustomerIds, ...paginatedCustomers.map((g) => g.pelangganId)])
      setSelectedCustomerIds(Array.from(combined))
    }
  }

  const handleToggleSelect = (pelangganId: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(pelangganId) ? prev.filter((id) => id !== pelangganId) : [...prev, pelangganId]
    )
  }

  // Find all delivery record IDs corresponding to selected customers
  const selectedDeliveryRecordIds = useMemo(() => {
    const selectedSet = new Set(selectedCustomerIds)
    const recordIds: string[] = []
    for (const g of groupedCustomers) {
      if (selectedSet.has(g.pelangganId)) {
        for (const r of g.records) {
          recordIds.push(r.id)
        }
      }
    }
    return recordIds
  }, [selectedCustomerIds, groupedCustomers])

  // Single Action
  const handleStatusChange = (
    record: DeliveryRecord,
    newStatus: DeliveryStatus,
    pelangganNama: string
  ) => {
    setConfirmState({
      open: true,
      recordId: record.id,
      newStatus,
      pelangganNama,
      shiftLabel:
        record.jadwal === 'pagi'
          ? 'Pagi'
          : record.jadwal === 'siang'
          ? 'Siang'
          : 'Malam',
    })
  }

  const confirmSingleChange = async () => {
    await updateDeliveryStatus(confirmState.recordId, confirmState.newStatus)
    setConfirmState({
      open: false,
      recordId: '',
      newStatus: 'belum',
      pelangganNama: '',
    })
    onUpdate()
  }

  const handleDirectStepChange = async (recordId: string, step: DeliveryStep) => {
    await updateDeliveryStep(recordId, step)
    onUpdate()
  }

  // Bulk Actions
  const handleTriggerBulk = (
    action: 'selesai' | 'sedang' | 'belum' | 'delete',
    targetShift?: 'all' | 'pagi' | 'siang' | 'malam'
  ) => {
    setBulkConfirmState({
      open: true,
      action,
      targetShift,
    })
  }

  const confirmBulkAction = async () => {
    const { action, targetShift } = bulkConfirmState
    const selectedSet = new Set(selectedCustomerIds)

    // Filter which delivery records to affect based on targetShift
    const targetRecordIds: string[] = []
    for (const g of groupedCustomers) {
      if (selectedSet.has(g.pelangganId)) {
        for (const r of g.records) {
          if (!targetShift || targetShift === 'all' || r.jadwal === targetShift) {
            targetRecordIds.push(r.id)
          }
        }
      }
    }

    if (action === 'delete') {
      await bulkDeleteDeliveryRecords(targetRecordIds)
    } else if (action === 'selesai') {
      await bulkUpdateDeliveryStatus(targetRecordIds, 'sudah')
    } else if (action === 'sedang') {
      await bulkUpdateDeliveryStatus(targetRecordIds, 'sedang')
    } else if (action === 'belum') {
      await bulkUpdateDeliveryStatus(targetRecordIds, 'belum')
    }

    setBulkConfirmState({ ...bulkConfirmState, open: false })
    setSelectedCustomerIds([])
    onUpdate()
  }

  const getConfirmMessage = () => {
    const statusLabels: Record<DeliveryStatus, string> = {
      belum: 'Belum Diantar',
      sedang: 'Sedang Diantar',
      sudah: 'Sudah Selesai',
    }
    return `Ubah status pengiriman shift ${confirmState.shiftLabel} untuk "${confirmState.pelangganNama}" menjadi "${statusLabels[confirmState.newStatus]}"?`
  }

  const getBulkConfirmMessage = () => {
    const count = selectedCustomerIds.length
    const shiftText =
      bulkConfirmState.targetShift === 'pagi'
        ? 'Shift Pagi'
        : bulkConfirmState.targetShift === 'siang'
        ? 'Shift Siang'
        : bulkConfirmState.targetShift === 'malam'
        ? 'Shift Malam'
        : 'Semua Shift'

    if (bulkConfirmState.action === 'delete') {
      return `Hapus catatan pengantaran untuk ${count} pelanggan terpilih (${shiftText})? Tindakan ini tidak dapat dibatalkan.`
    }
    if (bulkConfirmState.action === 'selesai') {
      return `Tandai SUDAH SELESAI untuk ${count} pelanggan terpilih (${shiftText}) sekaligus?`
    }
    if (bulkConfirmState.action === 'sedang') {
      return `Tandai SEDANG DIANTAR untuk ${count} pelanggan terpilih (${shiftText})?`
    }
    return `Reset status menjadi BELUM DIANTAR untuk ${count} pelanggan terpilih (${shiftText})?`
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val)
              setCurrentPage(1)
            }}
            placeholder="Cari nama penerima, alamat pengiriman, atau WhatsApp..."
            darkTheme={true}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips
        options={filterOptions}
        selectedKey={filter}
        onSelect={(k) => {
          setFilter(k)
          setCurrentPage(1)
        }}
        darkTheme={true}
      />

      {/* STICKY BULK ACTION BAR */}
      {selectedCustomerIds.length > 0 && (
        <div className="sticky top-14 sm:top-16 z-30 bg-[#282C30] border-2 border-[#FFB59E]/40 rounded-2xl p-3 sm:p-4 shadow-2xl animate-fade-in flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#70260D] text-[#FFB59E] font-extrabold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
              {selectedCustomerIds.length}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#E1E3E5] truncate">
                {selectedCustomerIds.length} pelanggan ({selectedDeliveryRecordIds.length} paket)
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#8E9196] truncate">
                Terapkan aksi massal untuk jadwal terpilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Bulk Quick Buttons */}
            <button
              type="button"
              onClick={() => handleTriggerBulk('selesai', 'all')}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="done_all" size={15} />
              <span>Selesai</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerBulk('sedang', 'all')}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="local_shipping" size={15} />
              <span>Antar</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerBulk('belum', 'all')}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#191C1E] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="replay" size={15} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerBulk('delete', 'all')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="delete" size={15} />
              <span>Hapus</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCustomerIds([])}
              className="p-1.5 sm:p-2 rounded-xl text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#191C1E] transition-all ml-0.5"
              title="Batal Memilih"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Record List (One Unified Row / Card per Customer Name) */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-[#3A3E43] bg-[#191C1E] p-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#282C30] text-[#8E9196] flex items-center justify-center">
            <Icon name="search_off" size={28} />
          </div>
          <p className="text-[#E1E3E5] text-sm font-semibold">Tidak ada jadwal pengiriman ditemukan</p>
          <p className="text-[#8E9196] text-xs mt-1">
            {search ? `Tidak ada hasil yang cocok dengan kata kunci "${search}"` : 'Belum ada jadwal untuk kategori ini'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Bar with Select All */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#202326]/60 rounded-2xl border border-[#3A3E43]/60 text-xs font-semibold text-[#8E9196]">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <RoundCheckbox
                checked={isAllPaginatedSelected}
                onChange={handleSelectAll}
                title="Pilih Semua di Halaman Ini"
                ariaLabel="Pilih Semua di Halaman Ini"
              />
              <span>Pilih Semua di Halaman ({paginatedCustomers.length} pelanggan)</span>
            </label>

            {selectedCustomerIds.length > 0 && (
              <span className="text-[#FFB59E] font-bold">
                {selectedCustomerIds.length} terpilih
              </span>
            )}
          </div>

          {/* Unified Customer Cards (1 Row per Customer Name, combining Pagi, Siang & Malam) */}
          {paginatedCustomers.map((group) => {
            const isSelected = selectedCustomerIds.includes(group.pelangganId)
            const hasMultipleShifts = group.records.length > 1
            const allCompleted = group.records.every((r) => r.status === 'sudah')
            const hasOverdue = group.records.some((r) => isOverdue(r.jadwal, r.tanggal) && r.status === 'belum')

            return (
              <div
                key={group.pelangganId}
                className={`relative rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
                  isSelected
                    ? 'border-[#FFB59E] bg-[#221C1A]'
                    : hasOverdue
                    ? 'bg-[#2D1616] border-red-500/40'
                    : allCompleted
                    ? 'bg-[#15271A]/40 border-emerald-500/20'
                    : 'bg-[#191C1E] border-[#3A3E43] hover:border-[#FFB59E]/40'
                }`}
              >
                {/* Main Row / Card Grid */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Customer Info with Checkbox */}
                  <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                    <div className="pt-0.5">
                      <RoundCheckbox
                        checked={isSelected}
                        onChange={() => handleToggleSelect(group.pelangganId)}
                        title={`Pilih ${group.pelangganNama}`}
                        ariaLabel={`Pilih ${group.pelangganNama}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-[#E1E3E5] text-base truncate">
                          {group.pelangganNama}
                        </h4>

                        {hasMultipleShifts && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            <Icon name="routine" size={13} />
                            {group.records.length} Shift Antaran
                          </span>
                        )}

                        {allCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Icon name="check_circle" size={13} filled />
                            Semua Selesai
                          </span>
                        )}

                        {hasOverdue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full animate-pulse">
                            <Icon name="warning" size={13} />
                            Ada Terlambat
                          </span>
                        )}
                      </div>

                      <p className="text-[#8E9196] text-xs flex items-start gap-1.5 line-clamp-2">
                        <Icon name="location_on" size={15} className="text-[#8E9196] flex-shrink-0 mt-0.5" />
                        {group.pelangganAlamat}
                      </p>

                      {group.pelangganWhatsapp && (
                        <a
                          href={`https://wa.me/${group.pelangganWhatsapp.replace(/[-+\s]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#8E9196] hover:text-[#FFB59E] flex items-center gap-1 mt-1 transition-colors"
                        >
                          <Icon name="call" size={13} />
                          {group.pelangganWhatsapp}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: Integrated Schedules with Status Bar Progress (1 Row contains each shift cleanly) */}
                  <div className="flex-1 space-y-3 w-full lg:max-w-xl">
                    {group.records.map((record) => {
                      const overdue = isOverdue(record.jadwal, record.tanggal)
                      const isPagi = record.jadwal === 'pagi'
                      const isSiang = record.jadwal === 'siang'

                      return (
                        <div
                          key={record.id}
                          className="bg-[#202326] p-3 sm:p-3.5 rounded-2xl border border-[#3A3E43]/70 space-y-2.5"
                        >
                          {/* Shift Label Header & Advance Button */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                                  isPagi
                                    ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                    : isSiang
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                }`}
                              >
                                <Icon
                                  name={
                                    isPagi ? 'wb_twilight' : isSiang ? 'wb_sunny' : 'bedtime'
                                  }
                                  size={14}
                                />
                                Shift{' '}
                                {isPagi ? 'Pagi (Sarapan)' : isSiang ? 'Siang' : 'Malam'}
                              </span>

                              {overdue && record.status === 'belum' && (
                                <span className="text-[10px] text-red-400 font-bold">
                                  Terlambat
                                </span>
                              )}
                            </div>

                            {/* Single Shift Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              {record.status !== 'sudah' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(
                                      record,
                                      record.status === 'belum' ? 'sedang' : 'sudah',
                                      group.pelangganNama
                                    )
                                  }
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                    record.status === 'belum'
                                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                  }`}
                                >
                                  <Icon
                                    name={record.status === 'belum' ? 'local_shipping' : 'check'}
                                    size={14}
                                  />
                                  <span>{record.status === 'belum' ? 'Mulai Antar' : 'Selesaikan'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(record, 'belum', group.pelangganNama)}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] transition-all"
                                  title="Reset status pengantaran ini"
                                >
                                  Reset
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteDeliveryRecord(record.id)
                                  onUpdate()
                                }}
                                className="p-1 text-[#8E9196] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                                title="Hapus jadwal shift ini"
                              >
                                <Icon name="delete" size={16} />
                              </button>
                            </div>
                          </div>

                          {/* BAR PROGRESS FORM: Visual 5-step progress bar */}
                          <DeliveryProgressBar
                            status={record.status}
                            step={record.step}
                            interactive={true}
                            onSelectStep={(step) => handleDirectStepChange(record.id, step)}
                            size="md"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Component */}
      {filteredCustomers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50]}
          darkTheme={true}
        />
      )}

      {/* Confirm Dialog (Single) */}
      <ConfirmDialog
        open={confirmState.open}
        title="Konfirmasi Perubahan Status"
        message={getConfirmMessage()}
        confirmLabel="Ya, Ubah Status"
        variant={confirmState.newStatus === 'sudah' ? 'success' : 'default'}
        onConfirm={confirmSingleChange}
        onCancel={() => setConfirmState({ ...confirmState, open: false })}
      />

      {/* Confirm Dialog (Bulk) */}
      <ConfirmDialog
        open={bulkConfirmState.open}
        title={
          bulkConfirmState.action === 'delete'
            ? `Hapus Pengantaran (${selectedCustomerIds.length} Pelanggan)`
            : bulkConfirmState.action === 'selesai'
            ? `Selesaikan Pengantaran (${selectedCustomerIds.length} Pelanggan)`
            : `Perbarui Status (${selectedCustomerIds.length} Pelanggan)`
        }
        message={getBulkConfirmMessage()}
        confirmLabel={
          bulkConfirmState.action === 'delete'
            ? 'Ya, Hapus Semua'
            : bulkConfirmState.action === 'selesai'
            ? 'Ya, Selesaikan Semua'
            : 'Ya, Terapkan'
        }
        variant={bulkConfirmState.action === 'delete' ? 'danger' : 'success'}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkConfirmState({ ...bulkConfirmState, open: false })}
      />
    </div>
  )
}

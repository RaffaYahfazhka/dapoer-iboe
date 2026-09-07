'use client'

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react'
import {
  getPelangganList,
  updatePelangganStatus,
  deletePelanggan,
  bulkUpdatePelangganStatus,
  bulkDeletePelanggan,
  seedDummyPelanggan,
} from '@/lib/store'
import { Pelanggan, JadwalType } from '@/lib/types'
import ConfirmDialog from '@/components/ConfirmDialog'
import CustomerStatusProgressBar from '@/components/CustomerStatusProgressBar'
import Icon from '@/components/m3/Icon'
import SearchBar from '@/components/m3/SearchBar'
import FilterChips, { FilterOption } from '@/components/m3/FilterChips'
import Pagination from '@/components/m3/Pagination'
import RoundCheckbox from '@/components/m3/RoundCheckbox'

const emptySubscribe = () => () => {}

export default function PelangganPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [jadwalFilter, setJadwalFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<'nama' | 'createdAt' | 'status'>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Single Confirm State
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    action: 'approve' | 'reject' | 'deactivate' | 'activate' | 'delete'
    pelangganId: string
    pelangganNama: string
  }>({
    open: false,
    action: 'approve',
    pelangganId: '',
    pelangganNama: '',
  })

  // Bulk Confirm State
  const [bulkConfirmState, setBulkConfirmState] = useState<{
    open: boolean
    action: 'approve' | 'deactivate' | 'delete'
  }>({
    open: false,
    action: 'approve',
  })

  const loadData = useCallback(async () => {
    const list = await getPelangganList()
    return list
  }, [])

  useEffect(() => {
    if (!isClient) return
    let cancelled = false
    loadData().then((list) => {
      if (!cancelled) {
        setPelangganList(list)
        setSelectedIds([])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [isClient, loadData])

  const refreshData = useCallback(async () => {
    const list = await loadData()
    setPelangganList(list)
    setSelectedIds([])
  }, [loadData])

  const handleResetDummy = async () => {
    await seedDummyPelanggan()
    await refreshData()
  }

  // Filter options for Status
  const statusFilterOptions: FilterOption[] = useMemo(() => {
    return [
      { key: 'all', label: 'Semua Status', icon: 'filter_list', count: pelangganList.length },
      { key: 'pending', label: 'Pending', icon: 'hourglass_top', count: pelangganList.filter((p) => p.status === 'pending').length },
      { key: 'aktif', label: 'Aktif', icon: 'check_circle', count: pelangganList.filter((p) => p.status === 'aktif').length },
      { key: 'nonaktif', label: 'Nonaktif', icon: 'cancel', count: pelangganList.filter((p) => p.status === 'nonaktif').length },
    ]
  }, [pelangganList])

  // Filter options for Jadwal
  const jadwalFilterOptions: FilterOption[] = useMemo(() => {
    return [
      { key: 'all', label: 'Semua Shift', icon: 'schedule' },
      { key: 'pagi', label: 'Pagi', icon: 'wb_twilight' },
      { key: 'siang', label: 'Siang', icon: 'wb_sunny' },
      { key: 'malam', label: 'Malam', icon: 'bedtime' },
      { key: 'keduanya', label: 'Siang & Malam', icon: 'routine' },
      { key: 'semua', label: 'Semua (3 Shift)', icon: 'routine' },
    ]
  }, [])

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    const list = pelangganList.filter((p) => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      // Jadwal filter
      if (jadwalFilter !== 'all' && p.jadwal !== jadwalFilter) return false
      // Search
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.nama.toLowerCase().includes(q) ||
        p.whatsapp.includes(q) ||
        p.alamat.toLowerCase().includes(q) ||
        (p.catatan && p.catatan.toLowerCase().includes(q))
      )
    })

    list.sort((a, b) => {
      let comparison = 0
      if (sortField === 'nama') {
        comparison = a.nama.localeCompare(b.nama)
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      return sortAsc ? comparison : -comparison
    })

    return list
  }, [pelangganList, statusFilter, jadwalFilter, search, sortField, sortAsc])

  // Paginated list
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize])

  // Selection helpers
  const isAllPaginatedSelected =
    paginatedList.length > 0 && paginatedList.every((p) => selectedIds.includes(p.id))

  const handleSelectAll = () => {
    if (isAllPaginatedSelected) {
      // Unselect only items in current page
      const pageIds = new Set(paginatedList.map((p) => p.id))
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)))
    } else {
      // Select all items in current page
      const combined = new Set([...selectedIds, ...paginatedList.map((p) => p.id)])
      setSelectedIds(Array.from(combined))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSort = (field: 'nama' | 'createdAt' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const handleAction = (action: typeof confirmState.action, pelanggan: Pelanggan) => {
    setConfirmState({
      open: true,
      action,
      pelangganId: pelanggan.id,
      pelangganNama: pelanggan.nama,
    })
  }

  const confirmAction = async () => {
    const { action, pelangganId } = confirmState
    switch (action) {
      case 'approve':
      case 'activate':
        await updatePelangganStatus(pelangganId, 'aktif')
        break
      case 'reject':
      case 'deactivate':
        await updatePelangganStatus(pelangganId, 'nonaktif')
        break
      case 'delete':
        await deletePelanggan(pelangganId)
        break
    }
    setConfirmState({ ...confirmState, open: false })
    await loadData()
  }

  const confirmBulkAction = async () => {
    const { action } = bulkConfirmState
    if (action === 'approve') {
      await bulkUpdatePelangganStatus(selectedIds, 'aktif')
    } else if (action === 'deactivate') {
      await bulkUpdatePelangganStatus(selectedIds, 'nonaktif')
    } else if (action === 'delete') {
      await bulkDeletePelanggan(selectedIds)
    }
    setBulkConfirmState({ ...bulkConfirmState, open: false })
    setSelectedIds([])
    await loadData()
  }

  const getActionMessage = () => {
    const messages = {
      approve: `Setujui "${confirmState.pelangganNama}" sebagai pelanggan aktif? Jadwal pengantaran otomatis aktif.`,
      reject: `Tolak pendaftaran "${confirmState.pelangganNama}"? Status akan dipindahkan ke nonaktif.`,
      deactivate: `Nonaktifkan pelanggan "${confirmState.pelangganNama}"? Pengantaran akan dihentikan sementara.`,
      activate: `Aktifkan kembali jadwal catering "${confirmState.pelangganNama}"?`,
      delete: `Hapus pelanggan "${confirmState.pelangganNama}" secara permanen? Tindakan ini tidak dapat dibatalkan.`,
    }
    return messages[confirmState.action]
  }

  const getBulkActionMessage = () => {
    const count = selectedIds.length
    if (bulkConfirmState.action === 'approve') {
      return `Setujui & aktifkan ${count} pelanggan yang dipilih sekaligus? Jadwal pengantaran harian otomatis aktif.`
    }
    if (bulkConfirmState.action === 'deactivate') {
      return `Nonaktifkan ${count} pelanggan yang dipilih? Pengantaran mereka akan dihentikan sementara.`
    }
    return `Hapus ${count} data pelanggan yang dipilih secara permanen? Tindakan ini tidak dapat dibatalkan.`
  }

  const renderJadwalBadge = (jadwal: JadwalType) => {
    if (jadwal === 'semua') {
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20">
            <Icon name="wb_twilight" size={12} />
            Pagi
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20">
            <Icon name="wb_sunny" size={12} />
            Siang
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
            <Icon name="bedtime" size={12} />
            Malam
          </span>
        </div>
      )
    }

    if (jadwal === 'keduanya') {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20">
            <Icon name="wb_sunny" size={13} />
            Siang
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
            <Icon name="bedtime" size={13} />
            Malam
          </span>
        </div>
      )
    }

    const config = {
      pagi: { icon: 'wb_twilight', label: 'Pagi', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
      siang: { icon: 'wb_sunny', label: 'Siang', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
      malam: { icon: 'bedtime', label: 'Malam', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    }[jadwal as 'pagi' | 'siang' | 'malam'] || {
      icon: 'schedule',
      label: jadwal,
      color: 'text-[#8E9196] bg-[#282C30] border-[#3A3E43]',
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon name={config.icon} size={14} />
        {config.label}
      </span>
    )
  }

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#FFB59E]/30 border-t-[#FFB59E] rounded-full animate-spin" />
      </div>
    )
  }

  const pendingCount = pelangganList.filter((p) => p.status === 'pending').length

  return (
    <div className="space-y-6 animate-fade-in relative pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E1E3E5] tracking-tight">
            Data Pelanggan
          </h1>
          <p className="text-[#8E9196] text-xs sm:text-sm mt-1">
            Kelola pendaftaran langganan catering harian, jadwal shift gabungan, dan status
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDummy}
          className="px-4 py-2.5 bg-[#191C1E] hover:bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs font-bold text-[#FFB59E] hover:text-[#FFDBD1] transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Icon name="cloud_sync" size={18} />
          Reset &amp; Seed Database Supabase
        </button>
      </div>

      {/* Pending Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-[#292212] border border-amber-500/40 rounded-3xl p-4 sm:p-5 flex items-center gap-3.5 animate-fade-in-up">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl flex-shrink-0">
            <Icon name="notifications_active" size={22} />
          </div>
          <div className="flex-1">
            <p className="text-amber-200 font-bold text-sm">
              {pendingCount} pendaftaran baru menunggu persetujuan (approval)
            </p>
            <p className="text-amber-300/70 text-xs mt-0.5">
              Gunakan filter &ldquo;Pending&rdquo; atau fitur bulk select di bawah untuk menyetujui sekaligus.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('pending')
              setCurrentPage(1)
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/30 text-amber-200 text-xs font-bold hover:bg-amber-500/40 transition-colors hidden sm:inline-block"
          >
            Lihat Sekarang
          </button>
        </div>
      )}

      {/* Universal Search & Modular Filter Chips */}
      <div className="space-y-3 bg-[#191C1E] p-4 sm:p-5 rounded-3xl border border-[#3A3E43]">
        {/* Search */}
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val)
            setCurrentPage(1)
          }}
          placeholder="Cari berdasarkan nama pelanggan, WhatsApp, atau alamat..."
          darkTheme={true}
        />

        {/* Filter Groups */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9196] w-14 flex-shrink-0">
              Status:
            </span>
            <FilterChips
              options={statusFilterOptions}
              selectedKey={statusFilter}
              onSelect={(k) => {
                setStatusFilter(k)
                setCurrentPage(1)
              }}
              darkTheme={true}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9196] w-14 flex-shrink-0">
              Shift:
            </span>
            <FilterChips
              options={jadwalFilterOptions}
              selectedKey={jadwalFilter}
              onSelect={(k) => {
                setJadwalFilter(k)
                setCurrentPage(1)
              }}
              darkTheme={true}
            />
          </div>
        </div>
      </div>

      {/* STICKY BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="sticky top-14 sm:top-16 z-30 bg-[#282C30] border-2 border-[#FFB59E]/40 rounded-2xl p-3 sm:p-4 shadow-2xl animate-fade-in flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#70260D] text-[#FFB59E] font-extrabold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
              {selectedIds.length}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#E1E3E5] truncate">
                {selectedIds.length} pelanggan dipilih
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#8E9196] truncate">
                Terapkan aksi serentak ke semua yang dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setBulkConfirmState({ open: true, action: 'approve' })}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="check_circle" size={15} />
              <span>Setujui</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkConfirmState({ open: true, action: 'deactivate' })}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#191C1E] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="pause_circle" size={15} />
              <span>Nonaktifkan</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkConfirmState({ open: true, action: 'delete' })}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Icon name="delete" size={15} />
              <span>Hapus</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 sm:p-2 rounded-xl text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#191C1E] transition-all ml-0.5"
              title="Batal Memilih"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="bg-[#191C1E] rounded-3xl border border-[#3A3E43] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#202326] text-[#8E9196] rounded-full flex items-center justify-center">
            <Icon name="person_search" size={32} />
          </div>
          <p className="text-[#E1E3E5] font-semibold text-sm">Tidak ada pelanggan ditemukan</p>
          <p className="text-[#8E9196] text-xs mt-1">
            {search || statusFilter !== 'all' || jadwalFilter !== 'all'
              ? 'Coba atur ulang kata kunci pencarian atau filter Anda'
              : 'Pelanggan yang mendaftar dari formulir website akan muncul di sini'}
          </p>
          {(search || statusFilter !== 'all' || jadwalFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setJadwalFilter('all')
                setCurrentPage(1)
              }}
              className="mt-4 px-4 py-2 rounded-full bg-[#70260D] text-[#FFB59E] text-xs font-bold hover:bg-[#8C3317] transition-all"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: M3 Data Table with Bulk Checkbox & Status Progress Bar */}
          <div className="hidden md:block bg-[#191C1E] rounded-3xl border border-[#3A3E43] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#3A3E43] bg-[#202326]/80 text-[#8E9196] text-xs font-semibold uppercase tracking-wider">
                    {/* Bulk Selection Header Checkbox */}
                    <th className="py-3.5 pl-5 pr-2 w-10">
                      <RoundCheckbox
                        checked={isAllPaginatedSelected}
                        onChange={handleSelectAll}
                        title="Pilih Semua di Halaman Ini"
                        ariaLabel="Pilih Semua di Halaman Ini"
                      />
                    </th>

                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-[#E1E3E5] select-none"
                      onClick={() => handleSort('nama')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nama & Kontak</span>
                        <Icon
                          name={sortField === 'nama' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                          size={15}
                        />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Alamat & Catatan</th>
                    <th className="py-3.5 px-4">Jadwal Shift</th>
                    <th
                      className="py-3.5 px-4 min-w-[160px] cursor-pointer hover:text-[#E1E3E5] select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status Progres</span>
                        <Icon
                          name={sortField === 'status' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                          size={15}
                        />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-[#E1E3E5] select-none"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Tanggal Mulai</span>
                        <Icon
                          name={sortField === 'createdAt' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                          size={15}
                        />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3E43]/50 text-sm">
                  {paginatedList.map((pelanggan) => {
                    const isSelected = selectedIds.includes(pelanggan.id)

                    return (
                      <tr
                        key={pelanggan.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-[#2D221D]/60'
                            : 'hover:bg-[#202326]/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 pl-5 pr-2">
                          <RoundCheckbox
                            checked={isSelected}
                            onChange={() => handleToggleSelect(pelanggan.id)}
                            title={`Pilih ${pelanggan.nama}`}
                            ariaLabel={`Pilih ${pelanggan.nama}`}
                          />
                        </td>

                        {/* Nama & WhatsApp */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#E1E3E5]">{pelanggan.nama}</div>
                          <a
                            href={`https://wa.me/${pelanggan.whatsapp.replace(/[-+\s]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#8E9196] hover:text-[#FFB59E] flex items-center gap-1 mt-0.5 transition-colors"
                          >
                            <Icon name="call" size={13} />
                            {pelanggan.whatsapp}
                          </a>
                        </td>

                        {/* Alamat & Catatan */}
                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-xs text-[#E1E3E5] line-clamp-2">{pelanggan.alamat}</p>
                          {pelanggan.catatan && (
                            <p className="text-[11px] text-[#8E9196] italic mt-0.5 flex items-center gap-1">
                              <Icon name="info" size={12} className="text-[#FFB59E]" />
                              {pelanggan.catatan}
                            </p>
                          )}
                        </td>

                        {/* Jadwal (Multi-shift dalam 1 row) */}
                        <td className="py-4 px-4">
                          {renderJadwalBadge(pelanggan.jadwal)}
                        </td>

                        {/* Status Bar Progress */}
                        <td className="py-4 px-4">
                          <CustomerStatusProgressBar status={pelanggan.status} size="sm" />
                        </td>

                        {/* Tanggal Mulai / Daftar */}
                        <td className="py-4 px-4 text-xs text-[#8E9196]">
                          <div>Mulai: {pelanggan.mulaiTanggal}</div>
                          <div className="text-[11px] opacity-70">
                            {new Date(pelanggan.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {pelanggan.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction('approve', pelanggan)}
                                  className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                  title="Setujui Pelanggan"
                                >
                                  <Icon name="check" size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction('reject', pelanggan)}
                                  className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                  title="Tolak Pelanggan"
                                >
                                  <Icon name="close" size={18} />
                                </button>
                              </>
                            )}
                            {pelanggan.status === 'aktif' && (
                              <button
                                type="button"
                                onClick={() => handleAction('deactivate', pelanggan)}
                                className="px-3 py-1.5 rounded-xl bg-[#282C30] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#33373B] text-xs font-semibold transition-all"
                              >
                                Nonaktifkan
                              </button>
                            )}
                            {pelanggan.status === 'nonaktif' && (
                              <button
                                type="button"
                                onClick={() => handleAction('activate', pelanggan)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold transition-all"
                              >
                                Aktifkan
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAction('delete', pelanggan)}
                              className="p-2 text-[#8E9196] hover:text-red-400 hover:bg-red-500/15 rounded-xl transition-all"
                              title="Hapus Permanen"
                            >
                              <Icon name="delete" size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE VIEW: Interactive Finger-friendly M3 Cards with Bulk Select */}
          <div className="md:hidden space-y-3">
            {/* Select All on mobile */}
            <div className="flex items-center justify-between px-2 py-1">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-[#8E9196] cursor-pointer">
                <RoundCheckbox
                  checked={isAllPaginatedSelected}
                  onChange={handleSelectAll}
                  title="Pilih Semua di Halaman"
                  ariaLabel="Pilih Semua di Halaman"
                />
                <span>Pilih Semua di Halaman ({paginatedList.length})</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="text-xs text-[#FFB59E] font-bold">
                  {selectedIds.length} dipilih
                </span>
              )}
            </div>

            {paginatedList.map((pelanggan) => {
              const isSelected = selectedIds.includes(pelanggan.id)

              return (
                <div
                  key={pelanggan.id}
                  className={`bg-[#191C1E] rounded-3xl p-4 border transition-all ${
                    isSelected
                      ? 'border-[#FFB59E] bg-[#241E1C]'
                      : pelanggan.status === 'pending'
                      ? 'border-amber-500/30'
                      : 'border-[#3A3E43]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <RoundCheckbox
                        checked={isSelected}
                        onChange={() => handleToggleSelect(pelanggan.id)}
                        title={`Pilih ${pelanggan.nama}`}
                        ariaLabel={`Pilih ${pelanggan.nama}`}
                      />
                      <div>
                        <h3 className="font-bold text-[#E1E3E5] text-base">{pelanggan.nama}</h3>
                        <a
                          href={`https://wa.me/${pelanggan.whatsapp.replace(/[-+\s]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#FFB59E] flex items-center gap-1 mt-0.5"
                        >
                          <Icon name="call" size={13} />
                          {pelanggan.whatsapp}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Status Progress Bar on mobile */}
                  <div className="mb-3 p-2.5 rounded-2xl bg-[#202326]/60 border border-[#3A3E43]/60">
                    <CustomerStatusProgressBar status={pelanggan.status} size="sm" />
                  </div>

                  <div className="mb-3 space-y-1 text-xs text-[#8E9196]">
                    <p className="flex items-start gap-1.5">
                      <Icon name="location_on" size={15} className="text-[#8E9196] flex-shrink-0 mt-0.5" />
                      <span className="text-[#E1E3E5]">{pelanggan.alamat}</span>
                    </p>
                    {pelanggan.catatan && (
                      <p className="flex items-center gap-1.5 italic text-amber-200/80">
                        <Icon name="info" size={13} />
                        {pelanggan.catatan}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div>{renderJadwalBadge(pelanggan.jadwal)}</div>
                      <span className="text-[11px] opacity-70">
                        Mulai: {pelanggan.mulaiTanggal}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="pt-2 border-t border-[#3A3E43] flex items-center justify-end gap-2">
                    {pelanggan.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction('approve', pelanggan)}
                          className="touch-target px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                        >
                          <Icon name="check" size={16} />
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction('reject', pelanggan)}
                          className="touch-target px-4 py-2 bg-red-500/20 text-red-400 rounded-2xl text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                        >
                          <Icon name="close" size={16} />
                          Tolak
                        </button>
                      </>
                    )}

                    {pelanggan.status === 'aktif' && (
                      <button
                        type="button"
                        onClick={() => handleAction('deactivate', pelanggan)}
                        className="touch-target px-4 py-2 bg-[#282C30] text-[#8E9196] hover:text-[#E1E3E5] rounded-2xl text-xs font-semibold transition-all"
                      >
                        Nonaktifkan
                      </button>
                    )}

                    {pelanggan.status === 'nonaktif' && (
                      <button
                        type="button"
                        onClick={() => handleAction('activate', pelanggan)}
                        className="touch-target px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold hover:bg-emerald-500/30 transition-all"
                      >
                        Aktifkan
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAction('delete', pelanggan)}
                      className="touch-target p-2 text-[#8E9196] hover:text-red-400 rounded-2xl hover:bg-red-500/10 transition-all ml-auto"
                      title="Hapus"
                    >
                      <Icon name="delete" size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredList.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50]}
            darkTheme={true}
          />
        </>
      )}

      {/* Confirm Action Dialog (Single) */}
      <ConfirmDialog
        open={confirmState.open}
        title={
          confirmState.action === 'delete'
            ? 'Hapus Pelanggan'
            : confirmState.action === 'approve'
            ? 'Setujui Pelanggan Baru'
            : confirmState.action === 'reject'
            ? 'Tolak Pendaftaran'
            : 'Konfirmasi Perubahan'
        }
        message={getActionMessage()}
        confirmLabel={
          confirmState.action === 'delete'
            ? 'Hapus'
            : confirmState.action === 'approve'
            ? 'Setujui'
            : confirmState.action === 'reject'
            ? 'Tolak'
            : 'Konfirmasi'
        }
        variant={
          confirmState.action === 'delete' || confirmState.action === 'reject'
            ? 'danger'
            : confirmState.action === 'approve' || confirmState.action === 'activate'
            ? 'success'
            : 'default'
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmState({ ...confirmState, open: false })}
      />

      {/* Confirm Action Dialog (Bulk) */}
      <ConfirmDialog
        open={bulkConfirmState.open}
        title={
          bulkConfirmState.action === 'delete'
            ? `Hapus ${selectedIds.length} Pelanggan Sekaligus`
            : bulkConfirmState.action === 'approve'
            ? `Setujui & Aktifkan ${selectedIds.length} Pelanggan`
            : `Nonaktifkan ${selectedIds.length} Pelanggan`
        }
        message={getBulkActionMessage()}
        confirmLabel={
          bulkConfirmState.action === 'delete'
            ? 'Ya, Hapus Semua'
            : bulkConfirmState.action === 'approve'
            ? 'Ya, Setujui Semua'
            : 'Ya, Nonaktifkan Semua'
        }
        variant={bulkConfirmState.action === 'delete' ? 'danger' : 'success'}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkConfirmState({ ...bulkConfirmState, open: false })}
      />
    </div>
  )
}

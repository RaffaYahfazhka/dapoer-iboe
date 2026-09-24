'use client'

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react'
import {
  getPelangganList,
  addPelanggan,
  updatePelanggan,
  updatePelangganStatus,
  deletePelanggan,
  bulkUpdatePelangganStatus,
  bulkDeletePelanggan,
  seedDummyPelanggan,
} from '@/lib/store'
import { Pelanggan, JadwalType, PelangganStatus } from '@/lib/types'
import ConfirmDialog from '@/components/ConfirmDialog'
import CustomerStatusProgressBar from '@/components/CustomerStatusProgressBar'
import Icon from '@/components/m3/Icon'
import SearchBar from '@/components/m3/SearchBar'
import FilterChips, { FilterOption } from '@/components/m3/FilterChips'
import Pagination from '@/components/m3/Pagination'
import RoundCheckbox from '@/components/m3/RoundCheckbox'

const emptySubscribe = () => () => {}

type ShiftKey = 'pagi' | 'siang' | 'malam'

function shiftsToJadwal(shifts: ShiftKey[]): JadwalType {
  const sorted = [...shifts].sort((a, b) => {
    const order: Record<string, number> = { pagi: 0, siang: 1, malam: 2 }
    return order[a] - order[b]
  })
  if (sorted.length === 3) return 'semua'
  if (sorted.length === 2) {
    return 'keduanya'
  }
  if (sorted.length === 1) return sorted[0] as JadwalType
  return 'siang'
}

function jadwalToShifts(jadwal: JadwalType, catatan?: string): ShiftKey[] {
  if (jadwal === 'semua') return ['pagi', 'siang', 'malam']
  if (jadwal === 'keduanya') {
    const cat = (catatan || '').toLowerCase()
    if (cat.includes('pagi') && cat.includes('siang')) return ['pagi', 'siang']
    if (cat.includes('pagi') && cat.includes('malam')) return ['pagi', 'malam']
    return ['siang', 'malam']
  }
  if (jadwal === 'pagi') return ['pagi']
  if (jadwal === 'malam') return ['malam']
  return ['siang']
}

function extractSubscriptionInfo(pelanggan: Pelanggan) {
  const text = pelanggan.catatan || ''
  const paketMatch = text.match(/Paket:\s*([^|\]]+)/i)
  const durasiMatch = text.match(/Durasi:\s*([^|\]]+)/i)

  const paket = pelanggan.paket || (paketMatch ? paketMatch[1].trim() : null)
  const durasi = pelanggan.durasi || (durasiMatch ? durasiMatch[1].trim() : null)
  const cleanCatatan = text.replace(/\[Paket:[^\]]+\]\s*/i, '').trim()

  return { paket, durasi, cleanCatatan }
}

const CATERING_PACKAGES = [
  { key: 'Paket 1 (3x Makan)', label: 'Paket 1 (3x Makan)', sub: 'Pagi + Siang + Malam' },
  { key: 'Paket 2 (2x Makan)', label: 'Paket 2 (2x Makan)', sub: '⭐ Siang & Malam' },
  { key: 'Paket 3 (1x Makan)', label: 'Paket 3 (1x Makan)', sub: 'Hemat 1x Makan' },
  { key: 'Healthy Food', label: 'Healthy Food', sub: 'Diet Sehat & Nutrisi' },
  { key: 'Sambal Saja Tanpa Nasi', label: 'Sambal Saja', sub: 'Lauk & Sambal' },
  { key: 'Alacarte / Lainnya', label: 'Alacarte', sub: 'Menu Kustom' },
]

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

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

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

  // ========================
  // MODAL STATES
  // ========================

  // 1. Add Subscription Modal State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    nama: '',
    whatsapp: '',
    alamat: '',
    paket: 'Paket 2 (2x Makan)',
    durasi: 'Mingguan (6 Hari)',
    selectedShifts: ['siang', 'malam'] as ShiftKey[],
    mulaiTanggal: new Date().toISOString().split('T')[0],
    catatan: '',
    status: 'aktif' as PelangganStatus,
  })

  // 2. Edit Customer Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(null)
  const [editForm, setEditForm] = useState({
    nama: '',
    whatsapp: '',
    alamat: '',
    paket: 'Paket 2 (2x Makan)',
    durasi: 'Mingguan (6 Hari)',
    selectedShifts: ['siang', 'malam'] as ShiftKey[],
    mulaiTanggal: '',
    catatan: '',
    status: 'aktif' as PelangganStatus,
  })

  // 3. Detail Customer Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailPelanggan, setDetailPelanggan] = useState<Pelanggan | null>(null)

  // ========================
  // DATA LOAD & AUTO-SYNC
  // ========================

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
    return () => {
      cancelled = true
    }
  }, [isClient, loadData])

  const refreshData = useCallback(async () => {
    const list = await loadData()
    setPelangganList(list)
    setSelectedIds([])
  }, [loadData])

  // Real-time Event Listener (Auto-updates when SubscriptionForm or Admin changes data)
  useEffect(() => {
    if (!isClient) return
    const handleUpdate = () => {
      loadData().then((list) => setPelangganList(list))
    }
    window.addEventListener('dapoer_iboe_pelanggan_updated', handleUpdate)
    return () => {
      window.removeEventListener('dapoer_iboe_pelanggan_updated', handleUpdate)
    }
  }, [isClient, loadData])

  const handleResetDummy = async () => {
    await seedDummyPelanggan()
    await refreshData()
    showToast('Database berhasil direset dan diisi data dummy default')
  }

  // ========================
  // MODAL HANDLERS
  // ========================

  // Shift toggling for Add Form
  const toggleAddShift = (shift: ShiftKey) => {
    setAddForm((prev) => {
      let next: ShiftKey[]
      if (prev.selectedShifts.includes(shift)) {
        if (prev.selectedShifts.length <= 1) return prev
        next = prev.selectedShifts.filter((s) => s !== shift)
      } else {
        next = [...prev.selectedShifts, shift]
      }
      return { ...prev, selectedShifts: next }
    })
  }

  const handleOpenAddModal = () => {
    setAddForm({
      nama: '',
      whatsapp: '',
      alamat: '',
      paket: 'Paket 2 (2x Makan)',
      durasi: 'Mingguan (6 Hari)',
      selectedShifts: ['siang', 'malam'],
      mulaiTanggal: new Date().toISOString().split('T')[0],
      catatan: '',
      status: 'aktif',
    })
    setAddModalOpen(true)
  }

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.nama.trim() || !addForm.whatsapp.trim() || !addForm.alamat.trim()) {
      alert('Mohon isi nama, nomor WhatsApp, dan alamat pelanggan.')
      return
    }

    setIsSubmittingAdd(true)
    try {
      const jadwal = shiftsToJadwal(addForm.selectedShifts)
      const shiftNames = addForm.selectedShifts
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' & ')
      const shiftInfo = `[Paket: ${addForm.paket} | Durasi: ${addForm.durasi} | Shift: ${shiftNames}]`
      const fullCatatan = [shiftInfo, addForm.catatan.trim()].filter(Boolean).join('\n')

      await addPelanggan({
        nama: addForm.nama.trim(),
        whatsapp: addForm.whatsapp.trim(),
        alamat: addForm.alamat.trim(),
        jadwal,
        mulaiTanggal: addForm.mulaiTanggal,
        catatan: fullCatatan,
        paket: addForm.paket,
        durasi: addForm.durasi,
        status: addForm.status,
      })

      setAddModalOpen(false)
      await refreshData()
      showToast(`Pendaftaran langganan "${addForm.nama}" berhasil ditambahkan!`)
    } catch (err) {
      console.error('Error adding pelanggan:', err)
      alert('Gagal menambahkan pelanggan. Silakan coba lagi.')
    } finally {
      setIsSubmittingAdd(false)
    }
  }

  // Edit Handlers
  const handleOpenEdit = (pelanggan: Pelanggan) => {
    const { paket, durasi, cleanCatatan } = extractSubscriptionInfo(pelanggan)
    const shifts = jadwalToShifts(pelanggan.jadwal, pelanggan.catatan)

    setEditingPelanggan(pelanggan)
    setEditForm({
      nama: pelanggan.nama,
      whatsapp: pelanggan.whatsapp,
      alamat: pelanggan.alamat,
      paket: paket || 'Paket 2 (2x Makan)',
      durasi: durasi || 'Mingguan (6 Hari)',
      selectedShifts: shifts,
      mulaiTanggal: pelanggan.mulaiTanggal,
      catatan: cleanCatatan,
      status: pelanggan.status,
    })
    setEditModalOpen(true)
  }

  const toggleEditShift = (shift: ShiftKey) => {
    setEditForm((prev) => {
      let next: ShiftKey[]
      if (prev.selectedShifts.includes(shift)) {
        if (prev.selectedShifts.length <= 1) return prev
        next = prev.selectedShifts.filter((s) => s !== shift)
      } else {
        next = [...prev.selectedShifts, shift]
      }
      return { ...prev, selectedShifts: next }
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPelanggan) return

    setIsSubmittingEdit(true)
    try {
      const jadwal = shiftsToJadwal(editForm.selectedShifts)
      const shiftNames = editForm.selectedShifts
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' & ')
      const shiftInfo = `[Paket: ${editForm.paket} | Durasi: ${editForm.durasi} | Shift: ${shiftNames}]`
      const fullCatatan = [shiftInfo, editForm.catatan.trim()].filter(Boolean).join('\n')

      await updatePelanggan(editingPelanggan.id, {
        nama: editForm.nama.trim(),
        whatsapp: editForm.whatsapp.trim(),
        alamat: editForm.alamat.trim(),
        jadwal,
        mulaiTanggal: editForm.mulaiTanggal,
        catatan: fullCatatan,
        status: editForm.status,
        paket: editForm.paket,
        durasi: editForm.durasi,
      })

      setEditModalOpen(false)
      setEditingPelanggan(null)
      await refreshData()
      showToast(`Data pelanggan "${editForm.nama}" berhasil diperbarui!`)
    } catch (err) {
      console.error('Error updating pelanggan:', err)
      alert('Gagal memperbarui data pelanggan.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Detail Modal Handler
  const handleOpenDetail = (pelanggan: Pelanggan) => {
    setDetailPelanggan(pelanggan)
    setDetailModalOpen(true)
  }

  // Filter options for Status
  const statusFilterOptions: FilterOption[] = useMemo(() => {
    return [
      { key: 'all', label: 'Semua Status', icon: 'filter_list', count: pelangganList.length },
      {
        key: 'pending',
        label: 'Pending',
        icon: 'hourglass_top',
        count: pelangganList.filter((p) => p.status === 'pending').length,
      },
      {
        key: 'aktif',
        label: 'Aktif',
        icon: 'check_circle',
        count: pelangganList.filter((p) => p.status === 'aktif').length,
      },
      {
        key: 'nonaktif',
        label: 'Nonaktif',
        icon: 'cancel',
        count: pelangganList.filter((p) => p.status === 'nonaktif').length,
      },
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
      const pageIds = new Set(paginatedList.map((p) => p.id))
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)))
    } else {
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
    const { action, pelangganId, pelangganNama } = confirmState
    switch (action) {
      case 'approve':
      case 'activate':
        await updatePelangganStatus(pelangganId, 'aktif')
        showToast(`Pelanggan "${pelangganNama}" berhasil diaktifkan`)
        break
      case 'reject':
      case 'deactivate':
        await updatePelangganStatus(pelangganId, 'nonaktif')
        showToast(`Pelanggan "${pelangganNama}" dinonaktifkan`)
        break
      case 'delete':
        await deletePelanggan(pelangganId)
        showToast(`Pelanggan "${pelangganNama}" telah dihapus`)
        break
    }
    setConfirmState({ ...confirmState, open: false })
    if (detailModalOpen && detailPelanggan?.id === pelangganId) {
      setDetailModalOpen(false)
    }
    await refreshData()
  }

  const confirmBulkAction = async () => {
    const { action } = bulkConfirmState
    const count = selectedIds.length
    if (action === 'approve') {
      await bulkUpdatePelangganStatus(selectedIds, 'aktif')
      showToast(`${count} pelanggan berhasil disetujui & diaktifkan`)
    } else if (action === 'deactivate') {
      await bulkUpdatePelangganStatus(selectedIds, 'nonaktif')
      showToast(`${count} pelanggan telah dinonaktifkan`)
    } else if (action === 'delete') {
      await bulkDeletePelanggan(selectedIds)
      showToast(`${count} pelanggan telah dihapus`)
    }
    setBulkConfirmState({ ...bulkConfirmState, open: false })
    setSelectedIds([])
    await refreshData()
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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#282C30] border-2 border-[#FFB59E] text-[#E1E3E5] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in-up">
          <Icon name="check_circle" size={18} className="text-[#FFB59E]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E1E3E5] tracking-tight">
            Data Pelanggan &amp; Langganan
          </h1>
          <p className="text-[#8E9196] text-xs sm:text-sm mt-1">
            Kelola pendaftaran langganan catering harian, jadwal shift gabungan, dan status verifikasi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Main Action: Register New Subscription */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FFB59E] to-[#E2886E] hover:from-[#FFC5B2] hover:to-[#EB9980] text-[#441908] rounded-2xl text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Icon name="person_add" size={18} />
            <span>+ Daftarkan Langganan Baru</span>
          </button>

          {/* Reset Dummy Seed Button */}
          <button
            type="button"
            onClick={handleResetDummy}
            className="px-3.5 py-2.5 bg-[#191C1E] hover:bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs font-bold text-[#8E9196] hover:text-[#E1E3E5] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Reset dan isi ulang data dummy bawaan"
          >
            <Icon name="cloud_sync" size={16} />
            <span className="hidden sm:inline">Reset Seed Data</span>
          </button>
        </div>
      </div>

      {/* Pending Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-[#292212] border border-amber-500/40 rounded-3xl p-4 sm:p-5 flex items-center gap-3.5 animate-fade-in-up">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl flex-shrink-0">
            <Icon name="notifications_active" size={22} />
          </div>
          <div className="flex-1">
            <p className="text-amber-200 font-bold text-sm">
              {pendingCount} pendaftaran langganan baru menunggu persetujuan (approval)
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
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/30 text-amber-200 text-xs font-bold hover:bg-amber-500/40 transition-colors hidden sm:inline-block cursor-pointer"
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
              className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
            >
              <Icon name="check_circle" size={15} />
              <span>Setujui</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkConfirmState({ open: true, action: 'deactivate' })}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#191C1E] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
            >
              <Icon name="pause_circle" size={15} />
              <span>Nonaktifkan</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkConfirmState({ open: true, action: 'delete' })}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
            >
              <Icon name="delete" size={15} />
              <span>Hapus</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 sm:p-2 rounded-xl text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#191C1E] transition-all ml-0.5 cursor-pointer"
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
              : 'Pelanggan yang mendaftar dari formulir website atau didaftarkan admin akan muncul di sini'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FFB59E] to-[#E2886E] text-[#441908] text-xs font-bold hover:shadow-md transition-all cursor-pointer"
            >
              + Daftarkan Langganan Sekarang
            </button>
            {(search || statusFilter !== 'all' || jadwalFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setJadwalFilter('all')
                  setCurrentPage(1)
                }}
                className="px-4 py-2 rounded-full bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: M3 Data Table */}
          <div className="hidden md:block bg-[#191C1E] rounded-3xl border border-[#3A3E43] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#3A3E43] bg-[#202326]/80 text-[#8E9196] text-xs font-semibold uppercase tracking-wider">
                    {/* Checkbox Header */}
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
                        <span>Pelanggan &amp; Paket</span>
                        <Icon
                          name={sortField === 'nama' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                          size={15}
                        />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Alamat &amp; Catatan</th>
                    <th className="py-3.5 px-4">Shift Antar</th>
                    <th
                      className="py-3.5 px-4 min-w-[150px] cursor-pointer hover:text-[#E1E3E5] select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
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
                        <span>Mulai Antar</span>
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
                    const { paket, durasi, cleanCatatan } = extractSubscriptionInfo(pelanggan)

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

                        {/* Nama & Paket */}
                        <td className="py-4 px-4">
                          <div className="flex items-baseline gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(pelanggan)}
                              className="font-bold text-[#E1E3E5] hover:text-[#FFB59E] transition-colors text-left cursor-pointer"
                            >
                              {pelanggan.nama}
                            </button>
                            {paket && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#70260D]/60 text-[#FFB59E] border border-[#FFB59E]/30 whitespace-nowrap">
                                {paket.split('(')[0].trim()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`https://wa.me/${pelanggan.whatsapp.replace(/[-+\s]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#8E9196] hover:text-[#25D366] flex items-center gap-1 transition-colors"
                              title="Chat WhatsApp Pelanggan"
                            >
                              <Icon name="call" size={13} />
                              {pelanggan.whatsapp}
                            </a>
                            {durasi && (
                              <span className="text-[10px] text-[#8E9196]">
                                • {durasi.split('(')[0].trim()}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Alamat & Catatan */}
                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-xs text-[#E1E3E5] line-clamp-2">{pelanggan.alamat}</p>
                          {cleanCatatan && (
                            <p className="text-[11px] text-[#8E9196] italic mt-0.5 flex items-center gap-1 line-clamp-1">
                              <Icon name="info" size={12} className="text-[#FFB59E] flex-shrink-0" />
                              <span>{cleanCatatan}</span>
                            </p>
                          )}
                        </td>

                        {/* Jadwal Shift */}
                        <td className="py-4 px-4">
                          {renderJadwalBadge(pelanggan.jadwal)}
                        </td>

                        {/* Status Progress */}
                        <td className="py-4 px-4">
                          <CustomerStatusProgressBar status={pelanggan.status} size="sm" />
                        </td>

                        {/* Tanggal Mulai */}
                        <td className="py-4 px-4 text-xs text-[#8E9196]">
                          <div className="font-semibold text-[#E1E3E5]">{pelanggan.mulaiTanggal}</div>
                          <div className="text-[10px] opacity-70">
                            Daftar: {new Date(pelanggan.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Detail */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(pelanggan)}
                              className="p-1.5 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] transition-all cursor-pointer"
                              title="Lihat Detail Profil"
                            >
                              <Icon name="visibility" size={16} />
                            </button>

                            {/* Edit Customer */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(pelanggan)}
                              className="p-1.5 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#FFB59E] hover:bg-[#282C30] transition-all cursor-pointer"
                              title="Edit Data Pelanggan"
                            >
                              <Icon name="edit" size={16} />
                            </button>

                            {/* Status Actions */}
                            {pelanggan.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction('approve', pelanggan)}
                                  className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                                  title="Setujui Pelanggan"
                                >
                                  <Icon name="check" size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction('reject', pelanggan)}
                                  className="p-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all cursor-pointer"
                                  title="Tolak Pelanggan"
                                >
                                  <Icon name="close" size={16} />
                                </button>
                              </>
                            )}

                            {pelanggan.status === 'aktif' && (
                              <button
                                type="button"
                                onClick={() => handleAction('deactivate', pelanggan)}
                                className="px-2.5 py-1 rounded-xl bg-[#282C30] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#33373B] text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                Nonaktifkan
                              </button>
                            )}

                            {pelanggan.status === 'nonaktif' && (
                              <button
                                type="button"
                                onClick={() => handleAction('activate', pelanggan)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                Aktifkan
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleAction('delete', pelanggan)}
                              className="p-1.5 text-[#8E9196] hover:text-red-400 hover:bg-red-500/15 rounded-xl transition-all cursor-pointer"
                              title="Hapus Permanen"
                            >
                              <Icon name="delete" size={16} />
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

          {/* MOBILE VIEW: Cards */}
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
              const { paket, durasi, cleanCatatan } = extractSubscriptionInfo(pelanggan)

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
                    <div className="flex items-start gap-3">
                      <RoundCheckbox
                        checked={isSelected}
                        onChange={() => handleToggleSelect(pelanggan.id)}
                        title={`Pilih ${pelanggan.nama}`}
                        ariaLabel={`Pilih ${pelanggan.nama}`}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(pelanggan)}
                            className="font-bold text-[#E1E3E5] text-base hover:text-[#FFB59E] text-left cursor-pointer"
                          >
                            {pelanggan.nama}
                          </button>
                          {paket && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#70260D]/60 text-[#FFB59E] border border-[#FFB59E]/30">
                              {paket.split('(')[0].trim()}
                            </span>
                          )}
                        </div>

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

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(pelanggan)}
                        className="p-1.5 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] transition-all cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Icon name="visibility" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pelanggan)}
                        className="p-1.5 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#FFB59E] transition-all cursor-pointer"
                        title="Edit Data"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Status Progress Bar on mobile */}
                  <div className="mb-3 p-2.5 rounded-2xl bg-[#202326]/60 border border-[#3A3E43]/60">
                    <CustomerStatusProgressBar status={pelanggan.status} size="sm" />
                  </div>

                  <div className="mb-3 space-y-1.5 text-xs text-[#8E9196]">
                    <p className="flex items-start gap-1.5">
                      <Icon name="location_on" size={15} className="text-[#8E9196] flex-shrink-0 mt-0.5" />
                      <span className="text-[#E1E3E5]">{pelanggan.alamat}</span>
                    </p>
                    {cleanCatatan && (
                      <p className="flex items-center gap-1.5 italic text-amber-200/80">
                        <Icon name="info" size={13} className="flex-shrink-0" />
                        <span>{cleanCatatan}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div>{renderJadwalBadge(pelanggan.jadwal)}</div>
                      <span className="text-[11px] opacity-70">
                        Mulai: {pelanggan.mulaiTanggal} {durasi ? `(${durasi.split('(')[0].trim()})` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="pt-2 border-t border-[#3A3E43] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {pelanggan.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAction('approve', pelanggan)}
                            className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Icon name="check" size={15} />
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction('reject', pelanggan)}
                            className="px-3.5 py-1.5 bg-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Icon name="close" size={15} />
                            Tolak
                          </button>
                        </>
                      )}

                      {pelanggan.status === 'aktif' && (
                        <button
                          type="button"
                          onClick={() => handleAction('deactivate', pelanggan)}
                          className="px-3 py-1.5 bg-[#282C30] text-[#8E9196] hover:text-[#E1E3E5] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          Nonaktifkan
                        </button>
                      )}

                      {pelanggan.status === 'nonaktif' && (
                        <button
                          type="button"
                          onClick={() => handleAction('activate', pelanggan)}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
                        >
                          Aktifkan
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAction('delete', pelanggan)}
                      className="p-2 text-[#8E9196] hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Hapus"
                    >
                      <Icon name="delete" size={16} />
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

      {/* ======================================================== */}
      {/* MODAL 1: DAFTARKAN LANGGANAN BARU (TAMBAH PELANGGAN)      */}
      {/* ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#191C1E] border border-[#3A3E43] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3A3E43]">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#E1E3E5] flex items-center gap-2">
                  <Icon name="person_add" size={22} className="text-[#FFB59E]" />
                  <span>Daftarkan Langganan Baru</span>
                </h2>
                <p className="text-[#8E9196] text-xs mt-0.5">
                  Input pesanan catering harian pelanggan langsung ke database
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-2 rounded-xl text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all cursor-pointer"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              {/* Pilihan Paket */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FFB59E] mb-1.5">
                  Paket Catering *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATERING_PACKAGES.map((pkt) => (
                    <button
                      key={pkt.key}
                      type="button"
                      onClick={() => setAddForm({ ...addForm, paket: pkt.key })}
                      className={`p-2.5 rounded-2xl text-left border text-xs font-bold transition-all cursor-pointer flex flex-col justify-between ${
                        addForm.paket === pkt.key
                          ? 'bg-[#70260D] border-[#FFB59E] text-[#FFB59E] shadow-sm'
                          : 'bg-[#202326] border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5] hover:border-[#FFB59E]/40'
                      }`}
                    >
                      <span>{pkt.label}</span>
                      <span className="text-[10px] opacity-75 font-normal mt-0.5">{pkt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilihan Durasi & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#FFB59E] mb-1.5">
                    Durasi Langganan *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'Mingguan (6 Hari)', label: 'Mingguan' },
                      { key: 'Bulanan (30 Hari)', label: 'Bulanan' },
                    ].map((dur) => (
                      <button
                        key={dur.key}
                        type="button"
                        onClick={() => setAddForm({ ...addForm, durasi: dur.key })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          addForm.durasi === dur.key
                            ? 'bg-[#FFB59E] text-[#441908] border-[#FFB59E]'
                            : 'bg-[#202326] border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5]'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#FFB59E] mb-1.5">
                    Status Awal *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'aktif' as PelangganStatus, label: 'Langsung Aktif', icon: 'check_circle', color: 'text-emerald-400' },
                      { key: 'pending' as PelangganStatus, label: 'Pending Verif', icon: 'hourglass_top', color: 'text-amber-400' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setAddForm({ ...addForm, status: st.key })}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          addForm.status === st.key
                            ? 'bg-[#282C30] border-[#FFB59E] text-[#E1E3E5] shadow-sm'
                            : 'bg-[#202326] border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5]'
                        }`}
                      >
                        <Icon name={st.icon} size={15} className={st.color} />
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-Select Shift Pengantaran */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FFB59E] mb-1.5">
                  Shift Pengantaran (Bisa Multi-Select) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'pagi' as ShiftKey, label: 'Pagi', icon: 'wb_twilight' },
                    { key: 'siang' as ShiftKey, label: 'Siang', icon: 'wb_sunny' },
                    { key: 'malam' as ShiftKey, label: 'Malam', icon: 'bedtime' },
                  ]).map((s) => {
                    const isSelected = addForm.selectedShifts.includes(s.key)
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => toggleAddShift(s.key)}
                        className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#70260D] border-[#FFB59E] text-[#FFB59E]'
                            : 'bg-[#202326] border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5]'
                        }`}
                      >
                        <Icon name={s.icon} size={16} />
                        <span>{s.label}</span>
                        {isSelected && <Icon name="check" size={14} className="ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Nama & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.nama}
                    onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                    placeholder="Contoh: Ibu Fatimah"
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all placeholder:text-[#8E9196]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addForm.whatsapp}
                    onChange={(e) => setAddForm({ ...addForm, whatsapp: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all placeholder:text-[#8E9196]/50"
                  />
                </div>
              </div>

              {/* Alamat Pengiriman */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addForm.alamat}
                  onChange={(e) => setAddForm({ ...addForm, alamat: e.target.value })}
                  placeholder="Jl. Merdeka No. 10, RT 02/05, pagar hitam..."
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all resize-none placeholder:text-[#8E9196]/50"
                />
              </div>

              {/* Mulai Tanggal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                  Mulai Pengantaran Tanggal *
                </label>
                <input
                  type="date"
                  required
                  value={addForm.mulaiTanggal}
                  onChange={(e) => setAddForm({ ...addForm, mulaiTanggal: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all [color-scheme:dark]"
                />
              </div>

              {/* Catatan Alergi / Khusus */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                  Catatan Khusus (Alergi / Permintaan Menu)
                </label>
                <input
                  type="text"
                  value={addForm.catatan}
                  onChange={(e) => setAddForm({ ...addForm, catatan: e.target.value })}
                  placeholder="Contoh: Tidak pakai santan, pedas sedang"
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all placeholder:text-[#8E9196]/50"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#3A3E43] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FFB59E] to-[#E2886E] hover:from-[#FFC5B2] hover:to-[#EB9980] text-[#441908] rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#441908]/40 border-t-[#441908] rounded-full animate-spin" />
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Icon name="check" size={17} />
                      Simpan &amp; Daftarkan Pelanggan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT DATA PELANGGAN                             */}
      {/* ======================================================== */}
      {editModalOpen && editingPelanggan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#191C1E] border border-[#3A3E43] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3A3E43]">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#E1E3E5] flex items-center gap-2">
                  <Icon name="edit" size={22} className="text-[#FFB59E]" />
                  <span>Edit Data Pelanggan</span>
                </h2>
                <p className="text-[#8E9196] text-xs mt-0.5">
                  Perbarui informasi profil, alamat, paket, atau jadwal pengantaran
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-xl text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all cursor-pointer"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Nama & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.nama}
                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all"
                  />
                </div>
              </div>

              {/* Paket & Durasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Paket Catering
                  </label>
                  <select
                    value={editForm.paket}
                    onChange={(e) => setEditForm({ ...editForm, paket: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all [color-scheme:dark]"
                  >
                    {CATERING_PACKAGES.map((pkt) => (
                      <option key={pkt.key} value={pkt.key}>
                        {pkt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Durasi
                  </label>
                  <select
                    value={editForm.durasi}
                    onChange={(e) => setEditForm({ ...editForm, durasi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all [color-scheme:dark]"
                  >
                    <option value="Mingguan (6 Hari)">Mingguan (6 Hari)</option>
                    <option value="Bulanan (30 Hari)">Bulanan (30 Hari)</option>
                  </select>
                </div>
              </div>

              {/* Shift Pengantaran */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1.5">
                  Shift Pengantaran (Multi-Select)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'pagi' as ShiftKey, label: 'Pagi', icon: 'wb_twilight' },
                    { key: 'siang' as ShiftKey, label: 'Siang', icon: 'wb_sunny' },
                    { key: 'malam' as ShiftKey, label: 'Malam', icon: 'bedtime' },
                  ]).map((s) => {
                    const isSelected = editForm.selectedShifts.includes(s.key)
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => toggleEditShift(s.key)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#70260D] border-[#FFB59E] text-[#FFB59E]'
                            : 'bg-[#202326] border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5]'
                        }`}
                      >
                        <Icon name={s.icon} size={15} />
                        <span>{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                  Alamat Pengiriman *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all resize-none"
                />
              </div>

              {/* Mulai Tanggal & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Mulai Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.mulaiTanggal}
                    onChange={(e) => setEditForm({ ...editForm, mulaiTanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                    Status Pelanggan
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as PelangganStatus })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all [color-scheme:dark]"
                  >
                    <option value="pending">Pending (Menunggu Approval)</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Catatan Alergi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E9196] mb-1">
                  Catatan Alergi / Pantangan
                </label>
                <input
                  type="text"
                  value={editForm.catatan}
                  onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-2xl text-xs sm:text-sm text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E] transition-all"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#3A3E43] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FFB59E] to-[#E2886E] hover:from-[#FFC5B2] hover:to-[#EB9980] text-[#441908] rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#441908]/40 border-t-[#441908] rounded-full animate-spin" />
                      Memperbarui...
                    </span>
                  ) : (
                    <>
                      <Icon name="check" size={17} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DETAIL LENGKAP PELANGGAN & LANGGANAN            */}
      {/* ======================================================== */}
      {detailModalOpen && detailPelanggan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#191C1E] border border-[#3A3E43] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#3A3E43]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#70260D] text-[#FFB59E] font-black text-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  {detailPelanggan.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#E1E3E5]">
                    {detailPelanggan.nama}
                  </h2>
                  <p className="text-xs text-[#8E9196]">
                    ID: <span className="font-mono">{detailPelanggan.id.substring(0, 13)}...</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="p-2 rounded-xl text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all cursor-pointer"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Status Section */}
            <div className="p-3.5 rounded-2xl bg-[#202326] border border-[#3A3E43]">
              <div className="text-[11px] font-bold text-[#8E9196] uppercase tracking-wider mb-2">
                Status Verifikasi &amp; Langganan
              </div>
              <CustomerStatusProgressBar status={detailPelanggan.status} size="md" />
            </div>

            {/* Subscription & Shift Specs */}
            {(() => {
              const { paket, durasi, cleanCatatan } = extractSubscriptionInfo(detailPelanggan)
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#202326] border border-[#3A3E43]">
                      <span className="text-[10px] uppercase font-bold text-[#8E9196] block mb-1">
                        Paket Catering
                      </span>
                      <span className="text-xs font-black text-[#FFB59E]">
                        {paket || 'Paket Standar'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#202326] border border-[#3A3E43]">
                      <span className="text-[10px] uppercase font-bold text-[#8E9196] block mb-1">
                        Durasi
                      </span>
                      <span className="text-xs font-bold text-[#E1E3E5]">
                        {durasi || 'Mingguan (6 Hari)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#202326] border border-[#3A3E43]">
                    <span className="text-[10px] uppercase font-bold text-[#8E9196] block mb-1.5">
                      Shift Pengantaran
                    </span>
                    <div>{renderJadwalBadge(detailPelanggan.jadwal)}</div>
                  </div>

                  {/* WhatsApp & Contact */}
                  <div className="p-3.5 rounded-2xl bg-[#202326] border border-[#3A3E43] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8E9196] block">
                        Nomor WhatsApp
                      </span>
                      <span className="text-sm font-bold text-[#E1E3E5]">
                        {detailPelanggan.whatsapp}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${detailPelanggan.whatsapp.replace(/[-+\s]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Icon name="chat" size={16} />
                      Chat WA
                    </a>
                  </div>

                  {/* Alamat Pengiriman */}
                  <div className="p-3.5 rounded-2xl bg-[#202326] border border-[#3A3E43] flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[#8E9196] flex items-center gap-1">
                      <Icon name="location_on" size={13} className="text-[#FFB59E]" />
                      Alamat Pengiriman
                    </span>
                    <p className="text-xs text-[#E1E3E5] leading-relaxed">{detailPelanggan.alamat}</p>
                  </div>

                  {/* Mulai & Daftar Tanggal */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-[#202326] border border-[#3A3E43]">
                      <span className="text-[10px] uppercase font-bold text-[#8E9196] block mb-0.5">
                        Mulai Tanggal
                      </span>
                      <span className="font-bold text-[#E1E3E5]">
                        {detailPelanggan.mulaiTanggal}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#202326] border border-[#3A3E43]">
                      <span className="text-[10px] uppercase font-bold text-[#8E9196] block mb-0.5">
                        Terdaftar Sejak
                      </span>
                      <span className="font-bold text-[#E1E3E5]">
                        {new Date(detailPelanggan.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Catatan Khusus */}
                  {cleanCatatan && (
                    <div className="p-3.5 rounded-2xl bg-[#2D221D]/50 border border-[#FFB59E]/30 text-xs">
                      <span className="text-[10px] uppercase font-extrabold text-[#FFB59E] block mb-1 flex items-center gap-1">
                        <Icon name="info" size={13} />
                        Catatan Khusus / Alergi
                      </span>
                      <p className="text-[#E1E3E5] italic">{cleanCatatan}</p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Quick Actions in Detail */}
            <div className="pt-3 border-t border-[#3A3E43] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false)
                  handleOpenEdit(detailPelanggan)
                }}
                className="px-3.5 py-2 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Icon name="edit" size={15} />
                Edit Data
              </button>

              <div className="flex items-center gap-2">
                {detailPelanggan.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleAction('approve', detailPelanggan)}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Icon name="check" size={16} />
                    Setujui Langganan
                  </button>
                )}

                {detailPelanggan.status === 'aktif' && (
                  <button
                    type="button"
                    onClick={() => handleAction('deactivate', detailPelanggan)}
                    className="px-4 py-2 bg-[#282C30] text-[#8E9196] hover:text-[#E1E3E5] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Nonaktifkan
                  </button>
                )}

                {detailPelanggan.status === 'nonaktif' && (
                  <button
                    type="button"
                    onClick={() => handleAction('activate', detailPelanggan)}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Aktifkan Kembali
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
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

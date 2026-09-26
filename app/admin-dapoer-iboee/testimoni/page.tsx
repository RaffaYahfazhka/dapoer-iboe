'use client'

import { useState, useEffect, useMemo, useSyncExternalStore, useRef } from 'react'
import Icon from '@/components/m3/Icon'
import SearchBar from '@/components/m3/SearchBar'
import FilterChips, { FilterOption } from '@/components/m3/FilterChips'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  TestimonialItem,
  getStoredTestimonials,
  saveStoredTestimonials,
  INITIAL_TESTIMONIALS,
} from '@/lib/testimonials'
import { validateImageFile, compressImageFile } from '@/lib/image-utils'

const DEFAULT_AVATAR =
  'https://www.nicepng.com/png/detail/73-730154_open-default-profile-picture-png.png'

const emptySubscribe = () => () => {}

export default function AdminTestimoniPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [items, setItems] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null)
  const [formData, setFormData] = useState<Omit<TestimonialItem, 'id'>>({
    dishName: '',
    badge: 'PAKET 2 · SIANG & MALAM',
    quote: '',
    authorName: '',
    authorRole: '',
    rating: 5,
    bgImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    avatarImage: DEFAULT_AVATAR,
    featured: true,
    date: new Date().toISOString().split('T')[0],
  })

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  })

  // Photo upload states
  const bgFileInputRef = useRef<HTMLInputElement>(null)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const [bgInputMode, setBgInputMode] = useState<'upload' | 'url'>('upload')
  const [avatarInputMode, setAvatarInputMode] = useState<'upload' | 'url'>('upload')
  const [bgError, setBgError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [isProcessingBg, setIsProcessingBg] = useState(false)
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false)

  useEffect(() => {
    if (!isClient) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (!cancelled) {
        const loaded = getStoredTestimonials()
        setItems(loaded)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isClient])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search.trim() === '' ||
        item.authorName.toLowerCase().includes(search.toLowerCase()) ||
        item.dishName.toLowerCase().includes(search.toLowerCase()) ||
        item.quote.toLowerCase().includes(search.toLowerCase()) ||
        item.badge.toLowerCase().includes(search.toLowerCase())

      const matchRating =
        ratingFilter === 'all' || item.rating.toString() === ratingFilter

      return matchSearch && matchRating
    })
  }, [items, search, ratingFilter])

  const ratingOptions: FilterOption[] = [
    { key: 'all', label: 'Semua Bintang', icon: 'star', count: items.length },
    { key: '5', label: '5 Bintang', count: items.filter((i) => i.rating === 5).length },
    { key: '4', label: '4 Bintang', count: items.filter((i) => i.rating === 4).length },
  ]

  const processBgFile = async (file: File) => {
    setBgError(null)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setBgError(validation.error || 'Format file tidak didukung!')
      if (bgFileInputRef.current) bgFileInputRef.current.value = ''
      return
    }

    try {
      setIsProcessingBg(true)
      const compressedDataUrl = await compressImageFile(file, 1200, 900, 0.85)
      setFormData((prev) => ({ ...prev, bgImage: compressedDataUrl }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file foto'
      setBgError(msg)
    } finally {
      setIsProcessingBg(false)
      if (bgFileInputRef.current) bgFileInputRef.current.value = ''
    }
  }

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processBgFile(file)
    }
  }

  const handleBgDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processBgFile(file)
    }
  }

  const processAvatarFile = async (file: File) => {
    setAvatarError(null)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setAvatarError(validation.error || 'Format file tidak didukung!')
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = ''
      return
    }

    try {
      setIsProcessingAvatar(true)
      const compressedDataUrl = await compressImageFile(file, 320, 320, 0.85)
      setFormData((prev) => ({ ...prev, avatarImage: compressedDataUrl }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file avatar'
      setAvatarError(msg)
    } finally {
      setIsProcessingAvatar(false)
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = ''
    }
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processAvatarFile(file)
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setBgError(null)
    setAvatarError(null)
    setBgInputMode('upload')
    setAvatarInputMode('upload')
    setFormData({
      dishName: '',
      badge: 'PAKET 2 · SIANG & MALAM',
      quote: '',
      authorName: '',
      authorRole: '',
      rating: 5,
      bgImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      avatarImage: DEFAULT_AVATAR,
      featured: true,
      date: new Date().toISOString().split('T')[0],
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item)
    setBgError(null)
    setAvatarError(null)
    setBgInputMode('upload')
    setAvatarInputMode('upload')
    setFormData({
      dishName: item.dishName || '',
      badge: item.badge || '',
      quote: item.quote || '',
      authorName: item.authorName || '',
      authorRole: item.authorRole || '',
      rating: item.rating || 5,
      bgImage: item.bgImage || '',
      avatarImage: item.avatarImage || DEFAULT_AVATAR,
      featured: item.featured ?? true,
      date: item.date || new Date().toISOString().split('T')[0],
    })
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dishName.trim() || !formData.authorName.trim() || !formData.quote.trim()) {
      alert('Mohon lengkapi nama hidangan, nama pelanggan, dan ulasan testimoni.')
      return
    }

    let nextItems: TestimonialItem[]
    if (editingItem) {
      nextItems = items.map((t) =>
        t.id === editingItem.id ? { ...formData, id: editingItem.id } : t
      )
    } else {
      const newItem: TestimonialItem = {
        ...formData,
        id: `testi-${Date.now()}`,
      }
      nextItems = [newItem, ...items]
    }

    setItems(nextItems)
    saveStoredTestimonials(nextItems)
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    const nextItems = items.filter((t) => t.id !== id)
    setItems(nextItems)
    saveStoredTestimonials(nextItems)
    setDeleteConfirm({ open: false, id: '', name: '' })
  }

  const handleResetToDefault = () => {
    setItems(INITIAL_TESTIMONIALS)
    saveStoredTestimonials(INITIAL_TESTIMONIALS)
  }

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFB59E]/30 border-t-[#FFB59E] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8E9196] text-sm">Memuat data ulasan pelanggan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#E1E3E5] tracking-tight">
            Manajemen Testimoni & Review
          </h1>
          <p className="text-[#8E9196] text-xs sm:text-sm mt-1">
            Kelola ulasan kepuasan pelanggan yang tampil di halaman beranda website
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-2xl border border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Kembalikan ke data awal"
          >
            <Icon name="history" size={16} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FFB59E] to-[#DE5B36] hover:from-[#DE5B36] hover:to-[#E86326] text-[#3C0A00] hover:text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Icon name="add" size={18} />
            <span>Tambah Testimoni</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#191C1E] border border-[#3A3E43] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFB59E]/15 text-[#FFB59E] flex items-center justify-center flex-shrink-0">
            <Icon name="rate_review" size={22} />
          </div>
          <div>
            <p className="text-[11px] text-[#8E9196] font-medium">Total Ulasan</p>
            <p className="text-xl font-extrabold text-[#E1E3E5]">{items.length}</p>
          </div>
        </div>

        <div className="bg-[#191C1E] border border-[#3A3E43] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Icon name="star" size={22} filled />
          </div>
          <div>
            <p className="text-[11px] text-[#8E9196] font-medium">Rating Rata-rata</p>
            <p className="text-xl font-extrabold text-[#E1E3E5]">5.0 / 5.0</p>
          </div>
        </div>

        <div className="bg-[#191C1E] border border-[#3A3E43] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Icon name="verified" size={22} />
          </div>
          <div>
            <p className="text-[11px] text-[#8E9196] font-medium">Status Tampil</p>
            <p className="text-xl font-extrabold text-emerald-400">Aktif di Web</p>
          </div>
        </div>

        <div className="bg-[#191C1E] border border-[#3A3E43] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Icon name="visibility" size={22} />
          </div>
          <div>
            <p className="text-[11px] text-[#8E9196] font-medium">Di Beranda</p>
            <p className="text-xs font-semibold text-[#8E9196] mt-0.5">Section Testimoni</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="bg-[#191C1E] border border-[#3A3E43] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari nama pelanggan, hidangan, ulasan..."
            />
          </div>

          <div className="flex items-center gap-2">
            <FilterChips
              options={ratingOptions}
              selectedKey={ratingFilter}
              onSelect={setRatingFilter}
              darkTheme={true}
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#191C1E] border border-[#3A3E43] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#FFB59E]/40 transition-all group"
          >
            <div>
              {/* Card Header: Dish info & Action Buttons */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#70260D] text-[#FFB59E] border border-[#FFB59E]/20 mb-1.5">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-[#E1E3E5] group-hover:text-[#FFB59E] transition-colors line-clamp-1">
                    {item.dishName}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl bg-[#202326] text-[#8E9196] hover:text-[#FFB59E] hover:bg-[#282C30] transition-all"
                    title="Edit Ulasan"
                  >
                    <Icon name="edit" size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        open: true,
                        id: item.id,
                        name: `${item.authorName} (${item.dishName})`,
                      })
                    }
                    className="p-2 rounded-xl bg-[#202326] text-[#8E9196] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Hapus Ulasan"
                  >
                    <Icon name="delete" size={17} />
                  </button>
                </div>
              </div>

              {/* Dish Photo Thumbnail & Quote */}
              <div className="flex gap-3.5 my-3.5">
                <div
                  className="relative group/thumb cursor-pointer flex-shrink-0"
                  onClick={() => handleOpenEdit(item)}
                  title="Klik untuk ubah foto & ulasan testimoni"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.bgImage}
                    alt={item.dishName}
                    className="w-20 h-20 rounded-2xl object-cover border border-[#3A3E43] shadow-md group-hover/thumb:border-[#FFB59E] transition-all"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#FFB59E]">
                    <Icon name="photo_camera" size={18} />
                    <span className="text-[9px] font-bold mt-0.5">Ubah</span>
                  </div>
                </div>
                <blockquote className="text-xs sm:text-sm text-[#8E9196] line-clamp-3 italic leading-relaxed">
                  {item.quote}
                </blockquote>
              </div>
            </div>

            {/* Card Footer: Author & Rating */}
            <div className="pt-4 border-t border-[#3A3E43]/60 flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.avatarImage || DEFAULT_AVATAR}
                  alt={item.authorName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-[#FFB59E]/40 flex-shrink-0 bg-white"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#E1E3E5] truncate">{item.authorName}</p>
                  <p className="text-[11px] text-[#8E9196] truncate">{item.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#202326] px-2.5 py-1 rounded-xl border border-[#3A3E43]/60 flex-shrink-0">
                <Icon name="star" size={14} filled className="text-amber-400" />
                <span className="text-xs font-bold text-[#E1E3E5]">{item.rating}.0</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-[#191C1E] border border-[#3A3E43] rounded-3xl p-8">
          <div className="w-16 h-16 rounded-full bg-[#202326] text-[#8E9196] flex items-center justify-center mx-auto mb-3">
            <Icon name="search_off" size={32} />
          </div>
          <p className="text-[#E1E3E5] font-bold text-base">Tidak ada testimoni yang cocok</p>
          <p className="text-xs text-[#8E9196] mt-1">Coba kata kunci lain atau tambahkan testimoni baru.</p>
        </div>
      )}

      {/* Modal Add / Edit Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-[#191C1E] border border-[#3A3E43] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3A3E43]/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#70260D] text-[#FFB59E]">
                  <Icon name={editingItem ? 'edit' : 'add_comment'} size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#E1E3E5]">
                    {editingItem ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
                  </h3>
                  <p className="text-[11px] text-[#8E9196]">
                    Ulasan akan langsung otomatis tersinkron ke halaman depan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326]"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              {/* Permanent hidden file inputs (rendered outside conditionals to prevent React input uncontrolled/controlled reconciliation warnings) */}
              <input
                key="permanent-hidden-file-input-bg"
                ref={bgFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleBgFileChange}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              />
              <input
                key="permanent-hidden-file-input-avatar"
                ref={avatarFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleAvatarFileChange}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              />

              <div>
                <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                  Nama Hidangan / Menu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ayam Bakar Madu & Sambal Bajak"
                  value={formData.dishName ?? ''}
                  onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                    Label / Paket Menu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PAKET 2 · SIANG & MALAM"
                    value={formData.badge ?? ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                    Rating Bintang
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                  Isi Testimoni / Ulasan
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tulis ulasan jujur dari pelanggan mengenai hidangan..."
                  value={formData.quote ?? ''}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rina Melati"
                    value={formData.authorName ?? ''}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                    Profesi / Lokasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Karyawan Swasta, SCBD Jakarta"
                    value={formData.authorRole ?? ''}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  />
                </div>
              </div>

              {/* Foto Masakan (bgImage) */}
              <div className="space-y-2 pt-2 border-t border-[#3A3E43]/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-[#E1E3E5] flex items-center gap-1.5">
                      <Icon name="image" size={16} className="text-[#FFB59E]" />
                      <span>Foto Masakan / Hidangan</span>
                    </label>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#202326] border border-[#3A3E43] text-[#8E9196]">
                      Khusus .png, .jpg, .jpeg (Bukan PDF)
                    </span>
                  </div>

                  <div className="flex items-center bg-[#202326] p-0.5 rounded-lg border border-[#3A3E43]">
                    <button
                      type="button"
                      onClick={() => setBgInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        bgInputMode === 'upload'
                          ? 'bg-[#FFB59E] text-[#3C0A00] shadow-sm'
                          : 'text-[#8E9196] hover:text-[#E1E3E5]'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgInputMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        bgInputMode === 'url'
                          ? 'bg-[#FFB59E] text-[#3C0A00] shadow-sm'
                          : 'text-[#8E9196] hover:text-[#E1E3E5]'
                      }`}
                    >
                      URL Gambar
                    </button>
                  </div>
                </div>

                {bgInputMode === 'upload' ? (
                  <div>
                    {formData.bgImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-[#3A3E43] bg-[#202326] group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.bgImage}
                          alt="Pratinjau Masakan"
                          className="w-full h-40 sm:h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                          <button
                            type="button"
                            onClick={() => bgFileInputRef.current?.click()}
                            disabled={isProcessingBg}
                            className="px-3.5 py-2 bg-[#FFB59E] text-[#3C0A00] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-[#DE5B36] hover:text-white transition-all active:scale-95"
                          >
                            <Icon name="photo_camera" size={16} />
                            <span>Ganti Foto dari Galeri</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, bgImage: '' }))}
                            className="px-3 py-2 bg-[#202326]/90 border border-red-500/40 text-red-400 rounded-xl font-semibold text-xs hover:bg-red-500/20 transition-all"
                            title="Hapus foto ini"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => bgFileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleBgDrop}
                        className="w-full border-2 border-dashed border-[#3A3E43] hover:border-[#FFB59E]/60 rounded-2xl p-6 text-center cursor-pointer bg-[#202326]/50 hover:bg-[#202326] transition-all"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#FFB59E]/10 text-[#FFB59E] flex items-center justify-center mx-auto mb-2">
                          <Icon name="add_photo_alternate" size={24} />
                        </div>
                        <p className="text-xs font-bold text-[#E1E3E5]">
                          Klik untuk upload foto dari galeri / file
                        </p>
                        <p className="text-[11px] text-[#8E9196] mt-1">
                          Hanya format <span className="text-[#FFB59E] font-semibold">PNG, JPG, atau JPEG</span> (PDF tidak didukung)
                        </p>
                      </div>
                    )}

                    {isProcessingBg && (
                      <p className="text-[11px] text-[#FFB59E] flex items-center gap-1.5 mt-1.5 animate-pulse">
                        <Icon name="sync" size={14} className="animate-spin" />
                        Mengoptimalkan resolusi foto...
                      </p>
                    )}

                    {bgError && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                        <Icon name="error" size={16} className="flex-shrink-0" />
                        <span>{bgError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      key="input-bg-image-url-field"
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.bgImage ?? ''}
                      onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                    />
                    {formData.bgImage && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-[#3A3E43] h-28 w-full bg-[#202326]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.bgImage} alt="Pratinjau Masakan" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Foto Avatar Pelanggan (avatarImage) */}
              <div className="space-y-2 pt-2 border-t border-[#3A3E43]/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-[#E1E3E5] flex items-center gap-1.5">
                      <Icon name="account_circle" size={16} className="text-[#FFB59E]" />
                      <span>Foto Avatar / Profil Pelanggan</span>
                    </label>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#202326] border border-[#3A3E43] text-[#8E9196]">
                      Khusus .png, .jpg, .jpeg
                    </span>
                  </div>

                  <div className="flex items-center bg-[#202326] p-0.5 rounded-lg border border-[#3A3E43]">
                    <button
                      type="button"
                      onClick={() => setAvatarInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        avatarInputMode === 'upload'
                          ? 'bg-[#FFB59E] text-[#3C0A00] shadow-sm'
                          : 'text-[#8E9196] hover:text-[#E1E3E5]'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarInputMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        avatarInputMode === 'url'
                          ? 'bg-[#FFB59E] text-[#3C0A00] shadow-sm'
                          : 'text-[#8E9196] hover:text-[#E1E3E5]'
                      }`}
                    >
                      URL Avatar
                    </button>
                  </div>
                </div>

                {avatarInputMode === 'upload' ? (
                  <div>
                    <div className="flex items-center gap-4 bg-[#202326] border border-[#3A3E43] p-3 rounded-2xl">
                      <div className="relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.avatarImage || DEFAULT_AVATAR}
                          alt="Avatar Pelanggan"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#FFB59E]/40 bg-white"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            disabled={isProcessingAvatar}
                            className="px-3.5 py-2 bg-[#FFB59E] text-[#3C0A00] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#DE5B36] hover:text-white transition-all active:scale-95"
                          >
                            <Icon name="photo_camera" size={15} />
                            <span>Pilih Foto Avatar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, avatarImage: DEFAULT_AVATAR }))
                              setAvatarError(null)
                            }}
                            className="px-3 py-2 rounded-xl text-xs text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] border border-[#3A3E43] transition-all font-semibold flex items-center gap-1.5 active:scale-95"
                            title="Kembalikan ke foto profil default"
                          >
                            <Icon name="history" size={15} />
                            <span>Reset Foto Profil</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[#8E9196]">
                          Pilih foto profil dari galeri (.png, .jpg, .jpeg). PDF ditolak.
                        </p>
                      </div>
                    </div>

                    {isProcessingAvatar && (
                      <p className="text-[11px] text-[#FFB59E] flex items-center gap-1.5 mt-1.5 animate-pulse">
                        <Icon name="sync" size={14} className="animate-spin" />
                        Mengompres foto avatar...
                      </p>
                    )}

                    {avatarError && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                        <Icon name="error" size={16} className="flex-shrink-0" />
                        <span>{avatarError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        key="input-avatar-url-field"
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.avatarImage ?? ''}
                        onChange={(e) => setFormData({ ...formData, avatarImage: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, avatarImage: DEFAULT_AVATAR }))
                          setAvatarError(null)
                        }}
                        className="px-3 py-2.5 bg-[#202326] border border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95"
                        title="Kembalikan ke foto profil default"
                      >
                        <Icon name="history" size={14} />
                        <span>Reset Foto Profil</span>
                      </button>
                    </div>
                    {formData.avatarImage && (
                      <div className="flex items-center gap-3 bg-[#202326] p-2.5 rounded-xl border border-[#3A3E43]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.avatarImage || DEFAULT_AVATAR}
                          alt="Pratinjau Avatar"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-[#FFB59E]/40 bg-white"
                        />
                        <span className="text-[11px] text-[#8E9196] truncate">{formData.avatarImage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A3E43]/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#3A3E43] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB59E] to-[#DE5B36] hover:from-[#DE5B36] hover:to-[#E86326] text-[#3C0A00] hover:text-white font-bold transition-all shadow-md active:scale-95"
                >
                  Simpan Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Hapus Testimoni Pelanggan"
        message={`Apakah Anda yakin ingin menghapus testimoni dari "${deleteConfirm.name}"? Tindakan ini akan menghapusnya dari daftar review beranda.`}
        confirmLabel="Hapus Testimoni"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '', name: '' })}
      />
    </div>
  )
}

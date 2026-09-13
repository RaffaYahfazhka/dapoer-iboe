'use client'

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react'
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
    avatarImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    featured: true,
    date: new Date().toISOString().split('T')[0],
  })

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  })

  useEffect(() => {
    if (!isClient) return
    const loaded = getStoredTestimonials()
    setItems(loaded)
    setLoading(false)
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

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      dishName: '',
      badge: 'PAKET 2 · SIANG & MALAM',
      quote: '',
      authorName: '',
      authorRole: '',
      rating: 5,
      bgImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      featured: true,
      date: new Date().toISOString().split('T')[0],
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item)
    setFormData({
      dishName: item.dishName,
      badge: item.badge,
      quote: item.quote,
      authorName: item.authorName,
      authorRole: item.authorRole,
      rating: item.rating,
      bgImage: item.bgImage,
      avatarImage: item.avatarImage,
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.bgImage}
                  alt={item.dishName}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-[#3A3E43] shadow-md"
                />
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
                  src={item.avatarImage}
                  alt={item.authorName}
                  className="w-9 h-9 rounded-full object-cover border border-[#FFB59E]/40 flex-shrink-0"
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
              <div>
                <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                  Nama Hidangan / Menu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ayam Bakar Madu & Sambal Bajak"
                  value={formData.dishName}
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
                    value={formData.badge}
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
                  value={formData.quote}
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
                    value={formData.authorName}
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
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                    URL Foto Masakan (Unsplash / Web)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.bgImage}
                    onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E9196] mb-1.5">
                    URL Foto Avatar Pelanggan
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.avatarImage}
                    onChange={(e) => setFormData({ ...formData, avatarImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#202326] border border-[#3A3E43] rounded-xl text-[#E1E3E5] focus:outline-none focus:border-[#FFB59E]"
                  />
                </div>
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

'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { getMenu, updateMenuItem } from '@/lib/store'
import { MenuItem } from '@/lib/types'
import Icon from '@/components/m3/Icon'

const emptySubscribe = () => () => {}

export default function MenuPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editState, setEditState] = useState<{
    hari: string
    jadwal: 'pagi' | 'siang' | 'malam'
    items: string
  } | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadData = useCallback(async () => {
    const menu = await getMenu()
    return menu?.items || []
  }, [])

  useEffect(() => {
    if (!isClient) return
    let cancelled = false
    loadData().then((items) => {
      if (!cancelled) {
        setMenuItems(items)
        setLoading(false)
      }
    })

    const handleMenuUpdate = () => {
      loadData().then((items) => {
        if (!cancelled) {
          setMenuItems(items)
        }
      })
    }
    window.addEventListener('dapoer_iboe_menu_updated', handleMenuUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('dapoer_iboe_menu_updated', handleMenuUpdate)
    }
  }, [isClient, loadData])

  const handleEdit = (item: MenuItem, jadwal: 'pagi' | 'siang' | 'malam') => {
    setEditState({
      hari: item.hari,
      jadwal,
      items: (item[jadwal] || []).join('\n'),
    })
  }

  const handleSave = async () => {
    if (!editState) return
    const menuArray = editState.items.split('\n').filter((m) => m.trim() !== '')
    await updateMenuItem(editState.hari, editState.jadwal, menuArray)
    setEditState(null)
    const items = await loadData()
    setMenuItems(items)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#FFB59E]/30 border-t-[#FFB59E] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E1E3E5] tracking-tight">
            Menu Mingguan
          </h1>
          <p className="text-[#8E9196] text-xs sm:text-sm mt-1">
            Atur dan perbarui daftar menu harian (Pagi, Siang, Malam) yang tampil di website publik
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold animate-fade-in-up flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
          <Icon name="check_circle" size={18} />
          Menu berhasil disimpan dan diperbarui!
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {menuItems.map((item) => (
          <div
            key={item.hari}
            className="bg-[#191C1E] rounded-3xl border border-[#3A3E43] overflow-hidden transition-all hover:border-[#FFB59E]/40"
          >
            {/* Day Header */}
            <div className="bg-[#202326] px-5 py-3.5 border-b border-[#3A3E43] flex items-center justify-between">
              <h3 className="font-extrabold text-[#E1E3E5] tracking-wide text-base flex items-center gap-2">
                <Icon name="calendar_today" size={18} className="text-[#FFB59E]" />
                {item.hari}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Pagi */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Icon name="wb_twilight" size={16} />
                    Shift Pagi (Sarapan)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(item, 'pagi')}
                    className="text-[#8E9196] hover:text-[#FFB59E] text-xs transition-all flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#202326]"
                  >
                    <Icon name="edit" size={14} />
                    Edit
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {(item.pagi || []).map((menu, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#8E9196] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                      {menu}
                    </li>
                  ))}
                  {(!item.pagi || item.pagi.length === 0) && (
                    <li className="text-xs text-[#8E9196]/50 italic">Belum ada menu pagi</li>
                  )}
                </ul>
              </div>

              <div className="border-t border-[#3A3E43]/60" />

              {/* Siang */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Icon name="wb_sunny" size={16} />
                    Shift Siang
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(item, 'siang')}
                    className="text-[#8E9196] hover:text-[#FFB59E] text-xs transition-all flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#202326]"
                  >
                    <Icon name="edit" size={14} />
                    Edit
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {item.siang.map((menu, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#8E9196] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      {menu}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#3A3E43]/60" />

              {/* Malam */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Icon name="bedtime" size={16} />
                    Shift Malam
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(item, 'malam')}
                    className="text-[#8E9196] hover:text-[#FFB59E] text-xs transition-all flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#202326]"
                  >
                    <Icon name="edit" size={14} />
                    Edit
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {item.malam.map((menu, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#8E9196] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      {menu}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editState && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setEditState(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative bg-[#1E2124] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#3A3E43] animate-slide-up-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-[#70260D] text-[#FFB59E]">
                <Icon name="restaurant" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E1E3E5]">
                  Edit Menu {editState.hari}
                </h3>
                <p className="text-[#8E9196] text-xs flex items-center gap-1">
                  <Icon
                    name={
                      editState.jadwal === 'pagi'
                        ? 'wb_twilight'
                        : editState.jadwal === 'siang'
                        ? 'wb_sunny'
                        : 'bedtime'
                    }
                    size={14}
                  />
                  {editState.jadwal === 'pagi'
                    ? 'Shift Pagi (Sarapan)'
                    : editState.jadwal === 'siang'
                    ? 'Shift Siang'
                    : 'Shift Malam'} — Satu item per baris
                </p>
              </div>
            </div>

            <textarea
              value={editState.items}
              onChange={(e) => setEditState({ ...editState, items: e.target.value })}
              rows={8}
              className="w-full mt-4 p-4 bg-[#111416] border border-[#3A3E43] rounded-2xl text-[#E1E3E5] text-sm focus:outline-none focus:border-[#FFB59E] transition-all resize-none font-sans"
              placeholder="Nasi&#10;Ayam Goreng&#10;Sayur Asem&#10;Kerupuk"
            />

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setEditState(null)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-full bg-[#C83718] hover:bg-[#8C2C10] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Icon name="save" size={16} />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

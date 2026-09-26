'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { getMenu } from '@/lib/store'
import { MenuItem } from '@/lib/types'
import Icon from '@/components/m3/Icon'

const emptySubscribe = () => () => {}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DAY_MAP: Record<number, string> = { 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu' }

const SHIFT_META = {
  pagi: { label: 'Sarapan', sublabel: '05:00–06:00', icon: 'wb_twilight', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  siang: { label: 'Makan Siang', sublabel: '11:00–13:00', icon: 'wb_sunny', color: 'text-[#C83718]', bg: 'bg-[#FFDBD1]/40', border: 'border-[#C83718]/15', dot: 'bg-[#C83718]' },
  malam: { label: 'Makan Malam', sublabel: '18:30–20:00', icon: 'bedtime', color: 'text-[#1E2D2F]', bg: 'bg-[#1E2D2F]/[0.04]', border: 'border-[#1E2D2F]/10', dot: 'bg-[#1E2D2F]' },
} as const

export default function MenuTable() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(() => {
    const jsDay = new Date().getDay()
    return DAY_MAP[jsDay] || 'Senin'
  })

  useEffect(() => {
    if (!isClient) return
    let cancelled = false
    const fetchMenu = () => {
      getMenu()
        .then((menu) => {
          if (!cancelled) setMenuItems(menu?.items || [])
        })
        .catch((err) => {
          console.warn('Failed to load menu in MenuTable:', err)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    fetchMenu()

    const handleMenuUpdate = () => {
      fetchMenu()
    }
    window.addEventListener('dapoer_iboe_menu_updated', handleMenuUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('dapoer_iboe_menu_updated', handleMenuUpdate)
    }
  }, [isClient])

  if (!isClient || loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-20 bg-[#F0EAE6] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-[#F0EAE6] rounded-3xl animate-pulse" />
      </div>
    )
  }

  const todayName = DAY_MAP[new Date().getDay()]
  const activeDayData = menuItems.find((item) => item.hari === activeDay)

  const renderShiftSection = (shift: 'pagi' | 'siang' | 'malam', items: string[]) => {
    const meta = SHIFT_META[shift]
    if (!items || items.length === 0) return null

    return (
      <div className={`p-4 sm:p-5 rounded-2xl ${meta.bg} border ${meta.border} transition-all duration-200`}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center`}>
            <Icon name={meta.icon} size={18} />
          </div>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-[10px] text-[#785A28] ml-2 font-medium">{meta.sublabel}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((menu, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-white/80 border border-[#DDD5CE]/60 text-xs sm:text-sm text-[#1E2D2F] font-medium shadow-xs transition-all duration-150 hover:shadow-sm hover:border-[#C83718]/20"
            >
              {menu}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Day Tabs — Segmented Control */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
        {DAYS.map((day) => {
          const isActive = activeDay === day
          const isToday = todayName === day
          const hasData = menuItems.some((item) => item.hari === day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              disabled={!hasData}
              className={`relative flex-shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-250 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#C83718] text-white shadow-lg shadow-[#C83718]/20 scale-[1.03]'
                  : hasData
                  ? 'bg-white text-[#1E2D2F] border border-[#DDD5CE] hover:border-[#C83718]/30 hover:bg-[#F0EAE6] hover:text-[#C83718]'
                  : 'bg-[#F7F2EF] text-[#DDD5CE] border border-[#DDD5CE]/50 cursor-not-allowed'
              }`}
            >
              {day}
              {isToday && (
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  isActive ? 'bg-white' : 'bg-[#C83718]'
                } ${isActive ? '' : 'animate-pulse'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Today indicator */}
      {todayName && activeDay === todayName && (
        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#C83718]">
          <Icon name="today" size={16} />
          <span>Menu Hari Ini — {todayName}</span>
        </div>
      )}

      {/* Active Day Content */}
      {activeDayData ? (
        <div className="bg-white rounded-3xl border border-[#DDD5CE] shadow-sm overflow-hidden transition-all duration-300 animate-fade-in">
          {/* Day Header */}
          <div className="bg-gradient-to-r from-[#C83718] to-[#DE5B36] px-5 sm:px-6 py-4 flex items-center justify-between text-white">
            <h3 className="font-extrabold text-lg sm:text-xl tracking-wide flex items-center gap-2">
              <Icon name="calendar_today" size={20} />
              {activeDayData.hari}
            </h3>
            <div className="flex items-center gap-2">
              {todayName === activeDayData.hari && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Hari Ini
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                3 Shift
              </span>
            </div>
          </div>

          {/* Shift Cards */}
          <div className="p-4 sm:p-6 space-y-3">
            {renderShiftSection('pagi', activeDayData.pagi)}
            {renderShiftSection('siang', activeDayData.siang)}
            {renderShiftSection('malam', activeDayData.malam)}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-[#DDD5CE] text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#F0EAE6] text-[#785A28] flex items-center justify-center">
            <Icon name="event_busy" size={28} />
          </div>
          <p className="text-sm font-bold text-[#1E2D2F] mb-1">Menu Belum Tersedia</p>
          <p className="text-xs text-[#785A28]">Menu untuk hari {activeDay} belum diinput oleh admin.</p>
        </div>
      )}

      {/* Quick day navigation — mobile swipe hint */}
      <div className="mt-4 flex items-center justify-center gap-1 lg:hidden">
        {DAYS.map((day) => {
          const isActive = activeDay === day
          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isActive ? 'bg-[#C83718] w-5' : 'bg-[#DDD5CE] hover:bg-[#785A28]'
              }`}
              aria-label={`Pilih menu ${day}`}
            />
          )
        })}
      </div>
    </div>
  )
}

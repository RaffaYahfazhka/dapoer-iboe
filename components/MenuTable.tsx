'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { getMenu } from '@/lib/store'
import { MenuItem } from '@/lib/types'
import Icon from '@/components/m3/Icon'

const emptySubscribe = () => () => {}

export default function MenuTable() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isClient) return
    getMenu()
      .then((menu) => setMenuItems(menu.items))
      .finally(() => setLoading(false))
  }, [isClient])

  if (!isClient || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-[#F0EAE6] rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
        {menuItems.map((item) => (
          <div
            key={item.hari}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#DDD5CE] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C83718] to-[#DE5B36] px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-base sm:text-lg tracking-wide flex items-center gap-2">
                <Icon name="calendar_today" size={18} />
                {item.hari}
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Menu Harian
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              {/* Pagi */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 rounded-lg bg-orange-100 text-orange-700">
                    <Icon name="wb_twilight" size={16} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                    Shift Pagi (Sarapan)
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {(item.pagi || []).map((menu, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#1E2D2F]/80 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/70 flex-shrink-0" />
                      {menu}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#DDD5CE]" />

              {/* Siang */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
                    <Icon name="wb_sunny" size={16} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C83718]">
                    Shift Siang (Makan Siang)
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {item.siang.map((menu, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#1E2D2F]/80 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C83718]/60 flex-shrink-0" />
                      {menu}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#DDD5CE]" />

              {/* Malam */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 rounded-lg bg-[#212E32] text-[#FFDBD1]">
                    <Icon name="bedtime" size={16} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#212E32]">
                    Shift Malam (Makan Malam)
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {item.malam.map((menu, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#1E2D2F]/80 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#212E32]/70 flex-shrink-0" />
                      {menu}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

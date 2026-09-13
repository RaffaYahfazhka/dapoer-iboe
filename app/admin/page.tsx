'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import {
  getPelangganList,
  generateDailyDeliveries,
  getDeliveriesByDate,
  formatDate,
  formatDateDisplay,
  getTodayStats,
} from '@/lib/store'
import { DeliveryRecord, Pelanggan } from '@/lib/types'
import SummaryCard from '@/components/SummaryCard'
import DeliveryTracker from '@/components/DeliveryTracker'
import Icon from '@/components/m3/Icon'

const emptySubscribe = () => () => {}

export default function AdminDashboard() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [stats, setStats] = useState({ total: 0, belum: 0, sedang: 0, sudah: 0 })
  const [pelangganCount, setPelangganCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const records = await generateDailyDeliveries(selectedDate)
    const allDeliveries = await getDeliveriesByDate(selectedDate)
    const todayStats = await getTodayStats()
    const pelangganList = await getPelangganList()

    return {
      deliveries: allDeliveries.length > 0 ? allDeliveries : records,
      stats: todayStats,
      aktifCount: pelangganList.filter((p: Pelanggan) => p.status === 'aktif').length,
      pendingCount: pelangganList.filter((p: Pelanggan) => p.status === 'pending').length,
    }
  }, [selectedDate])

  // Load data on mount and when selectedDate changes
  useEffect(() => {
    if (!isClient) return
    let cancelled = false
    loadData().then((data) => {
      if (!cancelled) {
        setDeliveries(data.deliveries)
        setStats(data.stats)
        setPelangganCount(data.aktifCount)
        setPendingCount(data.pendingCount)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [isClient, selectedDate, loadData])

  const refreshData = useCallback(async () => {
    const data = await loadData()
    setDeliveries(data.deliveries)
    setStats(data.stats)
    setPelangganCount(data.aktifCount)
    setPendingCount(data.pendingCount)
  }, [loadData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isClient) return
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [isClient, refreshData])

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFB59E]/30 border-t-[#FFB59E] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8E9196] text-sm">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  const progress = stats.total > 0 ? Math.round((stats.sudah / stats.total) * 100) : 0
  const isToday = selectedDate === formatDate(new Date())

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#E1E3E5] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#8E9196] text-xs sm:text-sm mt-0.5 sm:mt-1 flex items-center gap-1.5 flex-wrap">
            <Icon name="event" size={15} className="text-[#FFB59E] flex-shrink-0" />
            <span>{isToday ? 'Hari ini, ' : ''}{formatDateDisplay(selectedDate)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 sm:px-4 py-2 bg-[#191C1E] border border-[#3A3E43] rounded-2xl text-[#E1E3E5] text-xs sm:text-sm focus:outline-none focus:border-[#FFB59E] transition-all [color-scheme:dark]"
            />
          </div>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(formatDate(new Date()))}
              className="px-3 py-2 bg-[#70260D] text-[#FFB59E] rounded-2xl text-xs font-bold hover:bg-[#8C3317] transition-all flex items-center gap-1"
            >
              <Icon name="today" size={15} />
              <span>Hari Ini</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {stats.belum > 0 && isToday && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#2D1616] border border-red-500/40 p-3.5 sm:p-5 animate-fade-in-up">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 sm:p-3 bg-red-500/20 rounded-xl sm:rounded-2xl flex-shrink-0 text-red-400">
              <Icon name="warning" size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-red-200 font-bold text-xs sm:text-sm leading-snug">
                Perhatian: {stats.belum} pengiriman belum diantar hari ini!
              </p>
              <p className="text-red-300/70 text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                Segera proses sebelum batas waktu pengantaran berakhir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          title="Total Pelanggan"
          value={pelangganCount}
          color="terracotta"
          iconName="group"
          subtitle={pendingCount > 0 ? `${pendingCount} menunggu approval` : undefined}
        />
        <SummaryCard
          title="Belum Diantar"
          value={stats.belum}
          color="red"
          iconName="schedule"
          pulse={stats.belum > 0 && isToday}
        />
        <SummaryCard
          title="Sedang Diantar"
          value={stats.sedang}
          color="amber"
          iconName="local_shipping"
        />
        <SummaryCard
          title="Sudah Selesai"
          value={stats.sudah}
          color="emerald"
          iconName="check_circle"
          subtitle={stats.total > 0 ? `${progress}% tercapai` : undefined}
        />
      </div>

      {/* Progress Bar Section */}
      {stats.total > 0 && (
        <div className="bg-[#191C1E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#3A3E43]">
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-[#E1E3E5] flex items-center gap-1.5 sm:gap-2">
              <Icon name="trending_up" size={17} className="text-[#FFB59E]" />
              <span>Progress Pengiriman Hari Ini</span>
            </h3>
            <span className="text-[#FFB59E] font-extrabold text-xs sm:text-sm">{progress}%</span>
          </div>

          <div className="w-full bg-[#282C30] rounded-full h-2.5 sm:h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFB59E] to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2.5 text-[11px] sm:text-xs text-[#8E9196] flex-wrap gap-1">
            <span>{stats.sudah} dari {stats.total} selesai</span>
            <span className="flex items-center gap-1 font-semibold">
              {stats.belum > 0 ? (
                <>
                  <Icon name="pending" size={13} className="text-amber-400" />
                  <span>{stats.belum} tersisa</span>
                </>
              ) : (
                <>
                  <Icon name="verified" size={13} className="text-emerald-400" />
                  <span>Semua selesai</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Delivery Tracker Section */}
      <div className="bg-[#191C1E] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-[#3A3E43]">
        <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#E1E3E5] flex items-center gap-2 truncate">
              <Icon name="local_shipping" size={20} className="text-[#FFB59E] flex-shrink-0" />
              <span>Tracker Pengiriman Makanan</span>
            </h3>
            <p className="text-[#8E9196] text-[11px] sm:text-xs mt-0.5 truncate">
              Pencarian, filter, dan kelola status per pelanggan
            </p>
          </div>

          <button
            type="button"
            onClick={refreshData}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#202326] text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#282C30] transition-all flex-shrink-0"
            title="Muat Ulang"
            aria-label="Muat Ulang Data"
          >
            <Icon name="refresh" size={18} />
          </button>
        </div>

        <DeliveryTracker records={deliveries} onUpdate={refreshData} />
      </div>

      {/* Quick Testimonial Summary Card */}
      <div className="bg-gradient-to-r from-[#1E2022] to-[#251814] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#3A3E43] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#70260D] text-[#FFB59E] flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon name="reviews" size={24} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#E1E3E5]">
              Ulasan & Testimoni Pelanggan
            </h3>
            <p className="text-xs text-[#8E9196] mt-0.5">
              Kelola rating bintang, kutipan pelanggan, dan foto masakan yang tampil di beranda
            </p>
          </div>
        </div>

        <a
          href="/admin/testimoni"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#70260D] hover:bg-[#8C3317] text-[#FFB59E] text-xs font-bold transition-all flex-shrink-0 self-start sm:self-auto"
        >
          <span>Kelola Testimoni</span>
          <Icon name="arrow_forward" size={16} />
        </a>
      </div>
    </div>
  )
}

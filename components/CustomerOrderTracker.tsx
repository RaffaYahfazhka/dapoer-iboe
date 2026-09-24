'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Icon from '@/components/m3/Icon'
import { DeliveryRecord, DeliveryStep } from '@/lib/types'
import {
  getDeliveriesByCustomerQuery,
  getCustomerDeliveryHistory,
  getPelangganList,
  generateDailyDeliveries,
  formatDate,
  formatDateDisplay,
  getMenu,
} from '@/lib/store'

const TRACKER_STEPS: {
  step: DeliveryStep
  title: string
  subtitle: string
  icon: string
  detail: string
}[] = [
  {
    step: 1,
    title: 'Pesanan Diterima',
    subtitle: 'Dapur mencatat pesanan',
    icon: 'receipt_long',
    detail: 'Dapur Dapoer Iboe telah mencatat jadwal catering Ibu/Bapak hari ini.',
  },
  {
    step: 2,
    title: 'Sedang Dimasak',
    subtitle: 'Koki meracik bahan segar',
    icon: 'soup_kitchen',
    detail: 'Koki kami sedang mengolah hidangan rumahan lezat menggunakan bahan-bahan segar berkualitas.',
  },
  {
    step: 3,
    title: 'Siap Dikirim',
    subtitle: 'Makanan dikemas rapi',
    icon: 'inventory_2',
    detail: 'Santapan telah dikemas higienis dalam wadah food-grade dan siap diserahkan ke kurir pengantar.',
  },
  {
    step: 4,
    title: 'Dalam Perjalanan',
    subtitle: 'Kurir menuju lokasi',
    icon: 'two_wheeler',
    detail: 'Kurir Dapoer Iboe sedang dalam perjalanan membawa pesanan ke alamat Anda.',
  },
  {
    step: 5,
    title: 'Pesanan Sampai',
    subtitle: 'Selamat menikmati',
    icon: 'task_alt',
    detail: 'Makanan telah tiba di lokasi. Selamat menikmati santapan hangat dari Dapoer Iboe!',
  },
]

export default function CustomerOrderTracker() {
  const [quickSamples, setQuickSamples] = useState<{ nama: string; hp: string }[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [matchedRecords, setMatchedRecords] = useState<DeliveryRecord[]>([])
  const [activeRecord, setActiveRecord] = useState<DeliveryRecord | null>(null)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [historyRecords, setHistoryRecords] = useState<DeliveryRecord[]>([])
  const [historyAccordionOpen, setHistoryAccordionOpen] = useState(false)
  const [todayMenu, setTodayMenu] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const today = formatDate(new Date())
        await generateDailyDeliveries(today)

        const pelanggans = await getPelangganList()
        const aktifPelanggans = pelanggans.filter((p) => p.status === 'aktif')

        setQuickSamples(
          aktifPelanggans.slice(0, 3).map((p) => ({ nama: p.nama, hp: p.whatsapp }))
        )

        if (aktifPelanggans.length > 0) {
          const defaultQuery = aktifPelanggans[0].whatsapp
          setSearchQuery(defaultQuery)
          const [records, history] = await Promise.all([
            getDeliveriesByCustomerQuery(defaultQuery),
            getCustomerDeliveryHistory(defaultQuery),
          ])
          setMatchedRecords(records)
          setHistoryRecords(history)
          if (records.length > 0) {
            setActiveRecord(records[0])
          }
        }
      } catch (err) {
        console.error('Error loading tracker data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialData()
  }, [])

  const activeRecordShift = activeRecord?.jadwal || 'siang'

  // Load today's menu when active record shift changes
  useEffect(() => {
    let cancelled = false
    const loadMenu = async () => {
      try {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        const todayDayName = days[new Date().getDay()]
        const menuData = await getMenu()
        if (cancelled) return
        const todayMenuItem = menuData?.items?.find((m) => m.hari === todayDayName)
        if (todayMenuItem) {
          setTodayMenu(todayMenuItem[activeRecordShift] || [])
        } else {
          setTodayMenu([])
        }
      } catch (err) {
        console.warn('Error loading today menu:', err)
        if (!cancelled) setTodayMenu([])
      }
    }

    loadMenu()

    const handleMenuUpdate = () => {
      loadMenu()
    }
    window.addEventListener('dapoer_iboe_menu_updated', handleMenuUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('dapoer_iboe_menu_updated', handleMenuUpdate)
    }
  }, [activeRecordShift])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setMatchedRecords([])
      setActiveRecord(null)
      setHistoryRecords([])
      return
    }
    const [results, history] = await Promise.all([
      getDeliveriesByCustomerQuery(query),
      getCustomerDeliveryHistory(query),
    ])
    setMatchedRecords(results)
    setHistoryRecords(history)
    if (results.length > 0) {
      setActiveRecord(results[0])
    } else {
      setActiveRecord(null)
    }
  }, [])

  const currentStep: DeliveryStep = activeRecord?.step || (
    activeRecord?.status === 'sudah' ? 5 : activeRecord?.status === 'sedang' ? 4 : 2
  )

  const progressPercent = Math.round(((currentStep - 1) / 4) * 100)

  // WhatsApp Admin helper
  const getWhatsAppAdminUrl = () => {
    const adminPhone = '6281234567890'
    const name = activeRecord ? activeRecord.pelangganNama : 'Pelanggan'
    const msg = encodeURIComponent(
      `Halo Admin Dapoer Iboe, saya ${name}. Saya ingin konfirmasi / menanyakan status pengiriman catering hari ini.`
    )
    return `https://wa.me/${adminPhone}?text=${msg}`
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#C83718]/20 border-t-[#C83718] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#785A28] text-sm">Memuat data pesanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search & Quick Samples Card */}
      <div className="bg-[#FCFBF9] rounded-3xl p-5 sm:p-7 border border-[#DDD5CE] shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1E2D2F] flex items-center gap-2">
              <Icon name="radar" size={22} className="text-[#C83718]" />
              Lacak Pengiriman Pesanan
            </h3>
            <p className="text-xs text-[#785A28] mt-0.5">
              Ketik nomor WhatsApp atau nama pelanggan untuk melihat alur pengantaran secara langsung.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1E9CA] text-[#0C2009] text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#246B34] animate-ping" />
            Live Tracking
          </span>
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#785A28]">
            <Icon name="search" size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Masukkan No. WhatsApp (contoh: 081234567890) atau Nama..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#DDD5CE] rounded-2xl text-sm text-[#1E2D2F] placeholder:text-[#785A28]/60 focus:outline-none focus:border-[#C83718] focus:ring-2 focus:ring-[#C83718]/15 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#785A28] hover:text-[#1E2D2F]"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {/* Quick Sample Chips */}
        {quickSamples.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-[#785A28] font-medium flex items-center gap-1">
              <Icon name="touch_app" size={15} />
              Coba Klik Contoh:
            </span>
            {quickSamples.map((sample) => (
              <button
                key={sample.hp}
                type="button"
                onClick={() => handleSearch(sample.hp)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  searchQuery.includes(sample.hp)
                    ? 'bg-[#C83718] text-white shadow-sm'
                    : 'bg-[#F0EAE6] text-[#785A28] hover:bg-[#EBE4DD] hover:text-[#1E2D2F]'
                }`}
              >
                {sample.nama}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* If No Record Found */}
      {!activeRecord ? (
        <div className="bg-white rounded-3xl p-10 border border-[#DDD5CE] text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFDBD1] text-[#C83718] flex items-center justify-center">
            <Icon name="manage_search" size={32} />
          </div>
          <h4 className="text-base font-bold text-[#1E2D2F] mb-1">
            {searchQuery ? 'Pesanan Tidak Ditemukan' : 'Silakan Cari Pesanan Anda'}
          </h4>
          <p className="text-xs text-[#785A28] max-w-md mx-auto mb-5">
            {searchQuery
              ? `Tidak ada data pengiriman aktif untuk "${searchQuery}". Pastikan nomor WhatsApp terdaftar atau hubungi admin kami.`
              : 'Gunakan kotak pencarian atau pilih salah satu contoh pelanggan di atas untuk melihat simulasi alur pesanan.'}
          </p>

          <a
            href={getWhatsAppAdminUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#246B34] text-white text-xs font-bold hover:bg-[#1B5127] transition-all shadow-sm"
          >
            <Icon name="chat" size={18} />
            Hubungi WhatsApp Admin
          </a>
        </div>
      ) : (
        /* Active Record Tracker Card */
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#DDD5CE] shadow-md transition-all">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#DDD5CE]">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2D2F]">
                  {activeRecord.pelangganNama}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    activeRecord.jadwal === 'pagi'
                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                      : activeRecord.jadwal === 'siang'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#212E32] text-[#FFDBD1] border border-[#212E32]'
                  }`}
                >
                  <Icon
                    name={
                      activeRecord.jadwal === 'pagi'
                        ? 'wb_twilight'
                        : activeRecord.jadwal === 'siang'
                        ? 'wb_sunny'
                        : 'bedtime'
                    }
                    size={15}
                  />
                  Antaran{' '}
                  {activeRecord.jadwal === 'pagi'
                    ? 'Pagi'
                    : activeRecord.jadwal === 'siang'
                    ? 'Siang'
                    : 'Malam'}
                </span>

                {matchedRecords.length > 1 ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-[#FFDBD1] text-[#C83718] font-extrabold border border-[#C83718]/20 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C83718] animate-ping" />
                    {matchedRecords.length} Pengantaran Hari Ini: {matchedRecords.map(r => r.jadwal === 'pagi' ? 'Pagi' : r.jadwal === 'siang' ? 'Siang' : 'Malam').join(' & ')}
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-[#D1E9CA] text-[#0C2009] font-bold border border-[#246B34]/20">
                    1 Pengantaran Hari Ini: {activeRecord.jadwal === 'pagi' ? 'Pagi' : activeRecord.jadwal === 'siang' ? 'Siang' : 'Malam'}
                  </span>
                )}
              </div>

              {/* Shift Switcher — max 3 clean GoFood pill tabs */}
              {matchedRecords.length > 1 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs font-bold text-[#785A28]">Pilih Shift:</span>
                  {matchedRecords.map((rec) => {
                    const isSelected = activeRecord.id === rec.id
                    return (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => setActiveRecord(rec)}
                        className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#C83718] via-[#DE5B36] to-[#F97316] text-white shadow-md shadow-[#C83718]/30 -translate-y-0.5 scale-105'
                            : 'bg-[#F0EAE6] text-[#1E2D2F]/75 hover:bg-[#EBE4DD] hover:text-[#1E2D2F] hover:-translate-y-0.5'
                        }`}
                      >
                        <Icon
                          name={
                            rec.jadwal === 'pagi'
                              ? 'wb_twilight'
                              : rec.jadwal === 'siang'
                              ? 'wb_sunny'
                              : 'bedtime'
                          }
                          size={15}
                        />
                        Shift {rec.jadwal === 'pagi' ? 'Pagi' : rec.jadwal === 'siang' ? 'Siang' : 'Malam'}
                      </button>
                    )
                  })}
                </div>
              )}

              <p className="text-xs text-[#785A28] mt-1.5 flex items-center gap-1.5">
                <Icon name="calendar_today" size={14} />
                {formatDateDisplay(activeRecord.tanggal)}
              </p>
            </div>

            {/* Current Step Pill */}
            <div className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#FFDBD1] text-[#3C0A00] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C83718] animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Tahap {currentStep} dari 5 ({progressPercent}%)
                </p>
                <p className="text-xs font-bold">
                  {TRACKER_STEPS[currentStep - 1]?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar Line with Milestone Points */}
          <div className="relative my-8 px-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#785A28] mb-2">
              <span className="text-[#C83718]">Diterima</span>
              <span>Dimasak</span>
              <span>Siap Kirim</span>
              <span>Di Jalan</span>
              <span className={currentStep === 5 ? 'text-[#246B34]' : ''}>Sampai</span>
            </div>
            <div className="w-full bg-[#DDD5CE] h-3 rounded-full overflow-hidden flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`flex-1 border-r border-white/60 last:border-r-0 transition-all duration-500 ${
                    currentStep >= s
                      ? currentStep === 5
                        ? 'bg-[#246B34]'
                        : 'bg-gradient-to-r from-[#C83718] to-amber-500'
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 5-Step Visual Stepper */}
          <div className="space-y-4 sm:space-y-5 mb-8">
            {TRACKER_STEPS.map((item) => {
              const isPast = item.step < currentStep
              const isCurrent = item.step === currentStep

              return (
                <div
                  key={item.step}
                  className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#FCFBF9] border-2 border-[#C83718] shadow-md animate-fade-in'
                      : isPast
                      ? 'bg-[#F7F2EF]/60 border border-[#DDD5CE]'
                      : 'bg-transparent border border-dashed border-[#DDD5CE] opacity-50'
                  }`}
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-[#C83718] text-white shadow-lg animate-pulse-ring'
                        : isPast
                        ? 'bg-[#246B34] text-white'
                        : 'bg-[#DDD5CE] text-[#785A28]'
                    }`}
                  >
                    {isPast ? (
                      <Icon name="check" size={24} />
                    ) : (
                      <Icon name={item.icon} size={24} filled={isCurrent} />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4
                        className={`text-sm sm:text-base font-bold ${
                          isCurrent
                            ? 'text-[#C83718]'
                            : isPast
                            ? 'text-[#246B34]'
                            : 'text-[#1E2D2F]'
                        }`}
                      >
                        {item.step}. {item.title}
                      </h4>

                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C83718] text-white">
                          Sedang Berlangsung
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-semibold text-[#246B34] flex items-center gap-1">
                          <Icon name="done_all" size={14} /> Selesai
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#1E2D2F]/80 font-medium mt-1">
                      {item.detail}
                    </p>

                    {/* Stage-specific callout */}
                    {isCurrent && item.step === 4 && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon name="sports_motorsports" size={20} className="text-[#C83718]" />
                          <div>
                            <p className="text-xs font-bold text-[#1E2D2F]">
                              {activeRecord.driverNama || 'Pak Joko (Kurir Dapoer Iboe)'}
                            </p>
                            <p className="text-[11px] text-[#785A28]">
                              Estimasi Tiba: {activeRecord.estimatedTime || '15 - 30 Menit'}
                            </p>
                          </div>
                        </div>

                        {activeRecord.driverHp && (
                          <a
                            href={`tel:${activeRecord.driverHp}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F0EAE6] hover:bg-[#EBE4DD] text-[#C83718] text-xs font-bold self-start sm:self-auto transition-colors"
                          >
                            <Icon name="call" size={14} />
                            Hubungi Kurir
                          </a>
                        )}
                      </div>
                    )}

                    {isCurrent && item.step === 5 && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                        Terima kasih banyak telah menjadi bagian dari keluarga Dapoer Iboe! Mohon berikan ulasan jika hidangan memuaskan.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Collapsible Accordion: Ringkasan Pesanan */}
          <div className="border border-[#DDD5CE] rounded-2xl overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setAccordionOpen(!accordionOpen)}
              className="w-full px-5 py-3.5 bg-[#F7F2EF] hover:bg-[#F0EAE6] transition-colors flex items-center justify-between text-left"
            >
              <span className="text-xs sm:text-sm font-bold text-[#1E2D2F] flex items-center gap-2">
                <Icon name="restaurant_menu" size={18} className="text-[#C83718]" />
                Lihat Menu Makanan & Alamat Pengantaran
              </span>
              <Icon
                name={accordionOpen ? 'expand_less' : 'expand_more'}
                size={20}
                className="text-[#785A28]"
              />
            </button>

            {accordionOpen && (
              <div className="p-5 bg-white space-y-4 text-xs animate-fade-in">
                <div>
                  <p className="font-bold text-[#785A28] uppercase tracking-wider text-[10px] mb-1">
                    Alamat Pengantaran:
                  </p>
                  <p className="text-sm text-[#1E2D2F] font-medium flex items-start gap-1.5">
                    <Icon name="location_on" size={16} className="text-[#C83718] flex-shrink-0 mt-0.5" />
                    {activeRecord.pelangganAlamat}
                  </p>
                </div>

                {todayMenu.length > 0 && (
                  <div>
                    <p className="font-bold text-[#785A28] uppercase tracking-wider text-[10px] mb-1">
                      Menu Antaran Hari Ini ({activeRecord.jadwal === 'siang' ? 'Siang' : 'Malam'}):
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {todayMenu.map((m, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#F0EAE6] text-[#1E2D2F] font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapsible Accordion: Riwayat Pengantaran Sebelumnya (History) */}
          {historyRecords.length > 0 && (
            <div className="border border-[#DDD5CE] rounded-2xl overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => setHistoryAccordionOpen(!historyAccordionOpen)}
                className="w-full px-5 py-3.5 bg-[#F7F2EF] hover:bg-[#F0EAE6] transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1E2D2F] flex items-center gap-2">
                  <Icon name="history" size={18} className="text-[#C83718]" />
                  Riwayat Pengantaran Sebelumnya ({historyRecords.length} Hari Terakhir)
                </span>
                <Icon
                  name={historyAccordionOpen ? 'expand_less' : 'expand_more'}
                  size={20}
                  className="text-[#785A28]"
                />
              </button>

              {historyAccordionOpen && (
                <div className="p-4 sm:p-5 bg-white space-y-2.5 text-xs animate-fade-in">
                  <p className="text-[11px] text-[#785A28] mb-2 font-medium">
                    Riwayat jadwal pengantaran sebelumnya yang telah selesai tercatat di sistem:
                  </p>
                  <div className="divide-y divide-[#DDD5CE]/60">
                    {historyRecords.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#246B34]" />
                          <span className="font-bold text-[#1E2D2F]">
                            {formatDateDisplay(item.tanggal)}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F0EAE6] text-[#785A28] text-[10px] font-extrabold uppercase">
                            Shift {item.jadwal.charAt(0).toUpperCase() + item.jadwal.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#246B34] font-bold text-xs flex items-center gap-1">
                            <Icon name="check_circle" size={14} filled />
                            Terkirim
                          </span>
                          {item.driverNama && (
                            <span className="text-[#785A28] text-[11px]">
                              ({item.driverNama})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick WhatsApp Support CTA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#D1E9CA]/50 border border-[#4E6746]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#246B34] text-white flex items-center justify-center flex-shrink-0">
                <Icon name="support_agent" size={22} />
              </div>
              <div>
                <h5 className="font-bold text-sm text-[#0C2009]">
                  Butuh Bantuan atau Ingin Ubah Alamat?
                </h5>
                <p className="text-xs text-[#354E2E]">
                  Tim Customer Care Dapoer Iboe siap melayani Anda setiap hari.
                </p>
              </div>
            </div>

            <a
              href={getWhatsAppAdminUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#246B34] hover:bg-[#1B5127] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
              <Icon name="chat" size={18} />
              Chat WhatsApp Admin
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Icon from '@/components/m3/Icon'
import { DeliveryRecord, DeliveryStep } from '@/lib/types'
import {
  getDeliveriesByCustomerQuery,
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
          const records = await getDeliveriesByCustomerQuery(defaultQuery)
          setMatchedRecords(records)
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
    const loadMenu = async () => {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const todayDayName = days[new Date().getDay()]
      const menuData = await getMenu()
      const todayMenuItem = menuData.items.find((m) => m.hari === todayDayName)
      if (todayMenuItem) {
        setTodayMenu(todayMenuItem[activeRecordShift] || [])
      } else {
        setTodayMenu([])
      }
    }
    loadMenu()
  }, [activeRecordShift])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setMatchedRecords([])
      setActiveRecord(null)
      return
    }
    const results = await getDeliveriesByCustomerQuery(query)
    setMatchedRecords(results)
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
          <div className="w-10 h-10 border-4 border-[#B8421E]/20 border-t-[#B8421E] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#785A28] text-sm">Memuat data pesanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search & Quick Samples Card */}
      <div className="bg-[#FFF8F6] rounded-3xl p-5 sm:p-7 border border-[#E8E0DC] shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#221916] flex items-center gap-2">
              <Icon name="radar" size={22} className="text-[#B8421E]" />
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
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#E8E0DC] rounded-2xl text-sm text-[#221916] placeholder:text-[#785A28]/60 focus:outline-none focus:border-[#B8421E] focus:ring-2 focus:ring-[#B8421E]/15 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#785A28] hover:text-[#221916]"
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
                    ? 'bg-[#B8421E] text-white shadow-sm'
                    : 'bg-[#F5ECE8] text-[#785A28] hover:bg-[#EFE6E2] hover:text-[#221916]'
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
        <div className="bg-white rounded-3xl p-10 border border-[#E8E0DC] text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFDBD1] text-[#B8421E] flex items-center justify-center">
            <Icon name="manage_search" size={32} />
          </div>
          <h4 className="text-base font-bold text-[#221916] mb-1">
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
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E8E0DC] shadow-md transition-all">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E8E0DC]">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#221916]">
                  {activeRecord.pelangganNama}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    activeRecord.jadwal === 'pagi'
                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                      : activeRecord.jadwal === 'siang'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
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

                {matchedRecords.length > 1 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 font-bold border border-orange-200">
                    {matchedRecords.length} Jadwal Hari Ini
                  </span>
                )}
              </div>

              {/* Shift Switcher jika 1 pelanggan punya multi shift (Pagi, Siang & Malam) */}
              {matchedRecords.length > 1 && (
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[#785A28]">Pilih Shift:</span>
                  {matchedRecords.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setActiveRecord(rec)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeRecord.id === rec.id
                          ? 'bg-[#B8421E] text-white shadow-sm'
                          : 'bg-[#F5ECE8] text-[#785A28] hover:bg-[#EFE6E2]'
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
                        size={13}
                      />
                      Shift{' '}
                      {rec.jadwal === 'pagi'
                        ? 'Pagi'
                        : rec.jadwal === 'siang'
                        ? 'Siang'
                        : 'Malam'}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#785A28] mt-1.5 flex items-center gap-1.5">
                <Icon name="calendar_today" size={14} />
                {formatDateDisplay(activeRecord.tanggal)}
              </p>
            </div>

            {/* Current Step Pill */}
            <div className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#FFDBD1] text-[#3C0A00] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8421E] animate-pulse" />
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
              <span className="text-[#B8421E]">Diterima</span>
              <span>Dimasak</span>
              <span>Siap Kirim</span>
              <span>Di Jalan</span>
              <span className={currentStep === 5 ? 'text-[#246B34]' : ''}>Sampai</span>
            </div>
            <div className="w-full bg-[#E8E0DC] h-3 rounded-full overflow-hidden flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`flex-1 border-r border-white/60 last:border-r-0 transition-all duration-500 ${
                    currentStep >= s
                      ? currentStep === 5
                        ? 'bg-[#246B34]'
                        : 'bg-gradient-to-r from-[#B8421E] to-amber-500'
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
                      ? 'bg-[#FFF8F6] border-2 border-[#B8421E] shadow-md animate-fade-in'
                      : isPast
                      ? 'bg-[#FBF2EF]/60 border border-[#E8E0DC]'
                      : 'bg-transparent border border-dashed border-[#E8E0DC] opacity-50'
                  }`}
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-[#B8421E] text-white shadow-lg animate-pulse-ring'
                        : isPast
                        ? 'bg-[#246B34] text-white'
                        : 'bg-[#E8E0DC] text-[#785A28]'
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
                            ? 'text-[#B8421E]'
                            : isPast
                            ? 'text-[#246B34]'
                            : 'text-[#221916]'
                        }`}
                      >
                        {item.step}. {item.title}
                      </h4>

                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#B8421E] text-white">
                          Sedang Berlangsung
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-semibold text-[#246B34] flex items-center gap-1">
                          <Icon name="done_all" size={14} /> Selesai
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#221916]/80 font-medium mt-1">
                      {item.detail}
                    </p>

                    {/* Stage-specific callout */}
                    {isCurrent && item.step === 4 && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon name="sports_motorsports" size={20} className="text-[#B8421E]" />
                          <div>
                            <p className="text-xs font-bold text-[#221916]">
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5ECE8] hover:bg-[#EFE6E2] text-[#B8421E] text-xs font-bold self-start sm:self-auto transition-colors"
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
          <div className="border border-[#E8E0DC] rounded-2xl overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setAccordionOpen(!accordionOpen)}
              className="w-full px-5 py-3.5 bg-[#FBF2EF] hover:bg-[#F5ECE8] transition-colors flex items-center justify-between text-left"
            >
              <span className="text-xs sm:text-sm font-bold text-[#221916] flex items-center gap-2">
                <Icon name="restaurant_menu" size={18} className="text-[#B8421E]" />
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
                  <p className="text-sm text-[#221916] font-medium flex items-start gap-1.5">
                    <Icon name="location_on" size={16} className="text-[#B8421E] flex-shrink-0 mt-0.5" />
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
                          className="px-2.5 py-1 rounded-lg bg-[#F5ECE8] text-[#221916] font-medium"
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

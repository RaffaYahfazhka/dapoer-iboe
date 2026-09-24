'use client'

import { useState } from 'react'
import { addPelanggan } from '@/lib/store'
import { JadwalType } from '@/lib/types'
import Icon from '@/components/m3/Icon'

type ShiftKey = 'pagi' | 'siang' | 'malam'

function shiftsToJadwal(shifts: ShiftKey[]): JadwalType {
  const sorted = [...shifts].sort((a, b) => {
    const order: Record<string, number> = { pagi: 0, siang: 1, malam: 2 }
    return order[a] - order[b]
  })
  if (sorted.length === 3) return 'semua'
  if (sorted.length === 2) {
    if (sorted[0] === 'siang' && sorted[1] === 'malam') return 'keduanya'
    if (sorted[0] === 'pagi' && sorted[1] === 'siang') return 'keduanya'
    return 'keduanya'
  }
  if (sorted.length === 1) return sorted[0] as JadwalType
  return 'siang'
}

export default function SubscriptionForm() {
  const [selectedShifts, setSelectedShifts] = useState<ShiftKey[]>(['siang', 'malam'])
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    alamat: '',
    paket: 'Paket 2 (2x Makan)',
    durasi: 'Mingguan (6 Hari)',
    mulaiTanggal: '',
    catatan: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleShift = (shift: ShiftKey) => {
    setSelectedShifts((prev) => {
      let next: ShiftKey[]
      if (prev.includes(shift)) {
        if (prev.length <= 1) return prev // keep at least 1
        next = prev.filter((s) => s !== shift)
      } else {
        next = [...prev, shift]
      }

      // Auto-sync package selection if standard package was picked
      if (formData.paket.startsWith('Paket 1') || formData.paket.startsWith('Paket 2') || formData.paket.startsWith('Paket 3')) {
        if (next.length === 3) {
          setFormData((f) => ({ ...f, paket: 'Paket 1 (3x Makan)' }))
        } else if (next.length === 2) {
          setFormData((f) => ({ ...f, paket: 'Paket 2 (2x Makan)' }))
        } else if (next.length === 1) {
          setFormData((f) => ({ ...f, paket: 'Paket 3 (1x Makan)' }))
        }
      }

      return next
    })
  }

  const handlePaketSelect = (pkt: string) => {
    if (pkt.startsWith('Paket 1')) {
      setSelectedShifts(['pagi', 'siang', 'malam'])
    } else if (pkt.startsWith('Paket 2')) {
      if (selectedShifts.length !== 2) {
        setSelectedShifts(['siang', 'malam'])
      }
    } else if (pkt.startsWith('Paket 3') || pkt.includes('Sambal')) {
      if (selectedShifts.length !== 1) {
        setSelectedShifts([selectedShifts[0] || 'siang'])
      }
    }
    setFormData((prev) => ({ ...prev, paket: pkt }))
  }

  const shiftLabel = (() => {
    if (selectedShifts.length === 3) return '3 Shift Terpilih: Seharian Penuh (Pagi, Siang & Malam)'
    if (selectedShifts.length === 2) {
      const names = selectedShifts.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      return `2 Shift Terpilih: ${names[0]} & ${names[1]}`
    }
    if (selectedShifts.length === 1) {
      const name = selectedShifts[0].charAt(0).toUpperCase() + selectedShifts[0].slice(1)
      return `1 Shift Terpilih: Hanya ${name}`
    }
    return 'Pilih minimal 1 shift'
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const jadwal = shiftsToJadwal(selectedShifts)
      const shiftInfo = `[Paket: ${formData.paket} | Durasi: ${formData.durasi} | Shift: ${shiftLabel}]`
      const catatan = [shiftInfo, formData.catatan].filter(Boolean).join('\n')

      await addPelanggan({
        nama: formData.nama,
        whatsapp: formData.whatsapp,
        alamat: formData.alamat,
        jadwal,
        mulaiTanggal: formData.mulaiTanggal,
        catatan,
        paket: formData.paket,
        durasi: formData.durasi,
        status: 'pending',
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    const cleanWaAdmin = '6281234567890'
    const waText = encodeURIComponent(
      `Halo Dapoer Iboe, saya baru saja mendaftar langganan catering:\n\n• Nama: ${formData.nama}\n• Paket: ${formData.paket}\n• Durasi: ${formData.durasi}\n• Shift: ${shiftLabel}\n• Mulai Tanggal: ${formData.mulaiTanggal}\n• Alamat: ${formData.alamat}\n\nMohon konfirmasi pesanan saya. Terima kasih!`
    )
    const waLink = `https://wa.me/${cleanWaAdmin}?text=${waText}`

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#DDD5CE] text-center animate-fade-in-up">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-[#D1E9CA] text-[#246B34] rounded-full flex items-center justify-center shadow-inner">
          <Icon name="check_circle" size={36} filled />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#1E2D2F] mb-2 tracking-tight">
          Pendaftaran Berhasil Dikirim!
        </h3>
        <p className="text-[#1E2D2F]/75 text-xs sm:text-sm mb-5 max-w-md mx-auto leading-relaxed">
          Terima kasih <strong className="text-[#C83718]">{formData.nama}</strong>! Data pesanan langganan Anda sudah tersimpan di sistem Dapoer Iboe.
        </p>

        {/* Order Details Card */}
        <div className="bg-[#FAF8F5] border border-[#DDD5CE] rounded-2xl p-4 mb-6 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDD5CE]/60">
            <span className="text-[#785A28] font-bold">Paket Catering:</span>
            <span className="font-extrabold text-[#C83718]">{formData.paket}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#785A28] font-bold">Durasi:</span>
            <span className="font-semibold text-[#1E2D2F]">{formData.durasi}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#785A28] font-bold">Shift Pengantaran:</span>
            <span className="font-semibold text-[#1E2D2F]">{selectedShifts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#785A28] font-bold">Mulai Tanggal:</span>
            <span className="font-semibold text-[#1E2D2F]">{formData.mulaiTanggal}</span>
          </div>
          <div className="pt-2 border-t border-[#DDD5CE]/60 flex items-start gap-1.5">
            <Icon name="location_on" size={14} className="text-[#785A28] flex-shrink-0 mt-0.5" />
            <span className="text-[#1E2D2F]/80 text-[11px] line-clamp-2">{formData.alamat}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="chat" size={16} />
            Konfirmasi Cepat via WhatsApp
          </a>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false)
              setSelectedShifts(['siang', 'malam'])
              setFormData({
                nama: '',
                whatsapp: '',
                alamat: '',
                paket: 'Paket 2 (2x Makan)',
                durasi: 'Mingguan (6 Hari)',
                mulaiTanggal: '',
                catatan: '',
              })
            }}
            className="w-full sm:w-auto px-5 py-3 bg-[#F0EAE6] hover:bg-[#DDD5CE] text-[#1E2D2F] rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            Daftarkan Pesanan Lain
          </button>
        </div>
      </div>
    )
  }

  const inputCls = "w-full pl-10 pr-4 py-3.5 bg-white border border-[#DDD5CE] rounded-2xl text-sm text-[#1E2D2F] focus:outline-none focus:border-[#C83718] focus:ring-2 focus:ring-[#C83718]/10 transition-all placeholder:text-[#1E2D2F]/35"
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2"

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#DDD5CE]"
    >
      <div className="space-y-5">
        {/* Pilihan Paket Catering */}
        <div>
          <label className={labelCls}>Pilihan Paket Catering *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'Paket 1 (3x Makan)', label: 'Paket 1 (3x)', sub: 'Pagi+Siang+Malam' },
              { key: 'Paket 2 (2x Makan)', label: 'Paket 2 (2x)', sub: '⭐ Best Seller' },
              { key: 'Paket 3 (1x Makan)', label: 'Paket 3 (1x)', sub: 'Hemat Pagi/Sg/Mlm' },
              { key: 'Healthy Food', label: 'Healthy Food', sub: 'Diet / Bulking' },
              { key: 'Sambal Saja Tanpa Nasi', label: 'Sambal Saja', sub: 'Lauk + Sambal' },
              { key: 'Alacarte / Lainnya', label: 'Alacarte / Lainnya', sub: 'Menu Satuan' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePaketSelect(p.key)}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-left flex flex-col justify-between border cursor-pointer ${
                  formData.paket === p.key
                    ? 'bg-gradient-to-br from-[#FFDBD1] to-[#FFE8E0] border-[#C83718] text-[#C83718] shadow-sm'
                    : 'bg-[#FCFBF9] border-[#DDD5CE] text-[#1E2D2F]/75 hover:bg-[#F0EAE6] hover:border-[#C83718]/30'
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] font-medium text-[#785A28]/80 mt-0.5">{p.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Durasi Paket */}
        <div>
          <label className={labelCls}>Durasi Langganan *</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'Mingguan (6 Hari)', label: '📅 Paket Mingguan', sub: '6 Hari Kerja' },
              { key: 'Bulanan (30 Hari)', label: '⭐ Paket Bulanan', sub: '30 Hari Hemat' },
            ].map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setFormData({ ...formData, durasi: d.key })}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer border ${
                  formData.durasi === d.key
                    ? 'bg-gradient-to-r from-[#C83718] to-[#DE5B36] border-[#C83718] text-white shadow-sm'
                    : 'bg-[#FCFBF9] border-[#DDD5CE] text-[#785A28] hover:bg-[#F0EAE6]'
                }`}
              >
                <span>{d.label}</span>
                <span className={`text-[10px] font-medium ${formData.durasi === d.key ? 'text-white/80' : 'text-[#785A28]/70'}`}>
                  {d.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Multi-Select Shift Jadwal Pengantaran ═══ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28]">
              Jadwal Pengantaran (Bebas Multi-Select) *
            </label>
            <span className="text-[10px] text-[#785A28] font-bold bg-[#F0EAE6] px-2 py-0.5 rounded-full">
              Bisa 1, 2, atau 3 Shift
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {([
              { key: 'pagi' as ShiftKey, label: 'Pagi', desc: 'Shift Sarapan', icon: 'wb_twilight' },
              { key: 'siang' as ShiftKey, label: 'Siang', desc: 'Shift Makan Siang', icon: 'wb_sunny' },
              { key: 'malam' as ShiftKey, label: 'Malam', desc: 'Shift Makan Malam', icon: 'bedtime' },
            ]).map((s) => {
              const isActive = selectedShifts.includes(s.key)
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleShift(s.key)}
                  className={`relative py-4 px-3 rounded-2xl text-center font-extrabold transition-all duration-200 cursor-pointer border flex flex-col items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#C83718] via-[#DE5B36] to-[#F97316] border-[#C83718] text-white shadow-lg shadow-[#C83718]/25 hover:-translate-y-0.5 scale-[1.02]'
                      : 'bg-[#FCFBF9] border-[#DDD5CE] text-[#1E2D2F]/75 hover:bg-[#F0EAE6] hover:border-[#C83718]/40 hover:-translate-y-0.5'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                      <Icon name="check" size={13} />
                    </span>
                  )}
                  <Icon name={s.icon} size={24} />
                  <span className="text-sm sm:text-base">{s.label}</span>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-white/85' : 'text-[#785A28]/70'}`}>
                    {s.desc}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Dynamic Indicator */}
          <div className="mt-3 flex items-center gap-2.5 p-3 bg-[#FFDBD1]/60 rounded-2xl border border-[#C83718]/20 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C83718] animate-pulse flex-shrink-0" />
            <span className="text-[#C83718] font-black">{shiftLabel}</span>
          </div>
        </div>

        {/* Nama */}
        <div>
          <label className={labelCls}>Nama Lengkap *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#785A28]/70">
              <Icon name="person" size={18} />
            </div>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className={inputCls}
              placeholder="Contoh: Ibu Rina Melati"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelCls}>Nomor WhatsApp *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#785A28]/70">
              <Icon name="call" size={18} />
            </div>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className={inputCls}
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className={labelCls}>Alamat Pengiriman Lengkap *</label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 pointer-events-none text-[#785A28]/70">
              <Icon name="location_on" size={18} />
            </div>
            <textarea
              required
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#DDD5CE] rounded-2xl text-sm text-[#1E2D2F] focus:outline-none focus:border-[#C83718] focus:ring-2 focus:ring-[#C83718]/10 transition-all resize-none placeholder:text-[#1E2D2F]/35"
              placeholder="Jalan, nomor rumah, RT/RW, patokan atau nama gedung/apartemen"
            />
          </div>
        </div>

        {/* Tanggal Mulai */}
        <div>
          <label className={labelCls}>Mulai Pengiriman Tanggal *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#785A28]/70">
              <Icon name="calendar_month" size={18} />
            </div>
            <input
              type="date"
              required
              value={formData.mulaiTanggal}
              onChange={(e) => setFormData({ ...formData, mulaiTanggal: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className={labelCls}>Catatan Khusus (Alergi / Pantangan)</label>
          <textarea
            rows={2}
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            className="w-full px-4 py-3.5 bg-white border border-[#DDD5CE] rounded-2xl text-sm text-[#1E2D2F] focus:outline-none focus:border-[#C83718] focus:ring-2 focus:ring-[#C83718]/10 transition-all resize-none placeholder:text-[#1E2D2F]/35"
            placeholder="Contoh: Tidak pakai santan, pedas sedang, sayur dipisah"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#C83718] via-[#DE5B36] to-[#E86326] text-white rounded-full font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-[#C83718]/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Menyimpan Data...
            </span>
          ) : (
            <>
              <Icon name="send" size={18} />
              Daftar Langganan Sekarang
            </>
          )}
        </button>
      </div>
    </form>
  )
}

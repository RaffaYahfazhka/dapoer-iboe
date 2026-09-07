'use client'

import { useState } from 'react'
import { addPelanggan } from '@/lib/store'
import { JadwalType } from '@/lib/types'
import Icon from '@/components/m3/Icon'

export default function SubscriptionForm() {
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    alamat: '',
    jadwal: 'keduanya' as JadwalType,
    mulaiTanggal: '',
    catatan: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addPelanggan(formData)
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#E8E0DC] text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-6 bg-[#D1E9CA] text-[#246B34] rounded-full flex items-center justify-center">
          <Icon name="check_circle" size={40} filled />
        </div>
        <h3 className="text-2xl font-extrabold text-[#221916] mb-3">
          Pendaftaran Berhasil Dikirim!
        </h3>
        <p className="text-[#221916]/70 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Terima kasih <strong className="text-[#B8421E]">{formData.nama}</strong>! Data pesanan Anda telah tersimpan di sistem dapur kami. Tim admin akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi awal pengantaran.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setFormData({
              nama: '',
              whatsapp: '',
              alamat: '',
              jadwal: 'keduanya',
              mulaiTanggal: '',
              catatan: '',
            })
          }}
          className="px-6 py-3 bg-[#B8421E] hover:bg-[#8C2C10] text-white rounded-full text-xs font-bold transition-all shadow-md hover:shadow-lg"
        >
          Daftarkan Pesanan Lain
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#E8E0DC]"
    >
      <div className="space-y-5">
        {/* Nama */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2">
            Nama Lengkap *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#785A28]/70">
              <Icon name="person" size={18} />
            </div>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-[#F5ECE8]/60 border border-[#E8E0DC] rounded-2xl text-sm text-[#221916] focus:outline-none focus:border-[#B8421E] focus:bg-white focus:ring-2 focus:ring-[#B8421E]/10 transition-all placeholder:text-[#785A28]/40"
              placeholder="Contoh: Ibu Rina Melati"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2">
            Nomor WhatsApp *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#785A28]/70">
              <Icon name="call" size={18} />
            </div>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-[#F5ECE8]/60 border border-[#E8E0DC] rounded-2xl text-sm text-[#221916] focus:outline-none focus:border-[#B8421E] focus:bg-white focus:ring-2 focus:ring-[#B8421E]/10 transition-all placeholder:text-[#785A28]/40"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2">
            Alamat Pengiriman Lengkap *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-[#785A28]/70">
              <Icon name="location_on" size={18} />
            </div>
            <textarea
              required
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-[#F5ECE8]/60 border border-[#E8E0DC] rounded-2xl text-sm text-[#221916] focus:outline-none focus:border-[#B8421E] focus:bg-white focus:ring-2 focus:ring-[#B8421E]/10 transition-all resize-none placeholder:text-[#785A28]/40"
              placeholder="Jalan, nomor rumah, RT/RW, patokan atau nama gedung/apartemen"
            />
          </div>
        </div>

        {/* Jadwal - M3 Segmented Buttons */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2.5">
            Pilihan Jadwal Pengantaran *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'pagi', label: 'Pagi', sub: '06:30 - 08:00', icon: 'wb_twilight' },
              { key: 'siang', label: 'Siang', sub: '11:30 - 12:30', icon: 'wb_sunny' },
              { key: 'malam', label: 'Malam', sub: '17:30 - 18:30', icon: 'bedtime' },
              { key: 'semua', label: 'Semua (3x)', sub: 'Pagi+Siang+Mlm', icon: 'routine' },
            ].map((j) => (
              <button
                key={j.key}
                type="button"
                onClick={() => setFormData({ ...formData, jadwal: j.key as JadwalType })}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  formData.jadwal === j.key
                    ? 'bg-[#B8421E] text-white shadow-md'
                    : 'bg-[#F5ECE8] text-[#785A28] hover:bg-[#EFE6E2] hover:text-[#221916]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon name={j.icon} size={18} />
                  <span>{j.label}</span>
                </div>
                <span className={`text-[10px] font-medium ${formData.jadwal === j.key ? 'text-white/80' : 'text-[#785A28]/70'}`}>
                  {j.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tanggal Mulai */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2">
            Mulai Pengiriman Tanggal *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#785A28]/70">
              <Icon name="calendar_month" size={18} />
            </div>
            <input
              type="date"
              required
              value={formData.mulaiTanggal}
              onChange={(e) => setFormData({ ...formData, mulaiTanggal: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-[#F5ECE8]/60 border border-[#E8E0DC] rounded-2xl text-sm text-[#221916] focus:outline-none focus:border-[#B8421E] focus:bg-white focus:ring-2 focus:ring-[#B8421E]/10 transition-all"
            />
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#785A28] mb-2">
            Catatan Khusus (Alergi / Pantangan)
          </label>
          <textarea
            rows={2}
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            className="w-full px-4 py-3 bg-[#F5ECE8]/60 border border-[#E8E0DC] rounded-2xl text-sm text-[#221916] focus:outline-none focus:border-[#B8421E] focus:bg-white focus:ring-2 focus:ring-[#B8421E]/10 transition-all resize-none placeholder:text-[#785A28]/40"
            placeholder="Contoh: Tidak pakai santan, pedas sedang, sayur dipisah"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#B8421E] to-[#DE5B36] text-white rounded-full font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-[#B8421E]/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
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

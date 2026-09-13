'use client'

import { useState } from 'react'
import Icon from '@/components/m3/Icon'

export default function CateringPackages() {
  const [billingCycle, setBillingCycle] = useState<'mingguan' | 'bulanan'>('mingguan')

  const packages = [
    {
      id: 'paket-1',
      name: 'Paket 1',
      tagline: '3x Makan Lengkap',
      subtitle: 'Pagi, Siang, dan Malam',
      description: 'Solusi all-in-one bebas repot makan seharian dengan nutrisi seimbang.',
      prices: {
        mingguan: '395.000',
        bulanan: '1.970.000',
      },
      portionInfo: billingCycle === 'mingguan' ? '6 Hari (18 Porsi Makanan)' : '30 Hari (90 Porsi Makanan)',
      features: [
        '3x pengantaran hangat per hari (Pagi, Siang, Malam)',
        'Menu bervariasi setiap hari (anti bosan)',
        'Gratis ongkir langsung ke lokasi Anda',
        billingCycle === 'mingguan' ? 'Jatah skip catering: 1x / minggu' : 'Jatah skip catering: 4x / bulan',
        'Bisa request tidak pedas / cabai dipisah',
      ],
      badge: null,
      highlight: false,
    },
    {
      id: 'paket-2',
      name: 'Paket 2',
      tagline: '2x Makan Fleksibel',
      subtitle: 'Pagi & Siang / Siang & Malam / Pagi & Malam',
      description: 'Pilihan paling disukai pelanggan untuk kombinasi jam makan kantor & rumah.',
      prices: {
        mingguan: '264.000',
        bulanan: '1.300.000',
      },
      portionInfo: billingCycle === 'mingguan' ? '6 Hari (12 Porsi Makanan)' : '30 Hari (60 Porsi Makanan)',
      features: [
        'Bebas pilih 2 shift (Pagi+Siang, Siang+Mlm, Pagi+Mlm)',
        'Menu bergizi olahan rumahan higienis',
        'Gratis ongkir setiap pengantaran',
        billingCycle === 'mingguan' ? 'Jatah skip catering: 1x / minggu' : 'Jatah skip catering: 4x / bulan',
        'Bisa request catatan alergi & tingkat kepedasan',
      ],
      badge: 'Paling Populer',
      highlight: true,
    },
    {
      id: 'paket-3',
      name: 'Paket 3',
      tagline: '1x Makan Hemat',
      subtitle: 'Pilihan Pagi, Siang, ATAU Malam',
      description: 'Praktis dan hemat untuk kebutuhan makan siang kantor atau sarapan harian.',
      prices: {
        mingguan: '132.000',
        bulanan: '650.000',
      },
      portionInfo: billingCycle === 'mingguan' ? '6 Hari (6 Porsi Makanan)' : '30 Hari (30 Porsi Makanan)',
      features: [
        '1x pengantaran per hari (pilih Shift)',
        'Porsi pas dan lezat dengan menu berganti tiap hari',
        'Gratis ongkir langsung ke meja kerja/rumah',
        billingCycle === 'mingguan' ? 'Jatah skip catering: 1x / minggu' : 'Jatah skip catering: 4x / bulan',
        'Pengantaran tepat waktu sebelum jam makan',
      ],
      badge: 'Super Hemat',
      highlight: false,
    },
  ]

  const alacarteItems = [
    {
      title: 'Menu Ayam',
      price: 'Rp 25.000',
      category: 'Alacarte (Satuan)',
      desc: 'Olahan ayam segar pilihan (Serundeng, Kremes, Blackpepper, dll)',
      icon: 'restaurant',
    },
    {
      title: 'Menu Daging & Seafood',
      price: 'Rp 28.000',
      category: 'Alacarte (Satuan)',
      desc: 'Olahan daging sapi & ikan segar dengan resep tradisional mantap',
      icon: 'set_meal',
    },
    {
      title: 'Healthy Food - Loss Weight',
      price: 'Rp 27.000 /pack',
      category: 'Healthy Diet',
      desc: 'Rendah kalori, tinggi serat & protein, diolah higienis tanpa minyak berlebih',
      icon: 'monitor_weight',
    },
    {
      title: 'Healthy Food - Bulking',
      price: 'Rp 37.000 /pack',
      category: 'Fitness & Bulking',
      desc: 'Kaya protein berkualitas tinggi & karbohidrat kompleks untuk pembentukan otot',
      icon: 'fitness_center',
    },
  ]

  const addons = [
    { name: 'Nasi Putih / Tambahan', price: '+5K', icon: 'rice_bowl' },
    { name: 'Buah Potong Segar', price: '+5K', icon: 'nutrition' },
    { name: 'Telur (Dadar/Balado/Rebus)', price: '+5K', icon: 'egg' },
    { name: 'Air Mineral Botol', price: '+5K', icon: 'water_bottle' },
  ]

  const getWaLink = (paketName: string) => {
    const text = encodeURIComponent(
      `Halo Admin Dapoer Iboe! Saya tertarik ingin memesan/tanya tentang *${paketName}* (${billingCycle === 'mingguan' ? 'Paket Mingguan 6 Hari' : 'Paket Bulanan 30 Hari'}). Boleh minta info detail dan cara langganannya?`
    )
    return `https://wa.me/6281363312047?text=${text}`
  }

  return (
    <section id="paket" className="py-20 sm:py-28 bg-[#FCFBF9] relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C83718]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Icon name="loyalty" size={16} />
            Price List 2026
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2D2F] tracking-tight mb-4">
            Pilihan Paket Catering Harian
          </h2>
          <p className="text-sm sm:text-base text-[#785A28] leading-relaxed">
            Pilihan paket lengkap, fleksibel, dan terjangkau untuk kebutuhan makan harian Anda. 
            Semua paket sudah <strong className="text-[#C83718]">GRATIS ONGKIR</strong> sampai ke tempat Anda!
          </p>

          {/* Toggle Billing Cycle */}
          <div className="mt-8 inline-flex items-center p-1.5 bg-[#F0EAE6] rounded-full border border-[#DDD5CE] shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('mingguan')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                billingCycle === 'mingguan'
                  ? 'bg-[#C83718] text-white shadow-md'
                  : 'text-[#785A28] hover:text-[#1E2D2F]'
              }`}
            >
              📅 Mingguan (6 Hari)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('bulanan')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'bulanan'
                  ? 'bg-[#C83718] text-white shadow-md'
                  : 'text-[#785A28] hover:text-[#1E2D2F]'
              }`}
            >
              ⭐ Bulanan (30 Hari)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase font-extrabold tracking-wider">
                Hemat
              </span>
            </button>
          </div>
        </div>

        {/* 3 Main Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                pkg.highlight
                  ? 'bg-white border-2 border-[#C83718] shadow-2xl shadow-[#C83718]/15 ring-4 ring-[#FFDBD1]/50 lg:-translate-y-2'
                  : 'bg-white border border-[#DDD5CE] shadow-md hover:shadow-xl'
              }`}
            >
              {/* Highlight ribbon */}
              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C83718] to-[#DE5B36] text-white px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Icon name="star" size={14} filled />
                  {pkg.badge}
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Header Package */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E2D2F]">{pkg.name}</h3>
                  <span className="text-xs font-bold text-[#C83718] bg-[#FFDBD1] px-2.5 py-1 rounded-xl">
                    {pkg.tagline}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#785A28] mb-4">{pkg.subtitle}</p>
                <p className="text-xs text-[#1E2D2F]/75 mb-6 leading-relaxed">{pkg.description}</p>

                {/* Price block */}
                <div className="p-4 rounded-2xl bg-[#FCFBF9] border border-[#DDD5CE] mb-6">
                  <div className="text-[11px] text-[#785A28] font-bold uppercase tracking-wider mb-1">
                    Harga Paket {billingCycle === 'mingguan' ? 'Mingguan (6 Hari)' : 'Bulanan (30 Hari)'}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-[#C83718]">Rp</span>
                    <span className="text-3xl sm:text-4xl font-black text-[#1E2D2F] tracking-tight">
                      {billingCycle === 'mingguan' ? pkg.prices.mingguan : pkg.prices.bulanan}
                    </span>
                    <span className="text-xs font-medium text-[#785A28]">
                      /{billingCycle === 'mingguan' ? '6 hr' : '30 hr'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#246B34] font-bold mt-1.5 flex items-center gap-1">
                    <Icon name="check_circle" size={14} filled />
                    {pkg.portionInfo}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1E2D2F]/85">
                      <div className="w-5 h-5 rounded-full bg-[#D1E9CA] text-[#0C2009] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon name="check" size={13} />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="p-6 sm:p-8 pt-0 space-y-2.5">
                <a
                  href={`#langganan`}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    pkg.highlight
                      ? 'bg-[#C83718] hover:bg-[#8C2C10] text-white shadow-lg shadow-[#C83718]/25 hover:-translate-y-0.5'
                      : 'bg-[#1E2D2F] hover:bg-black text-white'
                  }`}
                >
                  <Icon name="assignment" size={18} />
                  Daftar Paket Ini
                </a>
                <a
                  href={getWaLink(pkg.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Icon name="chat" size={18} />
                  Konsultasi via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Alacarte, Healthy Food, Sambal Saja & Add-ons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {/* Card 1: Alacarte & Healthy Food */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD5CE] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFDBD1] text-[#C83718] flex items-center justify-center">
                    <Icon name="flatware" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#1E2D2F]">
                      Alacarte & Healthy Food (Pesan Satuan)
                    </h3>
                    <p className="text-xs text-[#785A28]">Menu satuan fleksibel untuk kebutuhan makan kapan saja</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {alacarteItems.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-2xl bg-[#FCFBF9] border border-[#DDD5CE] hover:border-[#C83718]/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C83718] bg-[#FFDBD1]/70 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <Icon name={item.icon} size={18} className="text-[#785A28]" />
                      </div>
                      <h4 className="font-bold text-[#1E2D2F] text-sm mb-1">{item.title}</h4>
                      <p className="text-[11px] text-[#785A28] leading-relaxed mb-3">{item.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-[#DDD5CE]/60 flex items-center justify-between">
                      <span className="text-sm sm:text-base font-black text-[#C83718]">{item.price}</span>
                      <a
                        href={`https://wa.me/6281363312047?text=${encodeURIComponent(`Halo Admin Dapoer Iboe, saya mau order ${item.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#1E2D2F] hover:text-[#C83718] flex items-center gap-1"
                      >
                        Pesan <Icon name="arrow_forward" size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tambahan / Add-ons section */}
            <div className="mt-6 pt-6 border-t border-[#DDD5CE]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#785A28] mb-3 flex items-center gap-1.5">
                <Icon name="add_circle" size={16} className="text-[#C83718]" />
                Menu Tambahan (Add-Ons)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {addons.map((add) => (
                  <div
                    key={add.name}
                    className="p-3.5 rounded-2xl bg-[#FCFBF9] hover:bg-white border border-[#DDD5CE] hover:border-[#C83718]/30 transition-all duration-200 flex items-center gap-3 shadow-xs min-w-0"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#FFDBD1]/70 text-[#C83718] flex items-center justify-center flex-shrink-0">
                      <Icon name={add.icon} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1E2D2F] truncate leading-tight" title={add.name}>
                        {add.name}
                      </p>
                      <p className="text-xs font-black text-[#C83718] mt-0.5">{add.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Sambal Saja Tanpa Nasi */}
          <div className="bg-gradient-to-br from-[#1A2629] via-[#212E32] to-[#1E2D2F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/15">
                <Icon name="local_fire_department" size={14} className="text-[#FFB59E]" />
                Pilihan Spesial
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                Sambal Saja Tanpa Nasi
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-6">
                Cocok bagi Anda yang sudah memasak nasi sendiri di rumah atau kantor dan hanya membutuhkan lauk + sayur + sambal lezat khas Dapoer Iboe.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">
                      Paket Mingguan (6 Hari)
                    </span>
                    <span className="text-xs text-white/90">1x Makan / Hari</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#FFB59E]">Rp 108.000</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">
                      Paket Bulanan (30 Hari)
                    </span>
                    <span className="text-xs text-white/90">1x Makan / Hari</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#FFB59E]">Rp 540.000</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-white/70 mb-4 italic">
                * Pilihan shift bebas: Pagi, Siang, atau Malam.
              </p>
              <a
                href={`https://wa.me/6281363312047?text=${encodeURIComponent('Halo Admin Dapoer Iboe, saya mau order paket Sambal Saja Tanpa Nasi')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-[#C83718] hover:bg-[#DE5B36] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Icon name="chat" size={18} />
                Pesan Sambal Saja
              </a>
            </div>
          </div>
        </div>

        {/* Ketentuan & Info Pengantaran (Banner Merah Dapoer Iboe) */}
        <div className="bg-gradient-to-r from-[#C83718] to-[#8C2C10] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/20">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider mb-2">
                <Icon name="local_shipping" size={16} />
                Ketentuan & Jadwal Pengantaran
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">Layanan Antar Tepat Waktu & Ramah</h3>
            </div>
            <a
              href="https://wa.me/6281363312047"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-white text-[#C83718] hover:bg-[#FCFBF9] font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 flex-shrink-0 active:scale-95"
            >
              <Icon name="support_agent" size={20} />
              Hubungi WA: 081363312047
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 text-xs sm:text-sm">
            {/* Shift Waktu */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-[#FFDBD1]">
                <Icon name="schedule" size={18} />
                Jadwal Pengantaran
              </h4>
              <ul className="space-y-1.5 text-white/90 text-xs">
                <li>• <strong>Pengantaran Pagi:</strong> jam 05:00 - 06:00</li>
                <li>• <strong>Pengantaran Siang:</strong> jam 11:00 - 13:00</li>
                <li>• <strong>Pengantaran Malam:</strong> jam 18:30 - 20:00</li>
                <li className="text-[#FFDBD1] font-bold mt-1">• 🛵 SUDAH FREE ONGKIR!</li>
              </ul>
            </div>

            {/* Kebijakan Skip Catering */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-[#FFDBD1]">
                <Icon name="event_repeat" size={18} />
                Fleksibilitas Skip Catering
              </h4>
              <ul className="space-y-1.5 text-white/90 text-xs">
                <li>• <strong>Jatah skip mingguan:</strong> 1x per minggu</li>
                <li>• <strong>Jatah skip bulanan:</strong> 4x per bulan</li>
                <li>• Untuk skip / ubah jadwal pengantaran boleh <strong>H-1 / di malam harinya</strong></li>
              </ul>
            </div>

            {/* Informasi Menu & Custom */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-[#FFDBD1]">
                <Icon name="restaurant_menu" size={18} />
                Jadwal Menu & Custom
              </h4>
              <ul className="space-y-1.5 text-white/90 text-xs">
                <li>• Menu akan di-share setiap hari <strong>Minggu</strong></li>
                <li>• Setiap hari <strong>Minggu libur pengantaran</strong></li>
                <li>• Untuk <strong>alergi</strong> boleh info ke admin ya 😊</li>
                <li>• Tidak suka pedas? <strong>Cabai bisa dipisah!</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

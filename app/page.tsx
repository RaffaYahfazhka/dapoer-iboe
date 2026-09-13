'use client'

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import CateringPackages from '@/components/CateringPackages'
import MenuTable from '@/components/MenuTable'
import TestimonialsSection from '@/components/TestimonialsSection'
import SubscriptionForm from '@/components/SubscriptionForm'
import CustomerOrderTracker from '@/components/CustomerOrderTracker'
import Icon from '@/components/m3/Icon'

export default function HomePage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      <Navbar />

      {/* ═══════ HERO SECTION ═══════ */}
      <section
        id="beranda"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E2D2F] via-[#263639] to-[#1E2D2F]"
      >
        {/* Radial accent glows */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 30%, rgba(200, 55, 24, 0.35) 0%, transparent 55%),
                             radial-gradient(circle at 75% 75%, rgba(232, 99, 38, 0.2) 0%, transparent 55%)`,
          }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C83718]/20 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-16 right-8 w-80 h-80 bg-[#E86326]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 text-center">
          <div className="animate-fade-in-up">
            {/* Logo */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-8 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl shadow-black/50">
              <Image
                src="/logo.jpg"
                alt="Dapoer Iboe Logo"
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              DAPOER IBOE
            </h1>

            <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto mb-4 font-normal leading-relaxed">
              Catering harian dengan cita rasa{' '}
              <span className="text-[#FFB59E] font-bold">rumahan yang otentik</span>.
              Menu bergizi bervariasi setiap hari, diantar hangat dan tepat waktu.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/85 text-xs font-semibold tracking-widest uppercase mb-10 border border-white/10">
              <Icon name="schedule" size={15} className="text-[#FFB59E]" />
              Senin — Sabtu · Pagi, Siang & Malam
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
              <a
                href="#paket"
                className="w-full sm:w-auto h-13 px-7 bg-gradient-to-r from-[#C83718] via-[#DE5B36] to-[#F97316] hover:from-[#DE5B36] hover:to-[#E86326] text-white font-extrabold rounded-full text-sm transition-all duration-300 shadow-xl shadow-[#C83718]/35 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Icon name="loyalty" size={20} />
                Lihat Paket & Harga
              </a>
              <a
                href="#menu"
                className="w-full sm:w-auto h-13 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-sm backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Icon name="restaurant_menu" size={18} className="text-[#FFB59E]" />
                Menu Mingguan
              </a>
              <a
                href="#tracking"
                className="w-full sm:w-auto h-13 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-sm backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Icon name="radar" size={18} className="text-[#FFB59E]" />
                Lacak Pesanan
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 sm:mt-18 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
            {[
              { value: 'Rp 132rb', label: 'Mulai Mingguan', icon: 'payments' },
              { value: 'Free Ongkir', label: 'Antar Gratis', icon: 'local_shipping' },
              { value: '100% Segar', label: 'Bahan Pilihan', icon: 'eco' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="py-4 px-3 sm:py-5 sm:px-4 rounded-3xl bg-white/8 hover:bg-white/12 backdrop-blur-md border border-white/15 text-center transition-all duration-300 flex flex-col items-center justify-center shadow-lg shadow-black/10"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                  <Icon name={stat.icon} size={18} className="text-[#FFDBD1]" />
                </div>
                <p className="text-sm sm:text-base font-black text-white leading-tight">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-white/70 font-medium tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#paket"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors animate-bounce"
          aria-label="Scroll ke daftar paket"
        >
          <Icon name="expand_more" size={30} />
        </a>
      </section>

      {/* ═══════ PAKET CATERING ═══════ */}
      <CateringPackages />

      {/* ═══════ MENU MINGGUAN ═══════ */}
      <section id="menu" className="py-20 sm:py-28 bg-[#FCFBF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <Icon name="restaurant" size={16} />
              Variasi Menu Mingguan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2D2F] mb-3 tracking-tight">
              Sajian Istimewa Setiap Hari
            </h2>
            <p className="text-sm sm:text-base text-[#785A28] max-w-xl mx-auto">
              Koki Dapoer Iboe meracik resep masakan rumahan berbeda setiap harinya dengan bahan segar dan higienis.
            </p>
          </div>

          <MenuTable />
        </div>
      </section>

      {/* ═══════ TESTIMONI ═══════ */}
      <TestimonialsSection />

      {/* ═══════ LIVE ORDER TRACKER ═══════ */}
      <section id="tracking" className="py-20 sm:py-28 bg-[#FCFBF9] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D1E9CA] text-[#0C2009] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <Icon name="radar" size={16} />
              Transparansi Pengiriman
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2D2F] mb-3 tracking-tight">
              Pantau Pesanan Anda
            </h2>
            <p className="text-sm sm:text-base text-[#785A28] max-w-xl mx-auto">
              Lacak posisi pesanan makanan Anda dari dapur hingga sampai ke tangan Anda.
            </p>
          </div>

          <CustomerOrderTracker />
        </div>
      </section>

      {/* ═══════ LANGGANAN / FORM ═══════ */}
      <section id="langganan" className="py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left Column: Keunggulan */}
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                <Icon name="loyalty" size={16} />
                Solusi Makan Harian Praktis
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2D2F] mb-5 tracking-tight">
                Langganan Catering Dapoer Iboe
              </h2>
              <p className="text-[#1E2D2F]/65 text-sm sm:text-base mb-8 leading-relaxed">
                Nikmati kenyamanan makan enak tanpa repot belanja, memasak, dan mencuci piring.
                Lengkapi formulir di samping, tim admin kami akan segera menghubungi Anda.
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: 'restaurant_menu',
                    title: 'Menu Bervariasi & Bergizi',
                    desc: 'Menu berbeda setiap hari dari Senin hingga Sabtu, anti bosan.',
                  },
                  {
                    icon: 'local_shipping',
                    title: 'Pengantaran Tepat Waktu',
                    desc: 'Diantar langsung ke meja kantor atau pagar rumah sebelum jam makan.',
                  },
                  {
                    icon: 'payments',
                    title: 'Harga Terjangkau & Hemat',
                    desc: 'Paket langganan hemat dengan porsi pas dan higienitas terjamin.',
                  },
                  {
                    icon: 'support_agent',
                    title: 'Customer Care Responsif',
                    desc: 'Mudah ganti jadwal atau libur antaran via pesan WhatsApp.',
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F0EAE6]/50 hover:bg-[#F0EAE6] transition-all duration-200 border border-[#DDD5CE]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C83718] to-[#DE5B36] text-white flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E2D2F] text-sm">{feature.title}</h3>
                      <p className="text-[#785A28] text-xs mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Form */}
            <div>
              <SubscriptionForm />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TENTANG KAMI ═══════ */}
      <section id="tentang" className="py-20 sm:py-28 bg-[#FCFBF9] border-t border-[#DDD5CE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Icon name="info" size={16} />
            Cerita Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E2D2F] mb-5 tracking-tight">
            Tentang Dapoer Iboe
          </h2>
          <p className="text-[#1E2D2F]/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-12">
            Dapoer Iboe berawal dari kerinduan akan kehangatan masakan seorang ibu. Kami berkomitmen menyajikan hidangan rumahan autentik berkualitas tinggi bagi para profesional, keluarga, dan mahasiswa.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: 'soup_kitchen', title: 'Resep Rumahan', desc: 'Racikan bumbu tradisional kaya rasa seperti buatan ibu tercinta.' },
              { icon: 'eco', title: 'Bahan Segar Alami', desc: 'Bahan baku berkualitas, tanpa bahan pengawet sintetis.' },
              { icon: 'favorite', title: 'Dibuat Penuh Cinta', desc: 'Setiap kotak makanan disiapkan dengan higienis dan sepenuh hati.' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-white rounded-3xl border border-[#DDD5CE] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFDBD1] to-[#FFE8E0] text-[#C83718] flex items-center justify-center">
                  <Icon name={item.icon} size={26} />
                </div>
                <h3 className="font-bold text-[#1E2D2F] mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-[#785A28] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-[#1E2D2F] text-white py-12 border-t border-[#263639]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/15 flex-shrink-0">
                <Image src="/logo.jpg" alt="Dapoer Iboe Logo" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-wide text-white/90">
                  DAPOER IBOE
                </h3>
                <p className="text-white/50 text-xs">Catering Harian & Tracking Pengiriman</p>
              </div>
            </div>

            <div className="text-xs text-white/40">
              © {new Date().getFullYear()} Dapoer Iboe. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

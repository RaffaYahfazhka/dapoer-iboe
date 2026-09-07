'use client'

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import MenuTable from '@/components/MenuTable'
import SubscriptionForm from '@/components/SubscriptionForm'
import CustomerOrderTracker from '@/components/CustomerOrderTracker'
import Icon from '@/components/m3/Icon'

export default function HomePage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section
        id="beranda"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2D160F] via-[#4D1B0B] to-[#8C2C10]"
      >
        {/* Subtle Radial Glows */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 181, 158, 0.4) 0%, transparent 60%),
                             radial-gradient(circle at 80% 80%, rgba(209, 233, 202, 0.3) 0%, transparent 60%)`,
          }}
        />

        {/* Ambient floating blobs */}
        <div className="absolute top-24 left-10 w-72 h-72 bg-[#B8421E]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4E6746]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 text-center">
          <div className="animate-fade-in-up">
            {/* Logo */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl shadow-black/50">
              <Image
                src="/logo.jpg"
                alt="Dapoer Iboe Logo"
                fill
                className="object-cover"
                sizes="160px"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              DAPOER IBOE
            </h1>

            <p className="text-base sm:text-xl text-white/85 max-w-2xl mx-auto mb-4 font-normal leading-relaxed">
              Catering harian dengan cita rasa <span className="text-[#FFB59E] font-bold">rumahan yang otentik</span>. 
              Menu bergizi bervariasi setiap hari, diantar hangat dan tepat waktu langsung ke rumah atau kantor Anda.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold tracking-widest uppercase mb-10 border border-white/15">
              <Icon name="schedule" size={16} className="text-[#FFB59E]" />
              Senin — Sabtu · Siang & Malam
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <a
                href="#langganan"
                className="w-full sm:w-auto px-8 py-4 bg-[#B8421E] hover:bg-[#DE5B36] text-white font-bold rounded-full text-base transition-all duration-300 shadow-xl shadow-[#B8421E]/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                <Icon name="local_mall" size={20} />
                Daftar Langganan
              </a>
              <a
                href="#tracking"
                className="w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-bold rounded-full text-base backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
              >
                <Icon name="radar" size={20} className="text-[#FFB59E]" />
                Lacak Pesanan
              </a>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="mt-16 sm:mt-24 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
            {[
              { value: '6 Hari', label: 'Senin - Sabtu', icon: 'date_range' },
              { value: '2x Shift', label: 'Siang & Malam', icon: 'routine' },
              { value: '100% Segar', label: 'Bahan Pilihan', icon: 'eco' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 sm:p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 text-center flex flex-col items-center justify-center"
              >
                <Icon name={stat.icon} size={20} className="text-[#FFB59E] mb-1" />
                <p className="text-base sm:text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-white/70 tracking-wide mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll down indicator */}
        <a
          href="#menu"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
          aria-label="Scroll ke menu"
        >
          <Icon name="expand_more" size={32} />
        </a>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 sm:py-28 bg-[#FCF8F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3">
              <Icon name="restaurant" size={16} />
              Variasi Menu Mingguan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#221916] mb-3 tracking-tight">
              Sajian Istimewa Setiap Hari
            </h2>
            <p className="text-xs sm:text-base text-[#785A28] max-w-xl mx-auto">
              Koki Dapoer Iboe meracik resep masakan rumahan berbeda setiap harinya dengan bahan segar dan higienis.
            </p>
          </div>

          <MenuTable />
        </div>
      </section>

      {/* Live Order Tracker Section */}
      <section id="tracking" className="py-20 sm:py-28 bg-[#F5ECE8] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D1E9CA] text-[#0C2009] text-xs font-bold uppercase tracking-wider mb-3">
              <Icon name="radar" size={16} />
              Transparansi Pengiriman
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#221916] mb-3 tracking-tight">
              Pantau Pesanan Anda
            </h2>
            <p className="text-xs sm:text-base text-[#785A28] max-w-xl mx-auto">
              Lacak posisi pesanan makanan Anda dari dapur hingga sampai ke tangan Anda dengan tahapan yang jelas.
            </p>
          </div>

          <CustomerOrderTracker />
        </div>
      </section>

      {/* Subscription Section */}
      <section id="langganan" className="py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left Column: Keunggulan */}
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3">
                <Icon name="loyalty" size={16} />
                Solusi Makan Harian Praktis
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#221916] mb-5 tracking-tight">
                Langganan Catering Dapoer Iboe
              </h2>
              <p className="text-[#221916]/70 text-sm sm:text-base mb-8 leading-relaxed">
                Nikmati kenyamanan makan enak tanpa repot belanja, memasak, dan mencuci piring. Lengkapi formulir di samping, tim admin kami akan segera menghubungi Anda.
              </p>

              <div className="space-y-4">
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
                    className="flex items-start gap-4 p-4 rounded-3xl bg-[#F5ECE8]/60 hover:bg-[#F5ECE8] transition-all duration-200 border border-[#E8E0DC]"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#B8421E] text-white flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon} size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#221916] text-sm">{feature.title}</h3>
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

      {/* About Section */}
      <section id="tentang" className="py-20 sm:py-28 bg-[#FCF8F6] border-t border-[#E8E0DC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDBD1] text-[#3C0A00] text-xs font-bold uppercase tracking-wider mb-3">
            <Icon name="info" size={16} />
            Cerita Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#221916] mb-5 tracking-tight">
            Tentang Dapoer Iboe
          </h2>
          <p className="text-[#221916]/75 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-12">
            Dapoer Iboe berawal dari kerinduan akan kehangatan masakan seorang ibu. Kami berkomitmen menyajikan hidangan rumahan autentik berkualitas tinggi bagi para profesional, keluarga, dan mahasiswa di tengah kesibukan harian kota.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: 'soup_kitchen', title: 'Resep Rumahan', desc: 'Racikan bumbu tradisional kaya rasa seperti buatan ibu tercinta.' },
              { icon: 'eco', title: 'Bahan Segar Alami', desc: 'Bahan baku berkualitas, tanpa bahan pengawet sintetis.' },
              { icon: 'favorite', title: 'Dibuat Penuh Cinta', desc: 'Setiap kotak makanan disiapkan dengan higienis dan sepenuh hati.' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-white rounded-3xl border border-[#E8E0DC] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#FFDBD1] text-[#B8421E] flex items-center justify-center">
                  <Icon name={item.icon} size={26} />
                </div>
                <h3 className="font-bold text-[#221916] mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-[#785A28] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#191C1E] text-white py-12 border-t border-[#3A3E43]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
                <Image src="/logo.jpg" alt="Dapoer Iboe Logo" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-wide text-[#E1E3E5]">
                  DAPOER IBOE
                </h3>
                <p className="text-[#8E9196] text-xs">Catering Harian & Tracking Pengiriman</p>
              </div>
            </div>

            <div className="text-xs text-[#8E9196]">
              © {new Date().getFullYear()} Dapoer Iboe. All rights reserved. Built with Material Design 3.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

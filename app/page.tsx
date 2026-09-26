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

      {/* ═══════ HERO SECTION — Asymmetric Editorial Split ═══════ */}
      <section
        id="beranda"
        className="relative min-h-screen flex items-center overflow-hidden bg-[#1E2D2F]"
      >
        {/* Layered ambient glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(ellipse 60% 50% at 15% 50%, rgba(200, 55, 24, 0.2) 0%, transparent 70%),
                             radial-gradient(ellipse 50% 60% at 85% 35%, rgba(232, 99, 38, 0.12) 0%, transparent 70%),
                             radial-gradient(ellipse 40% 40% at 50% 90%, rgba(200, 55, 24, 0.08) 0%, transparent 60%)`,
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#C83718]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#E86326]/[0.06] rounded-full blur-[120px] pointer-events-none" />

        {/* Fine grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23a)\'/%3E%3C/svg%3E")' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28 sm:py-36 lg:py-0 lg:min-h-screen lg:flex lg:items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* LEFT — Editorial Copy */}
            <div className="animate-fade-in-up">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-md text-white/70 text-[11px] font-semibold tracking-[0.12em] uppercase mb-6 border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB59E] animate-pulse" />
                Senin — Sabtu · Pagi, Siang & Malam
              </div>

              {/* Main Headline — Editorial, Emotional */}
              <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
                Hangatnya Masakan Ibu,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB59E] via-[#FFDBD1] to-[#FFB59E]">
                  Tersaji di Mejamu
                </span>{' '}
                Setiap Hari
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-white/55 max-w-lg mb-8 leading-relaxed font-normal">
                Menu bergizi bervariasi, diolah dari bahan segar pilihan tanpa pengawet. Diantar hangat langsung ke rumah atau kantormu.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                <a
                  href="#paket"
                  className="group w-full sm:w-auto h-12 px-7 bg-gradient-to-r from-[#C83718] to-[#DE5B36] text-white font-extrabold rounded-xl text-sm transition-all duration-300 shadow-xl shadow-[#C83718]/25 flex items-center justify-center gap-2 whitespace-nowrap tactile-press animate-glow-pulse"
                >
                  <Icon name="loyalty" size={19} />
                  Lihat Paket & Harga
                  <Icon name="arrow_forward" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#tracking"
                  className="w-full sm:w-auto h-12 px-6 bg-white/[0.07] hover:bg-white/[0.12] text-white/90 font-bold rounded-xl text-sm backdrop-blur-md border border-white/[0.1] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap tactile-press"
                >
                  <Icon name="radar" size={17} className="text-[#FFB59E]" />
                  Lacak Pesanan
                </a>
              </div>

              {/* Bento Pill Stats Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  { value: 'Free Ongkir', icon: 'local_shipping' },
                  { value: '100% Bahan Segar', icon: 'eco' },
                ].map((stat) => (
                  <div
                    key={stat.value}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.1]"
                  >
                    <Icon name={stat.icon} size={15} className="text-[#FFB59E]" />
                    <span className="text-[11px] font-bold text-white/80 whitespace-nowrap">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Interactive Floating Food Showcase */}
            <div className="relative hidden lg:flex items-center justify-center" style={{ minHeight: 480 }}>
              {/* Large ambient glow behind cards */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C83718]/15 rounded-full blur-[80px] pointer-events-none" />

              {/* Floating Card 1 — Main food showcase */}
              <div className="absolute top-6 right-0 w-72 animate-hero-float-1">
                <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 shadow-2xl">
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-[#263639]">
                    <Image
                      src="/hero-dish.jpg"
                      alt="Paket Nasi Lengkap Ayam Goreng Rempah Dapoer Iboe"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="288px"
                      priority
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Menu Hari Ini
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/95 text-sm font-bold tracking-tight">Nasi Ayam Rempah Nusantara</p>
                      <p className="text-white/50 text-[11px]">Tumis Buncis Tempe · Perkedel · Sambal</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300">
                      <Icon name="star" size={13} filled />
                      <span className="text-xs font-bold">4.9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 — Delivery ETA */}
              <div className="absolute bottom-16 left-0 animate-hero-float-2">
                <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 shadow-2xl w-56">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#246B34]/80 text-white flex items-center justify-center">
                      <Icon name="two_wheeler" size={22} />
                    </div>
                    <div>
                      <p className="text-white/90 text-xs font-bold">Dalam Perjalanan</p>
                      <p className="text-white/45 text-[10px]">Estimasi 15–30 menit</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-[#246B34] to-[#16A34A] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Card 3 — Live rating pulse */}
              <div className="absolute top-1/2 -translate-y-1/2 left-8 animate-float">
                <div className="bg-white/[0.1] backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-3 shadow-xl flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon key={s} name="star" size={13} filled />
                    ))}
                  </div>
                  <div className="h-4 w-px bg-white/15" />
                  <span className="text-white/80 text-[11px] font-bold">5.0 Rating</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#paket"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors animate-bounce"
          aria-label="Scroll ke daftar paket"
        >
          <Icon name="expand_more" size={28} />
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
                    className="group flex items-start gap-3.5 p-4 rounded-2xl bg-[#F0EAE6]/50 hover:bg-[#F0EAE6] transition-all duration-200 border border-[#DDD5CE] tactile-press"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C83718] to-[#DE5B36] text-white flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
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
                className="group p-6 bg-white rounded-3xl border border-[#DDD5CE] shadow-sm hover:shadow-lg transition-all duration-300 tactile-press"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFDBD1] to-[#FFE8E0] text-[#C83718] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <Icon name={item.icon} size={26} />
                </div>
                <h3 className="font-bold text-[#1E2D2F] mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-[#785A28] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER — Modernized ═══════ */}
      <footer className="bg-[#1E2D2F] text-white relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#C83718]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 flex-shrink-0">
                <Image src="/logo.jpg" alt="Dapoer Iboe Logo" fill className="object-cover" sizes="40px" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-white/90">
                  DAPOER IBOE
                </h3>
                <p className="text-white/40 text-[11px]">Catering Harian</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/6281363312047"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-[11px] font-bold hover:bg-white/[0.1] hover:text-white transition-all duration-200"
              >
                <Icon name="chat" size={14} />
                WhatsApp
              </a>
              <span className="text-[11px] text-white/30">
                © {new Date().getFullYear()} Dapoer Iboe
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

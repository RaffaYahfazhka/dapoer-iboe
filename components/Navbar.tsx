'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/m3/Icon'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#beranda', label: 'Beranda', icon: 'home' },
    { href: '#paket', label: 'Paket Catering', icon: 'loyalty' },
    { href: '#menu', label: 'Menu Mingguan', icon: 'restaurant_menu' },
    { href: '#testimoni', label: 'Testimoni', icon: 'reviews' },
    { href: '#tracking', label: 'Lacak Pesanan', icon: 'radar' },
    { href: '#langganan', label: 'Langganan', icon: 'event_note' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-md py-2.5 border-b border-[#DDD5CE]'
          : 'bg-gradient-to-b from-black/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/30 group-hover:ring-[#C83718] transition-all flex-shrink-0 shadow-md">
              <Image
                src="/logo.jpg"
                alt="Logo Dapoer Iboe"
                fill
                className="object-cover"
                sizes="44px"
                priority
              />
            </div>
            <div>
              <h1
                className={`font-black text-lg sm:text-xl tracking-tight leading-none transition-colors ${
                  scrolled ? 'text-[#1E2D2F]' : 'text-white'
                }`}
              >
                DAPOER IBOE
              </h1>
              <p
                className={`text-[10px] tracking-widest uppercase font-semibold mt-0.5 transition-colors ${
                  scrolled ? 'text-[#785A28]' : 'text-white/80'
                }`}
              >
                Catering Harian Premium
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  scrolled
                    ? 'text-[#1E2D2F]/75 hover:text-[#C83718] hover:bg-[#F0EAE6]'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <Icon name={link.icon} size={15} />
                {link.label}
              </a>
            ))}

            <Link
              href="/admin"
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-[#C83718] to-[#DE5B36] hover:from-[#8C2C10] hover:to-[#C83718] text-white text-xs font-bold rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Icon name="admin_panel_settings" size={16} />
              Admin Portal
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/admin"
              className={`p-2 rounded-full transition-colors ${
                scrolled ? 'text-[#C83718] hover:bg-[#F0EAE6]' : 'text-white hover:bg-white/10'
              }`}
              title="Admin"
            >
              <Icon name="admin_panel_settings" size={22} />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-full transition-colors ${
                scrolled ? 'text-[#1E2D2F] hover:bg-[#F0EAE6]' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle navigation menu"
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={26} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pt-2 pb-4 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-[#DDD5CE] space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-[#1E2D2F] hover:bg-[#F0EAE6] hover:text-[#C83718] transition-all"
                >
                  <Icon name={link.icon} size={18} className="text-[#C83718]" />
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-[#DDD5CE]">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#C83718] to-[#DE5B36] text-white rounded-2xl text-xs font-bold shadow-md"
                >
                  <Icon name="admin_panel_settings" size={18} />
                  Buka Portal Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

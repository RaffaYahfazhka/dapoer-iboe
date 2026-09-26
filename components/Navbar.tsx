'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/m3/Icon'

const NAV_LINKS = [
  { href: '#beranda', label: 'Beranda', icon: 'home' },
  { href: '#paket', label: 'Paket', icon: 'loyalty' },
  { href: '#menu', label: 'Menu', icon: 'restaurant_menu' },
  { href: '#testimoni', label: 'Testimoni', icon: 'reviews' },
  { href: '#tracking', label: 'Lacak', icon: 'radar' },
  { href: '#langganan', label: 'Langganan', icon: 'event_note' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#beranda')
  const indicatorRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Scroll listener for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.replace('#', ''))
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${id}`)
          }
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Move the sliding pill indicator to the active link
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return
    const activeLink = navRef.current.querySelector(
      `[data-section="${activeSection}"]`
    ) as HTMLElement | null
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      indicatorRef.current.style.left = `${linkRect.left - navRect.left}px`
      indicatorRef.current.style.width = `${linkRect.width}px`
      indicatorRef.current.style.opacity = '1'
    }
  }, [activeSection])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-2' : 'py-3.5'
      }`}
    >
      {/* Floating Island Container */}
      <div
        className={`max-w-5xl mx-auto px-3 sm:px-4 transition-all duration-500 ${
          scrolled ? 'mx-3 sm:mx-auto' : ''
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-5 py-2.5 transition-all duration-500 ${
            scrolled
              ? 'bg-white/80 backdrop-blur-2xl shadow-lg shadow-black/[0.06] border border-[#DDD5CE]/80'
              : 'bg-white/[0.06] backdrop-blur-md border border-white/[0.08]'
          }`}
        >
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className={`relative w-9 h-9 rounded-full overflow-hidden transition-all duration-300 flex-shrink-0 ${
              scrolled
                ? 'ring-2 ring-[#DDD5CE] group-hover:ring-[#C83718]'
                : 'ring-2 ring-white/25 group-hover:ring-white/60'
            }`}>
              <Image
                src="/logo.jpg"
                alt="Logo Dapoer Iboe"
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1
                className={`font-black text-sm tracking-tight leading-none transition-colors duration-300 ${
                  scrolled ? 'text-[#1E2D2F]' : 'text-white'
                }`}
              >
                DAPOER IBOE
              </h1>
              <p
                className={`text-[9px] tracking-[0.15em] uppercase font-semibold mt-0.5 transition-colors duration-300 ${
                  scrolled ? 'text-[#785A28]' : 'text-white/60'
                }`}
              >
                Catering Harian
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links with sliding indicator */}
          <div className="hidden lg:flex items-center gap-0.5 relative" ref={navRef}>
            {/* Sliding active indicator pill */}
            <div
              ref={indicatorRef}
              className={`absolute top-0 h-full rounded-xl transition-all duration-300 ease-out opacity-0 pointer-events-none ${
                scrolled ? 'bg-[#F0EAE6]' : 'bg-white/12'
              }`}
            />

            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  data-section={link.href}
                  className={`relative z-10 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    scrolled
                      ? isActive
                        ? 'text-[#C83718]'
                        : 'text-[#1E2D2F]/60 hover:text-[#C83718]'
                      : isActive
                      ? 'text-white'
                      : 'text-white/55 hover:text-white/90'
                  }`}
                >
                  <Icon name={link.icon} size={14} filled={isActive} />
                  {link.label}
                </a>
              )
            })}
          </div>

          {/* Desktop CTA + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop CTA */}
            <a
              href="#langganan"
              className={`hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-extrabold transition-all duration-300 tactile-press ${
                scrolled
                  ? 'bg-[#C83718] text-white shadow-md shadow-[#C83718]/20 hover:bg-[#A82D14]'
                  : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
              }`}
            >
              <Icon name="edit_note" size={16} />
              Pesan Sekarang
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${
                scrolled
                  ? 'text-[#1E2D2F] hover:bg-[#F0EAE6]'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle navigation menu"
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-2 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl border border-[#DDD5CE] space-y-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#FFDBD1]/60 text-[#C83718]'
                        : 'text-[#1E2D2F] hover:bg-[#F0EAE6] hover:text-[#C83718]'
                    }`}
                  >
                    <Icon name={link.icon} size={18} filled={isActive} className={isActive ? 'text-[#C83718]' : 'text-[#785A28]'} />
                    {link.label}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C83718]" />
                    )}
                  </a>
                )
              })}

              {/* Mobile CTA */}
              <div className="pt-2 mt-1 border-t border-[#DDD5CE]">
                <a
                  href="#langganan"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#C83718] hover:bg-[#A82D14] text-white rounded-xl text-xs font-extrabold shadow-md transition-all duration-200 active:scale-[0.97]"
                >
                  <Icon name="edit_note" size={18} />
                  Pesan Sekarang
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

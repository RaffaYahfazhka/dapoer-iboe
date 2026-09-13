'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import Icon from '@/components/m3/Icon'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navTabs = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/pelanggan', label: 'Pelanggan', icon: 'group' },
    { href: '/admin/menu', label: 'Menu', icon: 'restaurant_menu' },
    { href: '/admin/testimoni', label: 'Testi', icon: 'reviews' },
    { href: '/', label: 'Web', icon: 'storefront' },
  ]

  return (
    <div className="min-h-screen bg-[#111416] text-[#E1E3E5]">
      {/* Desktop & Drawer Sidebar */}
      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Top Header (Small App Bar) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#111416]/95 backdrop-blur-xl border-b border-[#3A3E43]/60 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-full text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all"
          aria-label="Buka menu navigasi"
        >
          <Icon name="menu" size={24} />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#FFB59E]/40">
            <Image src="/logo.jpg" alt="Logo" fill className="object-cover" sizes="28px" />
          </div>
          <span className="text-xs font-bold tracking-wider text-[#E1E3E5]">
            DAPOER IBOE ADMIN
          </span>
        </div>

        <Link
          href="/"
          className="p-2 rounded-full text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all"
          title="Ke Website"
        >
          <Icon name="arrow_outward" size={20} />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-10">
        <div className="px-3.5 py-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* M3 Mobile Bottom Navigation Bar (Handphone Ergonomics) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#191C1E]/95 backdrop-blur-xl border-t border-[#3A3E43]/60 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navTabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-[#FFB59E]' : 'text-[#8E9196] hover:text-[#E1E3E5]'
              }`}
            >
              <div
                className={`px-4 py-1 rounded-full transition-all ${
                  isActive ? 'bg-[#70260D]' : 'bg-transparent'
                }`}
              >
                <Icon name={tab.icon} size={22} filled={isActive} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

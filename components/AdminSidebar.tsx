'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Icon from '@/components/m3/Icon'

interface AdminSidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    href: '/admin/pelanggan',
    label: 'Pelanggan',
    icon: 'group',
  },
  {
    href: '/admin/menu',
    label: 'Menu Mingguan',
    icon: 'restaurant_menu',
  },
]

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111416] text-[#E1E3E5]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#3A3E43]/60">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#FFB59E]/30 group-hover:ring-[#FFB59E] transition-all flex-shrink-0">
            <Image src="/logo.jpg" alt="Dapoer Iboe" fill className="object-cover" sizes="44px" priority />
          </div>
          <div>
            <h2 className="font-extrabold text-[#E1E3E5] text-sm tracking-wide group-hover:text-[#FFB59E] transition-colors">
              DAPOER IBOE
            </h2>
            <p className="text-[10px] text-[#8E9196] font-semibold tracking-wider uppercase">
              Management Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <p className="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#8E9196]/80">
          Menu Utama
        </p>

        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#70260D] text-[#FFB59E] shadow-sm'
                  : 'text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326]'
              }`}
            >
              <Icon name={item.icon} size={22} filled={isActive} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-[#FFB59E]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Exit to Public Site */}
      <div className="p-4 border-t border-[#3A3E43]/60">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-xs font-semibold text-[#8E9196] hover:text-[#E1E3E5] hover:bg-[#202326] transition-all"
        >
          <Icon name="arrow_back" size={16} />
          Kembali ke Website
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 border-r border-[#3A3E43]/60 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (When hamburger clicked) */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
            onClick={onClose}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 border-r border-[#3A3E43] z-50 animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}

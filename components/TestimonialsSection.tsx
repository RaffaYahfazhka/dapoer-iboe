'use client'

import { useState, useEffect } from 'react'
import Icon from '@/components/m3/Icon'
import { TestimonialItem, getStoredTestimonials } from '@/lib/testimonials'

export default function TestimonialsSection() {
  const [items, setItems] = useState<TestimonialItem[]>(() => getStoredTestimonials())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getStoredTestimonials()
      setItems(updated)
    }
    window.addEventListener('dapoer_iboe_testimonials_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('dapoer_iboe_testimonials_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const safeIndex = items.length > 0 ? Math.min(currentIndex, items.length - 1) : 0
  const current = items[safeIndex]
  const totalCount = items.length

  const handleSelect = (idx: number) => {
    if (idx === currentIndex) return
    setIsFading(true)
    setTimeout(() => {
      setCurrentIndex(idx)
      setIsFading(false)
    }, 180)
  }

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + totalCount) % totalCount
    handleSelect(nextIdx)
  }

  const handleNext = () => {
    if (totalCount === 0) return
    const nextIdx = (currentIndex + 1) % totalCount
    handleSelect(nextIdx)
  }

  if (totalCount === 0 || !current) return null

  return (
    <section
      id="testimoni"
      className="py-20 sm:py-28 bg-[#FCFBF9] relative overflow-hidden border-t border-[#DDD5CE]"
    >
      {/* Subtle background glow */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-[#C83718]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-[#E86326]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 border-b border-[#DDD5CE]/80 pb-6">
          <div className="max-w-2xl">
            {/* Eyebrow Badge */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#FFDBD1] text-[#3C0A00] border border-[#C83718]/15 mb-3 shadow-sm">
              <Icon name="reviews" size={16} className="text-[#C83718]" />
              Customer Stories & Testimonials
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2D2F] tracking-tight leading-tight">
              Kata Mereka yang Sudah Mencicipi
            </h2>

            {/* Subheading */}
            <p className="mt-3 text-[#785A28] text-sm sm:text-base leading-relaxed">
              Pilih hidangan favorit atau ulasan di samping untuk membaca pengalaman kuliner autentik
              dari para penikmat catering Dapoer Iboe.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center self-start md:self-end gap-3">
            {/* Counter */}
            <div className="text-sm font-semibold tracking-widest text-[#1E2D2F]/80 mr-2 font-mono">
              <span className="text-[#C83718] text-base font-bold">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-[#DDD5CE] mx-1">/</span>
              <span className="text-[#785A28]">
                {String(totalCount).padStart(2, '0')}
              </span>
            </div>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Previous Testimonial"
              className="w-11 h-11 rounded-full border border-[#1E2D2F]/20 flex items-center justify-center text-[#1E2D2F] hover:bg-[#C83718] hover:text-white hover:border-[#C83718] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C83718]/40 shadow-sm"
            >
              <Icon name="chevron_left" size={22} />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              type="button"
              aria-label="Next Testimonial"
              className="w-11 h-11 rounded-full border border-[#1E2D2F]/20 flex items-center justify-center text-[#1E2D2F] hover:bg-[#C83718] hover:text-white hover:border-[#C83718] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C83718]/40 shadow-sm"
            >
              <Icon name="chevron_right" size={22} />
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Hero Featured Card (Left / Main) */}
          <div className="lg:col-span-7 xl:col-span-8 flex">
            <article className="relative w-full rounded-3xl overflow-hidden min-h-[500px] md:min-h-[580px] shadow-2xl flex flex-col justify-between border border-[#1E2D2F]/10 group">
              {/* Background Dish Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.bgImage}
                alt={current.dishName}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 duration-700 transition-transform pointer-events-none"
              />

              {/* Multi-stage dark gradient overlays for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Top Dish Badge */}
              <div className="relative z-10 p-6 sm:p-8">
                <span className="inline-block px-3.5 py-1.5 text-xs tracking-widest font-semibold uppercase rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm transition-all duration-300">
                  {current.badge}
                </span>
              </div>

              {/* Bottom Review Content */}
              <div className="relative z-10 p-6 sm:p-9 pt-12 flex flex-col justify-end">
                <div className="mb-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#FFDBD1]">
                    {current.dishName}
                  </span>
                </div>

                {/* Quote */}
                <blockquote
                  className={`text-white text-lg sm:text-xl md:text-2xl font-normal leading-relaxed tracking-normal mb-6 max-w-2xl drop-shadow-sm transition-all duration-300 ${
                    isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}
                >
                  {current.quote}
                </blockquote>

                {/* Author & Rating Footer */}
                <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-white/20">
                  {/* Author Profile */}
                  <div
                    className={`flex items-center gap-3.5 transition-all duration-300 ${
                      isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={current.avatarImage}
                      alt={current.authorName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/90 shadow-md flex-shrink-0 bg-white"
                    />
                    <div>
                      <h3 className="text-white font-bold text-base tracking-wide">
                        {current.authorName}
                      </h3>
                      <p className="text-stone-300 text-xs font-medium">
                        {current.authorRole}
                      </p>
                    </div>
                  </div>

                  {/* 5-Star Rating Pill */}
                  <div className="flex items-center gap-1.5 text-amber-400 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 self-start sm:self-auto shadow-sm">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="star" size={16} filled className="text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white ml-1">5.0</span>
                  </div>
                </footer>
              </div>
            </article>
          </div>

          {/* Right Side Column: Clickable List + Mini CTA */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-6">
            <div>
              {/* List Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#785A28]">
                  Daftar Ulasan Hidangan Lainnya
                </h3>
                <span className="text-xs text-[#C83718] font-bold cursor-default">
                  {totalCount} Pilihan Menu
                </span>
              </div>

              {/* Vertical Selectable Stack */}
              <div className="space-y-3" role="tablist" aria-label="Pilih ulasan hidangan">
                {items.map((item, idx) => {
                  const isActive = idx === safeIndex
                  return (
                    <button
                      key={item.id || item.dishName}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 ${
                        isActive
                          ? 'bg-white border-[#C83718] shadow-md ring-2 ring-[#C83718]/20 -translate-y-0.5'
                          : 'bg-white/70 border-[#DDD5CE] hover:bg-white hover:border-[#C83718]/40'
                      }`}
                    >
                      {/* Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.bgImage}
                        alt={item.dishName}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-sm font-bold truncate ${
                              isActive ? 'text-[#C83718]' : 'text-[#1E2D2F]'
                            }`}
                          >
                            {item.dishName}
                          </h4>
                          <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5 flex-shrink-0">
                            ★ 5.0
                          </span>
                        </div>
                        <p className="text-xs text-[#785A28] font-medium">{item.authorName}</p>
                        <p className="text-[11px] text-[#1E2D2F]/60 truncate mt-0.5">
                          {item.quote.replace(/[“”"]/g, '').slice(0, 45)}...
                        </p>
                      </div>

                      {/* Status Indicator Dot */}
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                          isActive ? 'bg-[#C83718]' : 'bg-transparent'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Compact Reservation CTA Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1E2D2F] via-[#263639] to-[#1E2D2F] text-white shadow-xl relative overflow-hidden border border-white/10">
              {/* Decorative circle glow */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#C83718]/30 blur-xl pointer-events-none" />

              <div className="relative z-10">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#FFDBD1] block mb-1">
                  KATERING HARIAN RUMAHAN
                </span>
                <h4 className="text-base sm:text-lg font-black mb-2 tracking-tight">
                  Tertarik Merasakan Kelezatan Ini?
                </h4>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">
                  Dapatkan pengalaman makan siang & malam nikmat tanpa repot masak bersama Dapoer Iboe.
                </p>
                <a
                  href="#langganan"
                  className="inline-flex items-center justify-center w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-[#C83718] to-[#DE5B36] hover:from-[#DE5B36] hover:to-[#E86326] text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-[#C83718]/30 active:scale-98 gap-1.5"
                >
                  Langganan Sekarang
                  <Icon name="arrow_forward" size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


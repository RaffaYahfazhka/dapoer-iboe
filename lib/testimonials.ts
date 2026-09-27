import { supabase } from './supabase'

export interface TestimonialItem {
  id: string
  badge: string
  dishName: string
  quote: string
  authorName: string
  authorRole: string
  bgImage: string
  avatarImage: string
  rating: number
  featured?: boolean
  date?: string
}

export const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testi-1',
    badge: 'PAKET 2 · SIANG & MALAM',
    dishName: 'Ayam Bakar Madu & Sambal Bajak',
    quote:
      '“Sejak langganan Dapoer Iboe, saya tidak perlu pusing lagi mikirin makan siang di kantor. Bumbu ayam bakarnya meresap sempurna, sambalnya nendang, dan porsinya pas banget! Menunya juga beda tiap hari jadi nggak pernah bosan.”',
    authorName: 'Rina Melati',
    authorRole: 'Karyawan Swasta, SCBD Jakarta',
    bgImage:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    avatarImage:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    featured: true,
    date: '2026-09-10',
  },
  {
    id: 'testi-2',
    badge: 'HEALTHY FOOD · BULKING',
    dishName: 'Dada Ayam Panggang Rosemary & Salad',
    quote:
      '“Paket bulking-nya mantap! Protein tinggi, garam dan minyak terkontrol tapi rasanya tetap gurih nikmat, bukan makanan diet hambar. Cocok banget buat yang butuh asupan kalori dan nutrisi berkualitas tanpa ribet meal prep.”',
    authorName: 'Ahmad Fauzi',
    authorRole: 'Penggiat Gym & Fitness Coach',
    bgImage:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80',
    avatarImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    featured: true,
    date: '2026-09-08',
  },
  {
    id: 'testi-3',
    badge: 'PAKET 1 · 3X MAKAN KELUARGA',
    dishName: 'Rendang Sapi Dapoer Iboe & Sayur Kapau',
    quote:
      '“Dengan paket 3x makan sekeluarga, saya jadi punya waktu berkualitas lebih banyak untuk anak-anak. Masakannya otentik rumahan banget, suami saya sampai bilang rasanya persis masakan ibu di kampung halaman.”',
    authorName: 'Siti Rahmawati',
    authorRole: 'Ibu Rumah Tangga, Tebet',
    bgImage:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    avatarImage:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    featured: true,
    date: '2026-09-05',
  },
  {
    id: 'testi-4',
    badge: 'PAKET 3 · 1X MAKAN HEMAT',
    dishName: 'Nasi Liwet Komplit Ikan Teri & Tempe Orek',
    quote:
      '“Harganya super terjangkau buat mahasiswa! Mulai Rp 132rb per minggu sudah dapat makan siang hangat 6 hari full, plus gratis ongkir ke kos. Sangat recommended buat anak rantau yang mau hemat tapi tetap makan bergizi.”',
    authorName: 'Dimas Prasetyo',
    authorRole: 'Mahasiswa S2, UI Depok',
    bgImage:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    avatarImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    featured: true,
    date: '2026-09-02',
  },
]

const STORAGE_KEY = 'dapoer_iboe_testimonials'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapTestimonialFromDb(row: any): TestimonialItem {
  return {
    id: row.id,
    badge: row.badge,
    dishName: row.dish_name,
    quote: row.quote,
    authorName: row.author_name,
    authorRole: row.author_role,
    bgImage: row.bg_image,
    avatarImage: row.avatar_image,
    rating: row.rating ?? 5,
    featured: row.featured ?? true,
    date: row.date,
  }
}

export function mapTestimonialToDb(item: TestimonialItem): Record<string, any> {
  return {
    id: item.id,
    badge: item.badge,
    dish_name: item.dishName,
    quote: item.quote,
    author_name: item.authorName,
    author_role: item.authorRole,
    bg_image: item.bgImage,
    avatar_image: item.avatarImage,
    rating: item.rating,
    featured: item.featured ?? true,
    date: item.date || new Date().toISOString().split('T')[0],
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Synchronous local cache access
export function getStoredTestimonials(): TestimonialItem[] {
  if (typeof window === 'undefined') return INITIAL_TESTIMONIALS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TESTIMONIALS))
      return INITIAL_TESTIMONIALS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TESTIMONIALS
  } catch {
    return INITIAL_TESTIMONIALS
  }
}

export function saveStoredTestimonials(items: TestimonialItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('dapoer_iboe_testimonials_updated'))
  } catch (err) {
    console.error('Failed to save testimonials:', err)
  }
}

// In-memory cache for fast repeat reads
let memoryTestimonialsCache: { data: TestimonialItem[]; timestamp: number } | null = null
const TESTIMONIALS_CACHE_TTL = 60 * 1000 // 1 minute

export function invalidateTestimonialsCache(): void {
  memoryTestimonialsCache = null
}

/**
 * Fetch testimonials with Supabase database priority, resilient fallback to localStorage/INITIAL_TESTIMONIALS
 */
export async function getTestimonialsList(forceFresh = false): Promise<TestimonialItem[]> {
  const now = Date.now()
  if (!forceFresh && memoryTestimonialsCache && now - memoryTestimonialsCache.timestamp < TESTIMONIALS_CACHE_TTL) {
    return memoryTestimonialsCache.data
  }

  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('date', { ascending: false })

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapTestimonialFromDb)
      if (typeof window !== 'undefined') {
        saveStoredTestimonials(mapped)
      }
      memoryTestimonialsCache = { data: mapped, timestamp: now }
      return mapped
    }
  } catch (err) {
    console.warn('Error fetching testimonials from Supabase, using local fallback:', err)
  }

  const local = getStoredTestimonials()
  memoryTestimonialsCache = { data: local, timestamp: now }
  return local
}

/**
 * Add or create a new testimonial: immediate local optimistic update + Supabase sync
 */
export async function addTestimonial(
  item: Omit<TestimonialItem, 'id'> & { id?: string }
): Promise<TestimonialItem> {
  invalidateTestimonialsCache()
  const newId = item.id || `testi-${Date.now()}`
  const newItem: TestimonialItem = {
    ...item,
    id: newId,
    date: item.date || new Date().toISOString().split('T')[0],
  }

  // 1. Optimistic save in localStorage
  const current = getStoredTestimonials()
  const nextItems = [newItem, ...current.filter((t) => t.id !== newId)]
  saveStoredTestimonials(nextItems)

  // 2. Persist to Supabase
  try {
    const row = mapTestimonialToDb(newItem)
    const { data, error } = await supabase
      .from('testimonials')
      .insert(row)
      .select()
      .single()

    if (!error && data) {
      const persisted = mapTestimonialFromDb(data)
      const updated = getStoredTestimonials().map((t) => (t.id === newId ? persisted : t))
      saveStoredTestimonials(updated)
      return persisted
    }
  } catch (err) {
    console.warn('Supabase insert testimonial failed, retained locally:', err)
  }

  return newItem
}

/**
 * Update an existing testimonial: immediate local update + Supabase sync
 */
export async function updateTestimonial(
  id: string,
  updates: Partial<Omit<TestimonialItem, 'id'>>
): Promise<TestimonialItem | null> {
  invalidateTestimonialsCache()
  const current = getStoredTestimonials()
  const existing = current.find((t) => t.id === id)
  if (!existing) return null

  const updated: TestimonialItem = {
    ...existing,
    ...updates,
  }

  const nextItems = current.map((t) => (t.id === id ? updated : t))
  saveStoredTestimonials(nextItems)

  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (updates.badge !== undefined) dbPayload.badge = updates.badge
    if (updates.dishName !== undefined) dbPayload.dish_name = updates.dishName
    if (updates.quote !== undefined) dbPayload.quote = updates.quote
    if (updates.authorName !== undefined) dbPayload.author_name = updates.authorName
    if (updates.authorRole !== undefined) dbPayload.author_role = updates.authorRole
    if (updates.bgImage !== undefined) dbPayload.bg_image = updates.bgImage
    if (updates.avatarImage !== undefined) dbPayload.avatar_image = updates.avatarImage
    if (updates.rating !== undefined) dbPayload.rating = updates.rating
    if (updates.featured !== undefined) dbPayload.featured = updates.featured
    if (updates.date !== undefined) dbPayload.date = updates.date
    /* eslint-enable @typescript-eslint/no-explicit-any */

    await supabase.from('testimonials').update(dbPayload).eq('id', id)
  } catch (err) {
    console.warn('Supabase update testimonial failed:', err)
  }

  return updated
}

/**
 * Delete a testimonial: immediate local update + Supabase sync
 */
export async function deleteTestimonial(id: string): Promise<void> {
  invalidateTestimonialsCache()
  const current = getStoredTestimonials()
  const nextItems = current.filter((t) => t.id !== id)
  saveStoredTestimonials(nextItems)

  try {
    await supabase.from('testimonials').delete().eq('id', id)
  } catch (err) {
    console.warn('Supabase delete testimonial failed:', err)
  }
}

/**
 * Reset testimonials back to default initial list
 */
export async function resetTestimonialsToDefault(): Promise<TestimonialItem[]> {
  invalidateTestimonialsCache()
  saveStoredTestimonials(INITIAL_TESTIMONIALS)

  try {
    // Delete existing rows and reseed defaults
    await supabase.from('testimonials').delete().neq('id', 'dummy-placeholder')
    const rows = INITIAL_TESTIMONIALS.map(mapTestimonialToDb)
    await supabase.from('testimonials').insert(rows)
  } catch (err) {
    console.warn('Supabase reset testimonials failed, local reset:', err)
  }

  return INITIAL_TESTIMONIALS
}

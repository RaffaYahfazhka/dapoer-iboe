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

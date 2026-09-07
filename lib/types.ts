export type DeliveryStatus = 'belum' | 'sedang' | 'sudah'
export type DeliveryStep = 1 | 2 | 3 | 4 | 5
export type ShiftType = 'pagi' | 'siang' | 'malam'
export type JadwalType = 'pagi' | 'siang' | 'malam' | 'keduanya' | 'semua'
export type PelangganStatus = 'pending' | 'aktif' | 'nonaktif'

export interface Pelanggan {
  id: string
  nama: string
  whatsapp: string
  alamat: string
  jadwal: JadwalType
  mulaiTanggal: string
  catatan: string
  status: PelangganStatus
  createdAt: string
  updatedAt?: string
}

export interface DeliveryRecord {
  id: string
  pelangganId: string
  pelangganNama: string
  pelangganAlamat: string
  pelangganWhatsapp?: string
  tanggal: string
  jadwal: ShiftType
  status: DeliveryStatus
  step?: DeliveryStep
  updatedAt: string
  confirmedAt?: string
  driverNama?: string
  driverHp?: string
  estimatedTime?: string
}

export interface MenuItem {
  hari: string
  pagi: string[]
  siang: string[]
  malam: string[]
}

export interface WeeklyMenu {
  items: MenuItem[]
  updatedAt: string
}

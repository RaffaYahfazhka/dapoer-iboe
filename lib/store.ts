import { Pelanggan, DeliveryRecord, DeliveryStatus, DeliveryStep, WeeklyMenu, MenuItem } from './types'
import { supabase } from './supabase'
import { DEFAULT_MENU, DEFAULT_PELANGGAN } from './seed'

// ========================
// Column Mapping Helpers
// ========================

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPelangganFromDb(row: any): Pelanggan {
  return {
    id: row.id,
    nama: row.nama,
    whatsapp: row.whatsapp,
    alamat: row.alamat,
    jadwal: row.jadwal,
    mulaiTanggal: row.mulai_tanggal,
    catatan: row.catatan ?? '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapDeliveryFromDb(row: any): DeliveryRecord {
  return {
    id: row.id,
    pelangganId: row.pelanggan_id,
    pelangganNama: row.pelanggan_nama,
    pelangganAlamat: row.pelanggan_alamat,
    pelangganWhatsapp: row.pelanggan_whatsapp,
    tanggal: row.tanggal,
    jadwal: row.jadwal,
    status: row.status,
    step: row.step,
    updatedAt: row.updated_at,
    confirmedAt: row.confirmed_at,
    driverNama: row.driver_nama,
    driverHp: row.driver_hp,
    estimatedTime: row.estimated_time,
  }
}

function mapMenuItemFromDb(row: any): MenuItem {
  return {
    hari: row.hari,
    pagi: row.pagi ?? [],
    siang: row.siang ?? [],
    malam: row.malam ?? [],
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ========================
// PELANGGAN
// ========================

export async function getPelangganList(): Promise<Pelanggan[]> {
  const { data, error } = await supabase
    .from('pelanggan')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pelanggan:', error)
    return []
  }

  return (data ?? []).map(mapPelangganFromDb)
}

export async function seedDummyPelanggan(): Promise<void> {
  // Clear existing pelanggan
  await supabase.from('pelanggan').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Insert seed data
  const rows = DEFAULT_PELANGGAN.map(p => ({
    nama: p.nama,
    whatsapp: p.whatsapp,
    alamat: p.alamat,
    jadwal: p.jadwal,
    mulai_tanggal: p.mulaiTanggal,
    catatan: p.catatan,
    status: p.status,
    created_at: p.createdAt,
  }))

  const { error } = await supabase.from('pelanggan').insert(rows)
  if (error) console.error('Error seeding pelanggan:', error)
}

export async function addPelanggan(data: Omit<Pelanggan, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Pelanggan | null> {
  const { data: result, error } = await supabase
    .from('pelanggan')
    .insert({
      nama: data.nama,
      whatsapp: data.whatsapp,
      alamat: data.alamat,
      jadwal: data.jadwal,
      mulai_tanggal: data.mulaiTanggal,
      catatan: data.catatan,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding pelanggan:', error)
    return null
  }

  return mapPelangganFromDb(result)
}

export async function updatePelangganStatus(id: string, status: Pelanggan['status']): Promise<void> {
  const { error } = await supabase
    .from('pelanggan')
    .update({ status })
    .eq('id', id)

  if (error) console.error('Error updating pelanggan status:', error)
}

export async function bulkUpdatePelangganStatus(ids: string[], status: Pelanggan['status']): Promise<void> {
  const { error } = await supabase
    .from('pelanggan')
    .update({ status })
    .in('id', ids)

  if (error) console.error('Error bulk updating pelanggan status:', error)
}

export async function deletePelanggan(id: string): Promise<void> {
  const { error } = await supabase
    .from('pelanggan')
    .delete()
    .eq('id', id)

  if (error) console.error('Error deleting pelanggan:', error)
}

export async function bulkDeletePelanggan(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('pelanggan')
    .delete()
    .in('id', ids)

  if (error) console.error('Error bulk deleting pelanggan:', error)
}

// ========================
// DELIVERY RECORDS
// ========================

export async function getDeliveryRecords(): Promise<DeliveryRecord[]> {
  const { data, error } = await supabase
    .from('delivery_records')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching delivery records:', error)
    return []
  }

  return (data ?? []).map(mapDeliveryFromDb)
}

export async function generateDailyDeliveries(tanggal: string): Promise<DeliveryRecord[]> {
  // Get existing deliveries for this date
  const { data: existingData } = await supabase
    .from('delivery_records')
    .select('*')
    .eq('tanggal', tanggal)

  const existing = (existingData ?? []).map(mapDeliveryFromDb)

  // Get active pelanggan
  const { data: pelangganData } = await supabase
    .from('pelanggan')
    .select('*')
    .eq('status', 'aktif')

  const pelangganAktif = (pelangganData ?? []).map(mapPelangganFromDb)

  const newRows: {
    pelanggan_id: string
    pelanggan_nama: string
    pelanggan_alamat: string
    pelanggan_whatsapp: string
    tanggal: string
    jadwal: string
    status: string
    step: number
    driver_nama: string
    driver_hp: string
    estimated_time: string
  }[] = []

  for (const p of pelangganAktif) {
    let jadwalList: ('pagi' | 'siang' | 'malam')[] = []
    if (p.jadwal === 'semua') {
      jadwalList = ['pagi', 'siang', 'malam']
    } else if (p.jadwal === 'keduanya') {
      const catLower = (p.catatan || '').toLowerCase()
      if (catLower.includes('pagi') && catLower.includes('siang')) {
        jadwalList = ['pagi', 'siang']
      } else if (catLower.includes('pagi') && catLower.includes('malam')) {
        jadwalList = ['pagi', 'malam']
      } else {
        jadwalList = ['siang', 'malam']
      }
    } else {
      jadwalList = [p.jadwal as 'pagi' | 'siang' | 'malam']
    }

    for (const jadwal of jadwalList) {
      const alreadyExists = existing.some(
        d => d.pelangganId === p.id && d.jadwal === jadwal
      )
      if (!alreadyExists) {
        newRows.push({
          pelanggan_id: p.id,
          pelanggan_nama: p.nama,
          pelanggan_alamat: p.alamat,
          pelanggan_whatsapp: p.whatsapp,
          tanggal,
          jadwal,
          status: 'belum',
          step: 2,
          driver_nama: 'Pak Joko (Kurir Dapoer Iboe)',
          driver_hp: '081299887766',
          estimated_time:
            jadwal === 'pagi'
              ? '06:30 - 08:00 WIB'
              : jadwal === 'siang'
              ? '11:30 - 12:30 WIB'
              : '17:30 - 18:30 WIB',
        })
      }
    }
  }

  if (newRows.length > 0) {
    const { data: insertedData, error } = await supabase
      .from('delivery_records')
      .insert(newRows)
      .select()

    if (error) {
      console.error('Error generating daily deliveries:', error)
      return existing
    }

    const inserted = (insertedData ?? []).map(mapDeliveryFromDb)
    return [...existing, ...inserted]
  }

  return existing
}

function getDeliveryUpdateFields(status: DeliveryStatus): Record<string, unknown> {
  const now = new Date().toISOString()
  const fields: Record<string, unknown> = { status, updated_at: now }

  if (status === 'belum') fields.step = 2
  else if (status === 'sedang') fields.step = 4
  else if (status === 'sudah') {
    fields.step = 5
    fields.confirmed_at = now
  }

  return fields
}

export async function updateDeliveryStatus(id: string, status: DeliveryStatus): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .update(getDeliveryUpdateFields(status))
    .eq('id', id)

  if (error) console.error('Error updating delivery status:', error)
}

export async function bulkUpdateDeliveryStatus(ids: string[], status: DeliveryStatus): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .update(getDeliveryUpdateFields(status))
    .in('id', ids)

  if (error) console.error('Error bulk updating delivery status:', error)
}

function getStepUpdateFields(step: DeliveryStep): Record<string, unknown> {
  const now = new Date().toISOString()
  const fields: Record<string, unknown> = { step, updated_at: now }

  if (step <= 3) fields.status = 'belum'
  else if (step === 4) fields.status = 'sedang'
  else if (step === 5) {
    fields.status = 'sudah'
    fields.confirmed_at = now
  }

  return fields
}

export async function updateDeliveryStep(id: string, step: DeliveryStep): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .update(getStepUpdateFields(step))
    .eq('id', id)

  if (error) console.error('Error updating delivery step:', error)
}

export async function bulkUpdateDeliveryStep(ids: string[], step: DeliveryStep): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .update(getStepUpdateFields(step))
    .in('id', ids)

  if (error) console.error('Error bulk updating delivery step:', error)
}

export async function deleteDeliveryRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .delete()
    .eq('id', id)

  if (error) console.error('Error deleting delivery record:', error)
}

export async function bulkDeleteDeliveryRecords(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .delete()
    .in('id', ids)

  if (error) console.error('Error bulk deleting delivery records:', error)
}

export async function getDeliveriesByDate(tanggal: string): Promise<DeliveryRecord[]> {
  const { data, error } = await supabase
    .from('delivery_records')
    .select('*')
    .eq('tanggal', tanggal)
    .order('jadwal', { ascending: true })

  if (error) {
    console.error('Error fetching deliveries by date:', error)
    return []
  }

  return (data ?? []).map(mapDeliveryFromDb)
}

export async function getDeliveriesByCustomerQuery(query: string): Promise<DeliveryRecord[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('delivery_records')
    .select('*')
    .or(`pelanggan_nama.ilike.%${cleanQuery}%,pelanggan_whatsapp.ilike.%${cleanQuery}%`)
    .eq('tanggal', today)
    .order('jadwal', { ascending: true })

  if (error) {
    console.error('Error searching deliveries:', error)
    return []
  }

  // Deduplicate: keep only the first record per (pelanggan_id, jadwal) for today
  const seen = new Set<string>()
  const deduped = (data ?? []).filter(row => {
    const key = `${row.pelanggan_id}_${row.jadwal}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return deduped.map(mapDeliveryFromDb)
}

export async function getCustomerDeliveryHistory(query: string): Promise<DeliveryRecord[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('delivery_records')
    .select('*')
    .or(`pelanggan_nama.ilike.%${cleanQuery}%,pelanggan_whatsapp.ilike.%${cleanQuery}%`)
    .lt('tanggal', today)
    .order('tanggal', { ascending: false })
    .order('jadwal', { ascending: true })
    .limit(15)

  if (error) {
    console.error('Error searching past deliveries:', error)
    return []
  }

  // Deduplicate per (pelanggan_id, tanggal, jadwal)
  const seen = new Set<string>()
  const deduped = (data ?? []).filter(row => {
    const key = `${row.pelanggan_id}_${row.tanggal}_${row.jadwal}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return deduped.map(mapDeliveryFromDb)
}

export async function getTodayStats(): Promise<{
  total: number
  belum: number
  sedang: number
  sudah: number
}> {
  const today = new Date().toISOString().split('T')[0]
  const records = await getDeliveriesByDate(today)
  return {
    total: records.length,
    belum: records.filter(r => r.status === 'belum').length,
    sedang: records.filter(r => r.status === 'sedang').length,
    sudah: records.filter(r => r.status === 'sudah').length,
  }
}

// ========================
// MENU
// ========================

export async function getMenu(): Promise<WeeklyMenu> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching menu:', error)
    return DEFAULT_MENU
  }

  if (!data || data.length === 0) {
    return DEFAULT_MENU
  }

  // Order days correctly
  const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const items = data.map(mapMenuItemFromDb)
  items.sort((a, b) => dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari))

  return {
    items,
    updatedAt: data[0]?.updated_at ?? new Date().toISOString(),
  }
}

export async function updateMenuItem(hari: string, jadwal: 'pagi' | 'siang' | 'malam', menu: string[]): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ [jadwal]: menu })
    .eq('hari', hari)

  if (error) console.error('Error updating menu item:', error)
}

// ========================
// HELPERS (remain synchronous)
// ========================

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isOverdue(jadwal: 'pagi' | 'siang' | 'malam', tanggal: string): boolean {
  const now = new Date()
  const today = formatDate(now)
  if (tanggal !== today) return tanggal < today
  const hour = now.getHours()
  if (jadwal === 'pagi' && hour >= 9) return true
  if (jadwal === 'siang' && hour >= 14) return true
  if (jadwal === 'malam' && hour >= 21) return true
  return false
}

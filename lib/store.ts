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
// STORAGE KEYS & EVENT DISPATCHERS
// ========================

const STORAGE_KEY_PELANGGAN = 'dapoer_iboe_pelanggan'
const STORAGE_KEY_DELIVERY = 'dapoer_iboe_delivery_records'
const STORAGE_KEY_MENU = 'dapoer_iboe_menu'

export function getLocalMenu(): WeeklyMenu {
  if (typeof window === 'undefined') return DEFAULT_MENU
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENU)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU))
      return DEFAULT_MENU
    }
    const parsed = JSON.parse(raw)
    return parsed && Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed : DEFAULT_MENU
  } catch {
    return DEFAULT_MENU
  }
}

export function saveLocalMenu(menu: WeeklyMenu): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menu))
    window.dispatchEvent(new CustomEvent('dapoer_iboe_menu_updated'))
  } catch (err) {
    console.warn('Failed to save menu to local storage:', err)
  }
}

export function getLocalPelanggan(): Pelanggan[] {
  if (typeof window === 'undefined') return DEFAULT_PELANGGAN
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PELANGGAN)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PELANGGAN, JSON.stringify(DEFAULT_PELANGGAN))
      return DEFAULT_PELANGGAN
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PELANGGAN
  } catch {
    return DEFAULT_PELANGGAN
  }
}

export function saveLocalPelanggan(list: Pelanggan[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PELANGGAN, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('dapoer_iboe_pelanggan_updated'))
  } catch (err) {
    console.error('Failed to save pelanggan to local storage:', err)
  }
}

export function getLocalDeliveries(): DeliveryRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELIVERY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalDeliveries(items: DeliveryRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_DELIVERY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('dapoer_iboe_delivery_updated'))
  } catch (err) {
    console.error('Failed to save deliveries to local storage:', err)
  }
}

// ========================
// PELANGGAN
// ========================

export async function getPelangganList(): Promise<Pelanggan[]> {
  try {
    const { data, error } = await supabase
      .from('pelanggan')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapPelangganFromDb)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PELANGGAN, JSON.stringify(mapped))
      }
      return mapped
    }
  } catch (err) {
    console.warn('Error fetching from Supabase, using local cache:', err)
  }

  return getLocalPelanggan()
}

export async function seedDummyPelanggan(): Promise<void> {
  saveLocalPelanggan(DEFAULT_PELANGGAN)

  try {
    await supabase.from('pelanggan').delete().neq('id', '00000000-0000-0000-0000-000000000000')

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

    await supabase.from('pelanggan').insert(rows)
  } catch (err) {
    console.warn('Supabase seed failed, local seeded:', err)
  }
}

export async function addPelanggan(
  data: Omit<Pelanggan, 'id' | 'createdAt' | 'updatedAt'> & { status?: Pelanggan['status'] }
): Promise<Pelanggan> {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pelanggan-${Date.now()}`
  const now = new Date().toISOString()
  const status = data.status || 'pending'

  const newPelanggan: Pelanggan = {
    id: newId,
    nama: data.nama,
    whatsapp: data.whatsapp,
    alamat: data.alamat,
    jadwal: data.jadwal,
    mulaiTanggal: data.mulaiTanggal,
    catatan: data.catatan || '',
    status,
    createdAt: now,
    updatedAt: now,
    paket: data.paket,
    durasi: data.durasi,
  }

  // 1. Immediately store to local storage & trigger sync event
  const currentLocal = getLocalPelanggan()
  saveLocalPelanggan([newPelanggan, ...currentLocal.filter(p => p.id !== newId)])

  // 2. Try persisting to Supabase in parallel
  try {
    const { data: result, error } = await supabase
      .from('pelanggan')
      .insert({
        nama: data.nama,
        whatsapp: data.whatsapp,
        alamat: data.alamat,
        jadwal: data.jadwal,
        mulai_tanggal: data.mulaiTanggal,
        catatan: data.catatan,
        status,
      })
      .select()
      .single()

    if (!error && result) {
      const dbPelanggan = mapPelangganFromDb(result)
      const updatedLocal = getLocalPelanggan().map(p => (p.id === newId ? dbPelanggan : p))
      saveLocalPelanggan(updatedLocal)
      return dbPelanggan
    }
  } catch (err) {
    console.warn('Supabase insert failed, fallback retained:', err)
  }

  return newPelanggan
}

export async function updatePelanggan(
  id: string,
  updates: Partial<Omit<Pelanggan, 'id' | 'createdAt'>>
): Promise<Pelanggan | null> {
  const currentLocal = getLocalPelanggan()
  const existing = currentLocal.find(p => p.id === id)
  if (!existing) return null

  const updated: Pelanggan = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const nextList = currentLocal.map(p => (p.id === id ? updated : p))
  saveLocalPelanggan(nextList)

  // Try updating in Supabase
  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const dbPayload: Record<string, any> = {
      updated_at: updated.updatedAt,
    }
    if (updates.nama !== undefined) dbPayload.nama = updates.nama
    if (updates.whatsapp !== undefined) dbPayload.whatsapp = updates.whatsapp
    if (updates.alamat !== undefined) dbPayload.alamat = updates.alamat
    if (updates.jadwal !== undefined) dbPayload.jadwal = updates.jadwal
    if (updates.mulaiTanggal !== undefined) dbPayload.mulai_tanggal = updates.mulaiTanggal
    if (updates.catatan !== undefined) dbPayload.catatan = updates.catatan
    if (updates.status !== undefined) dbPayload.status = updates.status
    /* eslint-enable @typescript-eslint/no-explicit-any */

    await supabase.from('pelanggan').update(dbPayload).eq('id', id)
  } catch (err) {
    console.warn('Supabase update failed:', err)
  }

  return updated
}

export async function updatePelangganStatus(id: string, status: Pelanggan['status']): Promise<void> {
  const currentLocal = getLocalPelanggan()
  const nextList = currentLocal.map(p =>
    p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
  )
  saveLocalPelanggan(nextList)

  try {
    await supabase.from('pelanggan').update({ status }).eq('id', id)
  } catch (err) {
    console.warn('Supabase status update failed:', err)
  }
}

export async function bulkUpdatePelangganStatus(ids: string[], status: Pelanggan['status']): Promise<void> {
  const idSet = new Set(ids)
  const currentLocal = getLocalPelanggan()
  const nextList = currentLocal.map(p =>
    idSet.has(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p
  )
  saveLocalPelanggan(nextList)

  try {
    await supabase.from('pelanggan').update({ status }).in('id', ids)
  } catch (err) {
    console.warn('Supabase bulk status update failed:', err)
  }
}

export async function deletePelanggan(id: string): Promise<void> {
  const currentLocal = getLocalPelanggan()
  const nextList = currentLocal.filter(p => p.id !== id)
  saveLocalPelanggan(nextList)

  try {
    await supabase.from('pelanggan').delete().eq('id', id)
  } catch (err) {
    console.warn('Supabase delete failed:', err)
  }
}

export async function bulkDeletePelanggan(ids: string[]): Promise<void> {
  const idSet = new Set(ids)
  const currentLocal = getLocalPelanggan()
  const nextList = currentLocal.filter(p => !idSet.has(p.id))
  saveLocalPelanggan(nextList)

  try {
    await supabase.from('pelanggan').delete().in('id', ids)
  } catch (err) {
    console.warn('Supabase bulk delete failed:', err)
  }
}

// ========================
// DELIVERY RECORDS
// ========================

export async function getDeliveryRecords(): Promise<DeliveryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('delivery_records')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapDeliveryFromDb)
      if (typeof window !== 'undefined') {
        saveLocalDeliveries(mapped)
      }
      return mapped
    }
  } catch (err) {
    console.warn('Supabase getDeliveryRecords failed, using local cache:', err)
  }

  return getLocalDeliveries()
}

export async function generateDailyDeliveries(tanggal: string): Promise<DeliveryRecord[]> {
  let existing: DeliveryRecord[] = []
  try {
    const { data: existingData } = await supabase
      .from('delivery_records')
      .select('*')
      .eq('tanggal', tanggal)

    if (existingData) {
      existing = existingData.map(mapDeliveryFromDb)
    }
  } catch (err) {
    console.warn('Supabase fetch deliveries failed, fallback to local:', err)
  }

  if (existing.length === 0) {
    existing = getLocalDeliveries().filter(d => d.tanggal === tanggal)
  }

  // Get active pelanggan from resilient store
  const pelangganList = await getPelangganList()
  const pelangganAktif = pelangganList.filter(p => p.status === 'aktif')

  const newDeliveries: DeliveryRecord[] = []
  const newDbRows: {
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
        const estTime =
          jadwal === 'pagi'
            ? '06:30 - 08:00 WIB'
            : jadwal === 'siang'
            ? '11:30 - 12:30 WIB'
            : '17:30 - 18:30 WIB'

        const recordId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `deliv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

        newDeliveries.push({
          id: recordId,
          pelangganId: p.id,
          pelangganNama: p.nama,
          pelangganAlamat: p.alamat,
          pelangganWhatsapp: p.whatsapp,
          tanggal,
          jadwal,
          status: 'belum',
          step: 2,
          updatedAt: new Date().toISOString(),
          driverNama: 'Pak Joko (Kurir Dapoer Iboe)',
          driverHp: '081299887766',
          estimatedTime: estTime,
        })

        newDbRows.push({
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
          estimated_time: estTime,
        })
      }
    }
  }

  if (newDeliveries.length > 0) {
    const combined = [...existing, ...newDeliveries]
    const allOtherDates = getLocalDeliveries().filter(d => d.tanggal !== tanggal)
    saveLocalDeliveries([...allOtherDates, ...combined])

    try {
      await supabase.from('delivery_records').insert(newDbRows)
    } catch (err) {
      console.warn('Supabase insert deliveries failed:', err)
    }

    return combined
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
  const localList = getLocalDeliveries()
  const now = new Date().toISOString()
  const nextList = localList.map(d => {
    if (d.id !== id) return d
    const updated = { ...d, status, updatedAt: now }
    if (status === 'belum') updated.step = 2
    else if (status === 'sedang') updated.step = 4
    else if (status === 'sudah') {
      updated.step = 5
      updated.confirmedAt = now
    }
    return updated
  })
  saveLocalDeliveries(nextList)

  try {
    await supabase
      .from('delivery_records')
      .update(getDeliveryUpdateFields(status))
      .eq('id', id)
  } catch (err) {
    console.warn('Supabase delivery status update failed:', err)
  }
}

export async function bulkUpdateDeliveryStatus(ids: string[], status: DeliveryStatus): Promise<void> {
  const idSet = new Set(ids)
  const localList = getLocalDeliveries()
  const now = new Date().toISOString()
  const nextList = localList.map(d => {
    if (!idSet.has(d.id)) return d
    const updated = { ...d, status, updatedAt: now }
    if (status === 'belum') updated.step = 2
    else if (status === 'sedang') updated.step = 4
    else if (status === 'sudah') {
      updated.step = 5
      updated.confirmedAt = now
    }
    return updated
  })
  saveLocalDeliveries(nextList)

  try {
    await supabase
      .from('delivery_records')
      .update(getDeliveryUpdateFields(status))
      .in('id', ids)
  } catch (err) {
    console.warn('Supabase bulk delivery status update failed:', err)
  }
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
  const localList = getLocalDeliveries()
  const now = new Date().toISOString()
  const nextList = localList.map(d => {
    if (d.id !== id) return d
    let status: DeliveryStatus = 'belum'
    let confirmedAt = d.confirmedAt
    if (step <= 3) status = 'belum'
    else if (step === 4) status = 'sedang'
    else if (step === 5) {
      status = 'sudah'
      confirmedAt = now
    }
    return { ...d, step, status, confirmedAt, updatedAt: now }
  })
  saveLocalDeliveries(nextList)

  try {
    await supabase
      .from('delivery_records')
      .update(getStepUpdateFields(step))
      .eq('id', id)
  } catch (err) {
    console.warn('Supabase update step failed:', err)
  }
}

export async function bulkUpdateDeliveryStep(ids: string[], step: DeliveryStep): Promise<void> {
  const idSet = new Set(ids)
  const localList = getLocalDeliveries()
  const now = new Date().toISOString()
  const nextList = localList.map(d => {
    if (!idSet.has(d.id)) return d
    let status: DeliveryStatus = 'belum'
    let confirmedAt = d.confirmedAt
    if (step <= 3) status = 'belum'
    else if (step === 4) status = 'sedang'
    else if (step === 5) {
      status = 'sudah'
      confirmedAt = now
    }
    return { ...d, step, status, confirmedAt, updatedAt: now }
  })
  saveLocalDeliveries(nextList)

  try {
    await supabase
      .from('delivery_records')
      .update(getStepUpdateFields(step))
      .in('id', ids)
  } catch (err) {
    console.warn('Supabase bulk step update failed:', err)
  }
}

export async function deleteDeliveryRecord(id: string): Promise<void> {
  const localList = getLocalDeliveries()
  saveLocalDeliveries(localList.filter(d => d.id !== id))

  try {
    await supabase
      .from('delivery_records')
      .delete()
      .eq('id', id)
  } catch (err) {
    console.warn('Supabase delete delivery failed:', err)
  }
}

export async function bulkDeleteDeliveryRecords(ids: string[]): Promise<void> {
  const idSet = new Set(ids)
  const localList = getLocalDeliveries()
  saveLocalDeliveries(localList.filter(d => !idSet.has(d.id)))

  try {
    await supabase
      .from('delivery_records')
      .delete()
      .in('id', ids)
  } catch (err) {
    console.warn('Supabase bulk delete delivery failed:', err)
  }
}

export async function getDeliveriesByDate(tanggal: string): Promise<DeliveryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('delivery_records')
      .select('*')
      .eq('tanggal', tanggal)
      .order('jadwal', { ascending: true })

    if (!error && data && data.length > 0) {
      return data.map(mapDeliveryFromDb)
    }
  } catch (err) {
    console.warn('Supabase fetch by date failed, using local cache:', err)
  }

  return getLocalDeliveries().filter(d => d.tanggal === tanggal)
}

export async function getDeliveriesByCustomerQuery(query: string): Promise<DeliveryRecord[]> {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const today = new Date().toISOString().split('T')[0]

  try {
    const { data, error } = await supabase
      .from('delivery_records')
      .select('*')
      .or(`pelanggan_nama.ilike.%${cleanQuery}%,pelanggan_whatsapp.ilike.%${cleanQuery}%`)
      .eq('tanggal', today)
      .order('jadwal', { ascending: true })

    if (!error && data && data.length > 0) {
      const seen = new Set<string>()
      const deduped = data.filter(row => {
        const key = `${row.pelanggan_id}_${row.jadwal}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      return deduped.map(mapDeliveryFromDb)
    }
  } catch (err) {
    console.warn('Supabase search deliveries failed, fallback to local:', err)
  }

  // Local fallback search
  const localToday = getLocalDeliveries().filter(
    d =>
      d.tanggal === today &&
      (d.pelangganNama.toLowerCase().includes(cleanQuery) ||
        (d.pelangganWhatsapp && d.pelangganWhatsapp.includes(cleanQuery)))
  )
  return localToday
}

export async function getCustomerDeliveryHistory(query: string): Promise<DeliveryRecord[]> {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const today = new Date().toISOString().split('T')[0]

  try {
    const { data, error } = await supabase
      .from('delivery_records')
      .select('*')
      .or(`pelanggan_nama.ilike.%${cleanQuery}%,pelanggan_whatsapp.ilike.%${cleanQuery}%`)
      .lt('tanggal', today)
      .order('tanggal', { ascending: false })
      .order('jadwal', { ascending: true })
      .limit(15)

    if (!error && data && data.length > 0) {
      const seen = new Set<string>()
      const deduped = data.filter(row => {
        const key = `${row.pelanggan_id}_${row.tanggal}_${row.jadwal}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      return deduped.map(mapDeliveryFromDb)
    }
  } catch (err) {
    console.warn('Supabase past deliveries failed, fallback to local:', err)
  }

  const pastLocal = getLocalDeliveries()
    .filter(
      d =>
        d.tanggal < today &&
        (d.pelangganNama.toLowerCase().includes(cleanQuery) ||
          (d.pelangganWhatsapp && d.pelangganWhatsapp.includes(cleanQuery)))
    )
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 15)

  return pastLocal
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
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('id', { ascending: true })

    if (!error && data && data.length > 0) {
      // Order days correctly
      const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const items = data.map(mapMenuItemFromDb)
      items.sort((a, b) => dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari))

      const menu: WeeklyMenu = {
        items,
        updatedAt: data[0]?.updated_at ?? new Date().toISOString(),
      }
      saveLocalMenu(menu)
      return menu
    }
  } catch (err) {
    console.warn('Supabase fetch menu failed, using local cache:', err)
  }

  return getLocalMenu()
}

export async function updateMenuItem(hari: string, jadwal: 'pagi' | 'siang' | 'malam', menu: string[]): Promise<void> {
  const currentMenu = getLocalMenu()
  const updatedItems = currentMenu.items.map(item => {
    if (item.hari === hari) {
      return { ...item, [jadwal]: menu }
    }
    return item
  })
  const updatedMenu: WeeklyMenu = {
    items: updatedItems,
    updatedAt: new Date().toISOString(),
  }
  saveLocalMenu(updatedMenu)

  try {
    const { error } = await supabase
      .from('menu_items')
      .update({ [jadwal]: menu, updated_at: updatedMenu.updatedAt })
      .eq('hari', hari)

    if (error) {
      console.warn('Supabase update menu failed:', error)
    }
  } catch (err) {
    console.warn('Supabase update menu item failed:', err)
  }
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

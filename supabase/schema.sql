-- ============================================
-- Dapoer Iboe — Supabase Schema
-- Jalankan script ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel Pelanggan
CREATE TABLE IF NOT EXISTS pelanggan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  jadwal TEXT NOT NULL CHECK (jadwal IN ('pagi', 'siang', 'malam', 'keduanya', 'semua')),
  mulai_tanggal DATE NOT NULL,
  catatan TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Delivery Records
CREATE TABLE IF NOT EXISTS delivery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pelanggan_id UUID REFERENCES pelanggan(id) ON DELETE CASCADE,
  pelanggan_nama TEXT NOT NULL,
  pelanggan_alamat TEXT NOT NULL,
  pelanggan_whatsapp TEXT,
  tanggal DATE NOT NULL,
  jadwal TEXT NOT NULL CHECK (jadwal IN ('pagi', 'siang', 'malam')),
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'sedang', 'sudah')),
  step INTEGER DEFAULT 2,
  driver_nama TEXT,
  driver_hp TEXT,
  estimated_time TEXT,
  confirmed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hari TEXT NOT NULL UNIQUE,
  pagi JSONB NOT NULL DEFAULT '[]'::jsonb,
  siang JSONB NOT NULL DEFAULT '[]'::jsonb,
  malam JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ============================================
-- Indexes for Search & Filtering Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_delivery_tanggal ON delivery_records(tanggal);
CREATE INDEX IF NOT EXISTS idx_delivery_pelanggan ON delivery_records(pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_delivery_whatsapp ON delivery_records(pelanggan_whatsapp);
CREATE INDEX IF NOT EXISTS idx_delivery_nama ON delivery_records(pelanggan_nama);
CREATE INDEX IF NOT EXISTS idx_pelanggan_status ON pelanggan(status);
CREATE INDEX IF NOT EXISTS idx_pelanggan_whatsapp ON pelanggan(whatsapp);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER pelanggan_updated_at
  BEFORE UPDATE ON pelanggan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER delivery_records_updated_at
  BEFORE UPDATE ON delivery_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Tabel Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  badge TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  bg_image TEXT NOT NULL,
  avatar_image TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN DEFAULT true,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes for Search & Filtering Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_delivery_tanggal ON delivery_records(tanggal);
CREATE INDEX IF NOT EXISTS idx_delivery_pelanggan ON delivery_records(pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_delivery_whatsapp ON delivery_records(pelanggan_whatsapp);
CREATE INDEX IF NOT EXISTS idx_delivery_nama ON delivery_records(pelanggan_nama);
CREATE INDEX IF NOT EXISTS idx_pelanggan_status ON pelanggan(status);
CREATE INDEX IF NOT EXISTS idx_pelanggan_whatsapp ON pelanggan(whatsapp);
CREATE INDEX IF NOT EXISTS idx_testimonials_date ON testimonials(date);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

CREATE OR REPLACE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) — Open Access (anon)
-- ============================================

ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Pelanggan policies
DROP POLICY IF EXISTS "Allow anon full access on pelanggan" ON pelanggan;
CREATE POLICY "Allow anon full access on pelanggan" ON pelanggan
  FOR ALL USING (true) WITH CHECK (true);

-- Delivery Records policies
DROP POLICY IF EXISTS "Allow anon full access on delivery_records" ON delivery_records;
CREATE POLICY "Allow anon full access on delivery_records" ON delivery_records
  FOR ALL USING (true) WITH CHECK (true);

-- Menu Items policies
DROP POLICY IF EXISTS "Allow anon full access on menu_items" ON menu_items;
CREATE POLICY "Allow anon full access on menu_items" ON menu_items
  FOR ALL USING (true) WITH CHECK (true);

-- Testimonials policies
DROP POLICY IF EXISTS "Allow anon full access on testimonials" ON testimonials;
CREATE POLICY "Allow anon full access on testimonials" ON testimonials
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Supabase Realtime Publication
-- Aktifkan broadcast realtime agar status pengiriman & testimoni
-- langsung terupdate di halaman pelacak dan beranda
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'delivery_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE delivery_records;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'testimonials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
  END IF;
END $$;


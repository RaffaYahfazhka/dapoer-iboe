-- ============================================
-- Dapoer Iboe — Seed Data
-- Jalankan SETELAH schema.sql
-- ============================================

-- =====================
-- Seed: Menu Items
-- =====================

INSERT INTO menu_items (hari, pagi, siang, malam) VALUES
  ('Senin',
    '["Nasi Uduk Gurih", "Semur Telur & Tahu", "Bihun Goreng", "Sambal Kacang", "Kerupuk"]'::jsonb,
    '["Nasi", "Ayam Serundeng", "Lalap Sayur", "Tempe Crispy", "Kerupuk"]'::jsonb,
    '["Nasi", "Ayam Kremes", "Lalap", "Kerupuk"]'::jsonb
  ),
  ('Selasa',
    '["Lontong Sayur Labu Siam", "Telur Balado", "Tahu Goreng", "Bawang Goreng", "Kerupuk"]'::jsonb,
    '["Nasi", "Chicken Blackpepper", "Salad Sayur", "French Fries"]'::jsonb,
    '["Nasi", "Chicken Pop", "Sambal Matah", "Timun", "Kerupuk"]'::jsonb
  ),
  ('Rabu',
    '["Bubur Ayam Komplit", "Cakwe Crispy", "Ayam Suwir Gurih", "Kuah Kaldu Kuning", "Emping"]'::jsonb,
    '["Nasi", "Ikan Cabe Ijo", "Cah Tauge", "Kerupuk"]'::jsonb,
    '["Nasi", "Ikan Balado Kentang", "Sayur Sawi Putih", "Kerupuk"]'::jsonb
  ),
  ('Kamis',
    '["Nasi Kuning Harum", "Ayam Goreng Lengkuas", "Orek Tempe Manis", "Telur Dadar Iris", "Sambal"]'::jsonb,
    '["Nasi", "Ayam Gulai Korma", "Rebusan Sayur", "Sambal Tomat", "Kerupuk"]'::jsonb,
    '["Nasi", "Ayam Cabe Ijo Kentang", "Sayur Bayam", "Kerupuk"]'::jsonb
  ),
  ('Jumat',
    '["Nasi Liwet Teri Medan", "Telur Pindang", "Tahu Bacem", "Sambal Terasi", "Kerupuk"]'::jsonb,
    '["Nasi", "Daging Kentang Balado", "Sayur Sawi Putih", "Kerupuk"]'::jsonb,
    '["Nasi", "Soto Padang"]'::jsonb
  ),
  ('Sabtu',
    '["Roti Bakar Dapoer Iboe", "Omelette Sayur Keju", "Sosis Panggang", "Salad Buah Segar"]'::jsonb,
    '["Nasi", "Ayam Daun Jeruk", "Cah Buncis", "Tempe", "Kerupuk"]'::jsonb,
    '["Nasi", "Ayam Kecap Tahu", "Bihun Goreng", "Kerupuk", "Buah"]'::jsonb
  )
ON CONFLICT (hari) DO UPDATE SET
  pagi = EXCLUDED.pagi,
  siang = EXCLUDED.siang,
  malam = EXCLUDED.malam;

-- =====================
-- Seed: Pelanggan
-- =====================

INSERT INTO pelanggan (nama, whatsapp, alamat, jadwal, mulai_tanggal, catatan, status, created_at) VALUES
  ('Budi Santoso', '081234567890', 'Jl. Merdeka No. 12, Jakarta Selatan (Rumah Pagar Hitam)', 'semua', '2026-08-01', 'Jangan terlalu pedas, sayur dipisah', 'aktif', '2026-08-01T08:00:00.000Z'),
  ('Siti Rahmawati', '085678901234', 'Apartemen Sudirman Tower A Lt. 15 No. 08, Jakpus', 'pagi', '2026-08-10', 'Titip ke resepsionis/lobby jika belum bangun', 'aktif', '2026-08-10T09:30:00.000Z'),
  ('Ahmad Fauzi', '081398765432', 'Komplek Permata Hijau Blok C3/15, Kebayoran Lama', 'malam', '2026-08-15', 'Alergi seafood/udang', 'aktif', '2026-08-15T11:00:00.000Z'),
  ('Dewi Lestari', '087811223344', 'Jl. Tebet Barat Dalam Raya No. 45, Jakarta Selatan', 'siang', '2026-08-25', 'Porsi nasi sedikit saja', 'pending', '2026-08-25T07:15:00.000Z'),
  ('Rian Pratama', '089944556677', 'Gedung Wisma GKBI Lt. 20, Jl. Jend Sudirman Kav. 28', 'keduanya', '2026-08-26', 'Mohon antar tepat jam 11:30 siang & jam 18:00 malam', 'pending', '2026-08-25T13:45:00.000Z'),
  ('Hendra Gunawan', '082155667788', 'Jl. Kemang Raya No. 88B, Jakarta Selatan', 'malam', '2026-07-15', 'Sedang libur dinas luar kota', 'nonaktif', '2026-07-15T10:00:00.000Z');

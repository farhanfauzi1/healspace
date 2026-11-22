# HEAL SPACE by HEAL BOARD

Frontend HTML5 + CSS3 + Vanilla JavaScript. Tidak memakai React, Vite, atau proses build.

## Halaman

- `index.html`: Beranda dan kategori
- `cerita.html`: Form kirim cerita anonim
- `cek-cerita.html`: Cek cerita menggunakan ID + kode akses dan membalas admin
- `tentang.html`: Penjelasan privasi dan batas layanan
- `login.html`: Login admin melalui Supabase Auth
- `admin.html`: Dashboard, statistik, cerita masuk, balas dan ubah status

## Cara menjalankan

1. Ekstrak ZIP.
2. Buka terminal di folder `heal-space-vanilla`.
3. Jalankan `python -m http.server 8080`.
4. Buka `http://localhost:8080`.
5. Masuk admin melalui `http://localhost:8080/login.html`.

Jangan membuka file HTML dengan `file://`, karena aplikasi menggunakan ES Modules. Koneksi internet diperlukan untuk memuat pustaka `supabase-js` dan layanan Supabase.

## Konfigurasi

`js/config.js` sudah berisi URL Supabase dan publishable key project HEAL SPACE. Publishable key aman ditempatkan di browser karena privilege data harus dibatasi menggunakan RLS.

**JANGAN PERNAH** meletakkan `service_role`, secret API key, atau password admin di file frontend. Admin login menggunakan Supabase Auth.

## Keamanan dan status

Frontend menggunakan `heal-api` yang sudah terpasang di Supabase. Pengiriman cerita, verifikasi kode, dan percakapan dua arah melewati Edge Function tersebut.

Kode akses hanya ditampilkan sesaat setelah cerita terkirim. User perlu menyimpan ID cerita dan kode secara pribadi. Kode tidak dimasukkan ke URL atau localStorage.

**Belum siap produksi publik.** Sebelum website dipublikasikan:
- Uji seluruh alur HTTP dan percakapan end-to-end.
- Tambahkan CAPTCHA/Turnstile dan validasi server untuk spam otomatis; rate limit saja tidak memadai.
- Periksa/aktifkan leaked password protection dan ganti password admin yang pernah terpapar.
- Tentukan kebijakan privasi resmi, retensi data, prosedur permintaan hapus cerita, dan respons krisis.
- Tinjau CORS, audit logs, monitoring, serta kebijakan keamanan CSP.
- Endpoint saat ini memakai fungsi `verify_jwt:false` agar pengunjung anonim dapat mengirim pesan, tetapi admin endpoint memverifikasi JWT dan role secara internal.

## Catatan kompatibilitas

Supabase SDK dimuat melalui CDN ESM dengan versi terpin. Jika akses internet ke CDN diblokir, unduh/library-kan SDK melalui tool lokal/npm pada pengembangan lanjutan.


## Pembaruan 20 November 2026
- Tampilan publik disesuaikan dengan mockup unisex biru-putih.
- Ilustrasi digunakan dari konsep mockup HEAL SPACE yang telah disetujui.
- Perbaikan backend Supabase: izin INSERT/SELECT `story_access` untuk `service_role` diperbaiki; role anonim tetap tidak dapat membacanya.
- Jika masih ada respons `429`, tunggu hingga jendela rate limiting berakhir.
- Jangan memasukkan data pribadi sensitif saat uji coba. Proteksi CAPTCHA dan pengujian integrasi publik masih diperlukan.


## ID cerita singkat
ID yang terlihat pengguna adalah CRT-1, CRT-2, dan seterusnya. UUID tetap digunakan secara internal oleh database. Pengguna tetap perlu menyimpan kode akses rahasia (kode baru 12 karakter, contoh K7MX-P2Q9-W4TR) dan tidak membagikannya.

## Perbaikan Navigasi Admin (versi 4)
Sidebar dashboard sekarang mendukung navigasi hash berbasis halaman:
`#dashboard`, `#stories`, `#history`, `#categories`, `#reports`, dan `#detail-<uuid>`.
Setiap menu membuka area yang berbeda tanpa reload penuh. Daftar cerita dapat difilter, tombol Buka membuka percakapan, kategori dapat ditambah/diedit/diaktifkan/nonaktifkan, dan laporan dapat diekspor menjadi CSV metadata (tanpa isi cerita).

Untuk pemasangan, **ganti seluruh folder lama** dengan folder dari ZIP baru, lalu jalankan `python -m http.server 8080` dan lakukan Ctrl+Shift+R di browser. Menu Riwayat menampilkan cerita berstatus Diproses atau Selesai. Statistik laporan kategori memakai maksimum 100 cerita terbaru dari API `admin_list` yang tersedia pada backend saat ini, sehingga laporan perlu pagination di backend jika datanya sudah melebihi 100.

## Kode akses versi singkat

Cerita baru menggunakan kode 12 karakter acak (contoh `K7MX-P2Q9-W4TR`). Setiap kode diacak oleh backend dan ditampilkan sekali saja. Kode akses lama sepanjang 64 karakter masih diterima. Ketik kode tanpa tanda hubung juga diperbolehkan. Jangan membagikan kode kepada orang lain.


## Pembaruan: Data opsional dan Manajemen Akun
- Form cerita menyediakan Usia (5-120) dan Jenis Kelamin (Laki-laki, Perempuan, Lainnya, atau Tidak ingin menyebutkan). Keduanya opsional dan disimpan sebagai NULL jika dilewati.
- Dashboard admin memiliki menu **Manajemen Akun**, daftar admin, serta formulir penambahan akun baru. Akun admin hanya dibuat melalui Edge Function `heal-api` (aksi `admin_create_account`), dengan JWT admin yang diverifikasi oleh server.
- Akun baru langsung mendapatkan role admin, sehingga harus hanya dibuat untuk orang yang dipercaya; atur kebijakan akses internal sebelum website dipublikasikan.
- Password baru tidak ditulis di localStorage atau file konfigurasi; berikan password awal kepada admin baru melalui saluran yang aman.
- Gunakan frontend ini dengan migrasi database dan Edge Function versi 7 atau lebih baru pada project Supabase yang sudah terhubung.


## Favicon
Logo favicon HEAL SPACE telah dipasang di semua halaman HTML. File berada di `assets/favicon.png`, `assets/apple-touch-icon.png`, dan `favicon.ico`. Jika tab masih menampilkan ikon lama, lakukan hard refresh atau buka di jendela Incognito.


## URL Admin Vercel

Deploy dengan Root Directory mengarah ke folder yang berisi `index.html` dan `vercel.json`.
- `/admin` membuka login (`login.html`).
- `/admin/dashboard` membuka dashboard (`admin.html`).
- Login dan logout sudah diarahkan ke URL baru.
- Path JS/CSS/aset menggunakan path absolut agar tidak rusak di route bertingkat.

**Catatan:** Rewrite di `vercel.json` hanya berlaku di Vercel. Saat menjalankan
`python -m http.server 8080` secara lokal, akses `/login.html` dan `/admin.html`.
Jangan anggap URL khusus sebagai pengamanan. Hak admin tetap diperiksa melalui Supabase Auth dan RLS.


## Pembaruan responsive unisex v5
Semua halaman pengguna memuat `css/responsive-unisex.css` paling akhir. Ikon fitur memakai SVG outline lokal dari `js/icons.js` tanpa emoji. Periksa mobile pada lebar 320, 375, 390, 430 px.

### Pembaruan mobile v6
Memperbaiki tinggi tombol CTA pada HP; mengganti ikon panah dekoratif dengan SVG outline melalui `js/icons.js`. Style tambahan: `css/cta-mobile-fix.css`. Tidak mengubah backend atau kredensial Supabase.

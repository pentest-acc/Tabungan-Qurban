# Frontend — Sistem Tabungan Qurban

Frontend React untuk aplikasi Tabungan Qurban: jamaah bergabung dengan kelompok (maks. 7 orang per sapi), menabung tunai/cicil, dan admin mengelola data master serta validasi.

## Teknologi

- React 18 + Vite
- React Router DOM v6
- Axios (service API + interceptor JWT)
- Tailwind CSS (dark mode, responsive)
- React Hook Form (validasi form)
- React Toastify (notifikasi)
- Heroicons

## Menjalankan

```bash
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL ke backend Anda
npm run dev
```

## Struktur Folder

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx                  # Entry point + provider
    ├── App.jsx                   # Seluruh routing
    ├── index.css                 # Tailwind + utility class
    ├── api/
    │   └── axiosClient.js        # Instance axios + interceptor token
    ├── context/
    │   ├── AuthContext.jsx       # Login/logout/role, persist localStorage
    │   └── ThemeContext.jsx      # Dark mode
    ├── routes/
    │   └── ProtectedRoute.jsx    # Guard berdasarkan role
    ├── services/                 # Service API per entitas
    │   ├── authService.js
    │   ├── jamaahService.js
    │   ├── sapiService.js
    │   ├── kelompokService.js
    │   ├── permintaanService.js
    │   ├── transaksiService.js
    │   ├── tabunganService.js
    │   ├── adminService.js
    │   └── laporanService.js
    ├── hooks/
    │   ├── useFetch.js           # Loading / error / refetch
    │   └── useTableControls.js   # Search + filter + pagination
    ├── utils/
    │   └── format.js             # Rupiah, tanggal, label role
    ├── components/
    │   ├── form/Fields.jsx       # Input/Select/Textarea (react-hook-form)
    │   ├── layout/               # Sidebar, Navbar, DashboardLayout, dll.
    │   └── ui/                   # Modal, Pagination, Badge, State, dll.
    └── pages/
        ├── public/               # Landing, Login, Register
        ├── jamaah/               # Dashboard, Profil, Kelompok, Tagihan, dst.
        ├── admin/                # CRUD master + validasi + monitoring
        ├── kepala/               # Dashboard, Kelola Admin, Laporan
        └── NotFound.jsx
```

## Role & Routing

| Role | Prefix Route | Akses |
| --- | --- | --- |
| `jamaah` | `/jamaah/*` | Dashboard, profil, kelompok, tagihan, transaksi, pembayaran |
| `admin_biasa` | `/admin/*` | CRUD jamaah/sapi/kelompok, validasi gabung, monitoring transaksi |
| `kepala_admin` | `/kepala/*` + `/admin/*` | Semua hal admin biasa + kelola admin + laporan |

Login mengembalikan `{ token, user: { ..., role } }`; token disimpan di `localStorage` dan dikirim sebagai `Authorization: Bearer <token>` oleh interceptor axios.

## Kontrak API yang Diasumsikan

Base URL: `VITE_API_URL` (default `http://localhost:5000/api`).

- `POST /auth/login`, `POST /auth/register`
- `GET|POST /jamaah`, `PUT|DELETE /jamaah/:id`, `PUT /jamaah/profil`
- `GET|POST /sapi`, `PUT|DELETE /sapi/:id`
- `GET|POST /kelompok`, `GET|PUT|DELETE /kelompok/:id`, `POST /kelompok/:id/gabung`
- `GET /permintaan`, `PUT /permintaan/:id/terima`, `PUT /permintaan/:id/tolak`
- `GET /transaksi`, `GET /transaksi/saya`, `POST /transaksi/bayar`
- `GET /tabungan/saya`
- `GET|POST /admin`, `PUT|DELETE /admin/:id`
- `GET /laporan/ringkasan`, `GET /laporan/kelompok` (opsional — ada fallback agregasi di klien)

Respons boleh berupa array langsung atau dibungkus `{ data: [...] }` — keduanya didukung.

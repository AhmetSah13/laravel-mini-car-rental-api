# Mini Car Rental — React Frontend

Laravel Mini Car Rental API ile uyumlu React (Vite + TypeScript) arayüzü.

Sanctum Bearer token auth, admin/user rol ayrımı, public katalog, admin CRUD, kiralama yönetimi ve **Laravel Reverb** ile real-time araç listesi güncellemesi içerir.

---

## Kurulum

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Uygulama varsayılan olarak [http://127.0.0.1:5173](http://127.0.0.1:5173) adresinde açılır.

---

## Ortam değişkenleri

`frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8080/api

VITE_REVERB_APP_KEY=local-app-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8081
VITE_REVERB_SCHEME=http
```

Backend farklı portta çalışıyorsa `VITE_API_BASE_URL` değerini güncelleyin. Reverb değerleri backend `.env` ile aynı olmalıdır.

Değişiklikten sonra `npm run dev` yeniden başlatılmalıdır.

---

## Portlar

| Servis | Port |
|--------|------|
| Backend API | 8080 |
| Frontend (Vite) | 5173 |
| Reverb WebSocket | 8081 |

---

## WebSocket (Reverb) çalıştırma

Üç süreç gerekir:

**1. Backend API**

```bash
# Docker
docker compose up -d

# veya local
php artisan serve --no-reload --port=8080
```

**2. Reverb server** (proje kökünde)

```bash
php artisan reverb:start
```

**3. Frontend**

```bash
cd frontend
npm run dev
```

### Real-time test senaryoları

**Faz 1 — Public car list**

1. Backend API’yi başlatın (8080).
2. `php artisan reverb:start` ile Reverb’i başlatın (8081).
3. Frontend’i başlatın (5173).
4. Tarayıcıda `/cars` sayfasını açın.
5. Başka bir sekmede admin olarak giriş yapıp `/admin/cars` üzerinden yeni araç oluşturun.
6. `/cars` listesinin sayfa yenilenmeden güncellendiğini ve “Yeni araç eklendi.” toast’ını doğrulayın.

**Faz 2 — Admin rental notification (private channel)**

1. Backend API + Reverb + Frontend çalışır durumda olsun.
2. Admin olarak giriş yapın (dashboard veya herhangi bir AppLayout sayfası açık kalsın).
3. Başka bir sekmeden (admin veya user) yeni rental oluşturun.
4. Admin ekranında “Yeni kiralama talebi oluşturuldu.” toast’ını görün.
5. Admin `/rentals` açıksa listenin yenilendiğini doğrulayın.
6. User olarak giriş yapıldığında bu bildirimin **gelmediğini** doğrulayın.

> Reverb kapalı olsa bile REST API ve formlar çalışmaya devam eder. WebSocket progressive enhancement’dır.

### Real-time özellikleri

| Faz | Channel | Event | Kim dinler |
|-----|---------|-------|------------|
| 1 | `cars` (public) | `car.created` | Herkes (`/cars`, `/admin/cars`) |
| 2 | `admin.notifications` (private) | `rental.created` | Yalnızca admin |

Private channel auth: `POST /broadcasting/auth` + `Authorization: Bearer {token}` (`auth:sanctum`).

### Sonraki fazlarda yok (henüz)

- Bildirim merkezi / history
- Rental status real-time update
- User’a özel private channel

---

## Örnek kullanıcılar (seed)

| Rol | E-posta | Şifre |
|-----|---------|--------|
| Admin | `admin@example.com` | `password` |
| User | `user@example.com` | `password` |

---

## Klasör yapısı

```
src/
├── app/           # providers, router, App
├── features/      # auth, brands, cars, customers, rentals, dashboard, home
├── shared/        # api client, realtime/echo, types, UI components
├── layouts/       # PublicLayout, AppLayout
└── main.tsx
```

---

## Auth özeti

1. Login / register → `token` + `user` localStorage’a yazılır.
2. Her istekte `Authorization: Bearer {token}` gönderilir.
3. Uygulama açılışında token varsa `GET /auth/me` ile hydrate edilir.
4. 401 → oturum temizlenir (protected sayfalarda login’e yönlendirilir).
5. Admin menü ve `/admin/*` route’ları yalnızca `role === "admin"` için açıktır.

---

## Scriptler

```bash
npm run dev      # geliştirme sunucusu
npm run build    # production build
npm run preview  # build önizleme
```

---

## Notlar

- Rental oluşturma **admin-first**: `customers` endpointleri yalnızca admin’e açıktır.
- Public `GET /cars` ve `GET /brands` auth gerektirmez.
- Rate limit (429) ve business hataları (400) toast ile gösterilir.
- Validation hataları (422) form alanlarına map edilir.

# Mini Car Rental API

![Laravel CI](https://github.com/AhmetSah13/laravel-mini-car-rental-api/actions/workflows/ci.yml/badge.svg)

**Repository:** [github.com/AhmetSah13/laravel-mini-car-rental-api](https://github.com/AhmetSah13/laravel-mini-car-rental-api)

Laravel tabanlı mini araç kiralama REST API’si: Sanctum auth, rol yetkilendirme, kiralama iş kuralları, Scribe dokümantasyonu, testler, Docker ve GitHub Actions (CI + GHCR image publish).

Eğitim / portfolio odaklıdır; gerçek prod için ek sertleştirme gerekir.

---

## Tech stack

PHP 8.4 · Laravel 12 · PostgreSQL 16 · Redis 7 · Sanctum · Scribe · React (Vite) frontend · Docker Compose · GitHub Actions

---

## Hızlı başlangıç (host, Docker’sız)

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --no-reload --port=8080
```

API: `http://127.0.0.1:8080` · Docs: `http://127.0.0.1:8080/docs` (önce `php artisan scribe:generate`)

Frontend (ayrı terminal):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

UI: `http://127.0.0.1:5173`

---

## Docker ortamları

Ayrıntılı komutlar, env şablonları, portlar, rollback ve sorun giderme:

**→ [docs/DOCKER_OPS.md](docs/DOCKER_OPS.md)**

| Ortam | Compose | Env şablonu → dosya | Giriş |
|--------|---------|---------------------|--------|
| Development | `docker-compose.yml` | `.env.docker.example` → `.env` | API `:8080`, UI `:5173`, Reverb `:8081` |
| Local production build/test | `docker-compose.prod.yml` | `.env.production.example` → `.env.production` | Nginx `:80` |
| Registry deployment (GHCR) | `docker-compose.deploy.yml` | `.env.deploy.example` → `.env.deploy` | Nginx `:80` |

Development özeti:

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

Aynı anda birden fazla stack çalıştırmayın (`:80` çakışması). `down -v` veritabanını siler.

---

## Mimari (kısa)

Feature-based Laravel: `app/Features/{Auth,Brands,Cars,Customers,Rentals}` + `app/Shared`.  
React frontend: `frontend/`.

| Katman | Görev |
|--------|--------|
| Controllers | HTTP |
| Requests | Validation |
| Resources | JSON DTO |
| Services | İş kuralları |

---

## Auth (özet)

Sanctum Bearer token. Public: marka/araç listeleri, register/login. Admin: yazma + müşteriler. Authenticated: kiralamalar.

Seed (development): `admin@example.com` / `user@example.com` (şifre: `password`).

Tam endpoint listesi ve filtreler için Scribe docs veya `routes/api.php`.

---

## Test ve CI

```bash
php artisan test
```

Testler SQLite `:memory:` (`phpunit.xml`).

| Workflow | Ne zaman | Ne yapar |
|----------|----------|----------|
| `.github/workflows/ci.yml` | PR / main dışı push | Backend test, frontend lint/build, prod Docker build check (push yok) |
| `.github/workflows/publish-images.yml` | `main` push | Test + GHCR’a backend/nginx image (`latest`, `sha-…`) |

---

## License

[MIT](https://opensource.org/licenses/MIT)

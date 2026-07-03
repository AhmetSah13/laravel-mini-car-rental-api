# Docker — Mini Car Rental API

Laravel uygulamasını Docker Compose ile PostgreSQL ve Redis ile birlikte çalıştırma rehberi.

> **PHP sürümü:** Image `php:8.4-cli` kullanır. Host'ta `composer install` PHP 8.4 ile yapıldıysa container da 8.4 olmalıdır.

## Servisler

| Servis   | Container adı              | Host port | Açıklama              |
|----------|----------------------------|-----------|------------------------|
| app      | mini_car_rental_app        | 8080      | Laravel API            |
| postgres | mini_car_rental_postgres   | 5434      | PostgreSQL 16          |
| redis    | mini_car_rental_redis      | 6380      | Redis 7                |

> Mevcut local `.env` dosyanız korunur. Docker için ayrı `.env` oluşturun (aşağıdaki adımlar).

---

## Kurulum

```bash
cp .env.docker.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan scribe:generate
```

---

## Test

```bash
docker compose exec app php artisan test
```

> Feature testler `phpunit.xml` içinde SQLite `:memory:` kullanır; testler için PostgreSQL gerekmez.

---

## Route list

```bash
docker compose exec app php artisan route:list
```

---

## Erişim adresleri

| Kaynak | URL |
|--------|-----|
| API Docs | http://127.0.0.1:8080/docs |
| API (örnek) | http://127.0.0.1:8080/api/cars |
| Health | http://127.0.0.1:8080/up |

---

## Cache / config temizliği

```bash
docker compose exec app php artisan config:clear
docker compose exec app php artisan cache:clear
```

---

## Storage izinleri (gerekirse)

```bash
docker compose exec app chmod -R 775 storage bootstrap/cache
```

---

## Yararlı komutlar

```bash
# Logları izle
docker compose logs -f app

# Container'a shell
docker compose exec app bash

# Servisleri durdur
docker compose down

# Volume dahil tam temizlik (DB verisi silinir)
docker compose down -v
```

---

## Seed kullanıcıları

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | admin |
| user@example.com | password | user |

---

## Yaygın hatalar

### `Connection refused` (PostgreSQL)

Postgres henüz hazır değilken migrate çalıştırılmış olabilir. Birkaç saniye bekleyip tekrar deneyin:

```bash
docker compose exec app php artisan migrate:fresh --seed
```

### `No application encryption key`

```bash
docker compose exec app php artisan key:generate
```

### `vendor/autoload.php` bulunamadı

Host'ta `vendor` yoksa container içinde kurun:

```bash
docker compose exec app composer install
```

### Port çakışması (8080, 5434, 6380)

Port kullanımdaysa `docker-compose.yml` içindeki host portlarını değiştirin.

### Redis connection error

`.env` içinde Docker servis adlarını kullanın:

```
REDIS_HOST=redis
REDIS_PORT=6379
DB_HOST=postgres
DB_PORT=5432
```

Host makineden bağlanırken `127.0.0.1:6380` ve `127.0.0.1:5434` kullanın.

### Storage / log yazma hatası

```bash
docker compose exec app chmod -R 775 storage bootstrap/cache
docker compose exec app php artisan cache:clear
```

### Windows + PowerShell curl

JSON gönderirken `Invoke-RestMethod` veya tek tırnaklı JSON ile `curl.exe` kullanın; `\"` kaçışı PowerShell'de body'yi bozar.

---

## Notlar

- Laravel Sail kullanılmaz; sade Dockerfile + docker-compose yapısı.
- Production için `php artisan serve` yerine Nginx + PHP-FPM önerilir; bu yapı geliştirme/portfolio amaçlıdır.
- Yeni composer paketi gerekmez; mevcut `composer.json` yeterlidir.

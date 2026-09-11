# Docker Operations Guide

Mini Car Rental için Docker / Compose operasyon rehberi.  
Üç ortam vardır: **development**, **local production build/test**, **registry deployment**. Aynı anda yalnızca **bir** stack çalıştırın (ortak host portu **80** ve kaynak çakışması).

---

## 1. Ortam özeti

| Ortam | Compose | Env (runtime) | Image kaynağı | Başlatma (özet) | URL / port | Ne zaman kullanılır |
|--------|---------|---------------|---------------|-----------------|------------|---------------------|
| **Development** | `docker-compose.yml` | `.env` (şablon: `.env.docker.example`) + `frontend/.env` | `Dockerfile` build + bind mount; frontend `node:22-alpine` | `docker compose up -d --build` | API `8080`, Reverb `8081`, Vite `5173`, PG `5434`, Redis `6380` | Günlük kod geliştirme |
| **Local production build/test** | `docker-compose.prod.yml` | `.env.production` (şablon: `.env.production.example`) | `Dockerfile.prod` + `docker/nginx/Dockerfile` (yerel build) | `--env-file .env.production … build` → `up -d` | Yalnızca **80** (Nginx) | Prod image’ları makinede denemek |
| **Registry deployment** | `docker-compose.deploy.yml` | `.env.deploy` (şablon: `.env.deploy.example`) | GHCR pull (`IMAGE_TAG`) — sunucuda **build yok** | `--env-file .env.deploy … pull` → `up -d` | Yalnızca **80** (Nginx) | Sunucu / GHCR ile çalıştırma |

**`env_file` vs `--env-file`:**  
- Compose içindeki `env_file:` → container ortam değişkenleri  
- CLI `--env-file` → Compose interpolasyonu (`${IMAGE_TAG}`, `${VITE_*}` build args)

---

## 2. Development

### Dosyalar

| Dosya | Rol |
|--------|-----|
| `docker-compose.yml` | Dev stack |
| `Dockerfile` | PHP 8.4 CLI + extension’lar; `artisan serve` |
| `.env.docker.example` | Compose DNS’li şablon → kopyala: `.env` |
| `frontend/.env` | Vite API / Reverb (tarayıcı → host portları) |

**`.env.docker.example` silinmez.** Görevi: development Compose için `DB_HOST=postgres`, `REDIS_HOST=redis`, cache Redis vb. değerleri vermek. Host-only Laravel kurulumu `.env.example` kullanır; Docker development mutlaka `.env.docker.example` → `.env` ile başlar.

### Mimari (bind mount)

- Kod host’tan container’a bind mount: `.:/var/www/html`
- **app:** Laravel API (`artisan serve`, host `8080` → `8000`)
- **reverb:** aynı image, `php artisan reverb:start`, host `8081`
- **frontend:** Vite `npm run dev -- --host 0.0.0.0`, host `5173`
- **postgres:** `5434:5432`
- **redis:** `6380:6379`

PHP image sürümü: `php:8.4-cli`. Host’ta Composer PHP 8.4 ile uyumlu olmalıdır. Laravel Sail kullanılmaz.

Frontend tarayıcıdan API/Reverb’e **host** adresleriyle bağlanır (`127.0.0.1:8080`, `127.0.0.1:8081`) — Compose servis adları `frontend/.env` içine yazılmaz.

### İlk kurulum

```bash
cp .env.docker.example .env
# APP_KEY boşsa key:generate adımında üretilir

docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan scribe:generate
```

PowerShell (mevcut `.env` varsa yedek):

```powershell
Copy-Item .env .env.local.backup
Copy-Item .env.docker.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

> `migrate:fresh` yalnızca disposable development DB içindir. Prod/deploy verisine uygulamayın.

### Port tablosu

| Servis | Host port | Açıklama |
|--------|-----------|----------|
| frontend | 5173 | Vite UI |
| app | 8080 | Laravel API (`artisan serve`) |
| reverb | 8081 | WebSocket |
| postgres | 5434 | DB (container içi 5432) |
| redis | 6380 | Cache (container içi 6379) |

### Erişim

| Kaynak | URL |
|--------|-----|
| Frontend | http://127.0.0.1:5173 |
| API | http://127.0.0.1:8080/api/cars |
| API Docs (Scribe) | http://127.0.0.1:8080/docs |
| Health | http://127.0.0.1:8080/up |

### Günlük komutlar

```bash
docker compose up -d --build   # oluştur / güncelle ve başlat
docker compose up -d           # mevcut image ile başlat
docker compose stop            # durdur (container kalır)
docker compose start           # durdurulmuş container’ları aç
docker compose ps
docker compose logs -f
docker compose logs -f app
docker compose exec app bash
docker compose down            # container + network sil; volume kalır
docker compose down -v         # volume’ler de silinir (DB kaybı)
```

### Test / artisan

```bash
docker compose exec app php artisan test
docker compose exec app php artisan route:list
docker compose exec app php artisan config:clear
docker compose exec app php artisan cache:clear
```

Feature testler `phpunit.xml` ile SQLite `:memory:` kullanır; test için PostgreSQL gerekmez.

### Seed kullanıcıları (development)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | admin |
| user@example.com | password | user |

### Development sorunları (özet)

| Belirti | Çözüm |
|---------|--------|
| Postgres connection refused | Birkaç sn bekle; `depends_on` healthy sonrası tekrar migrate |
| No application encryption key | `php artisan key:generate` |
| vendor/autoload.php yok | `docker compose exec app composer install` |
| Redis / DB host hatası | `.env` içinde `DB_HOST=postgres`, `REDIS_HOST=redis` (portlar **5432** / **6379**) |
| Host’tan DB/Redis | `127.0.0.1:5434` / `127.0.0.1:6380` |
| Storage yazma | `chmod -R 775 storage bootstrap/cache` |
| Port çakışması | `8080` / `8081` / `5173` / `5434` / `6380` kullanan süreci kapat veya compose port map’ini değiştir |

PowerShell’de JSON `curl`: `Invoke-RestMethod` veya `curl.exe` + tek tırnaklı body.

---

## 3. Local production build/test

Kaynak koddan **production benzeri** image üretip yerelde Nginx + PHP-FPM ile denemek için. Sunucu GHCR deploy’undan farklıdır (`docker-compose.deploy.yml`).

### Dosyalar

| Dosya | Rol |
|--------|-----|
| `docker-compose.prod.yml` | Local prod stack |
| `Dockerfile.prod` | Multi-stage Composer + PHP-FPM |
| `docker/nginx/Dockerfile` | Vite build + SPA + Laravel `public/` + conf |
| `.env.production.example` → `.env.production` | Runtime + build-time `VITE_*` |

Bind mount **yok**. Kod image içine kopyalanır. Volume’ler: `postgres_data_prod`, `redis_data_prod`, `app_storage`.

### Servisler

| Servis | Image / build | Host port | Rol |
|--------|---------------|-----------|-----|
| nginx | `docker/nginx/Dockerfile` | **80** | SPA, `/api`, `/broadcasting/auth`, WS `/app` |
| app | `Dockerfile.prod` (PHP-FPM) | yok | Laravel |
| reverb | aynı backend image | yok (internal 8081) | WebSocket |
| postgres | `postgres:16` | yok | DB |
| redis | `redis:7-alpine` | yok | Cache |

### Env hazırlığı

```powershell
Copy-Item .env.production.example .env.production
```

Doldurulacaklar (değerleri buraya yazmayın):

- `APP_KEY` (bir kez üret; image’a gömme)
- `DB_PASSWORD` = `POSTGRES_PASSWORD`
- `REVERB_APP_*` ve `VITE_REVERB_APP_KEY` (key eşleşmeli)
- İsteğe bağlı domain: `APP_URL`, `VITE_REVERB_HOST` / `SCHEME` / `PORT`

`APP_KEY` üretme örneği:

```powershell
docker compose -f docker-compose.prod.yml run --rm --no-deps app php artisan key:generate --show
```

Çıktıyı `.env.production` içine yapıştırın. **`.env.production` commit edilmez.**

### Build / up / migrate / smoke

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan migrate --force
```

İsteğe bağlı seed:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan db:seed --force
```

`migrate:fresh` / `db:wipe` bu akışta yok.

Smoke:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl http://127.0.0.1/healthz
curl http://127.0.0.1/up
curl http://127.0.0.1/api/cars
```

Tarayıcı: http://127.0.0.1/

Log / stop:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f nginx app reverb
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

`down -v` → `postgres_data_prod`, `redis_data_prod`, `app_storage` silinir.

### Local prod notları

- Entrypoint: `APP_KEY` varken `config:cache` / `route:cache` / `view:cache`; `key:generate` ve migrate yok.
- Frontend API: relative `/api` (same origin).
- Tarayıcı WS: Nginx (ör. port 80); Laravel publish: `REVERB_HOST=reverb`.
- Scribe `require-dev`; prod image `config/scribe.php` kaldırır.
- App healthcheck: `php-fpm -t`.
- TLS bu demo compose’ta yok.
- Kaynak rollback: git checkout → yeniden `build` / `up` (local tag’ler: `mini-car-rental-backend-prod`, `mini-car-rental-nginx-prod`).

---

## 4. Registry deployment

Sunucuda kaynak koddan build **yok**. CI (`publish-images.yml`) GHCR’a image basar; sunucu pull eder.

### Dosyalar / image’lar

| Rol | Image |
|-----|--------|
| Laravel PHP-FPM + Reverb | `ghcr.io/ahmetsah13/mini-car-rental-backend` |
| Nginx + SPA | `ghcr.io/ahmetsah13/mini-car-rental-nginx` |

| Dosya | Rol |
|--------|-----|
| `docker-compose.deploy.yml` | Pull & run (`build:` yok) |
| `.env.deploy.example` → `.env.deploy` | Runtime + `IMAGE_TAG` |

`app` / `reverb` / `nginx` aynı `IMAGE_TAG` kullanır.

### Public vs private GHCR

Public package:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml pull
```

Private:

```bash
docker login ghcr.io -u AhmetSah13
# PAT with read:packages (not account password)
docker compose --env-file .env.deploy -f docker-compose.deploy.yml pull
```

### `.env.deploy` oluşturma

```bash
cp .env.deploy.example .env.deploy
```

Doldur: `APP_KEY`, `DB_*` = `POSTGRES_*`, `REVERB_APP_*`, `APP_URL`, `IMAGE_TAG`.  
**Commit etme.**

### `IMAGE_TAG`: `latest` vs `sha-…`

| Tag | Anlam |
|-----|--------|
| `latest` | Kayar pointer; hızlı deneme |
| `sha-<git-sha>` | CI commit’ine kilitli; rollback için tercih |

```env
IMAGE_TAG=sha-c7daf0a0123456789abcdef0123456789abcdef0
```

### Pull / up / migrate / smoke

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml pull
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d
docker compose --env-file .env.deploy -f docker-compose.deploy.yml exec app php artisan migrate --force
docker compose --env-file .env.deploy -f docker-compose.deploy.yml ps
```

Host’ta yalnızca **80**. Postgres / Redis / Reverb / FPM internal `deploy` network’te.

Smoke:

```bash
curl -I http://127.0.0.1/
curl -i http://127.0.0.1/up
curl -i http://127.0.0.1/healthz
curl -i http://127.0.0.1/api/cars
```

Loglar:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml logs --tail=100
docker compose --env-file .env.deploy -f docker-compose.deploy.yml logs --tail=100 nginx app reverb
```

### Yeni sürüme geçiş

1. `.env.deploy` → yeni `IMAGE_TAG=sha-…`  
2. `pull` → `up -d` → gerekirse `migrate --force`

Volume’ler veri taşır.

### Rollback (SHA)

1. `IMAGE_TAG` = önceki bilinen iyi SHA  
2. `pull` → `up -d`  

İleri-only migration eski kodla uyumsuzsa: önce DB backup restore, sonra tag rollback. Upgrade öncesi Postgres backup alın.

### Stop / volumes

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml down      # volume kalır
docker compose --env-file .env.deploy -f docker-compose.deploy.yml down -v   # VERİ SİLİNİR
```

Deploy volume’leri: `deploy_postgres_data`, `deploy_redis_data`, `deploy_app_storage`.

### Sunucuda gerekenler

Docker / Compose, `.env.deploy`, `docker-compose.deploy.yml`.  
Node, Composer, `Dockerfile.prod` ve kaynak build **gerekmez**.

---

## 5. Environment dosyaları

| Dosya | Amaç | Git |
|--------|------|-----|
| `.env.example` | Genel Laravel şablonu; host local / CI (`cp .env.example .env`) | Evet (şablon) |
| `.env.docker.example` | **Development Compose** şablonu (`postgres` / `redis` DNS). `.env` yapmak için kopyalanır | Evet (şablon) |
| `.env.production.example` | Local prod build/test şablonu (+ `VITE_*`, `POSTGRES_*`) | Evet (şablon) |
| `.env.deploy.example` | Registry deploy şablonu (`IMAGE_TAG`, `POSTGRES_*`; Vite build arg yok) | Evet (şablon) |
| `.env` | Development runtime (Compose `env_file`) | **Hayır** (`.gitignore`) |
| `.env.production` | Local prod runtime + build interpolasyonu | **Hayır** |
| `.env.deploy` | Deploy runtime + `IMAGE_TAG` | **Hayır** |
| `frontend/.env` | Vite dev (tarayıcı → host API/Reverb) | Genelde ignore / local |

Şablonları (`.env.*.example`) ignore etmeyin; gerçek secret dosyalarını commit etmeyin.

---

## 6. Port çakışmaları

### Aynı anda birden fazla stack

| Stack | Host 80 | Diğer tipik portlar |
|--------|---------|---------------------|
| Development | hayır | 8080, 8081, 5173, 5434, 6380 |
| Local prod | **80** | — |
| Deploy | **80** | — |

**Local prod** ile **deploy** aynı anda çalışmaz (ikisi de `:80`). Dev ile prod/deploy birlikte denenebilir ama kaynak/CPU ve kafa karışıklığı artar; öneri: tek stack.

### Stack kapatma

```bash
# Development
docker compose stop          # veya: docker compose down

# Local production
docker compose --env-file .env.production -f docker-compose.prod.yml down

# Registry deploy
docker compose --env-file .env.deploy -f docker-compose.deploy.yml down
```

### `start` vs `up -d`

| Komut | Davranış |
|--------|----------|
| `docker compose start` | Önceden oluşturulmuş durmuş container’ları başlatır; yoksa oluşturmaz |
| `docker compose up -d` | Yoksa oluşturur, varsa güncelleyip başlatır |

### `down` vs `down -v`

| Komut | Etki |
|--------|------|
| `down` | Container + network silinir; **named volume kalır** |
| `down -v` | Volume’ler de silinir → **PostgreSQL verisi kaybolur** |

---

## 7. Güvenlik ve veri kaybı uyarıları

- `.env`, `.env.production`, `.env.deploy` commit edilmez.
- `down -v` ilgili stack’in Postgres (ve Redis/storage) verisini siler; backup olmadan kullanmayın.
- Production / deploy: `APP_ENV=production`, `APP_DEBUG=false`.
- Prod/deploy Compose’ta DB / Redis / Reverb **host’a publish edilmez**; yalnızca Nginx `80`.
- Gerçek veride `migrate:fresh` / `db:wipe` yok; migration öncesi Postgres backup.
- Secret’ları (`APP_KEY`, DB şifreleri, `REVERB_APP_SECRET`) image’a gömmeyin.
- Queue worker yok; `QUEUE_CONNECTION=sync` (mevcut ürün davranışı).

---

## 8. Sorun giderme

### Durum ve log

```bash
# Dev
docker compose ps
docker compose logs --tail=100
docker compose logs --tail=100 app

# Prod local
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100

# Deploy
docker compose --env-file .env.deploy -f docker-compose.deploy.yml ps
docker compose --env-file .env.deploy -f docker-compose.deploy.yml logs --tail=100
```

### Healthcheck `starting` / `unhealthy`

- 15–30 sn bekleyip `ps` tekrarlayın (`start_period`).
- `app` (prod/deploy): `php-fpm -t`; entrypoint / `APP_KEY` loglarına bakın.
- `nginx`: `/healthz` (curl image’da olmalı).
- `postgres`: `POSTGRES_*` ile `DB_*` eşleşmeli.
- `reverb`: port `8081` dinleme; `REVERB_SERVER_*` / `REVERB_APP_*`.

### `port already allocated`

Başka stack veya süreç aynı host portunu kullanıyor. Diğer compose’u `down`/`stop` edin veya port map’i değiştirin.

### GHCR `unauthorized`

Private package için `docker login ghcr.io` + `read:packages` token. Kullanıcı adının package erişimi olduğundan emin olun.

### `manifest unknown` / pull bulunamadı

- `IMAGE_TAG` yanlış veya image henüz publish edilmedi.
- Image adı / owner (`ghcr.io/ahmetsah13/...`) kontrol.
- CI `publish-images.yml` main push’unun başarılı olduğunu doğrulayın.
- `sha-` tag’inin tam commit ile eşleştiğini kontrol edin.

### Development ek hatalar

- `Connection refused` (Postgres): health / bekleme.
- Eksik `APP_KEY` / `vendor`: `key:generate` / `composer install`.
- Yanlış Redis/DB host: Docker DNS vs host port karışıklığı (bölüm 2).

---

## 9. Manuel backup ve restore testi

Bu bölüm **registry deployment** stack’i içindir (`docker-compose.deploy.yml` + `.env.deploy`).  
Amaç: yedeğin **alınabilir** ve **ayrı bir test veritabanına geri yüklenebilir** olduğunu doğrulamak.

**Yapılmaz:** çalışan ana veritabanına (`POSTGRES_DB` / `DB_DATABASE`) restore, ana DB’yi silme/`DROP`, test DB silme, `migrate:fresh`, `down -v`.

**Sınır:** Aynı makinede tutulan yedek, disk veya makine kaybına karşı yeterli değildir. Off-site / başka disk kopyası planlayın.

Komutlar **Ubuntu / WSL Bash** içindir. Proje kökünden çalıştırın. Secret’ları komuta yazmayın; Postgres container içindeki `POSTGRES_*` kullanılır.

```bash
COMPOSE='docker compose --env-file .env.deploy -f docker-compose.deploy.yml'
```

Stack’in ayakta ve `postgres` healthy olduğundan emin olun: `$COMPOSE ps`

### 1) Proje dışında yedek klasörü

Amaç: yedeği git/repo ve bind mount dışında, kullanıcıya özel izinlerle tutmak.

```bash
BACKUP_DIR="${HOME}/backups/mini-car-rental"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
```

`chmod 700` klasörü korur. Yeni yedek dosyasının izinlerini sınırlamak için dump’tan hemen önce `umask 077` kullanın (aşağıda).

### 2) `pg_dump -Fc` ile tarihli yedek

Amaç: taşınabilir custom-format arşiv üretmek (restore/list için uygun); yeni dosyayı başkalarının okuyamayacağı şekilde oluşturmak.

```bash
umask 077
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="${BACKUP_DIR}/mini_car_rental_${STAMP}.dump"

$COMPOSE exec -T postgres \
  sh -c 'pg_dump -Fc -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  > "$BACKUP_FILE"
DUMP_STATUS=$?
```

### 3) Başarı kontrolü

Amaç: başarısız veya boş çıktıyı geçerli yedek saymamak.

```bash
if [ "$DUMP_STATUS" -ne 0 ] || [ ! -s "$BACKUP_FILE" ]; then
  echo "Yedek BAŞARISIZ (exit=${DUMP_STATUS}). Dosya siliniyor / yok sayılıyor."
  rm -f "$BACKUP_FILE"
  exit 1
fi

ls -lh "$BACKUP_FILE"
echo "Yedek OK: $BACKUP_FILE"
```

### 4) `pg_restore --list` ile arşiv kontrolü

Amaç: dump’ın okunabilir bir arşiv olduğunu (içindekiler listesi) doğrulamak.  
`head` ile borulamayın: boru, `pg_restore` çıkış kodunu gizleyebilir.

```bash
$COMPOSE exec -T postgres \
  sh -c 'pg_restore --list' \
  < "$BACKUP_FILE"
LIST_STATUS=$?

if [ "$LIST_STATUS" -ne 0 ]; then
  echo "Arşiv listesi BAŞARISIZ (exit=${LIST_STATUS}). Restore adımına geçmeyin."
  exit 1
fi
echo "Arşiv listesi OK."
```

`LIST_STATUS` sıfır değilse **restore ve sonraki adımlara geçmeyin**; ana DB’ye dokunmayın.

### 5) Ayrı test veritabanı oluşturma

Amaç: restore’u **ana uygulamadan izole** bir DB’de denemek.  
`template0` ile temiz, locale/encoding sürprizi az bir hedef DB oluşturun.

```bash
TEST_DB='mini_car_rental_restore_test'

$COMPOSE exec -T postgres sh -c \
  'createdb -U "$POSTGRES_USER" -T template0 '"$TEST_DB"
CREATE_STATUS=$?

if [ "$CREATE_STATUS" -ne 0 ]; then
  echo "Test DB oluşturma BAŞARISIZ (exit=${CREATE_STATUS})."
  echo "DB zaten varsa durun. Yeni ve kullanılmayan bir test veritabanı adı seçerek oluşturma adımını tekrar uygulayın."
  echo "Restore adımına geçmeyin."
  exit 1
fi
echo "Test DB OK: $TEST_DB"
```

Oluşturma başarısızsa (ör. isim çakışması) **durun**; `TEST_DB` için henüz kullanılmayan bir ad seçip **yalnızca oluşturma adımını** yeniden çalıştırın. **Restore’a geçmeyin.** Bu bölümde `DROP DATABASE` yoktur.

### 6) Test DB’ye restore

Amaç: yedeğin `--exit-on-error --single-transaction` ile tutarlı şekilde yüklendiğini görmek.  
Yalnızca adım 4 ve 5 başarılıysa çalıştırın.

```bash
$COMPOSE exec -T postgres sh -c \
  'pg_restore --exit-on-error --single-transaction -U "$POSTGRES_USER" -d '"$TEST_DB" \
  < "$BACKUP_FILE"
RESTORE_STATUS=$?

if [ "$RESTORE_STATUS" -ne 0 ]; then
  echo "Restore BAŞARISIZ (exit=${RESTORE_STATUS}). Ana veritabanına dokunulmadı."
  exit 1
fi
echo "Restore test DB'ye OK: $TEST_DB"
```

### 7) Ana tabloların kayıt sayılarını karşılaştırma

Amaç: kaynak DB ile test DB’de satır sayılarına bakarak şema + veri için kaba bir smoke kontrolü yapmak.

```bash
COUNT_SQL="SELECT 'users' AS t, COUNT(*)::bigint AS n FROM users
UNION ALL SELECT 'brands', COUNT(*) FROM brands
UNION ALL SELECT 'cars', COUNT(*) FROM cars
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'rentals', COUNT(*) FROM rentals
UNION ALL SELECT 'migrations', COUNT(*) FROM migrations
ORDER BY 1;"

echo '=== Kaynak (POSTGRES_DB) ==='
$COMPOSE exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "'"$COUNT_SQL"'"'

echo "=== Test ($TEST_DB) ==="
$COMPOSE exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d '"$TEST_DB"' -v ON_ERROR_STOP=1 -c "'"$COUNT_SQL"'"'
```

**Yorumlama:**

- Yedek alındıktan sonra kaynak DB’ye yazma olduysa sayılar **bilerek farklı** olabilir; bu her zaman bozuk yedek demek değildir.
- Sayıların eşit olması, satır içeriklerinin veya tüm şemanın birebir aynı olduğunu **kanıtlamaz**; yalnızca kaba bir tutarlılık sinyalidir.
- Farkı veya hatayı görürseniz süreci inceleyin; **ana DB’ye restore etmeyin**.

### Hatırlatmalar

- Bu test, yedeğin **okunabilirliğini** doğrular; felaket kurtarma planının tamamı değildir.
- Yedeği mümkünse başka disk / makine / object storage’a kopyalayın.
- Gerçek kesinti senaryosunda restore prosedürünü ayrı bir runbook ve yedek kopyası ile önceden prova edin.
- Bu rehber şimdilik veritabanı **silme** adımı içermez.

---

## Hızlı komut özeti

**Development**

```bash
cp .env.docker.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

**Local production**

```powershell
Copy-Item .env.production.example .env.production
# secrets + APP_KEY doldur
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan migrate --force
```

**Registry deploy**

```bash
cp .env.deploy.example .env.deploy
# secrets + IMAGE_TAG=sha-... doldur
docker compose --env-file .env.deploy -f docker-compose.deploy.yml pull
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d
docker compose --env-file .env.deploy -f docker-compose.deploy.yml exec app php artisan migrate --force
```

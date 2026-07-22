# Production Docker — Mini Car Rental

Development stack (`docker-compose.yml`) is unchanged. This guide covers **production** images and `docker-compose.prod.yml` only.

## Architecture

| Service | Image / build | Host ports | Role |
|---------|---------------|------------|------|
| `nginx` | `docker/nginx/Dockerfile` | **80** | SPA + `/api` + `/broadcasting/auth` + WS `/app` |
| `app` | `Dockerfile.prod` (PHP-FPM) | none | Laravel |
| `reverb` | same backend image | none (internal 8081) | WebSocket |
| `postgres` | `postgres:16` | none | Database |
| `redis` | `redis:7-alpine` | none | Cache |

No source bind mounts. Application code is baked into images. Persistent data uses named volumes (`postgres_data_prod`, `redis_data_prod`, `app_storage`).

## 1. Create production env

```powershell
Copy-Item .env.production.example .env.production
```

Edit `.env.production`:

1. Set a real `APP_KEY` (generate **once** on a trusted machine, do not bake into the image):

```powershell
# Example: temporary local PHP, or one-off container after first build
docker compose -f docker-compose.prod.yml run --rm --no-deps app php artisan key:generate --show
```

Paste the output into `APP_KEY=base64:...` in `.env.production`.

2. Replace placeholders:
   - `DB_PASSWORD` / `POSTGRES_PASSWORD` (keep them equal)
   - `REVERB_APP_ID` / `REVERB_APP_KEY` / `REVERB_APP_SECRET`
   - `VITE_REVERB_APP_KEY` (must match `REVERB_APP_KEY`)
   - For a real domain: `APP_URL`, `VITE_REVERB_HOST`, `VITE_REVERB_SCHEME`, `VITE_REVERB_PORT`

**Never commit `.env.production`.**

Compose reads build-time Vite args from the project environment file. Prefer:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

This loads `VITE_*` and other `${...}` substitutions from `.env.production` without committing secrets.

## 2. Build images

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml build
```

## 3. Start stack

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 4. Run migrations (manual — not automatic)

Destructive commands (`migrate:fresh`, `db:wipe`, etc.) are **not** part of this flow.

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan migrate --force
```

Seed only if you intentionally want demo data:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan db:seed --force
```

## 5. Health checks

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl http://127.0.0.1/healthz
curl http://127.0.0.1/up
```

Browser: [http://127.0.0.1/](http://127.0.0.1/)

## 6. Logs

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f nginx app reverb
```

## 7. Stop stack

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## 8. Named volume risk / `down -v`

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml down -v
```

**Warning:** `-v` deletes `postgres_data_prod`, `redis_data_prod`, and `app_storage`. Database and uploaded/storage data are lost. Prefer plain `down` unless you intentionally reset data.

## 9. Rollback (logical)

1. `docker compose --env-file .env.production -f docker-compose.prod.yml down` (keep volumes).
2. Check out the previous git revision of Docker/prod files.
3. `docker compose --env-file .env.production -f docker-compose.prod.yml build`
4. `docker compose --env-file .env.production -f docker-compose.prod.yml up -d`
5. Run only forward-safe migrations if the old code requires them; do not `migrate:fresh` to “fix” prod.

Image tags are project-local (`mini-car-rental-backend-prod`, `mini-car-rental-nginx-prod`). Retag/push to a registry if you need remote rollback.

## 10. Development vs production

| Topic | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
|-------|--------------------------------------|----------------------------------------|
| PHP | `artisan serve` (CLI image) | PHP-FPM (`Dockerfile.prod`) |
| Frontend | Vite `npm run dev` on 5173 | Static build via Nginx |
| Code | Bind mounts | Copied into image |
| Public entry | Many host ports (8080, 8081, 5173, …) | Only Nginx **80** |
| Reverb | Published 8081 | Internal; Nginx `/app` |
| Env | `.env` | `.env.production` |
| Migrations | Manual / docs | Manual `--force` after up |
| Queue worker | Not used (`sync`) | Not used (`sync`) |

### Development commands

```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
```

### Production commands

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan migrate --force
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## Notes

- Entrypoint caches config/routes/views when `APP_KEY` is set; it never runs `key:generate` or migrations.
- Frontend API base URL is relative `/api` (same origin).
- Browser WebSocket targets Nginx (`VITE_REVERB_HOST` + port 80 by default); Laravel publishes to `REVERB_HOST=reverb`.
- TLS/HTTPS termination is out of scope for this demo compose (add a reverse proxy or certificates for real deploy).
- Postgres credentials come from `POSTGRES_*` in `.env.production` (via `env_file`), not hard-coded in Compose.
- Production image removes `config/scribe.php` because Scribe is `require-dev` and is not installed with `composer install --no-dev`.
- App healthcheck uses `php-fpm -t` (the FPM image has no `pgrep`).

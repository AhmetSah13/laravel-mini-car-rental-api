# Mini Car Rental API

![Laravel CI](https://github.com/AhmetSah13/laravel-mini-car-rental-api/actions/workflows/ci.yml/badge.svg)

**Repository:** [github.com/AhmetSah13/laravel-mini-car-rental-api](https://github.com/AhmetSah13/laravel-mini-car-rental-api)

A production-oriented mini car rental REST API built with Laravel. It includes token authentication, role-based authorization, rental business logic, API documentation, automated tests, Docker support, and a GitHub Actions CI pipeline.

---

## Tech Stack

- **PHP** 8.2+ (8.4 recommended)
- **Laravel** 12
- **PostgreSQL** 16
- **Redis** 7
- **Laravel Sanctum** — API token authentication
- **Scribe** — API documentation
- **Docker** & Docker Compose
- **GitHub Actions** — CI/CD
- **PHPUnit** / Laravel Feature Tests

---

## Features

- Brand CRUD
- Car CRUD
- Customer CRUD
- Rental CRUD
- Rental business rules (pricing, availability, status sync)
- Car availability management
- Auth: register, login, logout, me
- Admin / user role authorization
- Standard API response format (`ApiResponse`)
- `BusinessException` handling
- Pagination, filtering, and sorting
- Structured logging
- Rate limiting
- API documentation (Scribe)
- Docker support
- CI pipeline

---

## Architecture

This project uses a **feature-based architecture**. Each domain lives under `app/Features/` with its own controllers, requests, resources, and services where needed.

```
app/Features/Auth
app/Features/Brands
app/Features/Cars
app/Features/Customers
app/Features/Rentals
app/Shared
```

| Layer | Responsibility |
|-------|----------------|
| **Controllers** | HTTP request/response handling |
| **Requests** | Input validation |
| **Resources** | Response DTOs (JSON transformation) |
| **Services** | Business logic (e.g. `RentalService`, `CarService`) |
| **Shared** | Common enums, exceptions, `ApiResponse`, logging helpers |

Models remain in `app/Models/`.

---

## API Response Format

### Success

```json
{
  "success": true,
  "message": "Araçlar başarıyla listelendi.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin."
}
```

Validation errors follow Laravel's standard `422` format with an `errors` object.

---

## Authentication

The API uses **Laravel Sanctum** with Bearer token authentication (no session/cookie auth).

1. Obtain a token via `POST /api/auth/register` or `POST /api/auth/login`
2. Send the token on protected requests:

```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Default seed users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| User | `user@example.com` | `password` |

---

## Authorization Rules

| Access level | Endpoints |
|--------------|-----------|
| **Public** | `GET /api/brands`, `GET /api/brands/{brand}`, `GET /api/cars`, `GET /api/cars/{car}`, `POST /api/auth/register`, `POST /api/auth/login` |
| **Admin** | Brand write (POST/PUT/PATCH/DELETE), car write (POST/PUT/PATCH/DELETE), all customer endpoints |
| **Authenticated** | All rental endpoints, `GET /api/auth/me`, `POST /api/auth/logout` |

---

## Important Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **Auth** |
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive token |
| GET | `/api/auth/me` | Bearer | Get authenticated user |
| POST | `/api/auth/logout` | Bearer | Revoke current token |
| **Brands** |
| GET | `/api/brands` | Public | List brands (paginated) |
| POST | `/api/brands` | Admin | Create brand |
| GET | `/api/brands/{brand}` | Public | Show brand |
| PUT | `/api/brands/{brand}` | Admin | Update brand |
| DELETE | `/api/brands/{brand}` | Admin | Delete brand |
| **Cars** |
| GET | `/api/cars` | Public | List cars (filter/sort/paginate) |
| POST | `/api/cars` | Admin | Create car |
| GET | `/api/cars/{car}` | Public | Show car |
| PUT | `/api/cars/{car}` | Admin | Update car |
| DELETE | `/api/cars/{car}` | Admin | Delete car |
| **Customers** |
| GET | `/api/customers` | Admin | List customers |
| POST | `/api/customers` | Admin | Create customer |
| GET | `/api/customers/{customer}` | Admin | Show customer |
| PUT | `/api/customers/{customer}` | Admin | Update customer |
| DELETE | `/api/customers/{customer}` | Admin | Delete customer |
| **Rentals** |
| GET | `/api/rentals` | Bearer | List rentals |
| POST | `/api/rentals` | Bearer | Create rental |
| GET | `/api/rentals/{rental}` | Bearer | Show rental |
| PUT | `/api/rentals/{rental}` | Bearer | Update rental |
| DELETE | `/api/rentals/{rental}` | Bearer | Delete rental |

---

## Car Filtering Example

```http
GET /api/cars?status=available&brand_id=1&min_price=500&max_price=1500&sort_by=daily_price&sort_direction=asc&per_page=5
```

| Parameter | Description |
|-----------|-------------|
| `brand_id` | Filter by brand |
| `status` | `available`, `rented`, `maintenance` |
| `min_price` / `max_price` | Daily price range |
| `sort_by` | `id`, `daily_price`, `year`, `created_at` |
| `sort_direction` | `asc` or `desc` |
| `per_page` | Items per page (1–100) |

---

## API Documentation

Scribe generates interactive API docs:

| Resource | URL |
|----------|-----|
| HTML docs | http://127.0.0.1:8080/docs |
| Postman collection | http://127.0.0.1:8080/docs.postman |
| OpenAPI spec | http://127.0.0.1:8080/docs.openapi |

Generate documentation:

```bash
php artisan scribe:generate
```

---

## Local Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --no-reload --port=8080
```

API base URL: `http://127.0.0.1:8080`

---

## Docker Setup

See [DOCKER.md](DOCKER.md) for full details.

```powershell
Copy-Item .env .env.local.backup
Copy-Item .env.docker.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan test
```

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:8080/api/cars |
| Docs | http://127.0.0.1:8080/docs |

---

## Testing

```bash
php artisan test
```

**Current test suite:** 52 tests passing

Feature tests use SQLite in-memory (`phpunit.xml`). The CI pipeline runs migrations against PostgreSQL before executing tests.

---

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on **push** and **pull_request**:

1. Starts PostgreSQL and Redis service containers
2. Installs Composer dependencies
3. Generates `APP_KEY`
4. Runs `migrate:fresh --seed`
5. Runs `php artisan test`

Workflow file: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Logs

Structured logs are written to:

```
storage/logs/laravel.log
```

Example events:

- `User logged in`
- `Rental created`
- `Unavailable car rental attempt`
- `Rate limit exceeded`

---

## Rate Limiting

| Limiter | Limit | Scope |
|---------|-------|-------|
| `auth` | 5 req/min | Login & register (email+IP / IP) |
| `public-api` | 60 req/min | Public GET brands & cars |
| `auth-api` | 120 req/min | Authenticated & admin endpoints |

When exceeded, the API returns `429` with:

```json
{
  "success": false,
  "message": "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin."
}
```

---

## Project Status

This is an **educational / portfolio** project that demonstrates production-oriented API patterns: feature-based structure, centralized responses, auth/authorization, business rules, observability, rate limiting, documentation, containerization, and automated testing. It is not intended as a drop-in production deployment without further hardening (e.g. reverse proxy, queue workers, monitoring).

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

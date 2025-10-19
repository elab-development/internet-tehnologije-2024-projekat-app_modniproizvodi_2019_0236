# Aplikacija za prodaju modnih proizvoda

Jednostavna full‑stack aplikacija za katalog i porudžbine modnih proizvoda. Frontend je React (SPA), backend je Laravel (REST API). Autentikacija preko tokena (Sanctum).

## Tehnologije
- **Backend:** PHP 8+, Laravel 10/11, Sanctum, MySQL/MariaDB
- **Frontend:** React, Fetch/Axios


## Zahtevi
- PHP 8.2+, Composer
- Node 18+, npm/yarn
- MySQL/MariaDB
- Git (opciono)

## Backend — pokretanje
```bash
cp .env.example .env
# u .env podesi DB i APP_URL="http://localhost:8000"
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

## Frontend — pokretanje
U `frontend/` (ili folderu tvog React projekta):
```bash
npm install

npm run dev
```
Aplikacija radi na `http://localhost:3000` (CRA).

## API — kratki pregled
Base URL: `http://localhost:8000/api`  
Header: `Accept: application/json` (+ `Authorization: Bearer <token>` kada je potrebno)

**Autentikacija**
- `POST /register` — body: `{ name, username, email, password, password_confirmation }`
- `POST /login` — body: `{ identifier, password }` → vraća `token`
- `GET /me` — zahteva Bearer token
- `POST /logout` — poništava trenutni token

**Proizvodi**
- `GET /products` — filteri: `q, only_active, category_id, price_min, price_max, sort=price_asc|price_desc, per_page`
- `POST /products` — JSON (image URL) ili `multipart/form-data` (image fajl)
- `GET /products/{id}`
- `PATCH /products/{id}` / `DELETE /products/{id}`

**Porudžbine**
- `GET /orders?q=&status=&per_page=`
- `POST /orders` — `{ customer_name, customer_email, customer_phone?, items:[{product_id, quantity}] }`

 

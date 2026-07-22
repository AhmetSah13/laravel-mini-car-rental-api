#!/bin/sh
set -e

cd /var/www/html

# Named volume may mask image storage tree — ensure Laravel dirs exist
mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

# Do not generate APP_KEY. Do not run migrations.
if [ -n "${APP_KEY:-}" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
else
    echo "entrypoint: APP_KEY is empty; skipping config/route/view cache."
fi

exec "$@"

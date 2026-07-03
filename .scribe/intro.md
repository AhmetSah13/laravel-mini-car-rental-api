# Introduction

Laravel Sanctum token authentication kullanan mini araç kiralama API projesi.

<aside>
    <strong>Base URL</strong>: <code>http://localhost:8000</code>
</aside>

    Bu dokümantasyon, Mini Araç Kiralama API'sinin tüm endpointlerini frontend ve mobile geliştiriciler için açıklar.

    ## Kimlik Doğrulama

    API, **Laravel Sanctum** ile token tabanlı kimlik doğrulama kullanır. Session/cookie auth yoktur.

    1. `POST /api/auth/login` veya `POST /api/auth/register` ile token alın.
    2. Korumalı endpointlerde header gönderin:

    ```
    Authorization: Bearer {token}
    Content-Type: application/json
    Accept: application/json
    ```

    ## Roller

    - **Public**: Auth gerektirmez (marka/araç listeleme ve detay).
    - **Authenticated**: Geçerli Bearer token gerekir (kiralama endpointleri).
    - **Admin**: Bearer token + `admin` rolü gerekir (marka/araç yazma, tüm müşteri işlemleri).

    ## Response Formatı

    Başarılı yanıtlar `ApiResponse` standardını kullanır:

    ```json
    {
      "success": true,
      "message": "...",
      "data": {}
    }
    ```

    Sayfalı listelerde ek olarak `meta` alanı döner (`current_page`, `per_page`, `total`, `last_page`).

    Hata yanıtları:

    ```json
    {
      "success": false,
      "message": "..."
    }
    ```

    Validasyon hataları Laravel 422 formatındadır:

    ```json
    {
      "message": "The given data was invalid.",
      "errors": {
        "field": ["Hata mesajı"]
      }
    }
    ```


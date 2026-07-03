# Authenticating requests

To authenticate requests, include an **`Authorization`** header with the value **`"Bearer {YOUR_TOKEN}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

Token almak için `POST /api/auth/login` veya `POST /api/auth/register` endpointlerini kullanın.
Dönen `token` değerini tüm korumalı isteklerde şu header ile gönderin:

`Authorization: Bearer {token}`

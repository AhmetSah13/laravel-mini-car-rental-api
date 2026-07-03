<?php

namespace App\Shared\Exceptions;

use RuntimeException;

/**
 * Domain / iş kuralı ihlali exception'ı.
 *
 * Service veya domain katmanında iş kuralları ihlal edildiğinde fırlatılır.
 * abort() yerine kullanılır; merkezi handler ApiResponse::error() ile JSON döner.
 *
 * @example throw new BusinessException('Seçilen araç şu an kiralanabilir durumda değil.', 400);
 */
class BusinessException extends RuntimeException
{
    public function __construct(
        string $message,
        protected int $statusCode = 400,
        protected mixed $errors = null
    ) {
        parent::__construct($message);
    }

    /** HTTP status code (varsayılan: 400) */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /** Ek hata detayları (validation benzeri yapılar için) */
    public function getErrors(): mixed
    {
        return $this->errors;
    }
}

<?php

declare(strict_types=1);

namespace AdventurerGuild\Http;

final class Request
{
    private array $attributes = [];

    public function __construct(
        private array $headers,
        private array $queryParams,
        private array $parsedBody,
        private array $serverParams,
        private string $method,
        private string $uri
    ) {
    }

    public function getHeaderLine(string $name): string
    {
        $key = strtolower($name);
        if (isset($this->headers[$key])) {
            return (string) $this->headers[$key];
        }

        if (function_exists('getallheaders')) {
            foreach (getallheaders() as $headerName => $headerValue) {
                if (strtolower((string) $headerName) === $key) {
                    return (string) $headerValue;
                }
            }
        }

        if ($key === 'authorization') {
            return (string) ($this->serverParams['HTTP_AUTHORIZATION'] ?? $this->serverParams['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        }

        return '';
    }

    public function getQueryParams(): array
    {
        return $this->queryParams;
    }

    public function getParsedBody(): array
    {
        return $this->parsedBody;
    }

    public function withAttribute(string $name, mixed $value): self
    {
        $clone = clone $this;
        $clone->attributes[$name] = $value;
        return $clone;
    }

    public function getAttribute(string $name, mixed $default = null): mixed
    {
        return $this->attributes[$name] ?? $default;
    }
}

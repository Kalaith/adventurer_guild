<?php

declare(strict_types=1);

namespace AdventurerGuild\Core;

use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use ReflectionMethod;
use Throwable;

final class Router
{
    private array $routes = [];
    private string $basePath = '';

    public function setBasePath(string $basePath): void
    {
        $this->basePath = rtrim($basePath, '/');
    }

    public function get(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array|callable $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, array|callable $handler, array $middleware): void
    {
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method' => $method,
            'pattern' => '#^' . $pattern . '$#',
            'handler' => $handler,
            'middleware' => $middleware,
        ];
    }

    public function handle(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = explode('?', $uri)[0];

        if ($this->basePath !== '' && strpos($path, $this->basePath) === 0) {
            $path = substr($path, strlen($this->basePath));
        }

        if ($path === '') {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method || !preg_match($route['pattern'], $path, $matches)) {
                continue;
            }

            $routeParams = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            $request = $this->buildRequest();
            $response = new Response();

            foreach ($route['middleware'] as $middlewareClass) {
                $middleware = new $middlewareClass();
                $result = $middleware($request, $response, $routeParams);
                if ($result instanceof Response) {
                    $this->emit($this->withCors($result));
                    return;
                }
                if ($result instanceof Request) {
                    $request = $result;
                }
            }

            try {
                $response = $this->invokeHandler($route['handler'], $request, $response, $routeParams);
            } catch (Throwable $exception) {
                $payload = [
                    'success' => false,
                    'error' => 'Internal server error',
                ];

                if (($_ENV['APP_DEBUG'] ?? 'false') === 'true') {
                    $payload['message'] = $exception->getMessage();
                    $payload['file'] = $exception->getFile();
                    $payload['line'] = $exception->getLine();
                }

                $response = $this->writeJson($response->withStatus(500), $payload);
            }

            $this->emit($this->withCors($response));
            return;
        }

        $this->emit($this->withCors($this->writeJson((new Response())->withStatus(404), [
            'success' => false,
            'error' => 'Route not found: ' . $path,
        ])));
    }

    private function buildRequest(): Request
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headers[strtolower(str_replace('_', '-', substr($key, 5)))] = $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['content-type'] = $_SERVER['CONTENT_TYPE'];
        }

        $rawBody = file_get_contents('php://input') ?: '';
        $parsedBody = [];
        if (($headers['content-type'] ?? '') !== '' && stripos($headers['content-type'], 'application/json') !== false && $rawBody !== '') {
            $decoded = json_decode($rawBody, true);
            if (is_array($decoded)) {
                $parsedBody = $decoded;
            }
        } elseif (!empty($_POST)) {
            $parsedBody = $_POST;
        }

        return new Request(
            $headers,
            $_GET,
            $parsedBody,
            $_SERVER,
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            $_SERVER['REQUEST_URI'] ?? '/'
        );
    }

    private function invokeHandler(array|callable $handler, Request $request, Response $response, array $routeParams): Response
    {
        if (is_callable($handler)) {
            $result = $handler($request, $response, $routeParams);
            return $result instanceof Response ? $result : $response;
        }

        [$controllerClass, $methodName] = $handler;
        $controller = new $controllerClass();
        $reflection = new ReflectionMethod($controller, $methodName);
        $result = $reflection->getNumberOfParameters() >= 3
            ? $controller->$methodName($request, $response, $routeParams)
            : $controller->$methodName($request, $response);

        return $result instanceof Response ? $result : $response;
    }

    private function writeJson(Response $response, array $payload): Response
    {
        $response->getBody()->write((string) json_encode($payload));
        return $response->withHeader('Content-Type', 'application/json');
    }

    private function withCors(Response $response): Response
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }

    private function emit(Response $response): void
    {
        if (!headers_sent()) {
            http_response_code($response->getStatusCode());
            foreach ($response->getHeaders() as $name => $value) {
                header($name . ': ' . $value, false);
            }
        }

        echo (string) $response->getBody();
    }
}

import time
from collections import defaultdict, deque

from fastapi import Request

from app.utils.errors import AppError

_buckets: dict[str, deque[float]] = defaultdict(deque)

_MAX_TRACKED_KEYS = 10000


def reset_rate_limits() -> None:
    _buckets.clear()


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(max_requests: int, window_seconds: int):
    """Sliding-window in-memory limiter keyed by client IP + path."""

    def dependency(request: Request) -> None:
        if len(_buckets) > _MAX_TRACKED_KEYS:
            _buckets.clear()
        key = f"{_client_ip(request)}:{request.url.path}"
        now = time.monotonic()
        bucket = _buckets[key]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= max_requests:
            raise AppError(
                "RATE_LIMITED",
                "Слишком много попыток. Подождите минуту и попробуйте снова.",
                429,
            )
        bucket.append(now)

    return dependency

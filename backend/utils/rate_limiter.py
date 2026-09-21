"""
Simple in-memory rate limiter.
Limits how many times a single IP can call POST /api/tts per minute.
No external package required.
"""

import time
from collections import defaultdict
from threading import Lock

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MAX_REQUESTS = 10        # max requests per window
WINDOW_SECONDS = 60      # rolling window size in seconds

# ---------------------------------------------------------------------------
# Internal state
# ---------------------------------------------------------------------------
_lock = Lock()
_requests: dict[str, list[float]] = defaultdict(list)


def is_rate_limited(ip: str) -> bool:
    """
    Return True if the given IP has exceeded the rate limit.
    Automatically cleans up timestamps older than the window.
    """
    now = time.time()
    with _lock:
        # Remove timestamps outside the rolling window
        _requests[ip] = [t for t in _requests[ip] if now - t < WINDOW_SECONDS]

        if len(_requests[ip]) >= MAX_REQUESTS:
            return True

        # Record this request
        _requests[ip].append(now)
        return False


def get_retry_after(ip: str) -> int:
    """
    Return the number of seconds the client should wait before retrying.
    """
    now = time.time()
    with _lock:
        if not _requests[ip]:
            return 0
        oldest = min(_requests[ip])
        wait = WINDOW_SECONDS - (now - oldest)
        return max(1, int(wait))

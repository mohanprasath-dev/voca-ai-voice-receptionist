from time import time
from typing import Any, Optional


class SimpleCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}

    def set(self, key: str, value: Any, ttl_seconds: int = 120) -> None:
        self._store[key] = (value, time() + ttl_seconds)

    def get(self, key: str) -> Optional[Any]:
        item = self._store.get(key)
        if item is None:
            return None
        value, expires_at = item
        if time() > expires_at:
            self._store.pop(key, None)
            return None
        return value

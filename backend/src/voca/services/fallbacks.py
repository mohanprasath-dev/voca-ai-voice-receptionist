from itertools import cycle

FALLBACK_FILLERS = [
    "Just a moment...",
    "Let me check that for you...",
    "One second please...",
]


class FallbackService:
    def __init__(self) -> None:
        self._cycler = cycle(FALLBACK_FILLERS)

    def next_filler(self) -> str:
        return next(self._cycler)

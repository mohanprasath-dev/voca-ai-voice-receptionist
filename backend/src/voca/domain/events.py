from dataclasses import dataclass, field
from time import time
from typing import Dict, Optional
from uuid import uuid4


@dataclass
class DomainEvent:
    session_id: str
    type: str
    tags: Dict[str, str] = field(default_factory=dict)
    latency_ms: Optional[int] = None
    event_id: str = field(default_factory=lambda: str(uuid4()))
    ts_ms: int = field(default_factory=lambda: int(time() * 1000))

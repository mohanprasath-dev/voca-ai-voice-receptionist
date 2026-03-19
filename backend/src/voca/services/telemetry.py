from collections import deque


class Telemetry:
    def __init__(self) -> None:
        self._response_latencies_ms: deque[int] = deque(maxlen=200)
        self._intent_successes = 0
        self._intent_total = 0

    def record_response_latency(self, latency_ms: int) -> None:
        self._response_latencies_ms.append(max(0, latency_ms))

    def record_intent_result(self, success: bool) -> None:
        self._intent_total += 1
        if success:
            self._intent_successes += 1

    # Stubs kept for import compatibility
    def set_budget_usage_percentage(self, usage_pct: float) -> None:
        pass

    def set_budget_mode(self, mode: str) -> None:
        pass

    def snapshot(self) -> dict:
        avg_latency = 0.0
        if self._response_latencies_ms:
            avg_latency = sum(self._response_latencies_ms) / len(self._response_latencies_ms)
        intent_success_rate = 0.0
        if self._intent_total > 0:
            intent_success_rate = self._intent_successes / self._intent_total
        return {
            "avgResponseLatencyMs": avg_latency,
            "intentSuccessRate": intent_success_rate,
        }

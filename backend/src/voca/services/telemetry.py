from collections import deque


class Telemetry:
    def __init__(self) -> None:
        self._response_latencies_ms: deque[int] = deque(maxlen=200)
        self._intent_successes = 0
        self._intent_total = 0
        self._budget_usage_percentage = 0.0

    def record_response_latency(self, latency_ms: int) -> None:
        self._response_latencies_ms.append(max(0, latency_ms))

    def record_intent_result(self, success: bool) -> None:
        self._intent_total += 1
        if success:
            self._intent_successes += 1

    def set_budget_usage_percentage(self, usage_pct: float) -> None:
        self._budget_usage_percentage = max(0.0, min(100.0, usage_pct))

    def snapshot(self) -> dict[str, float]:
        avg_latency = 0.0
        if self._response_latencies_ms:
            avg_latency = sum(self._response_latencies_ms) / len(self._response_latencies_ms)
        intent_success_rate = 0.0
        if self._intent_total > 0:
            intent_success_rate = self._intent_successes / self._intent_total
        return {
            "avg_response_latency": avg_latency,
            "intent_success_rate": intent_success_rate,
            "budget_usage_percentage": self._budget_usage_percentage,
        }

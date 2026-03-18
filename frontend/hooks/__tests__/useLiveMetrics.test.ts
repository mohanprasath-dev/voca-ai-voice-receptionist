import { strict as assert } from 'node:assert';
import { EMPTY_LIVE_METRICS, mergeLiveMetrics } from '@/lib/telemetry';

const updated = mergeLiveMetrics(EMPTY_LIVE_METRICS, { avgResponseLatencyMs: 140 });
assert.equal(updated.avgResponseLatencyMs, 140);
assert.equal(updated.intentSuccessRate, 0);

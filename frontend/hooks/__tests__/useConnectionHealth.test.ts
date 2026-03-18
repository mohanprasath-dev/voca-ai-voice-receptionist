import { strict as assert } from 'node:assert';
import { evaluateConnectionHealth } from '@/hooks/useConnectionHealth';

assert.equal(evaluateConnectionHealth(false, 0, 10_000, 2_000), 'disconnected');
assert.equal(evaluateConnectionHealth(true, 1_000, 2_000, 2_000), 'healthy');
assert.equal(evaluateConnectionHealth(true, 1_000, 5_000, 2_000), 'stale');

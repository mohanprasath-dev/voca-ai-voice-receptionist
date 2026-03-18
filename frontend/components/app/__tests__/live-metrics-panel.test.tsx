import { strict as assert } from 'node:assert';
import { formatPercentage } from '@/components/app/live-metrics-panel';

assert.equal(formatPercentage(12.34), '12.34%');
assert.equal(formatPercentage(10), '10%');

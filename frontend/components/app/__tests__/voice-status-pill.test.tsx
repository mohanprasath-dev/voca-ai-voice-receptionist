import { strict as assert } from 'node:assert';
import { phaseLabel } from '@/components/app/voice-status-pill';

assert.equal(phaseLabel('listening'), 'listening');
assert.equal(phaseLabel('awaiting_confirmation'), 'awaiting confirmation');

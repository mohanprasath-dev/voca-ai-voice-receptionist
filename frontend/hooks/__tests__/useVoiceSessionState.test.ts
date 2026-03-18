import { strict as assert } from 'node:assert';
import { resolveVoicePhase } from '@/lib/session-state';

assert.equal(
  resolveVoicePhase({ roomState: 'disconnected', assistantState: 'listening', isConnected: false }),
  'idle'
);
assert.equal(
  resolveVoicePhase({ roomState: 'connected', assistantState: 'speaking', isConnected: true }),
  'speaking'
);

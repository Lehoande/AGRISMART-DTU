const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransition, TRANSITIONS, STATUSES } = require('../../src/services/orderStatus');

test('luồng hợp lệ pending -> confirmed -> shipping -> completed', () => {
  assert.ok(canTransition('pending', 'confirmed'));
  assert.ok(canTransition('confirmed', 'shipping'));
  assert.ok(canTransition('shipping', 'completed'));
});

test('không được nhảy cóc hoặc đi lùi', () => {
  assert.equal(canTransition('pending', 'shipping'), false);
  assert.equal(canTransition('pending', 'completed'), false);
  assert.equal(canTransition('shipping', 'confirmed'), false);
});

test('huỷ được khi chưa giao; completed/cancelled là trạng thái cuối', () => {
  assert.ok(canTransition('pending', 'cancelled'));
  assert.ok(canTransition('confirmed', 'cancelled'));
  assert.equal(canTransition('shipping', 'cancelled'), false);
  assert.deepEqual(TRANSITIONS.completed, []);
  assert.deepEqual(TRANSITIONS.cancelled, []);
});

test('mọi trạng thái trong TRANSITIONS đều nằm trong ENUM của schema', () => {
  assert.deepEqual(Object.keys(TRANSITIONS).sort(), [...STATUSES].sort());
  assert.equal(canTransition('foo', 'pending'), false);
});

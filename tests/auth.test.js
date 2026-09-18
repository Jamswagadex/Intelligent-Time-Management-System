const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

process.env.DB_PATH = './data/test_auth.db';
const { initDatabase } = require('../src/config/database');
const authService = require('../src/services/authService');

function reset() {
  for (const f of [process.env.DB_PATH, process.env.DB_PATH + '-wal', process.env.DB_PATH + '-shm']) {
    try { fs.unlinkSync(path.resolve(f)); } catch {}
  }
  initDatabase();
}

test('registration hashes password (no plaintext storage)', () => {
  reset();
  const { user } = authService.register({
    fullName: 'Jane Doe', email: 'jane@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 1',
  });
  const userRepo = require('../src/repositories/userRepository');
  const raw = userRepo.findByEmail('jane@pi.edu.ng');
  assert.notStrictEqual(raw.password_hash, 'secret123');
  assert.ok(raw.password_hash.startsWith('$2'));
  assert.strictEqual(user.email, 'jane@pi.edu.ng');
});

test('duplicate email is rejected', () => {
  reset();
  authService.register({
    fullName: 'A', email: 'a@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 1',
  });
  assert.throws(() => authService.register({
    fullName: 'B', email: 'a@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 2',
  }), /already exists/);
});

test('login succeeds with correct password', () => {
  reset();
  authService.register({
    fullName: 'A', email: 'a@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 1',
  });
  const { user, token } = authService.login('a@pi.edu.ng', 'secret123');
  assert.ok(token);
  assert.strictEqual(user.email, 'a@pi.edu.ng');
});

test('login fails with wrong password', () => {
  reset();
  authService.register({
    fullName: 'A', email: 'a@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 1',
  });
  assert.throws(() => authService.login('a@pi.edu.ng', 'wrong'), /Invalid email or password/);
});

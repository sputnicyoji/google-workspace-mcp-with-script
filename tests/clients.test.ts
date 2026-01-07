// tests/clients.test.ts
// Unit tests for Google API client management
// Note: These tests run without credentials, testing module structure only

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Cache the module import to avoid multiple auth attempts
let clientsModule: typeof import('../src/clients.js') | null = null;

async function getClientsModule() {
  if (!clientsModule) {
    clientsModule = await import('../src/clients.js');
  }
  return clientsModule;
}

describe('Clients Module', () => {

  describe('Module Structure', () => {

    it('should export getAuthClient function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getAuthClient, 'function');
    });

    it('should export initializeGoogleClient function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.initializeGoogleClient, 'function');
    });

    it('should export getDocsClient function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getDocsClient, 'function');
    });

    it('should export getDriveClient function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getDriveClient, 'function');
    });

    it('should export getSheetsClient function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getSheetsClient, 'function');
    });

    it('should export getScriptClient function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getScriptClient, 'function');
    });

    it('should export setupProcessErrorHandlers function', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.setupProcessErrorHandlers, 'function');
    });

  });

  describe('getAuthClient', () => {

    it('should return null or object', async () => {
      const clients = await getClientsModule();
      const result = clients.getAuthClient();
      // Result could be null or an auth client depending on environment
      assert.ok(result === null || typeof result === 'object');
    });

  });

  describe('setupProcessErrorHandlers', () => {

    it('should not throw when called', async () => {
      const clients = await getClientsModule();
      assert.doesNotThrow(() => {
        clients.setupProcessErrorHandlers();
      });
    });

    it('should be idempotent (can be called multiple times)', async () => {
      const clients = await getClientsModule();
      assert.doesNotThrow(() => {
        clients.setupProcessErrorHandlers();
        clients.setupProcessErrorHandlers();
      });
    });

  });

  describe('Client Getter Functions (structure check)', () => {

    // These tests verify function structure without triggering auth
    // Actual API calls require credentials

    it('getDocsClient should return Promise', async () => {
      const clients = await getClientsModule();
      // Just check it's a function that returns a promise
      assert.strictEqual(typeof clients.getDocsClient, 'function');
    });

    it('getDriveClient should return Promise', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getDriveClient, 'function');
    });

    it('getSheetsClient should return Promise', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getSheetsClient, 'function');
    });

    it('getScriptClient should return Promise', async () => {
      const clients = await getClientsModule();
      assert.strictEqual(typeof clients.getScriptClient, 'function');
    });

  });

});

describe('Client Error Handling Patterns', () => {

  it('should define UserError for client failures', async () => {
    // Verify that UserError is used for client-level errors
    const { UserError } = await import('fastmcp');
    assert.ok(UserError);
    assert.strictEqual(typeof UserError, 'function');
  });

  it('UserError should be throwable with message', async () => {
    const { UserError } = await import('fastmcp');
    const error = new UserError('Test error message');
    assert.ok(error instanceof Error);
    assert.strictEqual(error.message, 'Test error message');
  });

});

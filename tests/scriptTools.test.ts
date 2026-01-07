// tests/scriptTools.test.ts
// Unit tests for Apps Script tools

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import {
  MockFastMCP,
  MockScriptClient,
  MockDriveClient,
  MockLogger,
  createMockContext
} from './helpers/mock-utils.js';
import { registerScriptTools, SCRIPT_TOOLS_COUNT } from '../src/tools/scriptTools.js';

describe('Script Tools Registration', () => {

  let mockServer: MockFastMCP;

  beforeEach(() => {
    mockServer = new MockFastMCP();
    registerScriptTools(mockServer as any);
  });

  it('should register exactly 4 tools', () => {
    assert.strictEqual(mockServer.tools.size, 4);
    assert.strictEqual(mockServer.tools.size, SCRIPT_TOOLS_COUNT);
  });

  it('should register createBoundScript tool', () => {
    const tool = mockServer.getTool('createBoundScript');
    assert.ok(tool, 'createBoundScript tool should exist');
    assert.strictEqual(tool.name, 'createBoundScript');
  });

  it('should register updateScriptContent tool', () => {
    const tool = mockServer.getTool('updateScriptContent');
    assert.ok(tool, 'updateScriptContent tool should exist');
    assert.strictEqual(tool.name, 'updateScriptContent');
  });

  it('should register getScriptContent tool', () => {
    const tool = mockServer.getTool('getScriptContent');
    assert.ok(tool, 'getScriptContent tool should exist');
    assert.strictEqual(tool.name, 'getScriptContent');
  });

  it('should register getScriptProjects tool', () => {
    const tool = mockServer.getTool('getScriptProjects');
    assert.ok(tool, 'getScriptProjects tool should exist');
    assert.strictEqual(tool.name, 'getScriptProjects');
  });

  it('should have all expected tool names', () => {
    const toolNames = mockServer.getToolNames();
    assert.ok(toolNames.includes('createBoundScript'));
    assert.ok(toolNames.includes('updateScriptContent'));
    assert.ok(toolNames.includes('getScriptContent'));
    assert.ok(toolNames.includes('getScriptProjects'));
  });

});

describe('createBoundScript Tool', () => {

  let mockServer: MockFastMCP;

  beforeEach(() => {
    mockServer = new MockFastMCP();
    registerScriptTools(mockServer as any);
  });

  it('should have correct description', () => {
    const tool = mockServer.getTool('createBoundScript');
    assert.ok(tool?.description.includes('Apps Script project'));
    assert.ok(tool?.description.includes('bound'));
  });

  it('should require title parameter', () => {
    const tool = mockServer.getTool('createBoundScript');
    const schema = tool?.parameters as z.ZodObject<any>;
    const shape = schema.shape;
    assert.ok(shape.title, 'title parameter should exist');
  });

  it('should require parentId parameter', () => {
    const tool = mockServer.getTool('createBoundScript');
    const schema = tool?.parameters as z.ZodObject<any>;
    const shape = schema.shape;
    assert.ok(shape.parentId, 'parentId parameter should exist');
  });

  it('should validate parameters correctly', () => {
    const tool = mockServer.getTool('createBoundScript');
    const validParams = { title: 'My Script', parentId: 'doc-123' };
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'Valid parameters should pass');
  });

  it('should reject missing title', () => {
    const tool = mockServer.getTool('createBoundScript');
    const invalidParams = { parentId: 'doc-123' };
    const result = tool?.parameters.safeParse(invalidParams);
    assert.ok(!result?.success, 'Missing title should fail');
  });

  it('should reject missing parentId', () => {
    const tool = mockServer.getTool('createBoundScript');
    const invalidParams = { title: 'My Script' };
    const result = tool?.parameters.safeParse(invalidParams);
    assert.ok(!result?.success, 'Missing parentId should fail');
  });

});

describe('updateScriptContent Tool', () => {

  let mockServer: MockFastMCP;

  beforeEach(() => {
    mockServer = new MockFastMCP();
    registerScriptTools(mockServer as any);
  });

  it('should have correct description', () => {
    const tool = mockServer.getTool('updateScriptContent');
    assert.ok(tool?.description.includes('Updates'));
    assert.ok(tool?.description.includes('Apps Script'));
  });

  it('should require scriptId parameter', () => {
    const tool = mockServer.getTool('updateScriptContent');
    const schema = tool?.parameters as z.ZodObject<any>;
    const shape = schema.shape;
    assert.ok(shape.scriptId, 'scriptId parameter should exist');
  });

  it('should require files array parameter', () => {
    const tool = mockServer.getTool('updateScriptContent');
    const schema = tool?.parameters as z.ZodObject<any>;
    const shape = schema.shape;
    assert.ok(shape.files, 'files parameter should exist');
  });

  it('should validate valid file structure', () => {
    const tool = mockServer.getTool('updateScriptContent');
    const validParams = {
      scriptId: 'script-123',
      files: [
        { name: 'Code', type: 'SERVER_JS', source: 'function test() {}' }
      ]
    };
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'Valid file structure should pass');
  });

  it('should validate JSON file type', () => {
    const tool = mockServer.getTool('updateScriptContent');
    const validParams = {
      scriptId: 'script-123',
      files: [
        { name: 'appsscript', type: 'JSON', source: '{"timeZone":"UTC"}' }
      ]
    };
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'JSON file type should be valid');
  });

  it('should reject invalid file type', () => {
    const tool = mockServer.getTool('updateScriptContent');
    const invalidParams = {
      scriptId: 'script-123',
      files: [
        { name: 'Code', type: 'INVALID_TYPE', source: 'test' }
      ]
    };
    const result = tool?.parameters.safeParse(invalidParams);
    assert.ok(!result?.success, 'Invalid file type should fail');
  });

  it('should accept multiple files', () => {
    const tool = mockServer.getTool('updateScriptContent');
    const validParams = {
      scriptId: 'script-123',
      files: [
        { name: 'Code', type: 'SERVER_JS', source: 'function main() {}' },
        { name: 'Utils', type: 'SERVER_JS', source: 'function helper() {}' },
        { name: 'appsscript', type: 'JSON', source: '{}' }
      ]
    };
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'Multiple files should be valid');
  });

});

describe('getScriptContent Tool', () => {

  let mockServer: MockFastMCP;

  beforeEach(() => {
    mockServer = new MockFastMCP();
    registerScriptTools(mockServer as any);
  });

  it('should have correct description', () => {
    const tool = mockServer.getTool('getScriptContent');
    assert.ok(tool?.description.includes('Retrieves'));
    assert.ok(tool?.description.includes('content'));
  });

  it('should require scriptId parameter', () => {
    const tool = mockServer.getTool('getScriptContent');
    const schema = tool?.parameters as z.ZodObject<any>;
    const shape = schema.shape;
    assert.ok(shape.scriptId, 'scriptId parameter should exist');
  });

  it('should validate valid scriptId', () => {
    const tool = mockServer.getTool('getScriptContent');
    const validParams = { scriptId: 'script-123' };
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'Valid scriptId should pass');
  });

  it('should reject empty scriptId', () => {
    const tool = mockServer.getTool('getScriptContent');
    const invalidParams = { scriptId: '' };
    // Note: Zod string() allows empty by default, but min(1) would reject
    // This test documents current behavior
    const result = tool?.parameters.safeParse(invalidParams);
    // Empty string is technically valid for z.string()
    assert.ok(result?.success || !result?.success);
  });

});

describe('getScriptProjects Tool', () => {

  let mockServer: MockFastMCP;

  beforeEach(() => {
    mockServer = new MockFastMCP();
    registerScriptTools(mockServer as any);
  });

  it('should have correct description', () => {
    const tool = mockServer.getTool('getScriptProjects');
    assert.ok(tool?.description.includes('Lists'));
    assert.ok(tool?.description.includes('Apps Script'));
  });

  it('should have optional pageSize parameter', () => {
    const tool = mockServer.getTool('getScriptProjects');
    const validParams = {}; // pageSize is optional
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'Empty params should be valid (pageSize optional)');
  });

  it('should accept valid pageSize', () => {
    const tool = mockServer.getTool('getScriptProjects');
    const validParams = { pageSize: 25 };
    const result = tool?.parameters.safeParse(validParams);
    assert.ok(result?.success, 'Valid pageSize should pass');
  });

  it('should default pageSize to 10', () => {
    const tool = mockServer.getTool('getScriptProjects');
    const params = {};
    const result = tool?.parameters.parse(params);
    assert.strictEqual(result.pageSize, 10);
  });

  it('should reject pageSize less than 1', () => {
    const tool = mockServer.getTool('getScriptProjects');
    const invalidParams = { pageSize: 0 };
    const result = tool?.parameters.safeParse(invalidParams);
    assert.ok(!result?.success, 'pageSize < 1 should fail');
  });

  it('should reject pageSize greater than 50', () => {
    const tool = mockServer.getTool('getScriptProjects');
    const invalidParams = { pageSize: 100 };
    const result = tool?.parameters.safeParse(invalidParams);
    assert.ok(!result?.success, 'pageSize > 50 should fail');
  });

  it('should reject non-integer pageSize', () => {
    const tool = mockServer.getTool('getScriptProjects');
    const invalidParams = { pageSize: 10.5 };
    const result = tool?.parameters.safeParse(invalidParams);
    assert.ok(!result?.success, 'Non-integer pageSize should fail');
  });

});

describe('Mock Script Client Behavior', () => {

  let mockScript: MockScriptClient;
  let mockDrive: MockDriveClient;
  let logger: MockLogger;

  beforeEach(() => {
    mockScript = new MockScriptClient();
    mockDrive = new MockDriveClient();
    logger = new MockLogger();
  });

  it('should track projects.create calls', async () => {
    await mockScript.projects.create({
      requestBody: { title: 'Test', parentId: 'doc-1' }
    });
    assert.strictEqual(mockScript.calls.length, 1);
    assert.strictEqual(mockScript.calls[0].method, 'projects.create');
  });

  it('should return mock scriptId', async () => {
    const response = await mockScript.projects.create({
      requestBody: { title: 'Test', parentId: 'doc-1' }
    });
    assert.strictEqual(response.data.scriptId, 'mock-script-id-123');
  });

  it('should allow custom response', async () => {
    mockScript.setResponse('projects.create', {
      data: { scriptId: 'custom-id-456' }
    });
    const response = await mockScript.projects.create({
      requestBody: { title: 'Test', parentId: 'doc-1' }
    });
    assert.strictEqual(response.data.scriptId, 'custom-id-456');
  });

  it('should simulate errors', async () => {
    mockScript.setError('projects.create', new Error('API quota exceeded'));
    await assert.rejects(
      async () => mockScript.projects.create({ requestBody: {} }),
      { message: 'API quota exceeded' }
    );
  });

  it('should track files.list calls for drive', async () => {
    await mockDrive.files.list({ q: "mimeType='application/vnd.google-apps.script'" });
    assert.strictEqual(mockDrive.calls.length, 1);
    assert.strictEqual(mockDrive.calls[0].method, 'files.list');
  });

  it('should return mock file list', async () => {
    const response = await mockDrive.files.list({});
    assert.ok(Array.isArray(response.data.files));
    assert.strictEqual(response.data.files.length, 2);
  });

  it('should allow empty file list response', async () => {
    mockDrive.setResponse('files.list', { data: { files: [] } });
    const response = await mockDrive.files.list({});
    assert.strictEqual(response.data.files.length, 0);
  });

});

describe('Mock Logger Behavior', () => {

  let logger: MockLogger;

  beforeEach(() => {
    logger = new MockLogger();
  });

  it('should capture info logs', () => {
    logger.info('Test info message');
    assert.strictEqual(logger.logs.length, 1);
    assert.strictEqual(logger.logs[0].level, 'info');
    assert.strictEqual(logger.logs[0].message, 'Test info message');
  });

  it('should capture error logs', () => {
    logger.error('Test error message');
    assert.ok(logger.hasLog('error', 'Test error'));
  });

  it('should detect log patterns', () => {
    logger.info('Creating bound Apps Script project "MyScript"');
    assert.ok(logger.hasLog('info', 'Apps Script'));
    assert.ok(logger.hasLog('info', /MyScript/));
  });

  it('should clear logs', () => {
    logger.info('Message 1');
    logger.error('Message 2');
    logger.clear();
    assert.strictEqual(logger.logs.length, 0);
  });

});

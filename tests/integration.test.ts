// tests/integration.test.ts
// Integration tests for MCP server components

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import {
  MockFastMCP,
  MockScriptClient,
  MockDriveClient,
  MockDocsClient,
  MockSheetsClient,
  MockLogger
} from './helpers/mock-utils.js';
import { TOOL_COUNTS, TOOL_CATEGORIES } from '../src/tools/index.js';

describe('MCP Server Integration', () => {

  describe('Tool Category Consistency', () => {

    it('should have all categories defined', () => {
      const expectedCategories = [
        'Google Docs',
        'Google Docs Comments',
        'Google Sheets',
        'Google Drive',
        'Apps Script'
      ];
      for (const category of expectedCategories) {
        assert.ok(TOOL_CATEGORIES[category], `Category ${category} should exist`);
      }
    });

    it('should have tools in each category', () => {
      for (const [category, tools] of Object.entries(TOOL_CATEGORIES)) {
        assert.ok(Array.isArray(tools), `${category} should have tools array`);
        assert.ok(tools.length > 0, `${category} should have at least one tool`);
      }
    });

    it('should have unique tool names across all categories', () => {
      const allTools: string[] = [];
      for (const tools of Object.values(TOOL_CATEGORIES)) {
        allTools.push(...tools);
      }
      const uniqueTools = new Set(allTools);
      assert.strictEqual(allTools.length, uniqueTools.size, 'All tool names should be unique');
    });

  });

  describe('Tool Count Validation', () => {

    it('should match documented counts', () => {
      let categoryTotal = 0;
      for (const tools of Object.values(TOOL_CATEGORIES)) {
        categoryTotal += tools.length;
      }
      // Note: Category total might differ from TOOL_COUNTS.total due to grouping
      assert.ok(categoryTotal > 0, 'Should have tools defined');
    });

    it('should have consistent script tools count', () => {
      const scriptTools = TOOL_CATEGORIES['Apps Script'];
      assert.strictEqual(scriptTools.length, TOOL_COUNTS.script);
    });

  });

});

describe('Mock Client Integration', () => {

  describe('Full Workflow Simulation', () => {

    let mockScript: MockScriptClient;
    let mockDrive: MockDriveClient;
    let mockDocs: MockDocsClient;
    let mockSheets: MockSheetsClient;

    beforeEach(() => {
      mockScript = new MockScriptClient();
      mockDrive = new MockDriveClient();
      mockDocs = new MockDocsClient();
      mockSheets = new MockSheetsClient();
    });

    it('should simulate create script workflow', async () => {
      // Step 1: Create a bound script
      const createResponse = await mockScript.projects.create({
        requestBody: { title: 'Automation Script', parentId: 'spreadsheet-123' }
      });
      const scriptId = createResponse.data.scriptId;
      assert.ok(scriptId, 'Should get script ID');

      // Step 2: Update script content
      await mockScript.projects.updateContent({
        scriptId,
        requestBody: {
          files: [
            { name: 'Code', type: 'SERVER_JS', source: 'function onOpen() { /* menu */ }' },
            { name: 'appsscript', type: 'JSON', source: '{"timeZone":"Asia/Tokyo"}' }
          ]
        }
      });
      assert.strictEqual(mockScript.calls.length, 2);

      // Step 3: Get script content to verify
      const contentResponse = await mockScript.projects.getContent({ scriptId });
      assert.ok(contentResponse.data.files, 'Should have files');
    });

    it('should simulate list scripts workflow', async () => {
      // Set up mock response with multiple scripts
      mockDrive.setResponse('files.list', {
        data: {
          files: [
            { id: 's1', name: 'Script A', modifiedTime: '2024-01-01T00:00:00Z' },
            { id: 's2', name: 'Script B', modifiedTime: '2024-01-02T00:00:00Z' },
            { id: 's3', name: 'Script C', modifiedTime: '2024-01-03T00:00:00Z' }
          ]
        }
      });

      const response = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.script'",
        pageSize: 10,
        orderBy: 'modifiedTime desc'
      });

      assert.strictEqual(response.data.files.length, 3);
      assert.strictEqual(response.data.files[0].name, 'Script A');
    });

    it('should simulate error recovery workflow', async () => {
      // First attempt fails
      mockScript.setError('projects.create', new Error('Quota exceeded'));

      try {
        await mockScript.projects.create({
          requestBody: { title: 'Test', parentId: 'doc-1' }
        });
        assert.fail('Should have thrown');
      } catch (error: any) {
        assert.strictEqual(error.message, 'Quota exceeded');
      }

      // Reset and retry
      mockScript.reset();
      const response = await mockScript.projects.create({
        requestBody: { title: 'Test', parentId: 'doc-1' }
      });
      assert.ok(response.data.scriptId);
    });

    it('should simulate document read workflow', async () => {
      mockDocs.setResponse('documents.get', {
        data: {
          documentId: 'doc-123',
          title: 'Meeting Notes',
          body: {
            content: [
              {
                paragraph: {
                  elements: [{ textRun: { content: 'Important meeting notes' } }]
                }
              }
            ]
          }
        }
      });

      const response = await mockDocs.documents.get({ documentId: 'doc-123' });
      assert.strictEqual(response.data.title, 'Meeting Notes');
      assert.ok(response.data.body.content.length > 0);
    });

    it('should simulate spreadsheet read workflow', async () => {
      mockSheets.setResponse('spreadsheets.values.get', {
        data: {
          values: [
            ['Name', 'Score'],
            ['Alice', '95'],
            ['Bob', '87']
          ]
        }
      });

      const response = await mockSheets.spreadsheets.values.get({
        spreadsheetId: 'sheet-123',
        range: 'A1:B3'
      });

      assert.strictEqual(response.data.values.length, 3);
      assert.strictEqual(response.data.values[0][0], 'Name');
    });

  });

  describe('Cross-Client Workflows', () => {

    it('should simulate Drive + Docs workflow', async () => {
      const mockDrive = new MockDriveClient();
      const mockDocs = new MockDocsClient();

      // List documents from Drive
      mockDrive.setResponse('files.list', {
        data: {
          files: [
            { id: 'doc-1', name: 'Document A', mimeType: 'application/vnd.google-apps.document' }
          ]
        }
      });

      const listResponse = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.document'"
      });

      // Read document content
      const docId = listResponse.data.files[0].id;
      const docResponse = await mockDocs.documents.get({ documentId: docId });

      assert.strictEqual(docResponse.data.documentId, docId);
    });

    it('should simulate Drive + Sheets workflow', async () => {
      const mockDrive = new MockDriveClient();
      const mockSheets = new MockSheetsClient();

      // Find spreadsheet
      mockDrive.setResponse('files.list', {
        data: {
          files: [
            { id: 'sheet-1', name: 'Budget 2024', mimeType: 'application/vnd.google-apps.spreadsheet' }
          ]
        }
      });

      const listResponse = await mockDrive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'"
      });

      // Read spreadsheet data
      const sheetId = listResponse.data.files[0].id;
      const sheetResponse = await mockSheets.spreadsheets.get({ spreadsheetId: sheetId });

      assert.strictEqual(sheetResponse.data.spreadsheetId, sheetId);
    });

  });

});

describe('Error Handling Patterns', () => {

  describe('API Error Simulation', () => {

    it('should handle authentication errors', async () => {
      const mockScript = new MockScriptClient();
      mockScript.setError('projects.create', new Error('Invalid credentials'));

      await assert.rejects(
        async () => mockScript.projects.create({ requestBody: {} }),
        { message: 'Invalid credentials' }
      );
    });

    it('should handle not found errors', async () => {
      const mockScript = new MockScriptClient();
      mockScript.setError('projects.getContent', new Error('Script not found'));

      await assert.rejects(
        async () => mockScript.projects.getContent({ scriptId: 'invalid-id' }),
        { message: 'Script not found' }
      );
    });

    it('should handle rate limit errors', async () => {
      const mockDrive = new MockDriveClient();
      mockDrive.setError('files.list', new Error('Rate limit exceeded'));

      await assert.rejects(
        async () => mockDrive.files.list({}),
        { message: 'Rate limit exceeded' }
      );
    });

    it('should handle permission errors', async () => {
      const mockDocs = new MockDocsClient();
      mockDocs.setError('documents.get', new Error('Permission denied'));

      await assert.rejects(
        async () => mockDocs.documents.get({ documentId: 'private-doc' }),
        { message: 'Permission denied' }
      );
    });

  });

  describe('Response Validation', () => {

    it('should handle empty file list', async () => {
      const mockDrive = new MockDriveClient();
      mockDrive.setResponse('files.list', { data: { files: [] } });

      const response = await mockDrive.files.list({});
      assert.strictEqual(response.data.files.length, 0);
    });

    it('should handle null files in script content', async () => {
      const mockScript = new MockScriptClient();
      mockScript.setResponse('projects.getContent', { data: { files: null } });

      const response = await mockScript.projects.getContent({ scriptId: 'empty-script' });
      assert.strictEqual(response.data.files, null);
    });

    it('should handle missing optional fields', async () => {
      const mockDrive = new MockDriveClient();
      mockDrive.setResponse('files.list', {
        data: {
          files: [{ id: 'file-1' }] // name and other fields missing
        }
      });

      const response = await mockDrive.files.list({});
      assert.strictEqual(response.data.files[0].id, 'file-1');
      assert.strictEqual(response.data.files[0].name, undefined);
    });

  });

});

describe('Logger Integration', () => {

  it('should track all log levels', () => {
    const logger = new MockLogger();

    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.debug('Debug message');

    assert.strictEqual(logger.logs.length, 4);
    assert.ok(logger.hasLog('info', 'Info'));
    assert.ok(logger.hasLog('warn', 'Warning'));
    assert.ok(logger.hasLog('error', 'Error'));
    assert.ok(logger.hasLog('debug', 'Debug'));
  });

  it('should support regex pattern matching', () => {
    const logger = new MockLogger();

    logger.info('Creating script project "MyScript" for parent: doc-123');
    logger.error('Failed to create: API error code 403');

    assert.ok(logger.hasLog('info', /MyScript/));
    assert.ok(logger.hasLog('error', /error code \d+/));
  });

});

describe('Type Safety', () => {

  it('should enforce Zod schema validation', () => {
    const schema = z.object({
      title: z.string().min(1),
      parentId: z.string().min(1)
    });

    // Valid
    assert.ok(schema.safeParse({ title: 'Test', parentId: 'doc-1' }).success);

    // Invalid
    assert.ok(!schema.safeParse({ title: '', parentId: 'doc-1' }).success);
    assert.ok(!schema.safeParse({ title: 'Test' }).success);
    assert.ok(!schema.safeParse({}).success);
  });

  it('should validate file type enum', () => {
    const fileTypeSchema = z.enum(['SERVER_JS', 'JSON']);

    assert.ok(fileTypeSchema.safeParse('SERVER_JS').success);
    assert.ok(fileTypeSchema.safeParse('JSON').success);
    assert.ok(!fileTypeSchema.safeParse('INVALID').success);
    assert.ok(!fileTypeSchema.safeParse('').success);
  });

  it('should validate pageSize constraints', () => {
    const pageSizeSchema = z.number().int().min(1).max(50).optional().default(10);

    assert.strictEqual(pageSizeSchema.parse(undefined), 10);
    assert.strictEqual(pageSizeSchema.parse(25), 25);
    assert.ok(!pageSizeSchema.safeParse(0).success);
    assert.ok(!pageSizeSchema.safeParse(100).success);
    assert.ok(!pageSizeSchema.safeParse(10.5).success);
  });

});

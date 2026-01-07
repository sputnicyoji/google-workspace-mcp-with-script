// tests/helpers/mock-utils.ts
// Mock utilities for testing Google API integrations

import { z } from 'zod';

/**
 * Mock logger that captures log calls
 */
export class MockLogger {
  public logs: { level: string; message: string }[] = [];

  info(message: string) {
    this.logs.push({ level: 'info', message });
  }

  error(message: string) {
    this.logs.push({ level: 'error', message });
  }

  warn(message: string) {
    this.logs.push({ level: 'warn', message });
  }

  debug(message: string) {
    this.logs.push({ level: 'debug', message });
  }

  clear() {
    this.logs = [];
  }

  hasLog(level: string, pattern: string | RegExp): boolean {
    return this.logs.some(log =>
      log.level === level &&
      (typeof pattern === 'string' ? log.message.includes(pattern) : pattern.test(log.message))
    );
  }
}

/**
 * Mock Google Apps Script client
 */
export class MockScriptClient {
  public calls: { method: string; args: any }[] = [];
  private responses: Map<string, any> = new Map();
  private errors: Map<string, Error> = new Map();

  projects = {
    create: async (params: any) => {
      this.calls.push({ method: 'projects.create', args: params });
      if (this.errors.has('projects.create')) {
        throw this.errors.get('projects.create');
      }
      return this.responses.get('projects.create') || {
        data: { scriptId: 'mock-script-id-123' }
      };
    },
    updateContent: async (params: any) => {
      this.calls.push({ method: 'projects.updateContent', args: params });
      if (this.errors.has('projects.updateContent')) {
        throw this.errors.get('projects.updateContent');
      }
      return this.responses.get('projects.updateContent') || { data: {} };
    },
    getContent: async (params: any) => {
      this.calls.push({ method: 'projects.getContent', args: params });
      if (this.errors.has('projects.getContent')) {
        throw this.errors.get('projects.getContent');
      }
      return this.responses.get('projects.getContent') || {
        data: {
          files: [
            { name: 'Code', type: 'SERVER_JS', source: 'function test() {}' },
            { name: 'appsscript', type: 'JSON', source: '{"timeZone":"UTC"}' }
          ]
        }
      };
    }
  };

  setResponse(method: string, response: any) {
    this.responses.set(method, response);
  }

  setError(method: string, error: Error) {
    this.errors.set(method, error);
  }

  clearCalls() {
    this.calls = [];
  }

  reset() {
    this.calls = [];
    this.responses.clear();
    this.errors.clear();
  }
}

/**
 * Mock Google Drive client
 */
export class MockDriveClient {
  public calls: { method: string; args: any }[] = [];
  private responses: Map<string, any> = new Map();
  private errors: Map<string, Error> = new Map();

  files = {
    list: async (params: any) => {
      this.calls.push({ method: 'files.list', args: params });
      if (this.errors.has('files.list')) {
        throw this.errors.get('files.list');
      }
      return this.responses.get('files.list') || {
        data: {
          files: [
            { id: 'script-1', name: 'My Script', modifiedTime: '2024-01-01T00:00:00Z' },
            { id: 'script-2', name: 'Another Script', modifiedTime: '2024-01-02T00:00:00Z' }
          ]
        }
      };
    },
    get: async (params: any) => {
      this.calls.push({ method: 'files.get', args: params });
      if (this.errors.has('files.get')) {
        throw this.errors.get('files.get');
      }
      return this.responses.get('files.get') || {
        data: { id: params.fileId, name: 'Test File' }
      };
    },
    create: async (params: any) => {
      this.calls.push({ method: 'files.create', args: params });
      if (this.errors.has('files.create')) {
        throw this.errors.get('files.create');
      }
      return this.responses.get('files.create') || {
        data: { id: 'new-file-id' }
      };
    },
    update: async (params: any) => {
      this.calls.push({ method: 'files.update', args: params });
      if (this.errors.has('files.update')) {
        throw this.errors.get('files.update');
      }
      return this.responses.get('files.update') || { data: {} };
    },
    delete: async (params: any) => {
      this.calls.push({ method: 'files.delete', args: params });
      if (this.errors.has('files.delete')) {
        throw this.errors.get('files.delete');
      }
      return this.responses.get('files.delete') || { data: {} };
    },
    copy: async (params: any) => {
      this.calls.push({ method: 'files.copy', args: params });
      if (this.errors.has('files.copy')) {
        throw this.errors.get('files.copy');
      }
      return this.responses.get('files.copy') || {
        data: { id: 'copied-file-id' }
      };
    }
  };

  setResponse(method: string, response: any) {
    this.responses.set(method, response);
  }

  setError(method: string, error: Error) {
    this.errors.set(method, error);
  }

  clearCalls() {
    this.calls = [];
  }

  reset() {
    this.calls = [];
    this.responses.clear();
    this.errors.clear();
  }
}

/**
 * Mock Google Docs client
 */
export class MockDocsClient {
  public calls: { method: string; args: any }[] = [];
  private responses: Map<string, any> = new Map();
  private errors: Map<string, Error> = new Map();

  documents = {
    get: async (params: any) => {
      this.calls.push({ method: 'documents.get', args: params });
      if (this.errors.has('documents.get')) {
        throw this.errors.get('documents.get');
      }
      return this.responses.get('documents.get') || {
        data: {
          documentId: params.documentId,
          title: 'Test Document',
          body: { content: [] }
        }
      };
    },
    batchUpdate: async (params: any) => {
      this.calls.push({ method: 'documents.batchUpdate', args: params });
      if (this.errors.has('documents.batchUpdate')) {
        throw this.errors.get('documents.batchUpdate');
      }
      return this.responses.get('documents.batchUpdate') || { data: {} };
    }
  };

  setResponse(method: string, response: any) {
    this.responses.set(method, response);
  }

  setError(method: string, error: Error) {
    this.errors.set(method, error);
  }

  reset() {
    this.calls = [];
    this.responses.clear();
    this.errors.clear();
  }
}

/**
 * Mock Google Sheets client
 */
export class MockSheetsClient {
  public calls: { method: string; args: any }[] = [];
  private responses: Map<string, any> = new Map();
  private errors: Map<string, Error> = new Map();

  spreadsheets = {
    get: async (params: any) => {
      this.calls.push({ method: 'spreadsheets.get', args: params });
      if (this.errors.has('spreadsheets.get')) {
        throw this.errors.get('spreadsheets.get');
      }
      return this.responses.get('spreadsheets.get') || {
        data: {
          spreadsheetId: params.spreadsheetId,
          properties: { title: 'Test Spreadsheet' },
          sheets: [{ properties: { sheetId: 0, title: 'Sheet1' } }]
        }
      };
    },
    values: {
      get: async (params: any) => {
        this.calls.push({ method: 'spreadsheets.values.get', args: params });
        if (this.errors.has('spreadsheets.values.get')) {
          throw this.errors.get('spreadsheets.values.get');
        }
        return this.responses.get('spreadsheets.values.get') || {
          data: { values: [['A1', 'B1'], ['A2', 'B2']] }
        };
      },
      update: async (params: any) => {
        this.calls.push({ method: 'spreadsheets.values.update', args: params });
        if (this.errors.has('spreadsheets.values.update')) {
          throw this.errors.get('spreadsheets.values.update');
        }
        return this.responses.get('spreadsheets.values.update') || { data: {} };
      },
      append: async (params: any) => {
        this.calls.push({ method: 'spreadsheets.values.append', args: params });
        if (this.errors.has('spreadsheets.values.append')) {
          throw this.errors.get('spreadsheets.values.append');
        }
        return this.responses.get('spreadsheets.values.append') || { data: {} };
      },
      clear: async (params: any) => {
        this.calls.push({ method: 'spreadsheets.values.clear', args: params });
        if (this.errors.has('spreadsheets.values.clear')) {
          throw this.errors.get('spreadsheets.values.clear');
        }
        return this.responses.get('spreadsheets.values.clear') || { data: {} };
      }
    },
    batchUpdate: async (params: any) => {
      this.calls.push({ method: 'spreadsheets.batchUpdate', args: params });
      if (this.errors.has('spreadsheets.batchUpdate')) {
        throw this.errors.get('spreadsheets.batchUpdate');
      }
      return this.responses.get('spreadsheets.batchUpdate') || { data: {} };
    },
    create: async (params: any) => {
      this.calls.push({ method: 'spreadsheets.create', args: params });
      if (this.errors.has('spreadsheets.create')) {
        throw this.errors.get('spreadsheets.create');
      }
      return this.responses.get('spreadsheets.create') || {
        data: { spreadsheetId: 'new-spreadsheet-id' }
      };
    }
  };

  setResponse(method: string, response: any) {
    this.responses.set(method, response);
  }

  setError(method: string, error: Error) {
    this.errors.set(method, error);
  }

  reset() {
    this.calls = [];
    this.responses.clear();
    this.errors.clear();
  }
}

/**
 * Tool definition captured by MockFastMCP
 */
export interface CapturedTool {
  name: string;
  description: string;
  parameters: z.ZodType<any>;
  execute: (args: any, context: { log: MockLogger }) => Promise<string>;
}

/**
 * Mock FastMCP server that captures tool registrations
 */
export class MockFastMCP {
  public tools: Map<string, CapturedTool> = new Map();

  addTool(tool: {
    name: string;
    description: string;
    parameters: z.ZodType<any>;
    execute: (args: any, context: any) => Promise<string>;
  }) {
    this.tools.set(tool.name, tool as CapturedTool);
  }

  getTool(name: string): CapturedTool | undefined {
    return this.tools.get(name);
  }

  async executeTool(name: string, args: any, logger?: MockLogger): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    const log = logger || new MockLogger();
    return tool.execute(args, { log });
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  reset() {
    this.tools.clear();
  }
}

/**
 * Create execution context for tool testing
 */
export function createMockContext(logger?: MockLogger) {
  return {
    log: logger || new MockLogger()
  };
}

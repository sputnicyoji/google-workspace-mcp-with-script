// src/tools/index.ts
// Tool registry - exports all tool registration functions

export { registerScriptTools, SCRIPT_TOOLS_COUNT } from './scriptTools.js';

// Tool counts for documentation
export const TOOL_COUNTS = {
  docs: 15,      // Google Docs tools
  sheets: 14,    // Google Sheets tools
  drive: 16,     // Google Drive tools
  script: 4,     // Apps Script tools
  total: 49
};

// Tool categories for documentation
export const TOOL_CATEGORIES = {
  'Google Docs': [
    'readGoogleDoc',
    'listDocumentTabs',
    'appendToGoogleDoc',
    'insertText',
    'deleteRange',
    'applyTextStyle',
    'applyParagraphStyle',
    'formatMatchingText',
    'insertTable',
    'editTableCell',
    'insertPageBreak',
    'insertImageFromUrl',
    'insertLocalImage',
    'fixListFormatting',
    'findElement',
  ],
  'Google Docs Comments': [
    'listComments',
    'getComment',
    'addComment',
    'replyToComment',
    'resolveComment',
    'deleteComment',
  ],
  'Google Sheets': [
    'readSpreadsheet',
    'writeSpreadsheet',
    'appendSpreadsheetRows',
    'clearSpreadsheetRange',
    'getSpreadsheetInfo',
    'addSpreadsheetSheet',
    'createSpreadsheet',
    'listGoogleSheets',
    'setBasicFilter',
    'clearBasicFilter',
    'formatSpreadsheetCells',
  ],
  'Google Drive': [
    'listGoogleDocs',
    'searchGoogleDocs',
    'getRecentGoogleDocs',
    'getDocumentInfo',
    'createFolder',
    'listFolderContents',
    'getFolderInfo',
    'moveFile',
    'copyFile',
    'renameFile',
    'deleteFile',
    'createDocument',
    'createFromTemplate',
  ],
  'Apps Script': [
    'createBoundScript',
    'updateScriptContent',
    'getScriptContent',
    'getScriptProjects',
  ],
};

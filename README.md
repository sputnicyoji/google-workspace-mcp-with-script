# Google Workspace MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

[English](README.md) | [Simplified Chinese](README.zh-CN.md) | [Traditional Chinese](README.zh-TW.md)

A comprehensive MCP (Model Context Protocol) server providing full Google Workspace integration - including Google Docs, Sheets, Drive, and **Apps Script APIs**. Compatible with **Claude Code CLI**, **Cursor IDE**, and other MCP-compatible clients.

> **Unique Feature**: This is the **only** Google Workspace MCP server that supports **Apps Script API** - enabling AI-driven automation of Google Sheets, Docs, and other Workspace products.

![Demo Animation](assets/google.docs.mcp.1.gif)

## Features

This server provides **49 tools** across 4 Google Workspace services:

| Service | Tools | Description |
|---------|-------|-------------|
| Google Docs | 15 | Read, write, format, style, images, tables, comments |
| Google Sheets | 14 | Read, write, format, create spreadsheets, manage sheets |
| Google Drive | 16 | List, search, create, move, copy, delete files and folders |
| Apps Script | 4 | Create and manage bound scripts for automation |

### Google Docs (15 tools)

- **Document Operations**: `readGoogleDoc`, `appendToGoogleDoc`, `insertText`, `deleteRange`, `listDocumentTabs`
- **Formatting**: `applyTextStyle`, `applyParagraphStyle`, `formatMatchingText`, `fixListFormatting`
- **Structure**: `insertTable`, `editTableCell`, `insertPageBreak`, `findElement`
- **Images**: `insertImageFromUrl`, `insertLocalImage`

### Google Docs Comments (6 tools)

- **Comment Management**: `listComments`, `getComment`, `addComment`, `replyToComment`, `resolveComment`, `deleteComment`

### Google Sheets (14 tools)

- **Data Operations**: `readSpreadsheet`, `writeSpreadsheet`, `appendSpreadsheetRows`, `clearSpreadsheetRange`
- **Sheet Management**: `getSpreadsheetInfo`, `addSpreadsheetSheet`, `createSpreadsheet`, `listGoogleSheets`
- **Formatting**: `formatSpreadsheetCells`, `setBasicFilter`, `clearBasicFilter`

### Google Drive (16 tools)

- **Discovery**: `listGoogleDocs`, `searchGoogleDocs`, `getRecentGoogleDocs`, `getDocumentInfo`
- **Folders**: `createFolder`, `listFolderContents`, `getFolderInfo`
- **File Operations**: `moveFile`, `copyFile`, `renameFile`, `deleteFile`
- **Creation**: `createDocument`, `createFromTemplate`

### Apps Script (4 tools)

- **Script Management**: `createBoundScript`, `updateScriptContent`, `getScriptContent`, `getScriptProjects`

## Prerequisites

- **Node.js** v18+ with npm
- **Git** for cloning the repository
- **Google Account** with access to Google Workspace
- **MCP-compatible client**: Claude Code CLI, Cursor IDE, or other MCP clients

## Quick Start

### Option A: Interactive Setup Wizard (Recommended)

```bash
git clone https://github.com/sputnicyoji/google-docs-mcp-for-claudecode.git
cd google-docs-mcp-for-claudecode
npm install
npm run setup
```

The setup wizard will:
- Check your environment (Node.js, npm, build)
- Auto-build TypeScript if needed
- Guide you through credential setup
- Run OAuth authorization
- Generate and optionally auto-update Claude Code CLI config

### Option B: Manual Setup

#### 1. Clone and Install

```bash
git clone https://github.com/sputnicyoji/google-docs-mcp-for-claudecode.git
cd google-docs-mcp-for-claudecode
npm install
npm run build
```

#### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Docs API
   - Google Sheets API
   - Google Drive API
   - Apps Script API
4. Configure OAuth consent screen:
   - Select "External" user type
   - Add required scopes: `documents`, `spreadsheets`, `drive.file`, `script.projects`
   - Add your email as a test user
5. Create OAuth credentials:
   - Go to Credentials > Create Credentials > OAuth client ID
   - Select "Desktop app"
   - Download the JSON file and save as `credentials.json` in the project root

#### 3. Authenticate

```bash
node ./dist/server.js
```

Follow the URL in the terminal to authorize access. After authorization, a `token.json` will be created.

#### 4. Configure Claude Code CLI

Add to your Claude Code MCP configuration:

**Windows** (`%APPDATA%\Claude\mcp_config.json`):
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["C:\\path\\to\\google-docs-mcp-for-claudecode\\dist\\server.js"]
    }
  }
}
```

**macOS/Linux** (`~/.config/Claude/mcp_config.json`):
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/path/to/google-docs-mcp-for-claudecode/dist/server.js"]
    }
  }
}
```

#### 5. Configure Cursor IDE (Alternative)

This MCP server is fully compatible with [Cursor IDE](https://cursor.com/).

**Project-Level Configuration** - Create `.cursor/mcp.json` in your project root:
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/path/to/google-docs-mcp-for-claudecode/dist/server.js"]
    }
  }
}
```

**Global Configuration** - Or configure via **Cursor Settings > MCP**.

> **Note**: Cursor must be in **Agent Mode** (not Ask Mode) to access MCP tools.

## Service Account Authentication (Alternative)

For automated/server environments, you can use a service account:

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```
4. Share your Google Docs/Sheets with the service account email

## Usage Examples

### Google Docs

```
Read document 1abc...xyz and return as markdown
Append "Meeting Notes" to document 1abc...xyz
Apply bold formatting to text "Important" in document 1abc...xyz
Insert a 3x4 table at index 100 in document 1abc...xyz
```

### Google Sheets

```
Read range A1:D10 from spreadsheet 1abc...xyz
Write data to range A1:B5 in spreadsheet 1abc...xyz
Create a new spreadsheet titled "Sales Report 2024"
Add a new sheet named "Summary" to spreadsheet 1abc...xyz
```

### Google Drive

```
List all Google Docs in my Drive
Search for documents containing "Project Alpha"
Create a new folder named "2024 Reports"
Move file 1abc...xyz to folder 2def...uvw
```

### Apps Script

```
Create a bound script for spreadsheet 1abc...xyz
Update script content with custom functions
Get content of script project 1abc...xyz
```

## Project Structure

```
google-docs-mcp-for-claudecode/
  src/
    server.ts          # Main MCP server (tool definitions)
    clients.ts         # Google API client management
    auth.ts            # OAuth 2.0 / Service Account authentication
    types.ts           # TypeScript type definitions
    helpers/
      markdown.ts      # Docs to Markdown conversion
      index.ts         # Helper re-exports
    tools/
      scriptTools.ts   # Apps Script tools
      index.ts         # Tool registry
    googleDocsApiHelpers.ts   # Docs API helpers
    googleSheetsApiHelpers.ts # Sheets API helpers
  dist/               # Compiled JavaScript
  credentials.json    # OAuth credentials (not committed)
  token.json          # Auth token (not committed)
```

## Security Notes

- Never commit `credentials.json` or `token.json` to version control
- The `.gitignore` file is configured to exclude sensitive files
- For production, consider using secret management services
- Service account keys should be stored securely

## Known Limitations

- **Comment Anchoring**: Programmatically created comments may show "original content deleted" instead of anchoring to specific text
- **Converted Documents**: Some documents converted from other formats (e.g., Word) may not support all API operations
- **Quota Limits**: Google APIs have usage quotas - check [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) for limits

## Troubleshooting

### Connection Issues

1. Verify the path in `mcp_config.json` is absolute and correct
2. Ensure `npm run build` completed successfully
3. Test manually: `node ./dist/server.js`

### Authentication Errors

1. Verify all required APIs are enabled
2. Check that your email is added as a test user
3. Delete `token.json` and re-authenticate if scopes changed

### Tab/Sheet Errors

1. Use `listDocumentTabs` or `getSpreadsheetInfo` to verify IDs
2. Ensure you're using correct ID formats

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Credits

Based on [a-bonus/google-docs-mcp](https://github.com/a-bonus/google-docs-mcp) with additional enhancements:
- Google Apps Script API integration
- Service Account authentication support
- Modular code architecture
- Multi-language documentation

## License

MIT License - see [LICENSE](LICENSE) for details.

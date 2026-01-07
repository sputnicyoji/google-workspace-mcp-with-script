# Google Workspace MCP Server for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

一個全面的 MCP (Model Context Protocol) 伺服器,為 Claude Code CLI 提供完整的 Google Workspace 整合 - 包括 Google Docs、Sheets、Drive 和 Apps Script API。

![展示動畫](assets/google.docs.mcp.1.gif)

## 功能特性

本伺服器提供 **49 個工具**,涵蓋 4 個 Google Workspace 服務:

| 服務 | 工具數 | 描述 |
|------|--------|------|
| Google Docs | 15 | 讀取、寫入、格式化、樣式、圖片、表格、評論 |
| Google Sheets | 14 | 讀取、寫入、格式化、建立試算表、管理工作表 |
| Google Drive | 16 | 列出、搜尋、建立、移動、複製、刪除檔案和資料夾 |
| Apps Script | 4 | 建立和管理繫結指令碼以實現自動化 |

### Google Docs (15 個工具)

- **文件操作**: `readGoogleDoc`、`appendToGoogleDoc`、`insertText`、`deleteRange`、`listDocumentTabs`
- **格式化**: `applyTextStyle`、`applyParagraphStyle`、`formatMatchingText`、`fixListFormatting`
- **結構**: `insertTable`、`editTableCell`、`insertPageBreak`、`findElement`
- **圖片**: `insertImageFromUrl`、`insertLocalImage`

### Google Docs 評論 (6 個工具)

- **評論管理**: `listComments`、`getComment`、`addComment`、`replyToComment`、`resolveComment`、`deleteComment`

### Google Sheets (14 個工具)

- **資料操作**: `readSpreadsheet`、`writeSpreadsheet`、`appendSpreadsheetRows`、`clearSpreadsheetRange`
- **工作表管理**: `getSpreadsheetInfo`、`addSpreadsheetSheet`、`createSpreadsheet`、`listGoogleSheets`
- **格式化**: `formatSpreadsheetCells`、`setBasicFilter`、`clearBasicFilter`

### Google Drive (16 個工具)

- **探索**: `listGoogleDocs`、`searchGoogleDocs`、`getRecentGoogleDocs`、`getDocumentInfo`
- **資料夾**: `createFolder`、`listFolderContents`、`getFolderInfo`
- **檔案操作**: `moveFile`、`copyFile`、`renameFile`、`deleteFile`
- **建立**: `createDocument`、`createFromTemplate`

### Apps Script (4 個工具)

- **指令碼管理**: `createBoundScript`、`updateScriptContent`、`getScriptContent`、`getScriptProjects`

## 前置需求

- **Node.js** v18+ 及 npm
- **Git** 用於複製儲存庫
- **Google 帳號** 具有 Google Workspace 存取權限
- **Claude Code CLI** (用於 MCP 整合)

## 快速開始

### 1. 複製並安裝

```bash
git clone https://github.com/sputnicyoji/google-docs-mcp-for-claudecode.git
cd google-docs-mcp-for-claudecode
npm install
npm run build
```

### 2. Google Cloud 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API:
   - Google Docs API
   - Google Sheets API
   - Google Drive API
   - Apps Script API
4. 設定 OAuth 同意畫面:
   - 選擇「外部」使用者類型
   - 新增所需範圍: `documents`、`spreadsheets`、`drive.file`、`script.projects`
   - 將您的電子郵件新增為測試使用者
5. 建立 OAuth 憑證:
   - 前往 憑證 > 建立憑證 > OAuth 用戶端 ID
   - 選擇「桌面應用程式」
   - 下載 JSON 檔案並另存為專案根目錄的 `credentials.json`

### 3. 驗證

```bash
node ./dist/server.js
```

按照終端機中的 URL 授權存取。授權後將建立 `token.json`。

### 4. 設定 Claude Code CLI

新增至您的 Claude Code MCP 設定:

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

## 服務帳號驗證 (替代方案)

對於自動化/伺服器環境,可以使用服務帳號:

1. 在 Google Cloud Console 中建立服務帳號
2. 下載 JSON 金鑰檔案
3. 設定環境變數:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```
4. 將您的 Google Docs/Sheets 與服務帳號電子郵件共用

## 使用範例

### Google Docs

```
讀取文件 1abc...xyz 並以 markdown 格式傳回
向文件 1abc...xyz 附加「會議記錄」
對文件 1abc...xyz 中的「重要」文字套用粗體格式
在文件 1abc...xyz 的索引 100 處插入 3x4 表格
```

### Google Sheets

```
從試算表 1abc...xyz 讀取範圍 A1:D10
向試算表 1abc...xyz 的範圍 A1:B5 寫入資料
建立標題為「2024年銷售報告」的新試算表
向試算表 1abc...xyz 新增名為「摘要」的新工作表
```

### Google Drive

```
列出我的 Drive 中的所有 Google Docs
搜尋包含「專案 Alpha」的文件
建立名為「2024 報告」的新資料夾
將檔案 1abc...xyz 移動到資料夾 2def...uvw
```

### Apps Script

```
為試算表 1abc...xyz 建立繫結指令碼
使用自訂函式更新指令碼內容
取得指令碼專案 1abc...xyz 的內容
```

## 專案結構

```
google-docs-mcp-for-claudecode/
  src/
    server.ts          # 主 MCP 伺服器 (工具定義)
    clients.ts         # Google API 用戶端管理
    auth.ts            # OAuth 2.0 / 服務帳號驗證
    types.ts           # TypeScript 型別定義
    helpers/
      markdown.ts      # Docs 轉 Markdown 轉換
      index.ts         # Helper 重新匯出
    tools/
      scriptTools.ts   # Apps Script 工具
      index.ts         # 工具註冊表
    googleDocsApiHelpers.ts   # Docs API 輔助函式
    googleSheetsApiHelpers.ts # Sheets API 輔助函式
  dist/               # 編譯後的 JavaScript
  credentials.json    # OAuth 憑證 (不提交)
  token.json          # 驗證權杖 (不提交)
```

## 安全注意事項

- 切勿將 `credentials.json` 或 `token.json` 提交到版本控制
- `.gitignore` 檔案已設定為排除敏感檔案
- 對於正式環境,請考慮使用密鑰管理服務
- 服務帳號金鑰應安全儲存

## 已知限制

- **評論錨定**: 透過程式建立的評論可能顯示「原始內容已刪除」,而非錨定到特定文字
- **轉換的文件**: 從其他格式 (如 Word) 轉換的某些文件可能不支援所有 API 操作
- **配額限制**: Google API 有使用配額 - 請在 [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) 查看限制

## 疑難排解

### 連線問題

1. 驗證 `mcp_config.json` 中的路徑是絕對路徑且正確
2. 確保 `npm run build` 成功完成
3. 手動測試: `node ./dist/server.js`

### 驗證錯誤

1. 驗證所有必要的 API 已啟用
2. 檢查您的電子郵件是否已新增為測試使用者
3. 如果範圍已變更,請刪除 `token.json` 並重新驗證

### 分頁/工作表錯誤

1. 使用 `listDocumentTabs` 或 `getSpreadsheetInfo` 驗證 ID
2. 確保使用正確的 ID 格式

## 貢獻

歡迎貢獻! 請:

1. Fork 儲存庫
2. 建立功能分支
3. 提交 Pull Request

## 致謝

基於 [a-bonus/google-docs-mcp](https://github.com/a-bonus/google-docs-mcp) 進行增強:
- Google Apps Script API 整合
- 服務帳號驗證支援
- 模組化程式碼架構
- 多語言文件

## 授權條款

MIT 授權條款 - 詳見 [LICENSE](LICENSE)。

# Google Workspace MCP Server for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

一个全面的 MCP (Model Context Protocol) 服务器,为 Claude Code CLI 提供完整的 Google Workspace 集成 - 包括 Google Docs、Sheets、Drive 和 Apps Script API。

![演示动画](assets/google.docs.mcp.1.gif)

## 功能特性

本服务器提供 **49 个工具**,涵盖 4 个 Google Workspace 服务:

| 服务 | 工具数 | 描述 |
|------|--------|------|
| Google Docs | 15 | 读取、写入、格式化、样式、图片、表格、评论 |
| Google Sheets | 14 | 读取、写入、格式化、创建电子表格、管理工作表 |
| Google Drive | 16 | 列出、搜索、创建、移动、复制、删除文件和文件夹 |
| Apps Script | 4 | 创建和管理绑定脚本以实现自动化 |

### Google Docs (15 个工具)

- **文档操作**: `readGoogleDoc`、`appendToGoogleDoc`、`insertText`、`deleteRange`、`listDocumentTabs`
- **格式化**: `applyTextStyle`、`applyParagraphStyle`、`formatMatchingText`、`fixListFormatting`
- **结构**: `insertTable`、`editTableCell`、`insertPageBreak`、`findElement`
- **图片**: `insertImageFromUrl`、`insertLocalImage`

### Google Docs 评论 (6 个工具)

- **评论管理**: `listComments`、`getComment`、`addComment`、`replyToComment`、`resolveComment`、`deleteComment`

### Google Sheets (14 个工具)

- **数据操作**: `readSpreadsheet`、`writeSpreadsheet`、`appendSpreadsheetRows`、`clearSpreadsheetRange`
- **工作表管理**: `getSpreadsheetInfo`、`addSpreadsheetSheet`、`createSpreadsheet`、`listGoogleSheets`
- **格式化**: `formatSpreadsheetCells`、`setBasicFilter`、`clearBasicFilter`

### Google Drive (16 个工具)

- **发现**: `listGoogleDocs`、`searchGoogleDocs`、`getRecentGoogleDocs`、`getDocumentInfo`
- **文件夹**: `createFolder`、`listFolderContents`、`getFolderInfo`
- **文件操作**: `moveFile`、`copyFile`、`renameFile`、`deleteFile`
- **创建**: `createDocument`、`createFromTemplate`

### Apps Script (4 个工具)

- **脚本管理**: `createBoundScript`、`updateScriptContent`、`getScriptContent`、`getScriptProjects`

## 前置要求

- **Node.js** v18+ 及 npm
- **Git** 用于克隆仓库
- **Google 账号** 具有 Google Workspace 访问权限
- **Claude Code CLI** (用于 MCP 集成)

## 快速开始

### 1. 克隆并安装

```bash
git clone https://github.com/sputnicyoji/google-docs-mcp-for-claudecode.git
cd google-docs-mcp-for-claudecode
npm install
npm run build
```

### 2. Google Cloud 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下 API:
   - Google Docs API
   - Google Sheets API
   - Google Drive API
   - Apps Script API
4. 配置 OAuth 同意屏幕:
   - 选择"外部"用户类型
   - 添加所需范围: `documents`、`spreadsheets`、`drive.file`、`script.projects`
   - 将您的邮箱添加为测试用户
5. 创建 OAuth 凭据:
   - 转到 凭据 > 创建凭据 > OAuth 客户端 ID
   - 选择"桌面应用"
   - 下载 JSON 文件并另存为项目根目录的 `credentials.json`

### 3. 认证

```bash
node ./dist/server.js
```

按照终端中的 URL 授权访问。授权后将创建 `token.json`。

### 4. 配置 Claude Code CLI

添加到您的 Claude Code MCP 配置:

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

## 服务账号认证 (替代方案)

对于自动化/服务器环境,可以使用服务账号:

1. 在 Google Cloud Console 中创建服务账号
2. 下载 JSON 密钥文件
3. 设置环境变量:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```
4. 将您的 Google Docs/Sheets 与服务账号邮箱共享

## 使用示例

### Google Docs

```
读取文档 1abc...xyz 并以 markdown 格式返回
向文档 1abc...xyz 追加"会议记录"
对文档 1abc...xyz 中的"重要"文本应用粗体格式
在文档 1abc...xyz 的索引 100 处插入 3x4 表格
```

### Google Sheets

```
从电子表格 1abc...xyz 读取范围 A1:D10
向电子表格 1abc...xyz 的范围 A1:B5 写入数据
创建标题为"2024年销售报告"的新电子表格
向电子表格 1abc...xyz 添加名为"摘要"的新工作表
```

### Google Drive

```
列出我的 Drive 中的所有 Google Docs
搜索包含"项目 Alpha"的文档
创建名为"2024 报告"的新文件夹
将文件 1abc...xyz 移动到文件夹 2def...uvw
```

### Apps Script

```
为电子表格 1abc...xyz 创建绑定脚本
使用自定义函数更新脚本内容
获取脚本项目 1abc...xyz 的内容
```

## 项目结构

```
google-docs-mcp-for-claudecode/
  src/
    server.ts          # 主 MCP 服务器 (工具定义)
    clients.ts         # Google API 客户端管理
    auth.ts            # OAuth 2.0 / 服务账号认证
    types.ts           # TypeScript 类型定义
    helpers/
      markdown.ts      # Docs 转 Markdown 转换
      index.ts         # Helper 重导出
    tools/
      scriptTools.ts   # Apps Script 工具
      index.ts         # 工具注册表
    googleDocsApiHelpers.ts   # Docs API 辅助函数
    googleSheetsApiHelpers.ts # Sheets API 辅助函数
  dist/               # 编译后的 JavaScript
  credentials.json    # OAuth 凭据 (不提交)
  token.json          # 认证令牌 (不提交)
```

## 安全注意事项

- 切勿将 `credentials.json` 或 `token.json` 提交到版本控制
- `.gitignore` 文件已配置为排除敏感文件
- 对于生产环境,请考虑使用密钥管理服务
- 服务账号密钥应安全存储

## 已知限制

- **评论锚定**: 通过程序创建的评论可能显示"原始内容已删除",而不是锚定到特定文本
- **转换的文档**: 从其他格式(如 Word)转换的某些文档可能不支持所有 API 操作
- **配额限制**: Google API 有使用配额 - 请在 [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) 查看限制

## 故障排除

### 连接问题

1. 验证 `mcp_config.json` 中的路径是绝对路径且正确
2. 确保 `npm run build` 成功完成
3. 手动测试: `node ./dist/server.js`

### 认证错误

1. 验证所有必需的 API 已启用
2. 检查您的邮箱是否已添加为测试用户
3. 如果范围已更改,请删除 `token.json` 并重新认证

### 标签/工作表错误

1. 使用 `listDocumentTabs` 或 `getSpreadsheetInfo` 验证 ID
2. 确保使用正确的 ID 格式

## 贡献

欢迎贡献! 请:

1. Fork 仓库
2. 创建功能分支
3. 提交 Pull Request

## 致谢

基于 [a-bonus/google-docs-mcp](https://github.com/a-bonus/google-docs-mcp) 进行增强:
- Google Apps Script API 集成
- 服务账号认证支持
- 模块化代码架构
- 多语言文档

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)。

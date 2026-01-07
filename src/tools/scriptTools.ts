// src/tools/scriptTools.ts
// Google Apps Script API tools

import { FastMCP, UserError } from 'fastmcp';
import { z } from 'zod';
import { getScriptClient, getDriveClient } from '../clients.js';

/**
 * Register all Apps Script tools with the server
 */
export function registerScriptTools(server: FastMCP) {

  // Tool: createBoundScript
  server.addTool({
    name: 'createBoundScript',
    description: 'Creates a new Apps Script project bound to a Google Spreadsheet or Document. Returns the script ID for subsequent operations.',
    parameters: z.object({
      title: z.string().describe('Title for the new Apps Script project.'),
      parentId: z.string().describe('The ID of the Google Spreadsheet or Document to bind the script to.'),
    }),
    execute: async (args, { log }) => {
      const script = await getScriptClient();
      log.info(`Creating bound Apps Script project "${args.title}" for parent: ${args.parentId}`);

      try {
        const response = await script.projects.create({
          requestBody: {
            title: args.title,
            parentId: args.parentId,
          },
        });

        const scriptId = response.data.scriptId;
        return `Apps Script project created successfully!\n\n**Script ID:** ${scriptId}\n**Title:** ${args.title}\n**Bound to:** ${args.parentId}\n\nUse this Script ID with updateScriptContent to add your code.`;
      } catch (error: any) {
        log.error(`Error creating Apps Script project: ${error.message || error}`);
        throw new UserError(`Failed to create Apps Script project: ${error.message || 'Unknown error'}`);
      }
    },
  });

  // Tool: updateScriptContent
  server.addTool({
    name: 'updateScriptContent',
    description: 'Updates the content of an Apps Script project. You can add multiple script files (Code.gs, etc.) and the manifest (appsscript.json).',
    parameters: z.object({
      scriptId: z.string().describe('The ID of the Apps Script project to update.'),
      files: z.array(z.object({
        name: z.string().describe('File name without extension (e.g., "Code" for Code.gs, "appsscript" for manifest).'),
        type: z.enum(['SERVER_JS', 'JSON']).describe('File type: SERVER_JS for .gs files, JSON for appsscript.json manifest.'),
        source: z.string().describe('The source code content of the file.'),
      })).describe('Array of files to include in the script project.'),
    }),
    execute: async (args, { log }) => {
      const script = await getScriptClient();
      log.info(`Updating Apps Script project: ${args.scriptId}`);

      try {
        const filesPayload = args.files.map(file => ({
          name: file.name,
          type: file.type,
          source: file.source,
        }));

        await script.projects.updateContent({
          scriptId: args.scriptId,
          requestBody: {
            files: filesPayload,
          },
        });

        const fileList = args.files.map(f => `- ${f.name} (${f.type})`).join('\n');
        return `Apps Script project updated successfully!\n\n**Script ID:** ${args.scriptId}\n**Files updated:**\n${fileList}\n\nTo run the script, open the spreadsheet and use the custom menu (if you added onOpen), or go to Extensions > Apps Script.`;
      } catch (error: any) {
        log.error(`Error updating Apps Script content: ${error.message || error}`);
        throw new UserError(`Failed to update Apps Script content: ${error.message || 'Unknown error'}`);
      }
    },
  });

  // Tool: getScriptContent
  server.addTool({
    name: 'getScriptContent',
    description: 'Retrieves the content of an Apps Script project including all files.',
    parameters: z.object({
      scriptId: z.string().describe('The ID of the Apps Script project to retrieve.'),
    }),
    execute: async (args, { log }) => {
      const script = await getScriptClient();
      log.info(`Getting content of Apps Script project: ${args.scriptId}`);

      try {
        const response = await script.projects.getContent({
          scriptId: args.scriptId,
        });

        const files = response.data.files || [];
        let result = `**Apps Script Project Content**\n**Script ID:** ${args.scriptId}\n\n`;

        for (const file of files) {
          result += `### ${file.name} (${file.type})\n\`\`\`${file.type === 'SERVER_JS' ? 'javascript' : 'json'}\n${file.source}\n\`\`\`\n\n`;
        }

        return result;
      } catch (error: any) {
        log.error(`Error getting Apps Script content: ${error.message || error}`);
        throw new UserError(`Failed to get Apps Script content: ${error.message || 'Unknown error'}`);
      }
    },
  });

  // Tool: getScriptProjects
  server.addTool({
    name: 'getScriptProjects',
    description: 'Lists Apps Script projects. Note: This only works for standalone scripts. For bound scripts, use the parent document/spreadsheet ID.',
    parameters: z.object({
      pageSize: z.number().int().min(1).max(50).optional().default(10).describe('Maximum number of projects to return (1-50).'),
    }),
    execute: async (args, { log }) => {
      const drive = await getDriveClient();
      log.info(`Listing Apps Script projects (pageSize: ${args.pageSize})`);

      try {
        const response = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.script'",
          pageSize: args.pageSize,
          fields: 'files(id, name, createdTime, modifiedTime)',
          orderBy: 'modifiedTime desc',
        });

        const files = response.data.files || [];
        if (files.length === 0) {
          return 'No standalone Apps Script projects found.';
        }

        let result = `**Apps Script Projects (${files.length} found)**\n\n`;
        for (const file of files) {
          result += `- **${file.name}**\n  - ID: ${file.id}\n  - Modified: ${file.modifiedTime}\n\n`;
        }

        return result;
      } catch (error: any) {
        log.error(`Error listing Apps Script projects: ${error.message || error}`);
        throw new UserError(`Failed to list Apps Script projects: ${error.message || 'Unknown error'}`);
      }
    },
  });
}

// Export tool count for documentation
export const SCRIPT_TOOLS_COUNT = 4;

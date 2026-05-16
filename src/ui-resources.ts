import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resource URIs exposed by this server. Tools attach _meta.ui.resourceUri pointing here.
export const UI_RESOURCES = {
  campaignDetails: "ui://delightloop/campaign-details/index.html",
  campaignList: "ui://delightloop/campaign-list/index.html",
  contactList: "ui://delightloop/contact-list/index.html",
  contactCard: "ui://delightloop/contact-card/index.html",
  recipientList: "ui://delightloop/recipient-list/index.html",
} as const;

// Map resource URI -> built single-file HTML on disk
const RESOURCE_FILES: Record<string, string> = {
  [UI_RESOURCES.campaignDetails]: path.resolve(
    __dirname,
    "../ui/dist/campaign-details/index.html",
  ),
  [UI_RESOURCES.campaignList]: path.resolve(
    __dirname,
    "../ui/dist/campaign-list/index.html",
  ),
  [UI_RESOURCES.contactList]: path.resolve(
    __dirname,
    "../ui/dist/contact-list/index.html",
  ),
  [UI_RESOURCES.contactCard]: path.resolve(
    __dirname,
    "../ui/dist/contact-card/index.html",
  ),
  [UI_RESOURCES.recipientList]: path.resolve(
    __dirname,
    "../ui/dist/recipient-list/index.html",
  ),
};

const cache = new Map<string, string>();

async function loadResource(uri: string): Promise<string> {
  const cached = cache.get(uri);
  if (cached) return cached;
  const filePath = RESOURCE_FILES[uri];
  if (!filePath) throw new Error(`Unknown UI resource: ${uri}`);
  const html = await readFile(filePath, "utf-8");
  cache.set(uri, html);
  return html;
}

export function registerUiResources(server: McpServer): void {
  for (const uri of Object.values(UI_RESOURCES)) {
    registerAppResource(
      server,
      uri,
      uri,
      { mimeType: RESOURCE_MIME_TYPE },
      async () => {
        const html = await loadResource(uri);
        return {
          contents: [
            { uri, mimeType: RESOURCE_MIME_TYPE, text: html },
          ],
        };
      },
    );
  }
}

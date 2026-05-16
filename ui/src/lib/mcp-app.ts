import { App } from '@modelcontextprotocol/ext-apps';

const app = new App({
  name: 'mcp-delightloop-ui',
  version: '0.1.0',
});

let connected: Promise<void> | null = null;

export function getApp(): App {
  if (!connected) {
    connected = app.connect();
  }
  return app;
}

export async function ready(): Promise<App> {
  if (!connected) {
    connected = app.connect();
  }
  await connected;
  return app;
}

export function parseToolResult<T = unknown>(result: {
  content?: Array<{ type: string; text?: string }>;
}): T {
  const text = result.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new Error('MCP tool returned no text content');
  return JSON.parse(text) as T;
}

export async function callTool<T = unknown>(
  name: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const a = await ready();
  const result = await a.callServerTool({ name, arguments: args });
  return parseToolResult<T>(result);
}

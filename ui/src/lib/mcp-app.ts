import { App } from '@modelcontextprotocol/ext-apps';

const app = new App({
  name: 'mcp-delightloop-ui',
  version: '0.1.0',
});

let connected: Promise<void> | null = null;
let darkModeInitialized = false;

function initDarkMode(): void {
  if (darkModeInitialized || typeof window === 'undefined') return;
  darkModeInitialized = true;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
  };
  apply(mq.matches);
  mq.addEventListener('change', (e) => apply(e.matches));
}

export function getApp(): App {
  if (!connected) {
    initDarkMode();
    connected = app.connect();
  }
  return app;
}

export async function ready(): Promise<App> {
  if (!connected) {
    initDarkMode();
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

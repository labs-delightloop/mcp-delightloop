#!/usr/bin/env node
/**
 * Delightloop MCP Server
 *
 * Runs in two modes:
 *  - stdio  (local): set DELIGHTLOOP_API_KEY env var, no PORT
 *  - HTTP   (remote): set PORT
 *
 * HTTP supports:
 *  - OAuth 2.0 Authorization Code flow (Claude.ai web, new MCP clients)
 *  - StreamableHTTP: POST /mcp or POST /sse
 *  - SSE legacy:     GET /sse + POST /message
 */
export {};
//# sourceMappingURL=index.d.ts.map
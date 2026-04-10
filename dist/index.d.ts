#!/usr/bin/env node
/**
 * Delightloop MCP Server
 *
 * Runs in two modes:
 *  - stdio  (local): set DELIGHTLOOP_API_KEY env var, no PORT
 *  - HTTP   (remote / Smithery): set PORT, API key passed per-connection via ?apiKey=
 *
 * HTTP supports both transports:
 *  - StreamableHTTP (new): POST /mcp or POST /sse  — used by Smithery, Claude.ai, newer clients
 *  - SSE (legacy):         GET /sse + POST /message — used by older clients
 */
export {};
//# sourceMappingURL=index.d.ts.map
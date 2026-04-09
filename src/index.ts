#!/usr/bin/env node
/**
 * Delightloop MCP Server
 *
 * Runs in two modes:
 *  - stdio  (local): set DELIGHTLOOP_API_KEY env var, no PORT
 *  - HTTP   (remote / Smithery): set PORT, API key passed per-connection via ?apiKey=
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

import { validateApiKey } from "./client.js";
import { createMcpServer } from "./mcp.js";

const PORT = process.env.PORT;
const VERSION = "0.1.5";

function log(msg: string) {
  console.error(`[mcp-delightloop] ${msg}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP / SSE mode  (Smithery gateway + remote clients)
// ─────────────────────────────────────────────────────────────────────────────

if (PORT) {
  log(`Starting HTTP mode — version ${VERSION}, port ${PORT}`);
  log(`Node ${process.version} | pid ${process.pid}`);

  const app = express();
  app.use(express.json());

  // Log every incoming request
  app.use((req, _res, next) => {
    log(`${req.method} ${req.path} — ip: ${req.ip}, query: ${JSON.stringify(req.query)}`);
    next();
  });

  // Track active transports by session ID so POST /message can route correctly
  const transports = new Map<string, SSEServerTransport>();

  // Root — friendly landing page
  app.get("/", (_req, res) => {
    res.json({
      name: "Delightloop MCP Server",
      version: VERSION,
      status: "running",
      description: "MCP server for Delightloop — manage contacts, campaigns, gifts, email, enrichment, and webhooks from any AI assistant.",
      docs: "https://www.npmjs.com/package/mcp-delightloop",
      endpoints: {
        health: "GET /health",
        sse:    "GET /sse?apiKey=YOUR_DELIGHTLOOP_API_KEY",
        message:"POST /message?sessionId=SESSION_ID",
      },
      tools: [
        "contact_create", "contact_bulk_create", "contact_get", "contact_list", "contact_update",
        "recipient_get", "campaign_launch_recipients", "campaign_launch_all", "recipient_tag",
        "campaign_get", "campaign_list", "campaign_add_contacts",
        "linkedin_profile_get", "work_email_get",
        "gift_list", "gift_get",
        "email_send", "email_bulk_send",
        "webhook_create", "webhook_get", "webhook_list", "webhook_delete",
      ],
    });
  });

  // Health check — used by Coolify / Railway / Traefik
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "mcp-delightloop", version: VERSION, uptime: Math.floor(process.uptime()) });
  });

  // SSE endpoint — one persistent connection per client
  // API key is passed as ?apiKey=  (Smithery injects it from user config)
  app.get("/sse", async (req, res) => {
    const apiKey =
      (req.query["DELIGHTLOOP_API_KEY"] as string) ||
      (req.query["apiKey"] as string) ||
      (req.headers["x-api-key"] as string);

    if (!apiKey) {
      log("SSE rejected — no API key provided");
      res.status(401).json({
        error: "Missing API key — pass ?apiKey=YOUR_KEY or x-api-key header",
      });
      return;
    }

    log(`SSE — validating API key (key prefix: ${apiKey.slice(0, 8)}...)`);

    let ctx: { userId: string; orgId: string };
    try {
      ctx = await validateApiKey(apiKey);
      log(`SSE — auth OK: userId=${ctx.userId} orgId=${ctx.orgId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`SSE — auth FAILED: ${msg}`);
      res.status(401).json({
        error: `Invalid or expired API key: ${msg}`,
      });
      return;
    }

    const server = createMcpServer(apiKey);
    const transport = new SSEServerTransport("/message", res);

    transports.set(transport.sessionId, transport);
    log(`SSE — session opened: ${transport.sessionId} (active sessions: ${transports.size})`);

    transport.onclose = () => {
      transports.delete(transport.sessionId);
      log(`SSE — session closed: ${transport.sessionId} (active sessions: ${transports.size})`);
    };

    try {
      await server.connect(transport);
    } catch (err) {
      log(`SSE — server.connect error: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  // Message endpoint — client POSTs MCP messages here
  app.post("/message", async (req, res) => {
    const sessionId = req.query["sessionId"] as string;
    const transport = transports.get(sessionId);

    if (!transport) {
      log(`POST /message — session not found: ${sessionId}`);
      res.status(404).json({ error: "Session not found or expired" });
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
    } catch (err) {
      log(`POST /message — error: ${err instanceof Error ? err.message : String(err)}`);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Catch-all for unknown routes
  app.use((req, res) => {
    log(`404 — unknown route: ${req.method} ${req.path}`);
    res.status(404).json({ error: `Unknown route: ${req.method} ${req.path}` });
  });

  // Global error handler
  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    log(`Unhandled error on ${req.method} ${req.path}: ${err instanceof Error ? err.message : String(err)}`);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.listen(parseInt(PORT, 10), "0.0.0.0", () => {
    log(`HTTP server listening on 0.0.0.0:${PORT}`);
    log(`FQDN reachable at: ${process.env.FQDN || "(not set)"}`);
  });

  // Log unhandled promise rejections so they appear in Coolify logs
  process.on("unhandledRejection", (reason) => {
    log(`Unhandled rejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
  });

// ─────────────────────────────────────────────────────────────────────────────
//  stdio mode  (Claude Desktop, Cursor, Windsurf, Cline, Zed…)
// ─────────────────────────────────────────────────────────────────────────────

} else {
  const API_KEY = process.env.DELIGHTLOOP_API_KEY;

  if (!API_KEY) {
    console.error(
      "[mcp-delightloop] ERROR: DELIGHTLOOP_API_KEY is not set.\n" +
        "  DELIGHTLOOP_API_KEY=your_key node dist/index.js",
    );
    process.exit(1);
  }

  try {
    const ctx = await validateApiKey(API_KEY);
    console.error(
      `[mcp-delightloop] Authenticated — userId: ${ctx.userId} | orgId: ${ctx.orgId}`,
    );
  } catch (err) {
    console.error(
      `[mcp-delightloop] Auth failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  }

  const server = createMcpServer(API_KEY);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp-delightloop] Server running on stdio");
}

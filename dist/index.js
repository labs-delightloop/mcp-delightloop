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
import { randomUUID } from "crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { validateApiKey } from "./client.js";
import { createMcpServer } from "./mcp.js";
const PORT = process.env.PORT;
const VERSION = "0.1.9";
function log(msg) {
    console.error(`[mcp-delightloop] ${msg}`);
}
// ─────────────────────────────────────────────────────────────────────────────
//  HTTP mode  (Smithery gateway + remote clients)
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
    // ── Session stores ──────────────────────────────────────────────────────────
    // Legacy SSE sessions (GET /sse + POST /message)
    const sseSessions = new Map();
    // New StreamableHTTP sessions (POST /mcp or POST /sse)
    const streamableSessions = new Map();
    // ── Helper: extract API key from request ────────────────────────────────────
    function extractApiKey(req) {
        return (req.query["DELIGHTLOOP_API_KEY"] ||
            req.query["apiKey"] ||
            req.headers["x-api-key"] ||
            undefined);
    }
    // ── Helper: handle StreamableHTTP requests ──────────────────────────────────
    async function handleStreamable(req, res) {
        const sessionId = req.headers["mcp-session-id"];
        // Existing session — route to its transport
        if (sessionId) {
            const transport = streamableSessions.get(sessionId);
            if (!transport) {
                log(`StreamableHTTP — session not found: ${sessionId}`);
                res.status(404).json({ error: "Session not found or expired" });
                return;
            }
            await transport.handleRequest(req, res, req.body);
            return;
        }
        // New session — validate API key first
        const apiKey = extractApiKey(req);
        if (!apiKey) {
            log("StreamableHTTP rejected — no API key");
            res.status(401).json({ error: "Missing API key — pass ?apiKey=YOUR_KEY or x-api-key header" });
            return;
        }
        try {
            const ctx = await validateApiKey(apiKey);
            log(`StreamableHTTP — auth OK: userId=${ctx.userId} orgId=${ctx.orgId}`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`StreamableHTTP — auth FAILED: ${msg}`);
            res.status(401).json({ error: `Invalid or expired API key: ${msg}` });
            return;
        }
        // Pre-generate session ID so we can store before handleRequest fires
        const newSessionId = randomUUID();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => newSessionId,
        });
        streamableSessions.set(newSessionId, transport);
        log(`StreamableHTTP session opened: ${newSessionId} (active: ${streamableSessions.size})`);
        transport.onclose = () => {
            streamableSessions.delete(newSessionId);
            log(`StreamableHTTP session closed: ${newSessionId} (active: ${streamableSessions.size})`);
        };
        const server = createMcpServer(apiKey);
        try {
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        }
        catch (err) {
            log(`StreamableHTTP error: ${err instanceof Error ? err.message : String(err)}`);
            streamableSessions.delete(newSessionId);
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }
    // ── Routes ──────────────────────────────────────────────────────────────────
    // Root — landing page
    app.get("/", (_req, res) => {
        res.json({
            name: "Delightloop MCP Server",
            version: VERSION,
            status: "running",
            description: "MCP server for Delightloop — manage contacts, campaigns, gifts, email, enrichment, and webhooks.",
            docs: "https://www.npmjs.com/package/mcp-delightloop",
            endpoints: {
                health: "GET  /health",
                mcp: "POST /mcp          (StreamableHTTP — recommended)",
                sse_new: "POST /sse          (StreamableHTTP — Smithery)",
                sse_legacy: "GET  /sse?apiKey=  (SSE legacy)",
                message: "POST /message?sessionId= (SSE legacy messages)",
            },
        });
    });
    // Health check
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", server: "mcp-delightloop", version: VERSION, uptime: Math.floor(process.uptime()) });
    });
    // ── OAuth discovery endpoints ───────────────────────────────────────────────
    // New MCP clients (Smithery, Claude.ai) probe these to understand auth method.
    // We declare ourselves as a resource server that uses API key auth (no OAuth).
    const RESOURCE_URL = process.env.FQDN
        ? `https://${process.env.FQDN}`
        : "https://mcp.delightloop.vip";
    // RFC 8707 — Resource Server metadata: declares API-key-only auth, no OAuth
    app.get("/.well-known/oauth-protected-resource", (_req, res) => {
        res.json({
            resource: RESOURCE_URL,
            bearer_methods_supported: ["query", "header"],
            resource_documentation: "https://www.npmjs.com/package/mcp-delightloop",
        });
    });
    // Handle sub-path variants (e.g. /.well-known/oauth-protected-resource/sse)
    app.get("/.well-known/oauth-protected-resource/*", (_req, res) => {
        res.json({
            resource: RESOURCE_URL,
            bearer_methods_supported: ["query", "header"],
            resource_documentation: "https://www.npmjs.com/package/mcp-delightloop",
        });
    });
    // No OAuth authorization server — return 404 so clients skip OAuth flow
    app.get("/.well-known/oauth-authorization-server", (_req, res) => {
        res.status(404).json({ error: "This server uses API key auth. Pass ?apiKey=YOUR_KEY — no OAuth required." });
    });
    // No dynamic client registration
    app.post("/register", (_req, res) => {
        res.status(404).json({ error: "Dynamic client registration not supported. Use API key auth." });
    });
    // ── StreamableHTTP — /mcp (standard new endpoint) ──────────────────────────
    app.post("/mcp", handleStreamable);
    app.get("/mcp", handleStreamable);
    app.delete("/mcp", async (req, res) => {
        const sessionId = req.headers["mcp-session-id"];
        if (sessionId && streamableSessions.has(sessionId)) {
            streamableSessions.delete(sessionId);
            log(`StreamableHTTP session deleted: ${sessionId}`);
        }
        res.status(200).send();
    });
    // ── StreamableHTTP — POST /sse (Smithery uses this path) ───────────────────
    app.post("/sse", handleStreamable);
    // ── Legacy SSE — GET /sse (older clients) ──────────────────────────────────
    app.get("/sse", async (req, res) => {
        const apiKey = extractApiKey(req);
        if (!apiKey) {
            log("SSE legacy rejected — no API key");
            res.status(401).json({ error: "Missing API key — pass ?apiKey=YOUR_KEY or x-api-key header" });
            return;
        }
        try {
            const ctx = await validateApiKey(apiKey);
            log(`SSE legacy — auth OK: userId=${ctx.userId}`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`SSE legacy — auth FAILED: ${msg}`);
            res.status(401).json({ error: `Invalid or expired API key: ${msg}` });
            return;
        }
        const server = createMcpServer(apiKey);
        const transport = new SSEServerTransport("/message", res);
        sseSessions.set(transport.sessionId, transport);
        log(`SSE legacy session opened: ${transport.sessionId} (active: ${sseSessions.size})`);
        transport.onclose = () => {
            sseSessions.delete(transport.sessionId);
            log(`SSE legacy session closed: ${transport.sessionId} (active: ${sseSessions.size})`);
        };
        await server.connect(transport);
    });
    // ── Legacy SSE — POST /message ──────────────────────────────────────────────
    app.post("/message", async (req, res) => {
        const sessionId = req.query["sessionId"];
        const transport = sseSessions.get(sessionId);
        if (!transport) {
            log(`POST /message — session not found: ${sessionId}`);
            res.status(404).json({ error: "Session not found or expired" });
            return;
        }
        await transport.handlePostMessage(req, res);
    });
    // ── Catch-all ───────────────────────────────────────────────────────────────
    app.use((req, res) => {
        log(`404 — unknown route: ${req.method} ${req.path}`);
        res.status(404).json({ error: `Unknown route: ${req.method} ${req.path}` });
    });
    app.use((err, req, res, _next) => {
        log(`Unhandled error on ${req.method} ${req.path}: ${err instanceof Error ? err.message : String(err)}`);
        if (!res.headersSent)
            res.status(500).json({ error: "Internal server error" });
    });
    app.listen(parseInt(PORT, 10), "0.0.0.0", () => {
        log(`HTTP server listening on 0.0.0.0:${PORT}`);
    });
    process.on("unhandledRejection", (reason) => {
        log(`Unhandled rejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
    });
    // ─────────────────────────────────────────────────────────────────────────────
    //  stdio mode  (Claude Desktop, Cursor, Windsurf, Cline, Zed…)
    // ─────────────────────────────────────────────────────────────────────────────
}
else {
    const API_KEY = process.env.DELIGHTLOOP_API_KEY;
    if (!API_KEY) {
        console.error("[mcp-delightloop] ERROR: DELIGHTLOOP_API_KEY is not set.\n" +
            "  DELIGHTLOOP_API_KEY=your_key node dist/index.js");
        process.exit(1);
    }
    try {
        const ctx = await validateApiKey(API_KEY);
        console.error(`[mcp-delightloop] Authenticated — userId: ${ctx.userId} | orgId: ${ctx.orgId}`);
    }
    catch (err) {
        console.error(`[mcp-delightloop] Auth failed: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    }
    const server = createMcpServer(API_KEY);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[mcp-delightloop] Server running on stdio");
}
//# sourceMappingURL=index.js.map
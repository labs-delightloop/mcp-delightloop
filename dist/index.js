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
// ─────────────────────────────────────────────────────────────────────────────
//  HTTP / SSE mode  (Smithery gateway + remote clients)
// ─────────────────────────────────────────────────────────────────────────────
if (PORT) {
    const app = express();
    app.use(express.json());
    // Track active transports by session ID so POST /message can route correctly
    const transports = new Map();
    // Health check — required by Railway / Render / Fly
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", server: "mcp-delightloop" });
    });
    // SSE endpoint — one persistent connection per client
    // API key is passed as ?apiKey=  (Smithery injects it from user config)
    app.get("/sse", async (req, res) => {
        const apiKey = req.query["DELIGHTLOOP_API_KEY"] ||
            req.query["apiKey"] ||
            req.headers["x-api-key"];
        if (!apiKey) {
            res.status(401).json({
                error: "Missing API key — pass ?apiKey=YOUR_KEY or x-api-key header",
            });
            return;
        }
        try {
            await validateApiKey(apiKey);
        }
        catch (err) {
            res.status(401).json({
                error: `Invalid or expired API key: ${err instanceof Error ? err.message : String(err)}`,
            });
            return;
        }
        const server = createMcpServer(apiKey);
        const transport = new SSEServerTransport("/message", res);
        transports.set(transport.sessionId, transport);
        transport.onclose = () => transports.delete(transport.sessionId);
        await server.connect(transport);
    });
    // Message endpoint — client POSTs MCP messages here
    app.post("/message", async (req, res) => {
        const sessionId = req.query["sessionId"];
        const transport = transports.get(sessionId);
        if (!transport) {
            res.status(404).json({ error: "Session not found or expired" });
            return;
        }
        await transport.handlePostMessage(req, res);
    });
    app.listen(parseInt(PORT, 10), () => {
        console.log(`[mcp-delightloop] HTTP server listening on port ${PORT}`);
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
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

import { createHash, randomUUID } from "crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

import { validateApiKey } from "./client.js";
import { createMcpServer } from "./mcp.js";

const PORT = process.env.PORT;
const VERSION = "0.1.10";

function log(msg: string) {
  console.error(`[mcp-delightloop] ${msg}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP mode
// ─────────────────────────────────────────────────────────────────────────────

if (PORT) {
  log(`Starting HTTP mode — version ${VERSION}, port ${PORT}`);
  log(`Node ${process.version} | pid ${process.pid}`);

  const RESOURCE_URL = process.env.RESOURCE_URL || "https://mcp.delightloop.vip";

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, _res, next) => {
    log(`${req.method} ${req.path} — ip: ${req.ip}`);
    next();
  });

  // ── In-memory stores ────────────────────────────────────────────────────────
  const sseSessions       = new Map<string, SSEServerTransport>();
  const streamableSessions = new Map<string, StreamableHTTPServerTransport>();

  // OAuth stores
  const oauthClients = new Map<string, { redirectUris: string[] }>();
  const authCodes    = new Map<string, {
    apiKey: string; redirectUri: string; clientId: string;
    codeChallenge?: string; expiresAt: number;
  }>();
  const accessTokens = new Map<string, string>(); // token → apiKey

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function extractApiKey(req: express.Request): string | undefined {
    const auth = req.headers["authorization"] as string | undefined;
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      return accessTokens.get(token) ?? token; // bearer token OR raw API key
    }
    return (
      (req.query["DELIGHTLOOP_API_KEY"] as string) ||
      (req.query["apiKey"] as string) ||
      (req.headers["x-api-key"] as string) ||
      undefined
    );
  }

  async function handleStreamable(req: express.Request, res: express.Response) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId) {
      const transport = streamableSessions.get(sessionId);
      if (!transport) {
        res.status(404).json({ error: "Session not found or expired" });
        return;
      }
      await transport.handleRequest(req, res, req.body);
      return;
    }

    const apiKey = extractApiKey(req);
    if (!apiKey) {
      res.status(401).json({ error: "Missing API key" });
      return;
    }

    try {
      const ctx = await validateApiKey(apiKey);
      log(`StreamableHTTP auth OK: userId=${ctx.userId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`StreamableHTTP auth FAILED: ${msg}`);
      res.status(401).json({ error: `Invalid or expired API key: ${msg}` });
      return;
    }

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
    } catch (err) {
      log(`StreamableHTTP error: ${err instanceof Error ? err.message : String(err)}`);
      streamableSessions.delete(newSessionId);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  }

  // ── Standard endpoints ──────────────────────────────────────────────────────

  app.get("/", (_req, res) => {
    res.json({ name: "Delightloop MCP Server", version: VERSION, status: "running" });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "mcp-delightloop", version: VERSION, uptime: Math.floor(process.uptime()) });
  });

  // ── OAuth 2.0 — Resource Server metadata (RFC 8707) ─────────────────────────
  const oauthResourceMetadata = {
    resource: RESOURCE_URL,
    authorization_servers: [`${RESOURCE_URL}`],
    bearer_methods_supported: ["header"],
    resource_documentation: "https://www.npmjs.com/package/mcp-delightloop",
  };

  app.get("/.well-known/oauth-protected-resource", (_req, res) => res.json(oauthResourceMetadata));
  app.get("/.well-known/oauth-protected-resource/*", (_req, res) => res.json(oauthResourceMetadata));

  // ── OAuth 2.0 — Authorization Server metadata (RFC 8414) ────────────────────
  app.get("/.well-known/oauth-authorization-server", (_req, res) => {
    res.json({
      issuer: RESOURCE_URL,
      authorization_endpoint: `${RESOURCE_URL}/authorize`,
      token_endpoint: `${RESOURCE_URL}/token`,
      registration_endpoint: `${RESOURCE_URL}/register`,
      scopes_supported: ["mcp"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
    });
  });

  // ── OAuth 2.0 — Dynamic Client Registration (RFC 7591) ──────────────────────
  app.post("/register", (req, res) => {
    const clientId = randomUUID();
    const redirectUris: string[] = req.body?.redirect_uris ?? [];
    oauthClients.set(clientId, { redirectUris });
    log(`OAuth client registered: ${clientId}`);
    res.status(201).json({
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    });
  });

  // ── OAuth 2.0 — Authorization Endpoint ──────────────────────────────────────
  app.get("/authorize", (req, res) => {
    const { client_id, redirect_uri, state, code_challenge, code_challenge_method } = req.query as Record<string, string>;

    // Inline HTML login page — user enters their Delightloop API key
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect to Delightloop</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f0f10; color: #f0f0f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1a1a1d; border: 1px solid #2a2a2e; border-radius: 12px; padding: 36px; width: 100%; max-width: 400px; }
    .logo { font-size: 22px; font-weight: 700; color: #a78bfa; margin-bottom: 8px; }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    p { color: #888; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    a { color: #a78bfa; text-decoration: none; }
    label { display: block; font-size: 13px; color: #aaa; margin-bottom: 6px; }
    input[type=text] { width: 100%; padding: 10px 14px; background: #111; border: 1px solid #333; border-radius: 8px; color: #f0f0f0; font-size: 14px; outline: none; }
    input[type=text]:focus { border-color: #a78bfa; }
    button { width: 100%; margin-top: 16px; padding: 12px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    button:hover { background: #6d28d9; }
    .error { color: #f87171; font-size: 13px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Delightloop</div>
    <h1>Connect your account</h1>
    <p>Enter your Delightloop API key to authorize this connection.<br>
    Get your key from <a href="https://web.delightloop.ai/settings/api-keys" target="_blank">Settings → API Keys</a>.</p>
    <form method="POST" action="/authorize">
      <input type="hidden" name="client_id" value="${client_id || ""}">
      <input type="hidden" name="redirect_uri" value="${redirect_uri || ""}">
      <input type="hidden" name="state" value="${state || ""}">
      <input type="hidden" name="code_challenge" value="${code_challenge || ""}">
      <input type="hidden" name="code_challenge_method" value="${code_challenge_method || ""}">
      <label for="api_key">API Key</label>
      <input type="text" id="api_key" name="api_key" placeholder="ak-..." required autocomplete="off" spellcheck="false">
      <button type="submit">Authorize</button>
    </form>
  </div>
</body>
</html>`);
  });

  // Authorization form POST — validate key and redirect back with code
  app.post("/authorize", async (req, res) => {
    const { client_id, redirect_uri, state, api_key, code_challenge } = req.body as Record<string, string>;

    if (!api_key) {
      res.status(400).send("API key is required");
      return;
    }

    if (!redirect_uri) {
      res.status(400).send("redirect_uri is required");
      return;
    }

    try {
      await validateApiKey(api_key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`OAuth authorize — invalid API key: ${msg}`);
      res.status(401).send(`
        <html><body style="font-family:sans-serif;padding:40px">
        <h2 style="color:red">Invalid API key</h2>
        <p>${msg}</p>
        <p><a href="javascript:history.back()">Try again</a></p>
        </body></html>`);
      return;
    }

    const code = randomUUID();
    authCodes.set(code, {
      apiKey: api_key,
      redirectUri: redirect_uri,
      clientId: client_id || "",
      codeChallenge: code_challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    log(`OAuth authorize — code issued for clientId=${client_id}`);

    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);

    res.redirect(url.toString());
  });

  // ── OAuth 2.0 — Token Endpoint ───────────────────────────────────────────────
  app.post("/token", (req, res) => {
    const { grant_type, code, redirect_uri, code_verifier } = req.body as Record<string, string>;

    if (grant_type !== "authorization_code") {
      res.status(400).json({ error: "unsupported_grant_type" });
      return;
    }

    const entry = authCodes.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      authCodes.delete(code);
      res.status(400).json({ error: "invalid_grant", error_description: "Code expired or invalid" });
      return;
    }

    if (entry.redirectUri !== redirect_uri) {
      res.status(400).json({ error: "invalid_grant", error_description: "redirect_uri mismatch" });
      return;
    }

    // Verify PKCE if code_challenge was provided
    if (entry.codeChallenge && code_verifier) {
      const expected = createHash("sha256")
        .update(code_verifier)
        .digest("base64url");
      if (expected !== entry.codeChallenge) {
        res.status(400).json({ error: "invalid_grant", error_description: "PKCE verification failed" });
        return;
      }
    }

    authCodes.delete(code);

    // Issue access token
    const accessToken = randomUUID();
    accessTokens.set(accessToken, entry.apiKey);
    log(`OAuth token issued for clientId=${entry.clientId}`);

    // Clean up old tokens (simple TTL — keep last 1000)
    if (accessTokens.size > 1000) {
      const oldest = accessTokens.keys().next().value;
      if (oldest) accessTokens.delete(oldest);
    }

    res.json({
      access_token: accessToken,
      token_type: "bearer",
      expires_in: 86400,
      scope: "mcp",
    });
  });

  // ── MCP endpoints ────────────────────────────────────────────────────────────
  app.post("/mcp", handleStreamable);
  app.get("/mcp", handleStreamable);
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && streamableSessions.has(sessionId)) {
      streamableSessions.delete(sessionId);
      log(`StreamableHTTP session deleted: ${sessionId}`);
    }
    res.status(200).send();
  });

  app.post("/sse", handleStreamable);

  app.get("/sse", async (req, res) => {
    const apiKey = extractApiKey(req);
    if (!apiKey) {
      res.status(401).json({ error: "Missing API key" });
      return;
    }
    try {
      const ctx = await validateApiKey(apiKey);
      log(`SSE legacy auth OK: userId=${ctx.userId}`);
    } catch (err) {
      res.status(401).json({ error: `Invalid API key: ${err instanceof Error ? err.message : String(err)}` });
      return;
    }
    const server = createMcpServer(apiKey);
    const transport = new SSEServerTransport("/message", res);
    sseSessions.set(transport.sessionId, transport);
    transport.onclose = () => sseSessions.delete(transport.sessionId);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    const sessionId = req.query["sessionId"] as string;
    const transport = sseSessions.get(sessionId);
    if (!transport) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  app.use((req, res) => {
    log(`404 — ${req.method} ${req.path}`);
    res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
  });

  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    log(`Error on ${req.method} ${req.path}: ${err instanceof Error ? err.message : String(err)}`);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  });

  app.listen(parseInt(PORT, 10), "0.0.0.0", () => {
    log(`HTTP server listening on 0.0.0.0:${PORT}`);
    log(`OAuth authorize: ${RESOURCE_URL}/authorize`);
  });

  process.on("unhandledRejection", (reason) => {
    log(`Unhandled rejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
  });

// ─────────────────────────────────────────────────────────────────────────────
//  stdio mode
// ─────────────────────────────────────────────────────────────────────────────

} else {
  const API_KEY = process.env.DELIGHTLOOP_API_KEY;
  if (!API_KEY) {
    console.error("[mcp-delightloop] ERROR: DELIGHTLOOP_API_KEY is not set.");
    process.exit(1);
  }
  try {
    const ctx = await validateApiKey(API_KEY);
    console.error(`[mcp-delightloop] Authenticated — userId: ${ctx.userId} | orgId: ${ctx.orgId}`);
  } catch (err) {
    console.error(`[mcp-delightloop] Auth failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
  const server = createMcpServer(API_KEY);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp-delightloop] Server running on stdio");
}

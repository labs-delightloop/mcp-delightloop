# mcp-delightloop

> **Model Context Protocol (MCP) server for [Delightloop](https://delightloop.ai)**
> Manage contacts, campaigns, and webhooks from any AI assistant that supports MCP.

[![npm version](https://img.shields.io/npm/v/mcp-delightloop)](https://www.npmjs.com/package/mcp-delightloop)
[![license](https://img.shields.io/npm/l/mcp-delightloop)](https://www.npmjs.com/package/mcp-delightloop)

**Live server:** `https://mcp.delightloop.ai`

---

## What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open standard that lets AI assistants (Claude, Cursor, Windsurf, Continue, Cline, Zed, and more) securely connect to external tools and APIs. Once configured, your AI assistant can interact with Delightloop directly — no copy-pasting, no switching tabs.

---

## Prerequisites

- **Node.js 18+**
- A **Delightloop API key** → get it from [Settings → API Keys](https://web.delightloop.ai/settings/api-keys)

---

## Quick setup (all clients)

### Option A — Remote server (no install needed)

Connect directly to the hosted server. Just replace `YOUR_API_KEY_HERE`:

```json
{
  "mcpServers": {
    "delightloop": {
      "url": "https://mcp.delightloop.ai/sse?apiKey=YOUR_API_KEY_HERE"
    }
  }
}
```

### Option B — Local via npx

Runs the server locally on your machine:

```json
{
  "mcpServers": {
    "delightloop": {
      "command": "npx",
      "args": ["-y", "mcp-delightloop"],
      "env": {
        "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Paste your key, drop it in the right file for your tool, and restart.

---

## Setup by AI client

### Claude Desktop

| OS | Config file path |
|----|-----------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "delightloop": {
      "command": "npx",
      "args": ["-y", "mcp-delightloop"],
      "env": {
        "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see a 🔌 icon in the toolbar confirming MCP is active.

---

### Cursor

- **Global** (all projects): `~/.cursor/mcp.json`
- **Per-project**: `.cursor/mcp.json` in the project root

```json
{
  "mcpServers": {
    "delightloop": {
      "command": "npx",
      "args": ["-y", "mcp-delightloop"],
      "env": {
        "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Or via Cursor UI: **Settings → Cursor Settings → MCP → Add new global MCP server**

---

### Windsurf (by Codeium)

**Config file:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "delightloop": {
      "command": "npx",
      "args": ["-y", "mcp-delightloop"],
      "env": {
        "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Or via Windsurf UI: **Windsurf Settings → Cascade → MCP Servers → Add Server**

---

### Continue.dev (VS Code / JetBrains)

**Config file:** `~/.continue/config.json`

Add inside the `"mcpServers"` array:

```json
{
  "mcpServers": [
    {
      "name": "delightloop",
      "command": "npx",
      "args": ["-y", "mcp-delightloop"],
      "env": {
        "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  ]
}
```

---

### Cline (VS Code extension)

1. Open VS Code → Cline sidebar → **MCP Servers** tab → **Edit MCP Settings**
2. Add to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "delightloop": {
      "command": "npx",
      "args": ["-y", "mcp-delightloop"],
      "env": {
        "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

---

### Zed Editor

**Config file:** `~/.config/zed/settings.json`

Add inside the `"context_servers"` block:

```json
{
  "context_servers": {
    "delightloop": {
      "command": {
        "path": "npx",
        "args": ["-y", "mcp-delightloop"],
        "env": {
          "DELIGHTLOOP_API_KEY": "YOUR_API_KEY_HERE"
        }
      }
    }
  }
}
```

---

### Claude Code (CLI)

```bash
claude mcp add delightloop \
  -e DELIGHTLOOP_API_KEY=YOUR_API_KEY_HERE \
  -- npx -y mcp-delightloop
```

Or add to `~/.claude/settings.json` under `"mcpServers"` using the same JSON format as Claude Desktop above.

---

## What you can ask your AI after setup

Once configured, just talk to your AI naturally:

```
"List all my live campaigns"
"Create a contact — john@acme.com, John Smith, Acme Corp, VP of Sales"
"Add contact_abc123 to campaign camp_xyz789"
"Show me all contacts named Sarah"
"Set up a webhook on https://myapp.com/hooks for campaign.status_changed and recipient.email_sent"
"Bulk import these 50 contacts from this CSV..."
"What campaigns are currently paused?"
```

---

## Available tools (22 total)

### Contacts
| Tool | Description |
|------|-------------|
| `contact_create` | Create a new contact |
| `contact_bulk_create` | Create multiple contacts at once |
| `contact_get` | Retrieve a contact by ID |
| `contact_list` | List contacts — search by name/email/company, pagination, `returnAll` |
| `contact_update` | Update email, name, company, job title, phone, LinkedIn |

### Campaigns
| Tool | Description |
|------|-------------|
| `campaign_get` | Retrieve a campaign by ID |
| `campaign_list` | List campaigns — filter by status (`draft`, `live`, `paused`, `completed`), search, `returnAll` |
| `campaign_add_contacts` | Add contacts to a live campaign |
| `campaign_launch_recipients` | Launch specific recipients (status `ready`) — activates landing/claim page URLs and sends invitation email |
| `campaign_launch_all` | Launch **all** ready recipients in a campaign in one shot |

### Recipients
| Tool | Description |
|------|-------------|
| `recipient_get` | Get a recipient by ID — includes status, gift info, shipment, `landingPageUrl`, `claimPageUrl` |
| `recipient_tag` | Apply tags (name + hex color) to one or more recipients for segmentation |

### Enrichment
| Tool | Description |
|------|-------------|
| `linkedin_profile_get` | Fetch a LinkedIn profile by URL — returns name, headline, company, location, and profile photo |
| `work_email_get` | Find a contact's work email using their LinkedIn URL or name + company name |

### Gifts
| Tool | Description |
|------|-------------|
| `gift_list` | Browse the Delightloop gift catalog — filter by name, price, collection, or type |
| `gift_get` | Retrieve a single gift by ID |

### Email
| Tool | Description |
|------|-------------|
| `email_send` | Send a single personalized email — recipient, subject, HTML + plain-text body |
| `email_bulk_send` | Send multiple personalized emails in one call (each with its own content) |

### Webhooks
| Tool | Description |
|------|-------------|
| `webhook_create` | Subscribe a URL to one or more Delightloop events |
| `webhook_get` | Retrieve a webhook subscription by ID |
| `webhook_list` | List all webhook subscriptions |
| `webhook_delete` | Delete a webhook subscription |

**Webhook events available:**
- `campaign.created` · `campaign.updated` · `campaign.status_changed`
- `campaign.deleted` · `campaign.recipients_added`
- `recipient.created` · `recipient.status_changed`
- `recipient.email_sent` · `recipient.feedback_submitted`

---

## Authentication

The server reads `DELIGHTLOOP_API_KEY` from the environment and validates it against the Delightloop API on startup. If the key is missing, invalid, or expired the server exits immediately with a clear error message — no silent failures.

Get your API key from **[Settings → API Keys](https://web.delightloop.ai/settings/api-keys)** in the Delightloop dashboard.

---

## License

MIT © [Delightloop](https://delightloop.ai)

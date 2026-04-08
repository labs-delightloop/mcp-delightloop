#!/usr/bin/env node
/**
 * Delightloop MCP Server
 *
 * Authentication: set DELIGHTLOOP_API_KEY env variable before starting.
 *
 * Tools exposed:
 *  Contacts:  contact_create, contact_bulk_create, contact_get, contact_list, contact_update
 *  Campaigns: campaign_get, campaign_list, campaign_add_contacts
 *  Webhooks:  webhook_create, webhook_get, webhook_list, webhook_delete
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { validateApiKey } from "./client.js";

import {
  ContactCreateSchema,
  ContactBulkCreateSchema,
  ContactGetSchema,
  ContactListSchema,
  ContactUpdateSchema,
  contactCreate,
  contactBulkCreate,
  contactGet,
  contactList,
  contactUpdate,
} from "./tools/contacts.js";

import {
  CampaignGetSchema,
  CampaignListSchema,
  CampaignAddContactsSchema,
  campaignGet,
  campaignList,
  campaignAddContacts,
} from "./tools/campaigns.js";

import {
  WebhookCreateSchema,
  WebhookGetSchema,
  WebhookListSchema,
  WebhookDeleteSchema,
  webhookCreate,
  webhookGet,
  webhookList,
  webhookDelete,
} from "./tools/webhooks.js";

// ─── Auth ────────────────────────────────────────────────────────────────────

const API_KEY = process.env.DELIGHTLOOP_API_KEY;
if (!API_KEY) {
  console.error(
    "[mcp-delightloop] ERROR: DELIGHTLOOP_API_KEY environment variable is not set.\n" +
      "Set it before starting the server:\n" +
      "  DELIGHTLOOP_API_KEY=your_key node dist/index.js",
  );
  process.exit(1);
}

// Validate the key against Delightloop user service before starting
let authContext: { userId: string; orgId: string };
try {
  authContext = await validateApiKey(API_KEY);
  console.error(
    `[mcp-delightloop] Authenticated — userId: ${authContext.userId} | orgId: ${authContext.orgId}`,
  );
} catch (err) {
  console.error(
    `[mcp-delightloop] Auth failed: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
}

// ─── Server ──────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "mcp-delightloop",
  version: "0.1.0",
});

// ─── Helper to wrap tool handlers with consistent error formatting ────────────

function wrap<T>(fn: () => Promise<T>) {
  return fn()
    .then((result) => ({
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    }))
    .catch((err: unknown) => ({
      content: [
        {
          type: "text" as const,
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    }));
}

// ─── Contact tools ────────────────────────────────────────────────────────────

// Remove apiKey from schemas since we inject it from env
const ContactCreateInput = ContactCreateSchema.omit({ apiKey: true });
const ContactBulkCreateInput = ContactBulkCreateSchema.omit({ apiKey: true });
const ContactGetInput = ContactGetSchema.omit({ apiKey: true });
const ContactListInput = ContactListSchema.omit({ apiKey: true });
const ContactUpdateInput = ContactUpdateSchema.omit({ apiKey: true });

server.tool(
  "contact_create",
  "Create a new contact in Delightloop",
  ContactCreateInput.shape,
  (input) =>
    wrap(() => contactCreate({ ...input, apiKey: API_KEY! })),
);

server.tool(
  "contact_bulk_create",
  "Create multiple contacts at once in Delightloop",
  ContactBulkCreateInput.shape,
  (input) =>
    wrap(() => contactBulkCreate({ ...input, apiKey: API_KEY! })),
);

server.tool(
  "contact_get",
  "Retrieve a single contact by ID from Delightloop",
  ContactGetInput.shape,
  (input) =>
    wrap(() => contactGet({ ...input, apiKey: API_KEY! })),
);

server.tool(
  "contact_list",
  "List contacts in Delightloop with optional search and pagination",
  ContactListInput.shape,
  (input) =>
    wrap(() => contactList({ ...input, apiKey: API_KEY! })),
);

server.tool(
  "contact_update",
  "Update an existing contact in Delightloop",
  ContactUpdateInput.shape,
  (input) =>
    wrap(() => contactUpdate({ ...input, apiKey: API_KEY! })),
);

// ─── Campaign tools ───────────────────────────────────────────────────────────

server.tool(
  "campaign_get",
  "Retrieve a single campaign by ID from Delightloop",
  CampaignGetSchema.shape,
  (input) =>
    wrap(() => campaignGet(input, API_KEY!)),
);

server.tool(
  "campaign_list",
  "List campaigns in Delightloop. Filter by status (draft, live, paused, preparing, completed) or search by name.",
  CampaignListSchema.shape,
  (input) =>
    wrap(() => campaignList(input, API_KEY!)),
);

server.tool(
  "campaign_add_contacts",
  "Add one or more contacts to a live Delightloop campaign",
  CampaignAddContactsSchema.shape,
  (input) =>
    wrap(() => campaignAddContacts(input, API_KEY!)),
);

// ─── Webhook tools ────────────────────────────────────────────────────────────

server.tool(
  "webhook_create",
  "Create a webhook subscription in Delightloop. Events: campaign.created, campaign.updated, campaign.status_changed, campaign.deleted, campaign.recipients_added, recipient.created, recipient.status_changed, recipient.email_sent, recipient.feedback_submitted",
  WebhookCreateSchema.shape,
  (input) =>
    wrap(() => webhookCreate(input, API_KEY!)),
);

server.tool(
  "webhook_get",
  "Retrieve details of a single webhook subscription by ID",
  WebhookGetSchema.shape,
  (input) =>
    wrap(() => webhookGet(input, API_KEY!)),
);

server.tool(
  "webhook_list",
  "List all webhook subscriptions registered in Delightloop",
  WebhookListSchema.shape,
  (input) =>
    wrap(() => webhookList(input, API_KEY!)),
);

server.tool(
  "webhook_delete",
  "Delete (unsubscribe) a webhook subscription from Delightloop",
  WebhookDeleteSchema.shape,
  (input) =>
    wrap(() => webhookDelete(input, API_KEY!)),
);

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[mcp-delightloop] Server running on stdio");

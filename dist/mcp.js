import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ContactCreateSchema, ContactBulkCreateSchema, ContactGetSchema, ContactListSchema, ContactUpdateSchema, contactCreate, contactBulkCreate, contactGet, contactList, contactUpdate, } from "./tools/contacts.js";
import { CampaignGetSchema, CampaignListSchema, CampaignAddContactsSchema, campaignGet, campaignList, campaignAddContacts, } from "./tools/campaigns.js";
import { WebhookCreateSchema, WebhookGetSchema, WebhookListSchema, WebhookDeleteSchema, webhookCreate, webhookGet, webhookList, webhookDelete, } from "./tools/webhooks.js";
// ─── Helper ──────────────────────────────────────────────────────────────────
function wrap(fn) {
    return fn()
        .then((result) => ({
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }))
        .catch((err) => ({
        content: [
            {
                type: "text",
                text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
        ],
        isError: true,
    }));
}
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Creates a fully-configured McpServer bound to a specific API key.
 * Called once per stdio session, or once per HTTP connection.
 */
export function createMcpServer(apiKey) {
    const server = new McpServer({
        name: "mcp-delightloop",
        version: "0.1.2",
    });
    // ── Contacts ───────────────────────────────────────────────────────────────
    server.tool("contact_create", "Create a new contact in Delightloop", ContactCreateSchema.shape, (input) => wrap(() => contactCreate(input, apiKey)));
    server.tool("contact_bulk_create", "Create multiple contacts at once in Delightloop", ContactBulkCreateSchema.shape, (input) => wrap(() => contactBulkCreate(input, apiKey)));
    server.tool("contact_get", "Retrieve a single contact by ID from Delightloop", ContactGetSchema.shape, (input) => wrap(() => contactGet(input, apiKey)));
    server.tool("contact_list", "List contacts in Delightloop with optional search and pagination", ContactListSchema.shape, (input) => wrap(() => contactList(input, apiKey)));
    server.tool("contact_update", "Update an existing contact in Delightloop", ContactUpdateSchema.shape, (input) => wrap(() => contactUpdate(input, apiKey)));
    // ── Campaigns ──────────────────────────────────────────────────────────────
    server.tool("campaign_get", "Retrieve a single campaign by ID from Delightloop", CampaignGetSchema.shape, (input) => wrap(() => campaignGet(input, apiKey)));
    server.tool("campaign_list", "List campaigns in Delightloop. Filter by status (draft, live, paused, preparing, completed) or search by name.", CampaignListSchema.shape, (input) => wrap(() => campaignList(input, apiKey)));
    server.tool("campaign_add_contacts", "Add one or more contacts to a live Delightloop campaign", CampaignAddContactsSchema.shape, (input) => wrap(() => campaignAddContacts(input, apiKey)));
    // ── Webhooks ───────────────────────────────────────────────────────────────
    server.tool("webhook_create", "Create a webhook subscription in Delightloop. Events: campaign.created, campaign.updated, campaign.status_changed, campaign.deleted, campaign.recipients_added, recipient.created, recipient.status_changed, recipient.email_sent, recipient.feedback_submitted", WebhookCreateSchema.shape, (input) => wrap(() => webhookCreate(input, apiKey)));
    server.tool("webhook_get", "Retrieve details of a single webhook subscription by ID", WebhookGetSchema.shape, (input) => wrap(() => webhookGet(input, apiKey)));
    server.tool("webhook_list", "List all webhook subscriptions registered in Delightloop", WebhookListSchema.shape, (input) => wrap(() => webhookList(input, apiKey)));
    server.tool("webhook_delete", "Delete (unsubscribe) a webhook subscription from Delightloop", WebhookDeleteSchema.shape, (input) => wrap(() => webhookDelete(input, apiKey)));
    return server;
}
//# sourceMappingURL=mcp.js.map
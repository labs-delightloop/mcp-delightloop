import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ContactCreateSchema, ContactBulkCreateSchema, ContactGetSchema, ContactListSchema, ContactUpdateSchema, contactCreate, contactBulkCreate, contactGet, contactList, contactUpdate, } from "./tools/contacts.js";
import { CampaignGetSchema, CampaignListSchema, CampaignAddContactsSchema, campaignGet, campaignList, campaignAddContacts, } from "./tools/campaigns.js";
import { RecipientGetSchema, CampaignLaunchRecipientsSchema, CampaignLaunchAllSchema, RecipientTagSchema, recipientGet, campaignLaunchRecipients, campaignLaunchAll, recipientTag, } from "./tools/recipients.js";
import { LinkedInProfileSchema, WorkEmailSchema, linkedInProfileGet, workEmailGet, } from "./tools/enrichment.js";
import { GiftListSchema, GiftGetSchema, giftList, giftGet, } from "./tools/gifts.js";
import { EmailSendSchema, EmailBulkSendSchema, emailSend, emailBulkSend, } from "./tools/email.js";
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
        version: "0.1.7",
    });
    // ── Contacts ───────────────────────────────────────────────────────────────
    server.tool("contact_create", "Create a new contact in Delightloop", ContactCreateSchema.shape, (input) => wrap(() => contactCreate(input, apiKey)));
    server.tool("contact_bulk_create", "Create multiple contacts at once in Delightloop", ContactBulkCreateSchema.shape, (input) => wrap(() => contactBulkCreate(input, apiKey)));
    server.tool("contact_get", "Retrieve a single contact by ID from Delightloop", ContactGetSchema.shape, (input) => wrap(() => contactGet(input, apiKey)));
    server.tool("contact_list", "List contacts in Delightloop with optional search and pagination", ContactListSchema.shape, (input) => wrap(() => contactList(input, apiKey)));
    server.tool("contact_update", "Update an existing contact in Delightloop", ContactUpdateSchema.shape, (input) => wrap(() => contactUpdate(input, apiKey)));
    // ── Recipients ────────────────────────────────────────────────────────────
    server.tool("recipient_get", "Get a recipient by ID, including their status, contact details, selected gift, shipment info, and — importantly — the landingPageUrl and claimPageUrl they were sent.", RecipientGetSchema.shape, (input) => wrap(() => recipientGet(input, apiKey)));
    server.tool("campaign_launch_recipients", "Launch specific recipients in a campaign. Use when a recipient's status is 'ready' — this activates their landing page and claim page URLs, creates dynamic video content, and sends the invitation email. After launch, status changes to 'invite_sent' (if email configured) or 'invited'.", CampaignLaunchRecipientsSchema.shape, (input) => wrap(() => campaignLaunchRecipients(input, apiKey)));
    server.tool("campaign_launch_all", "Launch ALL recipients in 'ready' status for a campaign in one shot. This makes the entire campaign go live — activates landing/claim pages, creates video content, and sends invitation emails to everyone. To launch only specific recipients, use campaign_launch_recipients instead.", CampaignLaunchAllSchema.shape, (input) => wrap(() => campaignLaunchAll(input, apiKey)));
    server.tool("recipient_tag", "Apply one or more tags (with a name and hex color) to specific recipients in a campaign. Useful for segmenting, filtering, or labelling recipients (e.g. 'VIP', 'Follow-up', 'Hot Lead').", RecipientTagSchema.shape, (input) => wrap(() => recipientTag(input, apiKey)));
    // ── Enrichment ────────────────────────────────────────────────────────────
    server.tool("linkedin_profile_get", "Fetch a LinkedIn profile by URL. Returns name, headline, current job title, company, location, and profile image. No data is stored — purely a real-time lookup.", LinkedInProfileSchema.shape, (input) => wrap(() => linkedInProfileGet(input, apiKey)));
    server.tool("work_email_get", "Find a contact's work email address using their LinkedIn URL, or their first name + last name + company name. Also returns job title, seniority, company data, and all discovered emails.", WorkEmailSchema.shape, (input) => wrap(() => workEmailGet(input, apiKey)));
    // ── Gifts ─────────────────────────────────────────────────────────────────
    server.tool("gift_list", "Browse the Delightloop gift catalog. Filter by name, price range, collection, or type (delightloop catalog, org collection, inventory). Returns paginated results with gift details and pricing.", GiftListSchema.shape, (input) => wrap(() => giftList(input, apiKey)));
    server.tool("gift_get", "Retrieve a single gift by ID, including its name, description, price, images, inventory status, and collection info.", GiftGetSchema.shape, (input) => wrap(() => giftGet(input, apiKey)));
    // ── Email ─────────────────────────────────────────────────────────────────
    server.tool("email_send", "Send a single personalized email via Delightloop. Provide recipient, subject, HTML body, and plain-text body. The sender address is auto-generated from your organization name if not specified.", EmailSendSchema.shape, (input) => wrap(() => emailSend(input, apiKey)));
    server.tool("email_bulk_send", "Send multiple personalized emails in one call. Each email in the array can have its own recipient, subject, and content. Ideal for outreach campaigns or bulk notifications.", EmailBulkSendSchema.shape, (input) => wrap(() => emailBulkSend(input, apiKey)));
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
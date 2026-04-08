import { z } from "zod";
import { dlRequest } from "../client.js";
// ─── Event catalogue (mirrors n8n trigger) ───────────────────────────────────
export const WEBHOOK_EVENTS = [
    "campaign.created",
    "campaign.updated",
    "campaign.status_changed",
    "campaign.deleted",
    "campaign.recipients_added",
    "recipient.created",
    "recipient.status_changed",
    "recipient.email_sent",
    "recipient.feedback_submitted",
];
function parseEventType(eventType) {
    const [module, ...rest] = eventType.split(".");
    return { module, action: rest.join("_") };
}
// ─── Schemas ────────────────────────────────────────────────────────────────
export const WebhookCreateSchema = z.object({
    name: z
        .string()
        .default("MCP Delightloop Subscription")
        .describe("A label for this subscription visible in the Delightloop dashboard"),
    url: z
        .string()
        .url()
        .describe("The HTTPS endpoint that Delightloop will POST events to"),
    events: z
        .array(z.enum(WEBHOOK_EVENTS))
        .min(1)
        .describe("One or more event types to subscribe to. Available: " +
        WEBHOOK_EVENTS.join(", ")),
});
export const WebhookGetSchema = z.object({
    subscriptionId: z.string().describe("The ID of the webhook subscription"),
});
export const WebhookListSchema = z.object({
    limit: z.number().min(1).max(100).optional().default(50),
    page: z.number().min(1).optional().default(1),
});
export const WebhookDeleteSchema = z.object({
    subscriptionId: z
        .string()
        .describe("The ID of the webhook subscription to delete"),
});
// ─── Tool handlers ────────────────────────────────────────────────────────────
export async function webhookCreate(input, apiKey) {
    const eventPatterns = input.events.map(parseEventType);
    return dlRequest({
        method: "POST",
        path: "/api/campaigns/webhooks/subscriptions",
        apiKey,
        body: {
            name: input.name,
            url: input.url,
            eventPatterns,
        },
    });
}
export async function webhookGet(input, apiKey) {
    return dlRequest({
        method: "GET",
        path: `/api/campaigns/webhooks/subscriptions/${input.subscriptionId}`,
        apiKey,
    });
}
export async function webhookList(input, apiKey) {
    return dlRequest({
        method: "GET",
        path: "/api/campaigns/webhooks/subscriptions",
        apiKey,
        query: { limit: input.limit, page: input.page },
    });
}
export async function webhookDelete(input, apiKey) {
    return dlRequest({
        method: "DELETE",
        path: `/api/campaigns/webhooks/subscriptions/${input.subscriptionId}`,
        apiKey,
    });
}
//# sourceMappingURL=webhooks.js.map
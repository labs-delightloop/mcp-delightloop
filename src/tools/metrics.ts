import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const CampaignMetricsGetSchema = z.object({
  campaignId: z.string().describe("The ID of the campaign to get metrics for"),
});

export const RecipientTimelineGetSchema = z.object({
  recipientId: z
    .string()
    .describe("The ID of the recipient whose timeline to fetch"),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

/** Aggregate campaign metrics for StatusCards (totals, delivered, feedback, etc.) */
export async function campaignMetricsGet(
  input: z.infer<typeof CampaignMetricsGetSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "GET",
    path: `/api/campaigns/campaigns/${input.campaignId}/metrics`,
    apiKey,
  });
}

/** Chronological activity timeline for a recipient (emails, opens, gift events, feedback) */
export async function recipientTimelineGet(
  input: z.infer<typeof RecipientTimelineGetSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "GET",
    path: `/api/campaigns/recipient-timeline/recipient/${input.recipientId}`,
    apiKey,
  });
}

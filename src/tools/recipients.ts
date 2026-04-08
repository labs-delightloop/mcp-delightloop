import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const RecipientGetSchema = z.object({
  recipientId: z
    .string()
    .describe(
      "The ID of the recipient (e.g. recipient_xxxxxxxx). " +
      "IMPORTANT: If the recipient status is 'ready', the landing page and claim page URLs exist " +
      "but are NOT yet live — you must call campaign_launch_recipients first to activate them " +
      "and send the invitation email. Only after launching will the URLs be accessible to the recipient.",
    ),
});

export const CampaignLaunchRecipientsSchema = z.object({
  campaignId: z
    .string()
    .describe("The ID of the campaign that owns the recipient(s)"),
  recipientIds: z
    .array(z.string())
    .min(1)
    .describe(
      "One or more recipient IDs to launch. " +
      "Use this when a recipient is in 'ready' status — launching activates their landing page " +
      "and claim page URLs, creates dynamic video content, and sends the invitation email. " +
      "After a successful launch the recipient status changes to 'invite_sent' (email configured) " +
      "or 'invited' (no email).",
    ),
  batchSize: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Number of recipients to process per batch (default 50, max 100)"),
});

export const CampaignLaunchAllSchema = z.object({
  campaignId: z
    .string()
    .describe(
      "The ID of the campaign to launch. Launches ALL recipients that are in 'ready' status. " +
      "This makes the campaign go live, creates landing/claim pages, and sends invitation emails. " +
      "To launch only specific recipients, use campaign_launch_recipients instead.",
    ),
  batchSize: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Number of recipients to process per batch (default 50, max 100)"),
});

export const RecipientTagSchema = z.object({
  campaignId: z
    .string()
    .describe("The ID of the campaign that owns the recipients"),
  recipientIds: z
    .array(z.string())
    .min(1)
    .describe("One or more recipient IDs to tag"),
  tags: z
    .array(
      z.object({
        name: z.string().min(1).max(50).describe("Tag label (max 50 characters)"),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .describe("Tag color as a hex code (e.g. #FF5733)"),
      }),
    )
    .min(1)
    .describe("One or more tags to apply to the recipients"),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

/** Get a single recipient by ID — surfaces landingPageUrl and claimPageUrl at top level */
export async function recipientGet(
  input: z.infer<typeof RecipientGetSchema>,
  apiKey: string,
) {
  const data = await dlRequest<Record<string, unknown>>({
    method: "GET",
    path: `/api/campaigns/recipients/detail/${input.recipientId}`,
    apiKey,
  });

  const urls = (data.urls as Record<string, string>) ?? {};
  const status = data.status as string;

  return {
    recipientId: data.recipientId,
    status,

    // ── Status guidance ───────────────────────────────────────────────────────
    _note:
      status === "ready"
        ? "⚠️  This recipient is in 'ready' status. Call campaign_launch_recipients with this recipientId and its campaignId to activate the URLs and send the invitation email."
        : undefined,

    contactDetails: data.contactDetails,
    selectedGift: data.selectedGift,
    shipmentInfo: data.shipmentInfo,
    personalization: data.personalization,
    campaignId: data.campaignId,
    campaignData: data.campaignData,
    organizationDisplayName: data.organizationDisplayName,
    createdBy: data.createdBy,

    // ── Key URLs (only active after launch) ───────────────────────────────────
    landingPageUrl: urls.landingPage ?? null,
    claimPageUrl: urls.claimPage ?? null,
    urls,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** Launch specific recipients in a campaign (targeted — use when status is 'ready') */
export async function campaignLaunchRecipients(
  input: z.infer<typeof CampaignLaunchRecipientsSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "POST",
    path: `/api/campaigns/campaigns/${input.campaignId}/launch`,
    apiKey,
    body: {
      recipientIds: input.recipientIds,
      batchSize: input.batchSize,
    },
  });
}

/** Tag one or more recipients in a campaign */
export async function recipientTag(
  input: z.infer<typeof RecipientTagSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "PATCH",
    path: `/api/campaigns/campaigns/${input.campaignId}/recipients/tags`,
    apiKey,
    body: {
      recipientIds: input.recipientIds,
      tags: input.tags,
    },
  });
}

/** Launch ALL ready recipients in a campaign (full campaign launch) */
export async function campaignLaunchAll(
  input: z.infer<typeof CampaignLaunchAllSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "POST",
    path: `/api/campaigns/campaigns/${input.campaignId}/launch`,
    apiKey,
    body: {
      batchSize: input.batchSize,
    },
  });
}

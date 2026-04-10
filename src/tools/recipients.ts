import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const RecipientListSchema = z.object({
  campaignId: z.string().describe("The ID of the campaign to list recipients for"),
  returnAll: z.boolean().optional().default(false).describe("If true, fetch all pages automatically"),
  limit: z.number().min(1).max(100).optional().default(50).describe("Max recipients per page (ignored when returnAll=true)"),
  page: z.number().min(1).optional().default(1).describe("Page number"),
  status: z
    .enum([
      "draft",
      "ready",
      "invited",
      "invite_sent",
      "address_confirmed",
      "processing",
      "shipped",
      "in_transit",
      "delivered",
      "acknowledged",
      "cancelled",
    ])
    .optional()
    .describe("Filter by recipient status"),
});

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

function simplifyRecipient(r: Record<string, unknown>) {
  const contact = (r.contactDetails as Record<string, unknown>) ?? {};
  const urls = (r.urls as Record<string, string>) ?? {};
  return {
    recipientId: r.recipientId,
    status: r.status,
    contactId: r.sourceId,
    name: contact.fullName ?? `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim(),
    email: contact.email,
    landingPageUrl: urls.landingPage ?? null,
    claimPageUrl: urls.claimPage ?? null,
    tags: r.tags,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/** List recipients for a campaign with optional pagination and status filter */
export async function recipientList(
  input: z.infer<typeof RecipientListSchema>,
  apiKey: string,
) {
  const buildQuery = (page: number, limit: number) => {
    const q: Record<string, string | number | boolean | undefined> = { page, limit };
    if (input.status) q.status = input.status;
    return q;
  };

  if (input.returnAll) {
    const all: Record<string, unknown>[] = [];
    let page = 1;
    while (true) {
      const res = await dlRequest<Record<string, unknown>>({
        method: "GET",
        path: `/api/campaigns/campaigns/${input.campaignId}/recipients`,
        apiKey,
        query: buildQuery(page, 100),
      });
      const items = (res.recipients as Record<string, unknown>[]) ?? [];
      all.push(...items);
      const pagination = (res.pagination as Record<string, unknown>) ?? {};
      const totalPages = (pagination.totalPages as number) ?? 1;
      if (page >= totalPages || items.length === 0) break;
      page++;
    }
    return {
      recipients: all.map(simplifyRecipient),
      total: all.length,
      campaignId: input.campaignId,
    };
  }

  const res = await dlRequest<Record<string, unknown>>({
    method: "GET",
    path: `/api/campaigns/campaigns/${input.campaignId}/recipients`,
    apiKey,
    query: buildQuery(input.page ?? 1, input.limit ?? 50),
  });

  const recipients = (res.recipients as Record<string, unknown>[]) ?? [];
  const pagination = (res.pagination as Record<string, unknown>) ?? {};
  return {
    recipients: recipients.map(simplifyRecipient),
    total: pagination.total,
    page: pagination.currentPage,
    totalPages: pagination.totalPages,
    statusCounts: res.statusCounts,
    campaignId: input.campaignId,
  };
}

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

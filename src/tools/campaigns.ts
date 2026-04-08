import { z } from "zod";
import { dlRequest, fetchAllPages } from "../client.js";

// ─── Schemas ────────────────────────────────────────────────────────────────

export const CampaignGetSchema = z.object({
  campaignId: z.string().describe("The ID of the campaign to retrieve"),
});

export const CampaignListSchema = z.object({
  returnAll: z
    .boolean()
    .optional()
    .default(false)
    .describe("If true, fetch all pages automatically"),
  limit: z
    .number()
    .min(1)
    .max(500)
    .optional()
    .default(50)
    .describe("Max number of campaigns to return (ignored when returnAll=true)"),
  page: z.number().min(1).optional().default(1).describe("Page number"),
  status: z
    .enum(["", "draft", "live", "paused", "preparing", "completed"])
    .optional()
    .describe("Filter campaigns by status"),
  search: z.string().optional().describe("Search campaigns by name"),
});

export const CampaignAddContactsSchema = z.object({
  campaignId: z.string().describe("The ID of the live campaign"),
  contactIds: z
    .array(z.string())
    .min(1)
    .describe("Array of contact IDs to add to the campaign"),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function simplifyCampaign(c: Record<string, unknown>) {
  const data = (c.campaignData as Record<string, unknown>) ?? {};
  const goal = (data.goal as Record<string, unknown>) ?? {};
  const motion = (data.motion as Record<string, unknown>) ?? {};
  return {
    campaignId: c.campaignId,
    name: c.name,
    status: c.status,
    goal: goal.name,
    motion: motion.name,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// ─── Tool handlers ────────────────────────────────────────────────────────────

export async function campaignGet(
  input: z.infer<typeof CampaignGetSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "GET",
    path: `/api/campaigns/campaigns/${input.campaignId}`,
    apiKey,
  });
}

export async function campaignList(
  input: z.infer<typeof CampaignListSchema>,
  apiKey: string,
) {
  if (input.returnAll) {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (input.status) query.status = input.status;
    if (input.search) query.search = input.search;

    const items = await fetchAllPages<Record<string, unknown>>(
      apiKey,
      "/api/campaigns/campaigns",
      "campaigns",
      query,
    );
    return { campaigns: items.map(simplifyCampaign), total: items.length };
  }

  const query: Record<string, string | number | boolean | undefined> = {
    limit: input.limit,
    page: input.page,
  };
  if (input.status) query.status = input.status;
  if (input.search) query.search = input.search;

  const res = await dlRequest<Record<string, unknown>>({
    method: "GET",
    path: "/api/campaigns/campaigns",
    apiKey,
    query,
  });

  const campaigns = (res.campaigns as Record<string, unknown>[]) ?? [];
  return {
    campaigns: campaigns.map(simplifyCampaign),
    total: res.total,
    page: res.page,
    totalPages: res.totalPages,
  };
}

export async function campaignAddContacts(
  input: z.infer<typeof CampaignAddContactsSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "POST",
    path: `/api/campaigns/campaigns/${input.campaignId}/add-contacts`,
    apiKey,
    body: { contactIds: input.contactIds },
  });
}

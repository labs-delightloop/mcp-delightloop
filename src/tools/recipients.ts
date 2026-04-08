import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schema ──────────────────────────────────────────────────────────────────

export const RecipientGetSchema = z.object({
  recipientId: z.string().describe("The ID of the recipient (e.g. recipient_xxxxxxxx)"),
});

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function recipientGet(
  input: z.infer<typeof RecipientGetSchema>,
  apiKey: string,
) {
  const data = await dlRequest<Record<string, unknown>>({
    method: "GET",
    path: `/api/campaigns/recipients/${input.recipientId}`,
    apiKey,
  });

  // Surface the landing page and claim page URLs prominently at the top
  const urls = (data.urls as Record<string, string>) ?? {};

  return {
    recipientId: data.recipientId,
    status: data.status,
    contactDetails: data.contactDetails,
    selectedGift: data.selectedGift,
    shipmentInfo: data.shipmentInfo,
    personalization: data.personalization,
    campaignId: data.campaignId,
    campaignData: data.campaignData,
    organizationDisplayName: data.organizationDisplayName,
    createdBy: data.createdBy,

    // ── Key URLs ──────────────────────────────────────────────────────────────
    landingPageUrl: urls.landingPage ?? null,
    claimPageUrl: urls.claimPage ?? null,
    urls,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

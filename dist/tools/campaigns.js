import { z } from "zod";
import { dlRequest } from "../client.js";
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
        .max(100)
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
function simplifyCampaign(c) {
    const data = c.campaignData ?? {};
    const goal = data.goal ?? {};
    const motion = data.motion ?? {};
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
export async function campaignGet(input, apiKey) {
    return dlRequest({
        method: "GET",
        path: `/api/campaigns/campaigns/${input.campaignId}`,
        apiKey,
    });
}
export async function campaignList(input, apiKey) {
    const buildQuery = (page, limit) => {
        const q = { page, limit };
        if (input.status)
            q.status = input.status;
        if (input.search)
            q.search = input.search;
        return q;
    };
    if (input.returnAll) {
        const all = [];
        let page = 1;
        while (true) {
            const res = await dlRequest({
                method: "GET",
                path: "/api/campaigns/campaigns",
                apiKey,
                query: buildQuery(page, 100),
            });
            const items = res.campaigns ?? [];
            all.push(...items);
            const pagination = res.pagination ?? {};
            const totalPages = pagination.totalPages ?? 1;
            if (page >= totalPages || items.length === 0)
                break;
            page++;
        }
        return { campaigns: all.map(simplifyCampaign), total: all.length };
    }
    const res = await dlRequest({
        method: "GET",
        path: "/api/campaigns/campaigns",
        apiKey,
        query: buildQuery(input.page ?? 1, input.limit ?? 50),
    });
    const campaigns = res.campaigns ?? [];
    const pagination = res.pagination ?? {};
    return {
        campaigns: campaigns.map(simplifyCampaign),
        total: pagination.total,
        page: pagination.currentPage,
        totalPages: pagination.totalPages,
    };
}
export async function campaignAddContacts(input, apiKey) {
    return dlRequest({
        method: "POST",
        path: `/api/campaigns/campaigns/${input.campaignId}/add-contacts`,
        apiKey,
        body: { contactIds: input.contactIds },
    });
}
//# sourceMappingURL=campaigns.js.map
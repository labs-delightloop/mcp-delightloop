import { z } from "zod";
export declare const CampaignMetricsGetSchema: z.ZodObject<{
    campaignId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    campaignId: string;
}, {
    campaignId: string;
}>;
export declare const RecipientTimelineGetSchema: z.ZodObject<{
    recipientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    recipientId: string;
}, {
    recipientId: string;
}>;
/** Aggregate campaign metrics for StatusCards (totals, delivered, feedback, etc.) */
export declare function campaignMetricsGet(input: z.infer<typeof CampaignMetricsGetSchema>, apiKey: string): Promise<unknown>;
/** Chronological activity timeline for a recipient (emails, opens, gift events, feedback) */
export declare function recipientTimelineGet(input: z.infer<typeof RecipientTimelineGetSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=metrics.d.ts.map
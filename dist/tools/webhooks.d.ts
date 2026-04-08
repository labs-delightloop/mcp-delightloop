import { z } from "zod";
export declare const WEBHOOK_EVENTS: readonly ["campaign.created", "campaign.updated", "campaign.status_changed", "campaign.deleted", "campaign.recipients_added", "recipient.created", "recipient.status_changed", "recipient.email_sent", "recipient.feedback_submitted"];
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
export declare const WebhookCreateSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    url: z.ZodString;
    events: z.ZodArray<z.ZodEnum<["campaign.created", "campaign.updated", "campaign.status_changed", "campaign.deleted", "campaign.recipients_added", "recipient.created", "recipient.status_changed", "recipient.email_sent", "recipient.feedback_submitted"]>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
    events: ("campaign.created" | "campaign.updated" | "campaign.status_changed" | "campaign.deleted" | "campaign.recipients_added" | "recipient.created" | "recipient.status_changed" | "recipient.email_sent" | "recipient.feedback_submitted")[];
}, {
    url: string;
    events: ("campaign.created" | "campaign.updated" | "campaign.status_changed" | "campaign.deleted" | "campaign.recipients_added" | "recipient.created" | "recipient.status_changed" | "recipient.email_sent" | "recipient.feedback_submitted")[];
    name?: string | undefined;
}>;
export declare const WebhookGetSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subscriptionId: string;
}, {
    subscriptionId: string;
}>;
export declare const WebhookListSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const WebhookDeleteSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subscriptionId: string;
}, {
    subscriptionId: string;
}>;
export declare function webhookCreate(input: z.infer<typeof WebhookCreateSchema>, apiKey: string): Promise<unknown>;
export declare function webhookGet(input: z.infer<typeof WebhookGetSchema>, apiKey: string): Promise<unknown>;
export declare function webhookList(input: z.infer<typeof WebhookListSchema>, apiKey: string): Promise<unknown>;
export declare function webhookDelete(input: z.infer<typeof WebhookDeleteSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=webhooks.d.ts.map
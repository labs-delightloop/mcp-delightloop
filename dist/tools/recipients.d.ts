import { z } from "zod";
export declare const RecipientListSchema: z.ZodObject<{
    campaignId: z.ZodString;
    returnAll: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["ready", "invited", "invite_sent", "claimed", "fulfilled", "expired", "cancelled"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    returnAll: boolean;
    campaignId: string;
    status?: "ready" | "invited" | "invite_sent" | "claimed" | "fulfilled" | "expired" | "cancelled" | undefined;
}, {
    campaignId: string;
    page?: number | undefined;
    limit?: number | undefined;
    status?: "ready" | "invited" | "invite_sent" | "claimed" | "fulfilled" | "expired" | "cancelled" | undefined;
    returnAll?: boolean | undefined;
}>;
export declare const RecipientGetSchema: z.ZodObject<{
    recipientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    recipientId: string;
}, {
    recipientId: string;
}>;
export declare const CampaignLaunchRecipientsSchema: z.ZodObject<{
    campaignId: z.ZodString;
    recipientIds: z.ZodArray<z.ZodString, "many">;
    batchSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    campaignId: string;
    recipientIds: string[];
    batchSize: number;
}, {
    campaignId: string;
    recipientIds: string[];
    batchSize?: number | undefined;
}>;
export declare const CampaignLaunchAllSchema: z.ZodObject<{
    campaignId: z.ZodString;
    batchSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    campaignId: string;
    batchSize: number;
}, {
    campaignId: string;
    batchSize?: number | undefined;
}>;
export declare const RecipientTagSchema: z.ZodObject<{
    campaignId: z.ZodString;
    recipientIds: z.ZodArray<z.ZodString, "many">;
    tags: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    tags: {
        name: string;
        color: string;
    }[];
    campaignId: string;
    recipientIds: string[];
}, {
    tags: {
        name: string;
        color: string;
    }[];
    campaignId: string;
    recipientIds: string[];
}>;
/** List recipients for a campaign with optional pagination and status filter */
export declare function recipientList(input: z.infer<typeof RecipientListSchema>, apiKey: string): Promise<{
    recipients: {
        recipientId: unknown;
        status: unknown;
        contactId: unknown;
        name: {};
        email: unknown;
        landingPageUrl: string;
        claimPageUrl: string;
        tags: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[];
    total: number;
    campaignId: string;
    page?: undefined;
    totalPages?: undefined;
    statusCounts?: undefined;
} | {
    recipients: {
        recipientId: unknown;
        status: unknown;
        contactId: unknown;
        name: {};
        email: unknown;
        landingPageUrl: string;
        claimPageUrl: string;
        tags: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[];
    total: unknown;
    page: unknown;
    totalPages: unknown;
    statusCounts: unknown;
    campaignId: string;
}>;
/** Get a single recipient by ID — surfaces landingPageUrl and claimPageUrl at top level */
export declare function recipientGet(input: z.infer<typeof RecipientGetSchema>, apiKey: string): Promise<{
    recipientId: unknown;
    status: string;
    _note: string | undefined;
    contactDetails: unknown;
    selectedGift: unknown;
    shipmentInfo: unknown;
    personalization: unknown;
    campaignId: unknown;
    campaignData: unknown;
    organizationDisplayName: unknown;
    createdBy: unknown;
    landingPageUrl: string;
    claimPageUrl: string;
    urls: Record<string, string>;
    createdAt: unknown;
    updatedAt: unknown;
}>;
/** Launch specific recipients in a campaign (targeted — use when status is 'ready') */
export declare function campaignLaunchRecipients(input: z.infer<typeof CampaignLaunchRecipientsSchema>, apiKey: string): Promise<unknown>;
/** Tag one or more recipients in a campaign */
export declare function recipientTag(input: z.infer<typeof RecipientTagSchema>, apiKey: string): Promise<unknown>;
/** Launch ALL ready recipients in a campaign (full campaign launch) */
export declare function campaignLaunchAll(input: z.infer<typeof CampaignLaunchAllSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=recipients.d.ts.map
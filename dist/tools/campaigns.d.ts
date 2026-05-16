import { z } from "zod";
export declare const CampaignGetSchema: z.ZodObject<{
    campaignId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    campaignId: string;
}, {
    campaignId: string;
}>;
export declare const CampaignListSchema: z.ZodObject<{
    returnAll: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["", "draft", "live", "paused", "preparing", "completed"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    returnAll: boolean;
    status?: "" | "draft" | "live" | "paused" | "preparing" | "completed" | undefined;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    status?: "" | "draft" | "live" | "paused" | "preparing" | "completed" | undefined;
    returnAll?: boolean | undefined;
    search?: string | undefined;
}>;
export declare const CampaignAddContactsSchema: z.ZodObject<{
    campaignId: z.ZodString;
    contactIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    campaignId: string;
    contactIds: string[];
}, {
    campaignId: string;
    contactIds: string[];
}>;
export declare function campaignGet(input: z.infer<typeof CampaignGetSchema>, apiKey: string): Promise<unknown>;
export declare function campaignList(input: z.infer<typeof CampaignListSchema>, apiKey: string): Promise<{
    campaigns: {
        campaignId: unknown;
        name: unknown;
        status: unknown;
        goal: unknown;
        motion: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[];
    total: number;
    page?: undefined;
    totalPages?: undefined;
} | {
    campaigns: {
        campaignId: unknown;
        name: unknown;
        status: unknown;
        goal: unknown;
        motion: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[];
    total: unknown;
    page: unknown;
    totalPages: unknown;
}>;
export declare function campaignAddContacts(input: z.infer<typeof CampaignAddContactsSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=campaigns.d.ts.map
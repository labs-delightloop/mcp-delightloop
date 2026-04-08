import { z } from "zod";
export declare const GiftListSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    collectionId: z.ZodOptional<z.ZodString>;
    filterType: z.ZodOptional<z.ZodEnum<["delightloop", "orgcollection", "inventory"]>>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    collectionId?: string | undefined;
    filterType?: "delightloop" | "orgcollection" | "inventory" | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    collectionId?: string | undefined;
    filterType?: "delightloop" | "orgcollection" | "inventory" | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}>;
export declare const GiftGetSchema: z.ZodObject<{
    giftId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    giftId: string;
}, {
    giftId: string;
}>;
/** List gifts from the Delightloop catalog with optional filters */
export declare function giftList(input: z.infer<typeof GiftListSchema>, apiKey: string): Promise<unknown>;
/** Get a single gift by ID */
export declare function giftGet(input: z.infer<typeof GiftGetSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=gifts.d.ts.map
import { z } from "zod";
export declare const EventListSchema: z.ZodObject<{
    returnAll: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    returnAll: boolean;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    returnAll?: boolean | undefined;
}>;
export declare const EventGetSchema: z.ZodObject<{
    eventId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
}, {
    eventId: string;
}>;
export declare const EventCreateSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    locationType: z.ZodOptional<z.ZodEnum<["physical", "online", "hybrid"]>>;
    venueName: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    onlineUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    banner: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: string;
    startDate: string;
    description?: string | undefined;
    status?: string | undefined;
    address?: string | undefined;
    endDate?: string | undefined;
    locationType?: "physical" | "online" | "hybrid" | undefined;
    venueName?: string | undefined;
    onlineUrl?: string | undefined;
    banner?: string | undefined;
}, {
    name: string;
    type: string;
    startDate: string;
    description?: string | undefined;
    status?: string | undefined;
    address?: string | undefined;
    endDate?: string | undefined;
    locationType?: "physical" | "online" | "hybrid" | undefined;
    venueName?: string | undefined;
    onlineUrl?: string | undefined;
    banner?: string | undefined;
}>;
export declare function eventList(input: z.infer<typeof EventListSchema>, apiKey: string): Promise<{
    events: {
        eventId: string;
        name: unknown;
        type: unknown;
        status: unknown;
        startDate: string;
        endDate: string;
        locationType: string;
        venueName: string;
        address: string;
        onlineUrl: string;
        description: unknown;
        banner: unknown;
    }[];
    total: number;
    page?: undefined;
    totalPages?: undefined;
} | {
    events: {
        eventId: string;
        name: unknown;
        type: unknown;
        status: unknown;
        startDate: string;
        endDate: string;
        locationType: string;
        venueName: string;
        address: string;
        onlineUrl: string;
        description: unknown;
        banner: unknown;
    }[];
    total: unknown;
    page: unknown;
    totalPages: unknown;
}>;
export declare function eventGet(input: z.infer<typeof EventGetSchema>, apiKey: string): Promise<{
    eventId: string;
    name: unknown;
    type: unknown;
    status: unknown;
    startDate: string;
    endDate: string;
    locationType: string;
    venueName: string;
    address: string;
    onlineUrl: string;
    description: unknown;
    banner: unknown;
}>;
export declare function eventCreate(input: z.infer<typeof EventCreateSchema>, apiKey: string): Promise<{
    eventId: string;
    name: unknown;
    type: unknown;
    status: unknown;
    startDate: string;
    endDate: string;
    locationType: string;
    venueName: string;
    address: string;
    onlineUrl: string;
    description: unknown;
    banner: unknown;
}>;
//# sourceMappingURL=events.d.ts.map
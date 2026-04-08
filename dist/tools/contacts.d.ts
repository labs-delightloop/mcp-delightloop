import { z } from "zod";
export declare const ContactCreateSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    linkedinUrl: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color?: string | undefined;
    }, {
        name: string;
        color?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    companyName?: string | undefined;
    jobTitle?: string | undefined;
    phone?: string | undefined;
    linkedinUrl?: string | undefined;
    tags?: {
        name: string;
        color?: string | undefined;
    }[] | undefined;
}, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    companyName?: string | undefined;
    jobTitle?: string | undefined;
    phone?: string | undefined;
    linkedinUrl?: string | undefined;
    tags?: {
        name: string;
        color?: string | undefined;
    }[] | undefined;
}>;
export declare const ContactBulkCreateSchema: z.ZodObject<{
    contacts: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        companyName: z.ZodOptional<z.ZodString>;
        jobTitle: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        linkedinUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        companyName?: string | undefined;
        jobTitle?: string | undefined;
        phone?: string | undefined;
        linkedinUrl?: string | undefined;
    }, {
        email: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        companyName?: string | undefined;
        jobTitle?: string | undefined;
        phone?: string | undefined;
        linkedinUrl?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    contacts: {
        email: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        companyName?: string | undefined;
        jobTitle?: string | undefined;
        phone?: string | undefined;
        linkedinUrl?: string | undefined;
    }[];
}, {
    contacts: {
        email: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        companyName?: string | undefined;
        jobTitle?: string | undefined;
        phone?: string | undefined;
        linkedinUrl?: string | undefined;
    }[];
}>;
export declare const ContactGetSchema: z.ZodObject<{
    contactId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contactId: string;
}, {
    contactId: string;
}>;
export declare const ContactListSchema: z.ZodObject<{
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
    returnAll?: boolean | undefined;
    search?: string | undefined;
}>;
export declare const ContactUpdateSchema: z.ZodObject<{
    contactId: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    linkedinUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contactId: string;
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    companyName?: string | undefined;
    jobTitle?: string | undefined;
    phone?: string | undefined;
    linkedinUrl?: string | undefined;
}, {
    contactId: string;
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    companyName?: string | undefined;
    jobTitle?: string | undefined;
    phone?: string | undefined;
    linkedinUrl?: string | undefined;
}>;
export declare function contactCreate(input: z.infer<typeof ContactCreateSchema>, apiKey: string): Promise<unknown>;
export declare function contactBulkCreate(input: z.infer<typeof ContactBulkCreateSchema>, apiKey: string): Promise<unknown>;
export declare function contactGet(input: z.infer<typeof ContactGetSchema>, apiKey: string): Promise<unknown>;
export declare function contactList(input: z.infer<typeof ContactListSchema>, apiKey: string): Promise<{
    items: {
        contactId: unknown;
        firstName: unknown;
        lastName: unknown;
        fullName: unknown;
        email: unknown;
        jobTitle: unknown;
        companyName: unknown;
        linkedinUrl: unknown;
        profileImage: unknown;
        tags: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[];
    total: number;
    page?: undefined;
    totalPages?: undefined;
} | {
    items: {
        contactId: unknown;
        firstName: unknown;
        lastName: unknown;
        fullName: unknown;
        email: unknown;
        jobTitle: unknown;
        companyName: unknown;
        linkedinUrl: unknown;
        profileImage: unknown;
        tags: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[];
    total: unknown;
    page: unknown;
    totalPages: unknown;
}>;
export declare function contactUpdate(input: z.infer<typeof ContactUpdateSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=contacts.d.ts.map
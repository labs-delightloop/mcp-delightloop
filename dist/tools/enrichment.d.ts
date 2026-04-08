import { z } from "zod";
export declare const LinkedInProfileSchema: z.ZodObject<{
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>;
export declare const WorkEmailSchema: z.ZodObject<{
    linkedin_url: z.ZodOptional<z.ZodString>;
    firstname: z.ZodOptional<z.ZodString>;
    lastname: z.ZodOptional<z.ZodString>;
    company_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    linkedin_url?: string | undefined;
    firstname?: string | undefined;
    lastname?: string | undefined;
    company_name?: string | undefined;
}, {
    linkedin_url?: string | undefined;
    firstname?: string | undefined;
    lastname?: string | undefined;
    company_name?: string | undefined;
}>;
/** Fetch a LinkedIn profile by URL — returns name, headline, company, location, profile image, etc. */
export declare function linkedInProfileGet(input: z.infer<typeof LinkedInProfileSchema>, apiKey: string): Promise<unknown>;
/** Enrich a contact to get their work email address, using LinkedIn URL or name + company */
export declare function workEmailGet(input: z.infer<typeof WorkEmailSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=enrichment.d.ts.map
import { z } from "zod";
export declare const EmailSendSchema: z.ZodObject<{
    to: z.ZodString;
    subject: z.ZodString;
    htmlContent: z.ZodString;
    textContent: z.ZodString;
    from: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    to: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    from?: string | undefined;
}, {
    to: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    from?: string | undefined;
}>;
export declare const EmailBulkSendSchema: z.ZodObject<{
    emails: z.ZodArray<z.ZodObject<{
        to: z.ZodString;
        subject: z.ZodString;
        htmlContent: z.ZodString;
        textContent: z.ZodString;
        from: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        to: string;
        subject: string;
        htmlContent: string;
        textContent: string;
        from?: string | undefined;
    }, {
        to: string;
        subject: string;
        htmlContent: string;
        textContent: string;
        from?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    emails: {
        to: string;
        subject: string;
        htmlContent: string;
        textContent: string;
        from?: string | undefined;
    }[];
}, {
    emails: {
        to: string;
        subject: string;
        htmlContent: string;
        textContent: string;
        from?: string | undefined;
    }[];
}>;
/** Send a single personalized email */
export declare function emailSend(input: z.infer<typeof EmailSendSchema>, apiKey: string): Promise<unknown>;
/** Send bulk personalized emails (one API call, multiple recipients) */
export declare function emailBulkSend(input: z.infer<typeof EmailBulkSendSchema>, apiKey: string): Promise<unknown>;
//# sourceMappingURL=email.d.ts.map
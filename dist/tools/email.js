import { z } from "zod";
import { dlRequest } from "../client.js";
// ─── Schemas ─────────────────────────────────────────────────────────────────
const EmailItemSchema = z.object({
    to: z
        .string()
        .email()
        .describe("Recipient email address"),
    subject: z
        .string()
        .describe("Email subject line"),
    htmlContent: z
        .string()
        .describe("HTML body of the email (can include tags like <h1>, <p>, <a>, etc.)"),
    textContent: z
        .string()
        .describe("Plain-text fallback body of the email"),
    from: z
        .string()
        .email()
        .optional()
        .describe("Sender email address. If omitted, auto-generated from your organization name " +
        "(e.g. acme-corp@mail.delightloop.ai)."),
});
export const EmailSendSchema = z.object({
    to: z
        .string()
        .email()
        .describe("Recipient email address"),
    subject: z
        .string()
        .describe("Email subject line"),
    htmlContent: z
        .string()
        .describe("HTML body of the email"),
    textContent: z
        .string()
        .describe("Plain-text fallback body of the email"),
    from: z
        .string()
        .email()
        .optional()
        .describe("Sender email address. If omitted, auto-generated from your organization name."),
});
export const EmailBulkSendSchema = z.object({
    emails: z
        .array(EmailItemSchema)
        .min(1)
        .describe("List of personalized emails to send. Each email can have its own recipient, " +
        "subject, HTML content, and plain-text content."),
});
// ─── Handlers ────────────────────────────────────────────────────────────────
/** Send a single personalized email */
export async function emailSend(input, apiKey) {
    return dlRequest({
        method: "POST",
        path: `/api/campaigns/external/email/send-single`,
        apiKey,
        body: {
            to: input.to,
            subject: input.subject,
            htmlContent: input.htmlContent,
            textContent: input.textContent,
            ...(input.from && { from: input.from }),
        },
    });
}
/** Send bulk personalized emails (one API call, multiple recipients) */
export async function emailBulkSend(input, apiKey) {
    return dlRequest({
        method: "POST",
        path: `/api/campaigns/external/email/send-bulk`,
        apiKey,
        body: {
            emails: input.emails,
        },
    });
}
//# sourceMappingURL=email.js.map
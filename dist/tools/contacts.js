import { z } from "zod";
import { dlRequest, fetchAllPages } from "../client.js";
// ─── Schemas ────────────────────────────────────────────────────────────────
export const ContactCreateSchema = z.object({
    apiKey: z.string().describe("Delightloop API key"),
    email: z.string().email().describe("Primary email address of the contact"),
    firstName: z.string().optional().describe("First name"),
    lastName: z.string().optional().describe("Last name"),
    companyName: z.string().optional().describe("Company name"),
    jobTitle: z.string().optional().describe("Job title"),
    phone: z.string().optional().describe("Phone number (e.g. +1 555 000 0000)"),
    linkedinUrl: z
        .string()
        .optional()
        .describe("LinkedIn profile URL (e.g. https://linkedin.com/in/johnsmith)"),
    tags: z
        .array(z.object({
        name: z.string(),
        color: z.string().optional(),
    }))
        .optional()
        .describe('Tag objects with name and optional color hex, e.g. [{"name":"vip","color":"#FF5733"}]'),
});
export const ContactBulkCreateSchema = z.object({
    apiKey: z.string().describe("Delightloop API key"),
    contacts: z
        .array(z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        companyName: z.string().optional(),
        jobTitle: z.string().optional(),
        phone: z.string().optional(),
        linkedinUrl: z.string().optional(),
    }))
        .min(1)
        .describe("Array of contacts to create. Each must have at least an email."),
});
export const ContactGetSchema = z.object({
    apiKey: z.string().describe("Delightloop API key"),
    contactId: z.string().describe("The ID of the contact to retrieve"),
});
export const ContactListSchema = z.object({
    apiKey: z.string().describe("Delightloop API key"),
    returnAll: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, fetch all pages automatically"),
    limit: z
        .number()
        .min(1)
        .max(500)
        .optional()
        .default(50)
        .describe("Max number of contacts to return (ignored when returnAll=true)"),
    page: z.number().min(1).optional().default(1).describe("Page number"),
    search: z
        .string()
        .optional()
        .describe("Search by name, email, company, or job title"),
});
export const ContactUpdateSchema = z.object({
    apiKey: z.string().describe("Delightloop API key"),
    contactId: z.string().describe("The ID of the contact to update"),
    email: z.string().email().optional().describe("New email address"),
    firstName: z.string().optional().describe("New first name"),
    lastName: z.string().optional().describe("New last name"),
    companyName: z.string().optional().describe("New company name"),
    jobTitle: z.string().optional().describe("New job title"),
    phone: z.string().optional().describe("New phone number"),
    linkedinUrl: z.string().optional().describe("New LinkedIn URL"),
});
// ─── Helpers ─────────────────────────────────────────────────────────────────
function simplifyContact(c) {
    return {
        contactId: c.contactId,
        firstName: c.firstName,
        lastName: c.lastName,
        fullName: c.fullName,
        email: c.mailId,
        jobTitle: c.jobTitle,
        companyName: c.companyName,
        linkedinUrl: c.linkedinUrl,
        profileImage: c.profileImage,
        tags: c.tags,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}
// ─── Tool handlers ────────────────────────────────────────────────────────────
export async function contactCreate(input) {
    const body = {
        mailId: input.email,
        firstName: input.firstName ?? "",
        lastName: input.lastName ?? "",
    };
    if (input.companyName)
        body.companyName = input.companyName;
    if (input.jobTitle)
        body.jobTitle = input.jobTitle;
    if (input.phone)
        body.phoneNumber = input.phone;
    if (input.linkedinUrl)
        body.linkedinUrl = input.linkedinUrl;
    if (input.tags)
        body.tags = input.tags;
    return dlRequest({
        method: "POST",
        path: "/api/campaigns/contacts",
        apiKey: input.apiKey,
        body,
    });
}
export async function contactBulkCreate(input) {
    const normalised = input.contacts.map((c) => ({
        ...c,
        mailId: c.email,
        email: undefined,
    }));
    return dlRequest({
        method: "POST",
        path: "/api/campaigns/contacts/bulk",
        apiKey: input.apiKey,
        body: { contacts: normalised },
    });
}
export async function contactGet(input) {
    return dlRequest({
        method: "GET",
        path: `/api/campaigns/contacts/${input.contactId}`,
        apiKey: input.apiKey,
    });
}
export async function contactList(input) {
    if (input.returnAll) {
        const items = await fetchAllPages(input.apiKey, "/api/campaigns/contacts", "items", { search: input.search });
        return { items: items.map(simplifyContact), total: items.length };
    }
    const query = {
        limit: input.limit,
        page: input.page,
    };
    if (input.search)
        query.search = input.search;
    const res = await dlRequest({
        method: "GET",
        path: "/api/campaigns/contacts",
        apiKey: input.apiKey,
        query,
    });
    const items = res.items ?? [];
    return {
        items: items.map(simplifyContact),
        total: res.total,
        page: res.page,
        totalPages: res.totalPages,
    };
}
export async function contactUpdate(input) {
    const body = {};
    if (input.email)
        body.mailId = input.email;
    if (input.firstName)
        body.firstName = input.firstName;
    if (input.lastName)
        body.lastName = input.lastName;
    if (input.companyName)
        body.companyName = input.companyName;
    if (input.jobTitle)
        body.jobTitle = input.jobTitle;
    if (input.phone)
        body.phoneNumber = input.phone;
    if (input.linkedinUrl)
        body.linkedinUrl = input.linkedinUrl;
    if (Object.keys(body).length === 0) {
        throw new Error("Provide at least one field to update");
    }
    return dlRequest({
        method: "PUT",
        path: `/api/campaigns/contacts/${input.contactId}`,
        apiKey: input.apiKey,
        body,
    });
}
//# sourceMappingURL=contacts.js.map
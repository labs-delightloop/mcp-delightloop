import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const LinkedInProfileSchema = z.object({
  url: z
    .string()
    .describe(
      "The full LinkedIn profile URL (e.g. https://www.linkedin.com/in/username/). " +
      "Returns profile details including name, headline, job title, company, location, " +
      "profile image, and contact information scraped from LinkedIn.",
    ),
});

export const WorkEmailSchema = z.object({
  linkedin_url: z
    .string()
    .optional()
    .describe(
      "LinkedIn profile URL (e.g. https://www.linkedin.com/in/username/). " +
      "Provide this OR the name + company fields below.",
    ),
  firstname: z
    .string()
    .optional()
    .describe("First name of the contact (required if linkedin_url not provided)"),
  lastname: z
    .string()
    .optional()
    .describe("Last name of the contact (required if linkedin_url not provided)"),
  company_name: z
    .string()
    .optional()
    .describe("Company name (required if linkedin_url not provided)"),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

/** Fetch a LinkedIn profile by URL — returns name, headline, company, location, profile image, etc. */
export async function linkedInProfileGet(
  input: z.infer<typeof LinkedInProfileSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "GET",
    path: `/api/campaigns/contacts/enrichment/linkedin`,
    apiKey,
    query: { url: input.url },
  });
}

/** Enrich a contact to get their work email address, using LinkedIn URL or name + company */
export async function workEmailGet(
  input: z.infer<typeof WorkEmailSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "POST",
    path: `/api/campaigns/enrichment/work-email`,
    apiKey,
    body: {
      ...(input.linkedin_url && { linkedin_url: input.linkedin_url }),
      ...(input.firstname && { firstname: input.firstname }),
      ...(input.lastname && { lastname: input.lastname }),
      ...(input.company_name && { company_name: input.company_name }),
    },
  });
}

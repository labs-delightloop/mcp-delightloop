import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const GiftListSchema = z.object({
  page: z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe("Page number (default: 1)"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(12)
    .describe("Number of gifts per page (default: 12, max: 100)"),
  search: z
    .string()
    .optional()
    .describe("Search gifts by name"),
  collectionId: z
    .string()
    .optional()
    .describe("Filter gifts by collection ID"),
  filterType: z
    .enum(["delightloop", "orgcollection", "inventory"])
    .optional()
    .describe(
      "Filter by gift type: " +
      "'delightloop' — curated Delightloop catalog, " +
      "'orgcollection' — gifts added by your organization, " +
      "'inventory' — physical inventory gifts",
    ),
  minPrice: z
    .number()
    .optional()
    .describe("Minimum gift price filter"),
  maxPrice: z
    .number()
    .optional()
    .describe("Maximum gift price filter"),
});

export const GiftGetSchema = z.object({
  giftId: z
    .string()
    .describe("The ID of the gift to retrieve"),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

/** List gifts from the Delightloop catalog with optional filters */
export async function giftList(
  input: z.infer<typeof GiftListSchema>,
  apiKey: string,
) {
  const query: Record<string, string | number> = {
    page: input.page ?? 1,
    limit: input.limit ?? 12,
  };
  if (input.search) query.search = input.search;
  if (input.collectionId) query.collectionId = input.collectionId;
  if (input.filterType) query.filterType = input.filterType;
  if (input.minPrice !== undefined) query.minPrice = input.minPrice;
  if (input.maxPrice !== undefined) query.maxPrice = input.maxPrice;

  return dlRequest({
    method: "GET",
    path: `/api/campaigns/gifts`,
    apiKey,
    query,
  });
}

/** Get a single gift by ID */
export async function giftGet(
  input: z.infer<typeof GiftGetSchema>,
  apiKey: string,
) {
  return dlRequest({
    method: "GET",
    path: `/api/campaigns/gifts/${input.giftId}`,
    apiKey,
  });
}

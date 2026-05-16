import { z } from "zod";
import { dlRequest } from "../client.js";

// ─── Schemas ────────────────────────────────────────────────────────────────

export const EventListSchema = z.object({
  returnAll: z
    .boolean()
    .optional()
    .default(false)
    .describe("If true, fetch all pages automatically"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Max events per page (ignored when returnAll=true)"),
  page: z.number().min(1).optional().default(1).describe("Page number"),
  search: z.string().optional().describe("Search events by name"),
});

export const EventGetSchema = z.object({
  eventId: z.string().describe("The ID of the event to retrieve"),
});

export const EventCreateSchema = z.object({
  name: z.string().min(1).describe("Event name (required)"),
  type: z
    .string()
    .describe(
      "Event type: 'conference', 'webinar', 'workshop', 'meetup', 'roadshow', or any string the org uses",
    ),
  startDate: z
    .string()
    .describe(
      "ISO date/datetime when the event starts (e.g. 2026-06-15 or 2026-06-15T09:00:00Z)",
    ),
  endDate: z.string().optional().describe("ISO date/datetime when the event ends"),
  locationType: z
    .enum(["physical", "online", "hybrid"])
    .optional()
    .describe("Location type"),
  venueName: z.string().optional().describe("Venue or event venue name"),
  address: z.string().optional().describe("Full address"),
  onlineUrl: z
    .string()
    .url()
    .optional()
    .describe("Meeting/join URL for online or hybrid events"),
  description: z.string().optional().describe("Event description"),
  banner: z.string().url().optional().describe("Banner image URL"),
  status: z
    .string()
    .optional()
    .describe("Initial status (e.g. 'draft', 'published')"),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function simplifyEvent(e: Record<string, unknown>) {
  const dates = (e.eventDates as Record<string, string>) ?? {};
  const loc = (e.location as Record<string, string>) ?? {};
  return {
    eventId: (e.id ?? e._id) as string,
    name: e.name,
    type: e.type,
    status: e.status,
    startDate: dates.start,
    endDate: dates.end,
    locationType: loc.type,
    venueName: loc.venueName,
    address: loc.address,
    onlineUrl: loc.onlineUrl,
    description: e.description,
    banner: e.banner,
  };
}

// ─── Tool handlers ────────────────────────────────────────────────────────────

export async function eventList(
  input: z.infer<typeof EventListSchema>,
  apiKey: string,
) {
  const buildQuery = (page: number, limit: number) => {
    const q: Record<string, string | number | undefined> = { page, limit };
    if (input.search) q.search = input.search;
    return q;
  };

  if (input.returnAll) {
    const all: Record<string, unknown>[] = [];
    let page = 1;
    while (true) {
      const res = await dlRequest<Record<string, unknown>>({
        method: "GET",
        path: "/api/campaigns/events",
        apiKey,
        query: buildQuery(page, 100),
      });
      const items = (res.events as Record<string, unknown>[]) ?? [];
      all.push(...items);
      const pag = (res.pagination as Record<string, unknown>) ?? {};
      const totalPages = (pag.totalPages as number) ?? 1;
      if (page >= totalPages || items.length === 0) break;
      page++;
    }
    return { events: all.map(simplifyEvent), total: all.length };
  }

  const res = await dlRequest<Record<string, unknown>>({
    method: "GET",
    path: "/api/campaigns/events",
    apiKey,
    query: buildQuery(input.page ?? 1, input.limit ?? 50),
  });
  const events = (res.events as Record<string, unknown>[]) ?? [];
  const pag = (res.pagination as Record<string, unknown>) ?? {};
  return {
    events: events.map(simplifyEvent),
    total: pag.total,
    page: pag.currentPage,
    totalPages: pag.totalPages,
  };
}

export async function eventGet(
  input: z.infer<typeof EventGetSchema>,
  apiKey: string,
) {
  const res = await dlRequest<Record<string, unknown>>({
    method: "GET",
    path: `/api/campaigns/events/${input.eventId}`,
    apiKey,
  });
  const event = (res.event as Record<string, unknown>) ?? res;
  return simplifyEvent(event);
}

export async function eventCreate(
  input: z.infer<typeof EventCreateSchema>,
  apiKey: string,
) {
  const body: Record<string, unknown> = {
    name: input.name,
    type: input.type,
    eventDates: {
      start: input.startDate,
      ...(input.endDate ? { end: input.endDate } : {}),
    },
  };
  if (input.locationType || input.venueName || input.address || input.onlineUrl) {
    body.location = {
      ...(input.locationType ? { type: input.locationType } : {}),
      ...(input.venueName ? { venueName: input.venueName } : {}),
      ...(input.address ? { address: input.address } : {}),
      ...(input.onlineUrl ? { onlineUrl: input.onlineUrl } : {}),
    };
  }
  if (input.description) body.description = input.description;
  if (input.banner) body.banner = input.banner;
  if (input.status) body.status = input.status;

  const res = await dlRequest<Record<string, unknown>>({
    method: "POST",
    path: "/api/campaigns/events",
    apiKey,
    body,
  });
  const event = (res.event as Record<string, unknown>) ?? res;
  return simplifyEvent(event);
}

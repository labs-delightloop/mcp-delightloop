export const BASE_URL = "https://apiv1.delightloop.ai";

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  apiKey: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function dlRequest<T = unknown>(opts: RequestOptions): Promise<T> {
  const url = new URL(`${BASE_URL}${opts.path}`);

  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== "" && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method,
    headers: {
      "x-api-key": opts.apiKey,
      "Content-Type": "application/json",
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      `Delightloop API error ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`,
    );
  }

  return data as T;
}

/**
 * Validate an API key against the Delightloop user service.
 * Returns { userId, orgId } on success, throws on failure.
 * Called once at MCP server startup to fast-fail on bad keys.
 */
export async function validateApiKey(
  apiKey: string,
): Promise<{ userId: string; orgId: string }> {
  const res = await fetch(`${BASE_URL}/api/users/auth/validate-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  if (res.status === 401) {
    throw new Error("Invalid or expired DELIGHTLOOP_API_KEY");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API key validation failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<{ userId: string; orgId: string }>;
}

/** Fetch all pages and return a flat list of items */
export async function fetchAllPages<T>(
  apiKey: string,
  path: string,
  itemsKey: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  while (true) {
    const res = await dlRequest<Record<string, unknown>>({
      method: "GET",
      path,
      apiKey,
      query: { ...query, page, limit: 100 },
    });

    const items = (res[itemsKey] as T[]) ?? [];
    all.push(...items);

    const totalPages = (res.totalPages as number) ?? 1;
    if (page >= totalPages || items.length === 0) break;
    page++;
  }

  return all;
}

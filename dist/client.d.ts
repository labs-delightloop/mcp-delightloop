export declare const BASE_URL = "https://apiv1.delightloop.ai";
export interface RequestOptions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    apiKey: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
}
export declare function dlRequest<T = unknown>(opts: RequestOptions): Promise<T>;
/**
 * Validate an API key against the Delightloop user service.
 * Returns { userId, orgId } on success, throws on failure.
 * Called once at MCP server startup to fast-fail on bad keys.
 */
export declare function validateApiKey(apiKey: string): Promise<{
    userId: string;
    orgId: string;
}>;
/** Fetch all pages and return a flat list of items */
export declare function fetchAllPages<T>(apiKey: string, path: string, itemsKey: string, query?: Record<string, string | number | boolean | undefined>): Promise<T[]>;
//# sourceMappingURL=client.d.ts.map
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load .env if present, else .env.notion (your current file), else default env
const root = process.cwd();
const envPath = fs.existsSync(path.join(root, ".env"))
  ? path.join(root, ".env")
  : fs.existsSync(path.join(root, ".env.notion"))
  ? path.join(root, ".env.notion")
  : undefined;
if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment from ${path.basename(envPath)}`);
} else {
  dotenv.config();
  console.log(`Loaded environment from default process env`);
}

import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { WritePayload as WritePayloadSchema, QueryPayload as QueryPayloadSchema, CreateDatabasePayload as CreateDatabasePayloadSchema, UpdateDatabasePayload as UpdateDatabasePayloadSchema } from "./schema.js";
import { handleWrite, handleQuery, handleCreateDatabase, handleUpdateDatabase } from "./notion.js";
import { getPresetProperties, listPresets } from "./presets.js";

// Database aliases - map friendly names to database IDs
// Can be configured via environment variable NOTION_DB_ALIASES (JSON format)
const DB_ALIASES: Record<string, string> = (() => {
  const envAliases = process.env.NOTION_DB_ALIASES;
  if (envAliases) {
    try {
      return JSON.parse(envAliases);
    } catch (err) {
      console.warn("Failed to parse NOTION_DB_ALIASES, using defaults");
    }
  }
  return {
    // Main databases
    "marketing_projects_2025_q": "2920cf20-4ff7-80e3-a188-000bb0e7700e",
    "weekly_poc_reports": "c64e730c-5cb2-46f6-b379-792b5591e33e",
    "poc_kpi_tracking": "9bbfe462-bfd2-4628-85ad-d5df3e054154",
    "poc_implementation_tasks": "edc3b1cf-482c-4f5f-849d-48f5a6bffb1a",
    "microinfluencer_tracker_2025_api": "b4cfbb31-d31e-47a4-93eb-cc7f56e76bef",
    "onboarding": "2950cf20-4ff7-80ff-b640-000bc869f518",
    "couchloop_launch_content_tracker": "2950cf20-4ff7-81f1-96c7-000bfdf5a849",
    "social_media_log_in_info": "2770cf20-4ff7-8078-bf91-000be93d803c",
    "master_tasks_db": "23e0cf20-4ff7-8028-8117-000bafba25af",
    "therapist_contact_directory": "28c0cf20-4ff7-8043-9675-000b886945b5",
    "okrs_2025_master": "24c0cf20-4ff7-81c2-80e1-000b3fa98e6f",
    "projects_epics_db": "23e0cf20-4ff7-802b-ac37-000b34ad3d7b",
    "software_engineering_ats": "2730cf20-4ff7-807c-a0aa-000bacf9ccfd",
    "meeting_notes_db": "23e0cf20-4ff7-80a2-864e-000b0d0f3b84",
    "master_content_db": "2820cf20-4ff7-80bd-8669-000bf38f429b",
    "social_accounts": "2820cf20-4ff7-8075-a31c-000bda1911c2",
    "tasks_for_this_project": "92b97b36-2903-4b8b-9d3a-3b166560ed75",
    "docs_for_this_project": "1657708c-5ccf-4292-ae4a-f65019b39905",
    "competitor_matrix": "2800cf20-4ff7-8094-9bd8-000b979fb0b3",
    "content_strategy_upload_uuid": "27f0cf20-4ff7-8094-a8ad-000b2ecdf74d",
    "content_ideas": "23e0cf20-4ff7-8071-9843-000baa12b285",
    "schedule": "2640cf20-4ff7-8032-a30b-000b3970c371",
    "decisions": "24c0cf20-4ff7-8165-94ae-000b620e98da",
    "content_schedule": "2640cf20-4ff7-8022-a14b-000b11e2f9ae",
    "app_testing_tracker": "25e0cf20-4ff7-803f-a279-000b54017bdb",
    "crisis_management_example_log": "25e0cf20-4ff7-80a8-a1b3-000b4214a1b7",
    "feedback_database": "24a0cf20-4ff7-808d-a389-000b5bea7cc8",
    "internal_feedback_form": "24a0cf20-4ff7-80ce-9abe-000b453efe8d",
    
    // Legacy aliases for backward compatibility
    "influencers": "b4cfbb31-d31e-47a4-93eb-cc7f56e76bef", // microinfluencer_tracker_2025_api
    "poc_tasks": "edc3b1cf-482c-4f5f-849d-48f5a6bffb1a", // poc_implementation_tasks
    "default": process.env.NOTION_DB_ID || "2920cf20-4ff7-80e3-a188-000bb0e7700e" // marketing_projects_2025_q
  };
})();

// Resolve database alias to actual ID
function resolveDatabaseAlias(input?: string): string | undefined {
  if (!input) return undefined;
  // If it's already a valid UUID format, return as-is
  if (/^[a-f0-9]{32}$/i.test(input.replace(/-/g, ''))) {
    return input;
  }
  // Otherwise, check if it's an alias
  return DB_ALIASES[input.toLowerCase()] || input;
}

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

// Minimal request debug logging (redacted). Helps trace connector issues.
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const hasAuth = Boolean(req.header("Authorization"));
  const bodyKeys = typeof req.body === "object" && req.body ? Object.keys(req.body).slice(0, 12) : [];
  console.log(`[req] ${req.method} ${req.path} auth=${hasAuth ? "present" : "missing"} bodyKeys=${bodyKeys.join(",")}`);
  res.on("finish", () => {
    console.log(`[res] ${req.method} ${req.path} -> ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Simple shared-secret auth for inbound calls (set CHATGPT_ACTION_SECRET)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Public routes that do not require auth
  const publicPaths = new Set([
    "/",
    "/health",
    "/openapi.yaml",
    "/.well-known/openapi.yaml",
    "/debug/ping",
  ]);
  if (publicPaths.has(req.path)) return next();
  if (req.method === "GET" && req.path === "/favicon.ico") return next();

  const expected = process.env.CHATGPT_ACTION_SECRET;
  if (!expected) return next();
  const auth = req.header("Authorization");
  const provided = auth?.replace(/^Bearer\s+/i, "");
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Health
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Serve OpenAPI for Actions import convenience
app.get(["/openapi.yaml", "/.well-known/openapi.yaml"], (_req: Request, res: Response) => {
  // Prevent CDN/client caching of the OpenAPI document so Actions always sees the latest version
  res.set("Cache-Control", "no-store, max-age=0");
  res.sendFile(path.join(root, "openapi.yaml"));
});

// Debug ping: helps verify connector path, auth presence, and env flags without exposing secrets
app.all("/debug/ping", (req: Request, res: Response) => {
  const bearer = req.header("Authorization");
  const hasBearer = Boolean(bearer && /^Bearer\s+.+/.test(bearer));
  const bodyKeys = typeof req.body === "object" && req.body ? Object.keys(req.body).slice(0, 24) : [];
  res.json({
    ok: true,
    method: req.method,
    path: req.path,
    auth: { bearer: hasBearer },
    body_keys: bodyKeys,
    env: {
      has_notion_token: Boolean(process.env.NOTION_TOKEN),
      has_default_db: Boolean(process.env.NOTION_DB_ID || process.env.NOTION_DB_URL),
      port: Number(process.env.PORT || 8787),
    },
  });
});

// Debug endpoint to inspect ChatGPT payloads (requires auth)
app.all("/debug/chatgpt-payload", (req: Request, res: Response) => {
  // Check auth first
  const expected = process.env.CHATGPT_ACTION_SECRET;
  if (expected) {
    const auth = req.header("Authorization");
    const provided = auth?.replace(/^Bearer\s+/i, "");
    if (!provided || provided !== expected) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  
  res.json({
    ok: true,
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : 'none'
    },
    body: req.body,
    body_keys: Object.keys(req.body || {}),
    has_properties: !!(req.body && req.body.properties),
    properties_count: req.body && req.body.properties ? Object.keys(req.body.properties).length : 0,
    properties_keys: req.body && req.body.properties ? Object.keys(req.body.properties) : []
  });
});

// Root endpoint: simple info page for browsers
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    name: "ChatGPT → Notion Middleware",
    docs: "/openapi.yaml",
    endpoints: {
      write: "/chatgpt/notion-write",
      query: "/chatgpt/notion-query",
      create_db: "/chatgpt/notion-create-database",
      update_db: "/chatgpt/notion-update-database",
      health: "/health",
      ping: "/debug/ping",
    },
    auth: "Use Authorization: Bearer {CHATGPT_ACTION_SECRET} for protected endpoints",
  });
});

// Helper to extract hyphenated Notion ID from URL or raw ID
function extractNotionId(input?: string) {
  if (!input) return undefined;
  const str = String(input).trim();
  const match32 = (str.match(/[0-9a-fA-F]{32}/g) || [])[0];
  const raw = match32 || str.replace(/[^0-9a-fA-F]/g, "");
  if (raw.length !== 32) return undefined;
  const id = raw.toLowerCase();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

// Main write endpoint
app.post("/chatgpt/notion-write", async (req: Request, res: Response) => {
  // Allow NOTION_DB_URL/NOTION_DB_ID env fallback for target=db
  const input = { ...(req.body ?? {}) } as any;
  
  // Resolve database alias to actual ID (e.g., "influencers" -> "2950cf20...")
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }
  
  // Normalize IDs: accept Notion URLs or raw IDs and hyphenate
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
    if (inferred) input.page_id = inferred;
  }
  if (input.target === "db" && !input.database_id) {
    const envDb = process.env.NOTION_DB_ID || process.env.NOTION_DB_URL;
    const inferred = extractNotionId(envDb);
    if (inferred) input.database_id = inferred;
  }

  // Tolerant normalization: if connector can't send `properties`, accept top-level fields
  // and/or JSON inside `content` as the properties object. Applies to db, update, and page.
  try {
    const reserved = new Set(["target", "database_id", "page_id", "title", "content", "request_id"]);
    const needsProps = !input.properties || typeof input.properties !== "object";
    if (needsProps) {
      // 1) Try extracting from JSON-encoded content
      if (typeof input.content === "string") {
        const s = input.content.trim();
        if (s.startsWith("{") && s.endsWith("}")) {
          try {
            const parsed = JSON.parse(s);
            if (parsed && typeof parsed === "object") {
              input.properties = parsed;
              // Remove content to avoid appending JSON blob to the page body
              delete input.content;
            }
          } catch {}
        }
      }

      // 2) Merge top-level schema-like fields into properties for update/page/db
      if (!input.properties || typeof input.properties !== "object") {
        const props: Record<string, any> = {};
        for (const k of Object.keys(input)) {
          if (!reserved.has(k)) {
            props[k] = input[k];
            delete input[k];
          }
        }
        if (Object.keys(props).length) input.properties = props;
      }
    }
  } catch {}

  const parse = WritePayloadSchema.safeParse(input);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  try {
    try {
      const propKeys = Object.keys((parse.data as any).properties || {});
      console.log(`[write] properties_keys=${propKeys.length}`, propKeys.slice(0, 24));
    } catch {}
    const result = await handleWrite(parse.data);
    res.json({ ok: true, ...result, request_id: parse.data.request_id ?? null });
  } catch (err: any) {
    console.error("Notion write failed:", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res
      .status(status)
      .json({ ok: false, error: err?.message || "Internal error", request_id: parse.data.request_id ?? null });
  }
});

// Legacy/alias write paths for compatibility with older clients
app.post(["/notionWrite", "/chatgpt/notionWrite"], async (req: Request, res: Response) => {
  // Reuse the same handler logic
  const input = { ...(req.body ?? {}) } as any;
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
    if (inferred) input.page_id = inferred;
  }
  if (input.target === "db" && !input.database_id) {
    const envDb = process.env.NOTION_DB_ID || process.env.NOTION_DB_URL;
    const inferred = extractNotionId(envDb);
    if (inferred) input.database_id = inferred;
  }
  // Tolerant normalization (aliases): allow properties via JSON in content or top-level fields
  try {
    const reserved = new Set(["target", "database_id", "page_id", "title", "content", "request_id"]);
    const needsProps = !input.properties || typeof input.properties !== "object";
    if (needsProps) {
      if (typeof input.content === "string") {
        const s = input.content.trim();
        if (s.startsWith("{") && s.endsWith("}")) {
          try {
            const parsed = JSON.parse(s);
            if (parsed && typeof parsed === "object") {
              input.properties = parsed;
              delete input.content;
            }
          } catch {}
        }
      }
      if (!input.properties || typeof input.properties !== "object") {
        const props: Record<string, any> = {};
        for (const k of Object.keys(input)) {
          if (!reserved.has(k)) {
            props[k] = input[k];
            delete input[k];
          }
        }
        if (Object.keys(props).length) input.properties = props;
      }
    }
  } catch {}
  const parse = WritePayloadSchema.safeParse(input);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  try {
    const result = await handleWrite(parse.data);
    res.json({ ok: true, ...result, request_id: parse.data.request_id ?? null });
  } catch (err: any) {
    console.error("Notion write failed:", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res
      .status(status)
      .json({ ok: false, error: err?.message || "Internal error", request_id: parse.data.request_id ?? null });
  }
});

// Compatibility endpoint: accepts any top-level fields and/or JSON in `content`.
// Useful when the connector is using a cached schema and rejects `properties`.
app.post("/chatgpt/notion-write-compat", async (req: Request, res: Response) => {
  // Start with a shallow copy of the body
  const input = { ...(req.body ?? {}) } as any;

  // Resolve database alias first
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }

  // Normalize IDs
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
    if (inferred) input.page_id = inferred;
  }
  if (input.target === "db" && !input.database_id) {
    const envDb = process.env.NOTION_DB_ID || process.env.NOTION_DB_URL;
    const inferred = extractNotionId(envDb);
    if (inferred) input.database_id = inferred;
  }

  // Tolerant normalization identical to main write route
  try {
    const reserved = new Set(["target", "database_id", "page_id", "title", "content", "request_id"]);
    const needsProps = !input.properties || typeof input.properties !== "object";
    if (needsProps) {
      // JSON-in-content → properties
      if (typeof input.content === "string") {
        const s = input.content.trim();
        if (s.startsWith("{") && s.endsWith("}")) {
          try {
            const parsed = JSON.parse(s);
            if (parsed && typeof parsed === "object") {
              input.properties = parsed;
              delete input.content;
            }
          } catch {}
        }
      }
      // Merge top-level fields into properties
      if (!input.properties || typeof input.properties !== "object") {
        const props: Record<string, any> = {};
        for (const k of Object.keys(input)) {
          if (!reserved.has(k)) {
            props[k] = input[k];
            delete input[k];
          }
        }
        if (Object.keys(props).length) input.properties = props;
      }
    }
  } catch {}

  const parse = WritePayloadSchema.safeParse(input);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  try {
    try {
      const propKeys = Object.keys((parse.data as any).properties || {});
      console.log(`[write-compat] properties_keys=${propKeys.length}`, propKeys.slice(0, 24));
    } catch {}
    const result = await handleWrite(parse.data);
    res.json({ ok: true, ...result, request_id: parse.data.request_id ?? null });
  } catch (err: any) {
    console.error("Notion write (compat) failed:", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res
      .status(status)
      .json({ ok: false, error: err?.message || "Internal error", request_id: parse.data.request_id ?? null });
  }
});

// Main query endpoint (safe read-only)
app.post("/chatgpt/notion-query", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  
  // Resolve database alias first
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }

  // Normalize IDs from URLs or raw IDs
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
    if (inferred) input.page_id = inferred;
  } else if (input.page_url) {
    const inferred = extractNotionId(input.page_url);
    if (inferred) input.page_id = inferred;
  }
  // Allow NOTION_DB_URL/NOTION_DB_ID env fallback for mode=db_query
  if (input.mode === "db_query" && !input.database_id) {
    const envDb = process.env.NOTION_DB_ID || process.env.NOTION_DB_URL;
    const inferred = extractNotionId(envDb);
    if (inferred) input.database_id = inferred;
  }

  const parse = QueryPayloadSchema.safeParse(input);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  try {
    const result = await handleQuery(parse.data);
    res.json({ ok: true, result });
  } catch (err: any) {
    console.error("Notion query failed:", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// Legacy/alias query paths for compatibility
app.post(["/notionQuery", "/chatgpt/notionQuery"], async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;

  // Resolve database alias
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }

  // Normalize IDs
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
    if (inferred) input.page_id = inferred;
  } else if (input.page_url) {
    const inferred = extractNotionId(input.page_url);
    if (inferred) input.page_id = inferred;
  }
  if (input.mode === "db_query" && !input.database_id) {
    const envDb = process.env.NOTION_DB_ID || process.env.NOTION_DB_URL;
    const inferred = extractNotionId(envDb);
    if (inferred) input.database_id = inferred;
  }
  const parse = QueryPayloadSchema.safeParse(input);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  try {
    const result = await handleQuery(parse.data);
    res.json({ ok: true, result });
  } catch (err: any) {
    console.error("Notion query failed:", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// Create database endpoint (consequential)
app.post("/chatgpt/notion-create-database", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  
  // Resolve parent page alias
  if (input.parent_page_id) {
    const resolved = resolveDatabaseAlias(input.parent_page_id);
    if (resolved) input.parent_page_id = resolved;
  }
  
  if (input.parent_page_id) {
    const inferred = extractNotionId(input.parent_page_id);
    if (inferred) input.parent_page_id = inferred;
  }
  if (input.parent_page_url && !input.parent_page_id) {
    const inferred = extractNotionId(input.parent_page_url);
    if (inferred) input.parent_page_id = inferred;
  }
  const parse = CreateDatabasePayloadSchema.safeParse(input);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  try {
    const result = await handleCreateDatabase(parse.data as any);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Create database failed:", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// Update database (add/rename properties)
app.post("/chatgpt/notion-update-database", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  console.log("[UPDATE-DB] Received payload:", JSON.stringify(input, null, 2));
  
  // Resolve database alias first
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }
  
  // Accept full Notion URL or raw 32-char id for database_id and normalize to hyphenated id
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }

  // Auto-fix common ChatGPT mistakes in relation properties
  // ChatGPT often sends {"relation": {"database_id": "...", "type": "dual_property"}}
  // But correct format is {"relation": {"database_id": "...", "dual_property": {}}}
  if (input.properties && typeof input.properties === "object") {
    for (const [propName, propDef] of Object.entries(input.properties)) {
      if (propDef && typeof propDef === "object" && (propDef as any).relation) {
        const rel = (propDef as any).relation;
        if (rel.type === "dual_property" && !rel.dual_property) {
          console.log(`[UPDATE-DB] Auto-fixing relation format for "${propName}": type="dual_property" -> dual_property={}`);
          rel.dual_property = {};
          delete rel.type;
        } else if (rel.type === "single_property" && !rel.single_property) {
          console.log(`[UPDATE-DB] Auto-fixing relation format for "${propName}": type="single_property" -> single_property={}`);
          rel.single_property = {};
          delete rel.type;
        }
      }
    }
  }

  // Tolerant aliases for backward-compat and model quirks
  // - allow legacy add_properties -> properties
  // - allow nested content.properties -> properties
  // - allow legacy rename_properties -> rename (string or {name})
  if (!input.properties && input.add_properties && typeof input.add_properties === "object") {
    input.properties = input.add_properties;
    delete input.add_properties;
  }
  if (!input.properties && input.content && typeof input.content === "object" && input.content.properties) {
    input.properties = input.content.properties;
    // do not forward unknown wrapper to strict schema
    delete input.content;
  }
  if (!input.rename && input.rename_properties && typeof input.rename_properties === "object") {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(input.rename_properties)) {
      if (typeof v === "string" && v.trim()) map[k] = v;
      else if (v && typeof (v as any).name === "string") map[k] = (v as any).name;
    }
    input.rename = map;
    delete input.rename_properties;
  }

  const parse = UpdateDatabasePayloadSchema.safeParse(input);
  if (!parse.success) {
    console.error("[UPDATE-DB] Validation failed:", JSON.stringify(parse.error.flatten(), null, 2));
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  console.log("[UPDATE-DB] Validation passed, calling Notion API...");
  try {
    const result = await handleUpdateDatabase(parse.data as any);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Update database failed", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// PATCH variant: Update database (add/rename properties)
app.patch("/chatgpt/notion-update-database", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  console.log("[UPDATE-DB][PATCH] Received payload:", JSON.stringify(input, null, 2));

  // Resolve database alias first
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }

  // Accept full Notion URL or raw 32-char id for database_id and normalize to hyphenated id
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }

  // Auto-fix common ChatGPT mistakes in relation properties
  // ChatGPT often sends {"relation": {"database_id": "...", "type": "dual_property"}}
  // But correct format is {"relation": {"database_id": "...", "dual_property": {}}}
  if (input.properties && typeof input.properties === "object") {
    for (const [propName, propDef] of Object.entries(input.properties)) {
      if (propDef && typeof propDef === "object" && (propDef as any).relation) {
        const rel = (propDef as any).relation;
        if (rel.type === "dual_property" && !rel.dual_property) {
          console.log(`[UPDATE-DB] Auto-fixing relation format for "${propName}": type="dual_property" -> dual_property={}`);
          rel.dual_property = {};
          delete rel.type;
        } else if (rel.type === "single_property" && !rel.single_property) {
          console.log(`[UPDATE-DB] Auto-fixing relation format for "${propName}": type="single_property" -> single_property={}`);
          rel.single_property = {};
          delete rel.type;
        }
      }
    }
  }

  // Tolerant aliases for backward-compat and model quirks
  // - allow legacy add_properties -> properties
  // - allow nested content.properties -> properties
  // - allow legacy rename_properties -> rename (string or {name})
  if (!input.properties && input.add_properties && typeof input.add_properties === "object") {
    input.properties = input.add_properties;
    delete input.add_properties;
  }
  if (!input.properties && input.content && typeof input.content === "object" && input.content.properties) {
    input.properties = input.content.properties;
    // do not forward unknown wrapper to strict schema
    delete input.content;
  }
  if (!input.rename && input.rename_properties && typeof input.rename_properties === "object") {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(input.rename_properties)) {
      if (typeof v === "string" && v.trim()) map[k] = v;
      else if (v && typeof (v as any).name === "string") map[k] = (v as any).name;
    }
    input.rename = map;
    delete input.rename_properties;
  }

  const parse = UpdateDatabasePayloadSchema.safeParse(input);
  if (!parse.success) {
    console.error("[UPDATE-DB][PATCH] Validation failed:", JSON.stringify(parse.error.flatten(), null, 2));
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  console.log("[UPDATE-DB][PATCH] Validation passed, calling Notion API...");
  try {
    const result = await handleUpdateDatabase(parse.data as any);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Update database (PATCH) failed", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// Compatibility endpoint for updating database schema when Actions cache rejects unknown keys
// Accepts:
// - database_id OR database_url
// - properties (preferred) OR add_properties
// - rename OR rename_properties
// - content as JSON string OR object with { properties }
// - top-level fields merged into properties (last resort)
app.post("/chatgpt/notion-update-database-compat", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  console.log("[UPDATE-DB-COMPAT] Raw body keys:", Object.keys(input || {}));

  // Resolve database alias first
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }

  // Normalize database_id from URL or raw 32-char
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }

  // Flexible normalization: map various shapes to { properties, rename }
  try {
    // 0) Accept legacy alias add_properties
    if (!input.properties && input.add_properties && typeof input.add_properties === "object") {
      input.properties = input.add_properties;
      delete input.add_properties;
    }

    // 1) If content is a JSON string, parse into properties
    if (!input.properties && typeof input.content === "string") {
      const s = input.content.trim();
      if (s.startsWith("{") && s.endsWith("}")) {
        try {
          const parsed = JSON.parse(s);
          if (parsed && typeof parsed === "object") {
            // If caller wrapped it { properties: {...} }, unwrap; else treat as properties map
            input.properties = parsed.properties && typeof parsed.properties === "object" ? parsed.properties : parsed;
          }
          delete input.content; // avoid passing unknown field to strict schema
        } catch {}
      }
    }

    // 2) If content is an object with properties, unwrap
    if (!input.properties && input.content && typeof input.content === "object" && input.content.properties) {
      input.properties = input.content.properties;
      delete input.content;
    }

    // 3) Merge any non-reserved top-level fields as properties (useful when Actions rejects `properties` key)
    if (!input.properties || typeof input.properties !== "object") {
      const reserved = new Set(["database_id", "database_url", "properties", "rename", "rename_properties", "content"]);
      const props: Record<string, any> = {};
      for (const k of Object.keys(input)) {
        if (!reserved.has(k)) {
          props[k] = input[k];
          delete input[k];
        }
      }
      if (Object.keys(props).length) input.properties = props;
    }

    // 4) Normalize rename_properties alias
    if (!input.rename && input.rename_properties && typeof input.rename_properties === "object") {
      const map: Record<string, string> = {};
      for (const [k, v] of Object.entries(input.rename_properties)) {
        if (typeof v === "string" && v.trim()) map[k] = v;
        else if (v && typeof (v as any).name === "string") map[k] = (v as any).name;
      }
      input.rename = map;
      delete input.rename_properties;
    }
  } catch {}

  // Auto-fix common ChatGPT mistakes in relation properties
  if (input.properties && typeof input.properties === "object") {
    for (const [propName, propDef] of Object.entries(input.properties)) {
      if (propDef && typeof propDef === "object" && (propDef as any).relation) {
        const rel = (propDef as any).relation;
        if (rel.type === "dual_property" && !rel.dual_property) {
          console.log(`[UPDATE-DB-COMPAT] Auto-fixing relation format for "${propName}": type="dual_property" -> dual_property={}`);
          rel.dual_property = {};
          delete rel.type;
        } else if (rel.type === "single_property" && !rel.single_property) {
          console.log(`[UPDATE-DB-COMPAT] Auto-fixing relation format for "${propName}": type="single_property" -> single_property={}`);
          rel.single_property = {};
          delete rel.type;
        }
      }
    }
  }

  // Validate against strict schema after normalization
  const parse = UpdateDatabasePayloadSchema.safeParse(input);
  if (!parse.success) {
    console.error("[UPDATE-DB-COMPAT] Validation failed:", JSON.stringify(parse.error.flatten(), null, 2));
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  console.log("[UPDATE-DB-COMPAT] Normalized keys:", Object.keys(parse.data as any));
  try {
    const result = await handleUpdateDatabase(parse.data as any);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Update database (compat) failed", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// PATCH variant (compat): flexible shapes for updating database schema
app.patch("/chatgpt/notion-update-database-compat", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  console.log("[UPDATE-DB-COMPAT][PATCH] Raw body keys:", Object.keys(input || {}));

  // Resolve database alias first
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }

  // Normalize database_id from URL or raw 32-char
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
  }

  // Flexible normalization: map various shapes to { properties, rename }
  try {
    // 0) Accept legacy alias add_properties
    if (!input.properties && input.add_properties && typeof input.add_properties === "object") {
      input.properties = input.add_properties;
      delete input.add_properties;
    }

    // 1) If content is a JSON string, parse into properties
    if (!input.properties && typeof input.content === "string") {
      const s = input.content.trim();
      if (s.startsWith("{") && s.endsWith("}")) {
        try {
          const parsed = JSON.parse(s);
          if (parsed && typeof parsed === "object") {
            input.properties = parsed.properties && typeof parsed.properties === "object" ? parsed.properties : parsed;
          }
          delete input.content; // avoid passing unknown field to strict schema
        } catch {}
      }
    }

    // 2) If content is an object with properties, unwrap
    if (!input.properties && input.content && typeof input.content === "object" && input.content.properties) {
      input.properties = input.content.properties;
      delete input.content;
    }

    // 3) Merge any non-reserved top-level fields as properties
    if (!input.properties || typeof input.properties !== "object") {
      const reserved = new Set([
        "database_id",
        "database_url",
        "properties",
        "rename",
        "rename_properties",
        "content",
      ]);
      const props: Record<string, any> = {};
      for (const k of Object.keys(input)) {
        if (!reserved.has(k)) {
          props[k] = input[k];
          delete input[k];
        }
      }
      if (Object.keys(props).length) input.properties = props;
    }

    // 4) Normalize rename_properties alias
    if (!input.rename && input.rename_properties && typeof input.rename_properties === "object") {
      const map: Record<string, string> = {};
      for (const [k, v] of Object.entries(input.rename_properties)) {
        if (typeof v === "string" && v.trim()) map[k] = v;
        else if (v && typeof (v as any).name === "string") map[k] = (v as any).name;
      }
      input.rename = map;
      delete input.rename_properties;
    }
  } catch {}

  // Auto-fix common ChatGPT mistakes in relation properties
  if (input.properties && typeof input.properties === "object") {
    for (const [propName, propDef] of Object.entries(input.properties)) {
      if (propDef && typeof propDef === "object" && (propDef as any).relation) {
        const rel = (propDef as any).relation;
        if (rel.type === "dual_property" && !rel.dual_property) {
          console.log(`[UPDATE-DB-COMPAT][PATCH] Auto-fixing relation format for "${propName}": type="dual_property" -> dual_property={}`);
          rel.dual_property = {};
          delete rel.type;
        } else if (rel.type === "single_property" && !rel.single_property) {
          console.log(`[UPDATE-DB-COMPAT][PATCH] Auto-fixing relation format for "${propName}": type="single_property" -> single_property={}`);
          rel.single_property = {};
          delete rel.type;
        }
      }
    }
  }

  // Validate against strict schema after normalization
  const parse = UpdateDatabasePayloadSchema.safeParse(input);
  if (!parse.success) {
    console.error(
      "[UPDATE-DB-COMPAT][PATCH] Validation failed:",
      JSON.stringify(parse.error.flatten(), null, 2)
    );
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  console.log("[UPDATE-DB-COMPAT][PATCH] Normalized keys:", Object.keys(parse.data as any));
  try {
    const result = await handleUpdateDatabase(parse.data as any);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Update database (compat, PATCH) failed", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

// Apply a predefined schema preset to a database (adds columns)
app.post("/chatgpt/notion-apply-preset", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  const preset = String(input.preset || "").trim();
  if (!preset) {
    return res.status(400).json({ ok: false, error: `Missing 'preset'. Available: ${listPresets().join(", ")}` });
  }

  // Resolve and normalize database id
  if (input.database_id) {
    const resolved = resolveDatabaseAlias(input.database_id);
    if (resolved) input.database_id = resolved;
  } else if (input.database_url) {
    const resolved = resolveDatabaseAlias(input.database_url);
    if (resolved) input.database_id = resolved;
  }
  const dbId = extractNotionId(input.database_id || input.database_url);
  if (!dbId) {
    return res.status(400).json({ ok: false, error: "database_id (or database_url) is required" });
  }

  const properties = getPresetProperties(preset);
  if (!properties) {
    return res.status(400).json({ ok: false, error: `Unknown preset '${preset}'. Available: ${listPresets().join(", ")}` });
  }

  // Strict-validate via UpdateDatabasePayloadSchema
  const normalized = { database_id: dbId, properties };
  const parse = UpdateDatabasePayloadSchema.safeParse(normalized);
  if (!parse.success) {
    return res.status(400).json({ ok: false, error: "Invalid preset payload", details: parse.error.flatten() });
  }

  try {
    const result = await handleUpdateDatabase(parse.data as any);
    res.json({ ok: true, preset, ...result });
  } catch (err: any) {
    console.error("Apply preset failed", err?.message, err?.body ?? "");
    const status = (err?.status as number) || 500;
    res.status(status).json({ ok: false, error: err?.message || "Internal error" });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`HTTP server listening on http://localhost:${port}`);
});

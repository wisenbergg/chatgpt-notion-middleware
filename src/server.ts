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
  // Normalize IDs: accept Notion URLs or raw IDs and hyphenate
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

// Main query endpoint (safe read-only)
app.post("/chatgpt/notion-query", async (req: Request, res: Response) => {
  const input = { ...(req.body ?? {}) } as any;
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
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
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  }
  if (input.page_id) {
    const inferred = extractNotionId(input.page_id);
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
  // Accept full Notion URL or raw 32-char id for database_id and normalize to hyphenated id
  if (input.database_id) {
    const inferred = extractNotionId(input.database_id);
    if (inferred) input.database_id = inferred;
  } else if (input.database_url) {
    const inferred = extractNotionId(input.database_url);
    if (inferred) input.database_id = inferred;
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

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`HTTP server listening on http://localhost:${port}`);
});

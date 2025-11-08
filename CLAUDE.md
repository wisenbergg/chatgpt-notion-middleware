# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **ChatGPT Action middleware** that bridges ChatGPT with the Notion API 2025-09-03. It provides intelligent normalization, flexible parameter handling, and auto-conversion between `database_id` and `data_source_id`.

**Key Features:**
- Accepts Notion URLs, raw IDs, or friendly database aliases
- Auto-converts between database_id ↔ data_source_id
- Schema-aware property conversion
- Supports all Notion property types
- Deployed to Vercel with production URL: `https://api.wheniwas.me`

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Build TypeScript to dist/
npm run build

# Production mode (requires build first)
npm start
```

### Testing
```bash
# Test health endpoint
curl http://localhost:8787/debug/ping

# Test with authentication
curl -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:8787/chatgpt/notion-query \
  -d '{"mode":"search","query":"test"}'
```

### Deployment
```bash
# Deploy to Vercel production
vercel --prod

# Set environment variables in Vercel
vercel env add NOTION_TOKEN
vercel env add CHATGPT_ACTION_SECRET
```

### Database Discovery
```bash
# List all databases in workspace
node scripts/fetch-databases.mjs
```

## Architecture

### Notion API 2025-09-03 Structure
**CRITICAL**: Notion API 2025-09-03 has two distinct concepts:
- **databases** = Containers (location, title, locked status)
- **data_sources** = Content schemas (property columns, pages)

This middleware handles the complexity of auto-converting between these concepts so users can provide simple `database_id` values.

### Core Normalization Functions

These functions in `src/notion.ts` are **critical** and should not be modified without understanding their purpose:

1. **`extractNotionId()`** - Normalizes URLs/IDs to hyphenated format
   - Accepts: `https://notion.so/workspace/abc123...` or `abc123...` or `abc-123-...`
   - Returns: `abc-123-def-...` (hyphenated UUID format)

2. **`resolveDataSourceId()`** - Converts `database_id` ↔ `data_source_id`
   - Required because Notion API 2025-09-03 uses `data_source_id` for property operations
   - Users only have `database_id` from URLs
   - Auto-fetches data_source_id from database metadata

3. **`resolveParentPageId()`** - Accepts multiple parameter name variations
   - Handles: `parent_page_id`, `parentPageId`, `parent.page_id`, etc.
   - Makes API flexible for different ChatGPT schema versions

4. **`getDatabaseSchema()`** - Fetches property schema from data source
   - Properties are stored in data_sources, NOT databases (API 2025-09-03)
   - Used for schema-aware property conversion

5. **`toNotionPropertiesWithSchema()`** - Converts simple properties to Notion format
   - Schema-aware: uses database schema to detect property types
   - Converts `{ Name: "Test" }` → `{ Name: { title: [{ text: { content: "Test" }}]}}`

### Database Aliases

The middleware supports friendly names instead of UUIDs (defined in `src/server.ts`):
- `weekly_poc_reports` → actual UUID
- `master_tasks_db` → actual UUID
- `microinfluencer_tracker_2025_api` → actual UUID
- 30+ more pre-configured aliases

Configure custom aliases via `NOTION_DB_ALIASES` environment variable (JSON format).

### API Endpoints Architecture

**Write Operations (Consequential - require auth):**
- `/chatgpt/notion-write` - Create/update pages in databases
- `/chatgpt/notion-create-database` - Create new databases
- `/chatgpt/notion-update-database` - Add/rename properties in databases
- `/chatgpt/notion-apply-preset` - Apply predefined schema presets

**Read Operations (Safe):**
- `/chatgpt/notion-query` - Multi-mode query (search, db_query, page_get, etc.)
- 14+ query modes supported

**Utility:**
- `GET /health` - Health check
- `GET /openapi.yaml` - API documentation for ChatGPT Actions
- `POST /debug/ping` - Environment validation

### Critical Endpoint Patterns

**NEVER use `data_sources` endpoint for title updates:**
```typescript
// WRONG - Title updates fail
await client.request({
  path: `data_sources/${id}`,
  method: 'PATCH',
  body: { title: [...] }
});

// CORRECT - Use databases endpoint
await client.request({
  path: `databases/${id}`,
  method: 'PATCH',
  body: { title: [...] }
});
```

**NEVER use `databases` endpoint for property updates:**
```typescript
// WRONG - Properties parameter doesn't exist
await client.request({
  path: `databases/${id}`,
  method: 'PATCH',
  body: { properties: {...} }
});

// CORRECT - Use data_sources endpoint
await client.request({
  path: `data_sources/${id}`,
  method: 'PATCH',
  body: { properties: {...} }
});
```

## File Structure

```
src/
├── server.ts       # Express server, routing, middleware, database aliases
├── notion.ts       # Core Notion API integration & handlers
├── schema.ts       # Zod validation schemas & TypeScript types
└── presets.ts      # Predefined database schema presets

.github/
└── copilot-instructions.md  # Comprehensive development guide (READ THIS!)

docs/
├── CHATGPT_*.md    # ChatGPT prompt guides for each operation
└── README.md       # Docs overview

scripts/
└── fetch-databases.mjs  # Discover workspace databases

openapi.yaml        # API documentation for ChatGPT Actions
```

## Important Implementation Details

### ID Normalization Pattern
**Every endpoint MUST normalize IDs before validation:**
```typescript
const input = { ...req.body };

// Resolve database alias first
if (input.database_id) {
  const resolved = resolveDatabaseAlias(input.database_id);
  if (resolved) input.database_id = resolved;
}

// Then normalize to hyphenated format
if (input.database_id) {
  input.database_id = extractNotionId(input.database_id);
}

// Then validate with Zod
const parse = Schema.safeParse(input);
```

### Property Normalization Pattern
The middleware is **tolerant** of multiple input formats:
1. Properties in dedicated `properties` field
2. Properties as JSON string in `content` field
3. Properties as top-level fields (auto-extracted)

This flexibility handles ChatGPT's varying schema interpretations.

### Authentication
- Uses bearer token authentication: `Authorization: Bearer YOUR_CHATGPT_ACTION_SECRET`
- Public paths: `/`, `/health`, `/openapi.yaml`, `/debug/ping`
- All write operations require authentication
- Configure via `CHATGPT_ACTION_SECRET` environment variable

## Environment Variables

**Required:**
- `NOTION_TOKEN` - Notion integration token (get from notion.so/my-integrations)
- `CHATGPT_ACTION_SECRET` - Secret for authenticating ChatGPT Actions

**Optional:**
- `PORT` - Server port (default: 8787)
- `NOTION_DB_ID` - Default database for writes
- `NOTION_DB_URL` - Alternative to NOTION_DB_ID
- `NOTION_PARENT_PAGE_ID` - Default parent page for new databases
- `NOTION_DB_ALIASES` - Custom database aliases as JSON

## Key Dependencies

- `@notionhq/client` v5.0.0 - Official Notion SDK (API version 2025-09-03)
- `express` v4.19.2 - Web server framework
- `zod` v3.23.8 - Runtime type validation
- `tsx` - TypeScript execution for development

## Critical Development Rules

1. **Always normalize IDs** - Use `extractNotionId()` before validation
2. **Use correct endpoints** - `databases` for container ops, `data_sources` for schema ops
3. **Accept multiple formats** - Title as string OR array, various parameter names
4. **Auto-resolve IDs** - `database_id` ↔ `data_source_id` transparently
5. **Never remove resolver functions** - They enable backward compatibility
6. **Read .github/copilot-instructions.md** - Before modifying critical functions
7. **Test with real ChatGPT** - Schema cache can cause unexpected parameter variations

## Common Pitfalls to Avoid

- ❌ Don't remove ID normalization (breaks URL input)
- ❌ Don't hardcode property names (use schema detection)
- ❌ Don't use wrong endpoint for title vs properties
- ❌ Don't require exact parameter names (use resolvers)
- ❌ Don't skip database alias resolution
- ❌ Don't modify critical functions without reading docs first

## Testing Critical Paths

When making changes, verify:
1. URL → ID extraction works (URLs, UUIDs, aliases)
2. Database → Data Source resolution works
3. Title accepts both string and array formats
4. Properties normalization handles all input patterns
5. Authentication works for protected endpoints
6. Database aliases resolve correctly

## Additional Resources

- **OpenAPI Spec**: Available at `/openapi.yaml` on production server
- **ChatGPT Guides**: See `docs/` folder for prompt templates
- **Development Guide**: See `.github/copilot-instructions.md` for technical details
- **Notion API Docs**: https://developers.notion.com

## Project Context (from existing docs)

This middleware is designed to work with:
- **Frontend**: Froid client-side application
- **Backend**: Supabase backend + /shrink-chat server hosting AI engine
- **Purpose**: Bridge ChatGPT Actions with Notion workspace for content management

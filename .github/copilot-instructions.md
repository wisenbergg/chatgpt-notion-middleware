# GitHub Copilot Instructions for ChatGPT-Notion Middleware

## 🎯 Project Overview
This is a ChatGPT action server that bridges ChatGPT with Notion API 2025-09-03. It provides intelligent normalization, flexible parameter handling, and auto-conversion between database_id and data_source_id.

**CRITICAL**: Notion API 2025-09-03 has TWO distinct concepts:
- **databases** = Containers (location, title, locked status)
- **data_sources** = Content schemas (property columns, pages)

---

## 🚨 CRITICAL FUNCTIONS - NEVER MODIFY WITHOUT UNDERSTANDING

### 1. `extractNotionId(input?: string | null): string | undefined`
**Location**: `src/notion.ts` (line 17) and `src/server.ts` (line 140)

**Purpose**: Extracts and normalizes Notion IDs from URLs or raw 32-character hex strings.

**Critical Behavior**:
- Accepts full Notion URLs: `https://notion.so/myworkspace/cf47f53fb71d434f93d58e05a0b144f5`
- Accepts raw IDs with/without dashes: `cf47f53fb71d434f93d58e05a0b144f5`
- Returns hyphenated format: `cf47f53f-b71d-434f-93d5-8e05a0b144f5`
- Returns `undefined` if invalid (not exactly 32 hex chars)

**Why It's Critical**:
- Used in EVERY endpoint for ID normalization
- Prevents "Invalid ID" errors from Notion API
- Enables users to paste URLs directly from Notion

**Example**:
```typescript
// All these produce same result: "cf47f53f-b71d-434f-93d5-8e05a0b144f5"
extractNotionId("https://notion.so/cf47f53fb71d434f93d58e05a0b144f5")
extractNotionId("cf47f53fb71d434f93d58e05a0b144f5")
extractNotionId("cf47f53f-b71d-434f-93d5-8e05a0b144f5")
```

---

### 2. `resolveDataSourceId(payload: any): Promise<string | undefined>`
**Location**: `src/notion.ts` (line 33)

**Purpose**: Intelligently converts `database_id` ↔ `data_source_id` to handle Notion API 2025-09-03 architecture.

**Critical Behavior**:
- **Prefers** `data_source_id` if provided
- **Falls back** to looking up from `database_id`
- Handles null `data_source_id` (uses `database_id` as fallback)
- Logs auto-resolution for debugging

**Why It's Critical**:
- Notion API 2025-09-03 requires `data_source_id` for property operations
- Users only have `database_id` from URLs
- Without this, EVERY property operation would fail with "Could not find data source"

**Usage Pattern**:
```typescript
// User provides: database_id
// Function resolves to: data_source_id (from API lookup)
const dataSourceId = await resolveDataSourceId(payload);
if (!dataSourceId) {
  throw new Error("Either data_source_id or database_id is required");
}
```

**⚠️ NEVER remove this function - it's the backbone of backward compatibility**

---

### 3. `resolveParentPageId(payload: any): string | undefined`
**Location**: `src/notion.ts` (line 59)

**Purpose**: Accepts multiple parameter name variations for parent page ID.

**Critical Behavior**:
Accepts ANY of these parameter names:
- `parent_page_id` ← Preferred
- `parentPageId` ← camelCase variant
- `parent.page_id` ← Nested format
- `parent.pageId` ← Nested camelCase
- `page_id` ← Only when NOT creating in database (to avoid confusion)

**Why It's Critical**:
- ChatGPT sends different parameter names depending on schema cache
- Users might use different naming conventions
- Without this, page creation would fail with "parent required"

**Example**:
```typescript
// All these work:
{ parent_page_id: "abc-123" }      // ✅
{ parentPageId: "abc-123" }        // ✅
{ parent: { page_id: "abc-123" }}  // ✅
{ page_id: "abc-123" }             // ✅ (only when target="page")
```

---

### 4. `getPrimaryDataSourceId(databaseId: string): Promise<string>`
**Location**: `src/notion.ts` (line 312)

**Purpose**: Gets the first (primary) data source ID from a database for backward compatibility.

**Critical Behavior**:
- Retrieves database metadata
- Returns first data source ID from `data_sources` array
- Throws error if no data sources found

**Why It's Critical**:
- Legacy endpoints expect to work with database_id only
- Must transparently convert to data_source_id
- Maintains backward compatibility with old API calls

**⚠️ DO NOT remove - breaking change for all legacy integrations**

---

### 5. `getDatabaseSchema(databaseId: string): Promise<Record<string, any>>`
**Location**: `src/notion.ts` (line 109)

**Purpose**: Fetches property schema from data source (not database).

**Critical Behavior**:
- Retrieves database to get data_sources array
- Fetches first data source for properties schema
- Returns empty object if no data sources

**Why It's Critical**:
- Properties are stored in data_sources, NOT databases (API 2025-09-03)
- Required for schema-aware property conversion
- Without this, property type detection fails

**Usage**:
```typescript
const schema = await getDatabaseSchema(databaseId);
// schema = { Name: { title: {} }, Status: { status: {} }, ... }
```

---

### 6. `toNotionPropertiesWithSchema(input, schema): Record<string, any>`
**Location**: `src/notion.ts` (line 130)

**Purpose**: Converts simple key-value properties to Notion's typed property format using schema.

**Critical Behavior**:
- **Schema-aware**: Uses database schema to detect property types
- Converts strings → title/rich_text based on schema
- Converts booleans → checkbox
- Converts arrays → multi_select
- Falls back to heuristic conversion if schema unavailable

**Why It's Critical**:
- Notion API rejects properties in wrong format
- Without schema awareness: `{ Name: "Test" }` would fail (needs `{ title: [{ text: { content: "Test" }}]}`)
- Enables ChatGPT to send simple JSON that "just works"

**Example**:
```typescript
// Input from ChatGPT
{ Name: "My Page", Status: "In Progress", Priority: 5 }

// Output with schema
{
  Name: { title: [{ text: { content: "My Page" }}]},
  Status: { status: { name: "In Progress" }},
  Priority: { number: 5 }
}
```

---

### 7. `toDatabaseProperty(def): any`
**Location**: `src/notion.ts` (line 616)

**Purpose**: Converts simplified property definitions to Notion API property schema format.

**Critical Behavior**:
- Accepts user-friendly format: `{ type: "select", options: ["A", "B"] }`
- Converts to Notion format: `{ select: { options: [{ name: "A" }, { name: "B" }]}}`
- Handles complex types: relation, rollup, formula
- Maps user-friendly `"many_to_many"` → Notion's `"dual_property"`

**Why It's Critical**:
- Required for `handleCreateDatabase` and `handleUpdateDatabase`
- Without this, database creation would require verbose Notion schemas
- Enables simple property definitions from ChatGPT

**Supported Types**:
- Simple: `title`, `rich_text`, `number`, `checkbox`, `url`, `email`, `phone_number`
- Select: `select`, `multi_select`, `status`
- Complex: `relation`, `rollup`, `formula`, `unique_id`
- Auto: `date`, `people`, `files`, `created_time`, `created_by`, `last_edited_time`, `last_edited_by`

---

### 8. `handleUpdateDataSource(payload: any)`
**Location**: `src/notion.ts` (line 876)

**Purpose**: Updates database-level metadata (title, icon, parent).

**Critical Behavior**:
- **Uses `databases` endpoint** (NOT data_sources) for title updates
- Accepts `title` as string OR Notion rich text array
- Auto-converts string → rich text format
- Uses `resolveDataSourceId()` for flexible ID input

**Why It's Critical**:
- **Architecture change in v5.3.4**: Uses `PATCH databases/${id}` (was `data_sources/${id}`)
- Reason: Notion API 2025-09-03 has `databases` for container operations
- Breaking change if reverted - title updates would fail

**NEVER change this line without consulting SDK documentation**:
```typescript
path: `databases/${extractNotionId(dataSourceId)}`,  // Line 947 - CORRECT endpoint
```

---

### 9. `handleUpdateDatabase(payload: UpdateDatabasePayload)`
**Location**: `src/notion.ts` (line 768)

**Purpose**: Adds or renames property columns in database schema.

**Critical Behavior**:
- **Uses `data_sources` endpoint** for property operations
- Supports adding new properties
- Supports renaming properties (copies to new name, sets old to null)
- Uses `getPrimaryDataSourceId()` for database_id → data_source_id conversion

**Why It's Critical**:
- Property schema is stored in data_sources, NOT databases
- Uses CORRECT endpoint: `PATCH data_sources/${id}`
- This endpoint INCLUDES `properties` parameter (unlike `databases` endpoint)

**⚠️ DO NOT change to `databases` endpoint - properties param doesn't exist there**

---

## 🔧 Configuration & Environment

### Critical Environment Variables
```bash
NOTION_TOKEN=secret_...              # REQUIRED - Notion integration token
CHATGPT_ACTION_SECRET=...            # REQUIRED - Protects consequential endpoints
NOTION_DB_ID=...                     # OPTIONAL - Default database for writes
NOTION_DB_URL=...                    # OPTIONAL - Alternative to DB_ID
NOTION_PARENT_PAGE_ID=...            # OPTIONAL - Default parent for databases
```

### Notion API Version
**CRITICAL**: Always use `notionVersion: "2025-09-03"` in Client initialization.

**Why**: This version introduced data_sources architecture. Using older versions breaks all property operations.

---

## 📋 Endpoint Architecture Guide

### Write Operations (Consequential)
| Endpoint | Purpose | Uses | Critical Notes |
|----------|---------|------|----------------|
| `/chatgpt/notion-write` | Create/update pages | `handleWrite()` | Main write endpoint |
| `/chatgpt/notion-write-compat` | Tolerant write | Same as above | Accepts JSON in `content` field |
| `/chatgpt/notion-create-database` | Create database | `handleCreateDatabase()` | Uses `initial_data_source` in API |
| `/chatgpt/notion-update-database` | Add/rename properties | `handleUpdateDatabase()` | Uses `data_sources` endpoint |

### Read Operations (Safe)
| Endpoint | Purpose | Mode Parameter | Critical Notes |
|----------|---------|----------------|----------------|
| `/chatgpt/notion-query` | Multi-purpose query | Various | Supports 14+ modes |
| Mode: `data_source_update` | Rename database | N/A | Uses `databases` endpoint |
| Mode: `database_get` | Get database + schema | N/A | Fetches data_source for properties |
| Mode: `data_source_query` | Query pages | N/A | Pagination support |

---

## 🎨 Schema Normalization Patterns

### Pattern 1: Flexible Title Input
**Always accept both formats**:
```typescript
// Schema definition
title: z.union([
  z.string(),                        // Simple string
  z.array(z.record(z.any()))         // Notion rich text array
]).optional()

// Conversion logic
if (typeof payload.title === 'string') {
  requestBody.title = [{
    type: "text",
    text: { content: payload.title }
  }];
} else if (Array.isArray(payload.title)) {
  requestBody.title = payload.title;
}
```

### Pattern 2: ID Normalization in Endpoints
**Every endpoint MUST normalize IDs**:
```typescript
app.post("/endpoint", async (req, res) => {
  const input = { ...req.body };
  
  // Normalize ALL ID fields
  if (input.database_id) {
    input.database_id = extractNotionId(input.database_id);
  }
  if (input.page_id) {
    input.page_id = extractNotionId(input.page_id);
  }
  if (input.data_source_id) {
    input.data_source_id = extractNotionId(input.data_source_id);
  }
  
  // Then validate with Zod...
});
```

### Pattern 3: Property Tolerance
**Accept properties in multiple locations**:
```typescript
const reserved = new Set(["target", "database_id", "page_id", "title", "content", "request_id"]);

// 1. Properties in dedicated field
if (input.properties) { /* use it */ }

// 2. Properties inside JSON content
if (typeof input.content === "string" && input.content.startsWith("{")) {
  const parsed = JSON.parse(input.content);
  input.properties = parsed;
}

// 3. Properties as top-level fields
for (const [key, val] of Object.entries(input)) {
  if (!reserved.has(key)) {
    input.properties[key] = val;
  }
}
```

---

## 🚫 Common Pitfalls - NEVER DO THESE

### ❌ DON'T: Use `data_sources` for title updates
```typescript
// WRONG - Title updates fail
await client.request({
  path: `data_sources/${id}`,  // ❌ Wrong endpoint
  method: 'PATCH',
  body: { title: [...] }
});
```

### ✅ DO: Use `databases` for title updates
```typescript
// CORRECT - Title updates work
await client.request({
  path: `databases/${id}`,  // ✅ Correct endpoint
  method: 'PATCH',
  body: { title: [...] }
});
```

### ❌ DON'T: Use `databases` for property updates
```typescript
// WRONG - Properties parameter doesn't exist
await client.request({
  path: `databases/${id}`,  // ❌ Wrong endpoint for properties
  method: 'PATCH',
  body: { properties: {...} }
});
```

### ✅ DO: Use `data_sources` for property updates
```typescript
// CORRECT - Properties schema lives here
await client.request({
  path: `data_sources/${id}`,  // ✅ Correct endpoint
  method: 'PATCH',
  body: { properties: {...} }
});
```

### ❌ DON'T: Remove ID normalization
```typescript
// WRONG - Breaks URL input
const parse = WritePayload.safeParse(req.body);
```

### ✅ DO: Always normalize before validation
```typescript
// CORRECT - URLs work
const input = { ...req.body };
if (input.database_id) {
  input.database_id = extractNotionId(input.database_id);
}
const parse = WritePayload.safeParse(input);
```

### ❌ DON'T: Require exact parameter names
```typescript
// WRONG - Brittle to schema changes
if (!payload.parent_page_id) {
  throw new Error("parent_page_id required");
}
```

### ✅ DO: Use resolver functions
```typescript
// CORRECT - Accepts multiple names
const parentId = resolveParentPageId(payload);
if (!parentId) {
  throw new Error("Parent page required");
}
```

---

## 🧪 Testing Critical Paths

### Test 1: URL → ID Extraction
```typescript
// Test all formats work
const testCases = [
  "https://notion.so/myworkspace/cf47f53fb71d434f93d58e05a0b144f5",
  "cf47f53fb71d434f93d58e05a0b144f5",
  "cf47f53f-b71d-434f-93d5-8e05a0b144f5",
];
testCases.forEach(input => {
  const id = extractNotionId(input);
  assert(id === "cf47f53f-b71d-434f-93d5-8e05a0b144f5");
});
```

### Test 2: Database → Data Source Resolution
```typescript
// Test auto-lookup works
const payload = { database_id: "cf47f53f-b71d-434f-93d5-8e05a0b144f5" };
const dataSourceId = await resolveDataSourceId(payload);
assert(dataSourceId !== undefined);
```

### Test 3: Title String → Rich Text Conversion
```typescript
// Test both formats accepted
const stringTitle = { title: "My Database" };
const arrayTitle = { title: [{ type: "text", text: { content: "My Database" }}]};
// Both should work identically
```

---

## 📝 Code Review Checklist

When reviewing changes to this codebase, ensure:

- [ ] All ID parameters use `extractNotionId()` normalization
- [ ] Endpoint uses correct path (`databases` vs `data_sources`)
- [ ] Title accepts both string and array formats
- [ ] Parent parameters use `resolveParentPageId()`
- [ ] Database/data source IDs use `resolveDataSourceId()` when needed
- [ ] Schema uses `additionalProperties: false` only when truly needed
- [ ] OpenAPI spec matches TypeScript schema exactly
- [ ] Error messages are helpful (include what was expected)
- [ ] Logging includes context (operation type, IDs involved)
- [ ] Backward compatibility maintained (no breaking changes)

---

## 🔄 Version History

### v5.3.5 (Current - Oct 25, 2025)
- **Fix**: OpenAPI schema accepts `title` as string OR array
- **Impact**: Fixes `UnrecognizedKwargsError` from ChatGPT

### v5.3.4 (Oct 24, 2025)
- **Fix**: `handleUpdateDataSource` uses `databases` endpoint (not `data_sources`)
- **Impact**: Database rename now works correctly
- **Critical**: This is the correct architecture per SDK

### v5.3.3 (Oct 23, 2025)
- **Fix**: Handle null `data_source_id` with fallback to `database_id`
- **Impact**: Works with databases that don't have separate data sources

### v5.3.2 (Oct 22, 2025)
- **Feature**: Flexible schema validation (union types, parameter aliases)
- **Impact**: More tolerant of ChatGPT's varying parameter names

---

## 🎓 Learning Resources

### Understanding Notion API 2025-09-03
- Databases = Containers (location, title)
- Data Sources = Content (property schemas, pages)
- SDK Method Reference: `@notionhq/client` v5.0.0
  - `databases.update()` → `PATCH /databases/${id}` (no `properties` param)
  - `dataSources.query()` → `POST /data_sources/${id}/query`
  - No `dataSources.update()` method (use low-level `.request()`)

### SDK Endpoint Reference
```typescript
// From @notionhq/client/build/src/api-endpoints.js

updateDatabase: {
  method: "patch",
  path: (p) => `databases/${p.database_id}`,
  bodyParams: ["title", "description", "is_inline", "icon", "cover", "in_trash", "is_locked"]
  // NOTE: No "properties" param!
}

updateDataSource: {
  method: "patch",
  path: (p) => `data_sources/${p.data_source_id}`,
  bodyParams: ["title", "icon", "properties", "in_trash", "archived", "parent"]
  // NOTE: HAS "properties" param!
}
```

---

## 💡 When in Doubt

**Before changing critical functions**:
1. Check SDK source: `node_modules/@notionhq/client/build/src/api-endpoints.js`
2. Test manually with curl against Notion API
3. Review conversation history in this repo
4. Check if similar issue was fixed before (git log)

**When adding new features**:
1. Follow existing normalization patterns
2. Use resolver functions for flexibility
3. Add to OpenAPI spec with examples
4. Test with actual ChatGPT integration

**Red flags that indicate problems**:
- "Could not find database/page" errors
- `UnrecognizedKwargsError` from ChatGPT
- Breaking changes in patch version updates
- Hardcoded ID formats or parameter names

---

## 🎯 Summary: The Golden Rules

1. **Always normalize IDs** with `extractNotionId()`
2. **Use correct endpoints**: `databases` for container, `data_sources` for schema
3. **Accept multiple formats**: strings OR arrays for title, various parameter names for parent
4. **Auto-resolve IDs**: `database_id` ↔ `data_source_id` transparently
5. **Schema-aware conversion**: Use `getDatabaseSchema()` + `toNotionPropertiesWithSchema()`
6. **Never remove resolver functions**: They enable backward compatibility
7. **Test with real ChatGPT**: Schema cache can cause unexpected parameter names
8. **Consult SDK source**: When unsure about endpoints, check the official SDK

Remember: **This middleware exists to make Notion integration seamless for ChatGPT users. Every normalization function serves that purpose.**

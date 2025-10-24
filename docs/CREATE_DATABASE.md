# Notion Database Creation API

Create Notion databases programmatically with a safe default schema, support for all public property types, and a raw passthrough for advanced use.

- Base URL (prod): https://api.wheniwas.me
- OpenAPI spec: https://api.wheniwas.me/openapi.yaml
- Auth: Bearer token for protected endpoints (`Authorization: Bearer {CHATGPT_ACTION_SECRET}`)

## Endpoint

`POST /chatgpt/notion-create-database`

- Consequential: Yes
- Auth required: Yes

## What it does

- Creates a new Notion database under:
  - a parent page (`parent_page_id`), or
  - the workspace root (`workspace: true`)
- Ensures there’s exactly one Title property (adds `Name: { title: {} }` if missing)
- Supports all public Notion property types (see below)
- Allows advanced “raw” property schema passthrough

## Request schema (summary)

- `parent_page_id: string`
  - Required if `workspace` is not `true`
- `workspace: boolean`
  - Set `true` to create at the workspace root (mutually exclusive with `parent_page_id`)
- `title: string` (required)
- `properties: object`
  - Map of property name to either:
    - Simplified definition (type + minimal fields), or
    - Raw passthrough: `{ "raw": { ...NotionPropertyObject } }`

Supported simplified property types:

- Basic: `title`, `rich_text`, `number` (`number_format`), `select` (`options[]`), `multi_select` (`options[]`), `status` (`options[]`), `date`, `checkbox`, `url`, `email`, `phone_number`, `people`, `files`
- Calculated/linked: `formula` (`expression`), `relation` (`database_id`, `relation_type`, `synced_property_name/id`), `rollup` (`relation_property_name/id`, `rollup_property_name/id`, `function`)
- System: `created_time`, `created_by`, `last_edited_time`, `last_edited_by`, `unique_id` (`prefix`)

Validation rules:

- Provide `parent_page_id` or `workspace=true` (but not both)
- `title` is required
- Server ensures at least one Title property

## Response shape (200)

```json
{
  "ok": true,
  "action": "created_database",
  "database_id": "...",
  "url": "https://www.notion.so/..."
}
```

Errors:

- 400: Invalid payload (validation details included)
- 401: Unauthorized (missing/incorrect Bearer token)

## Examples

Minimal (workspace-level)

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-create-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "workspace": true,
    "title": "My New DB"
  }'
```

Parent page with common properties

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-create-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "parent_page_id": "YOUR_PARENT_PAGE_ID",
    "title": "Tasks",
    "properties": {
      "Name": { "type": "title" },
      "Status": { "type": "status", "options": ["Todo","In Progress","Done"] },
      "Priority": { "type": "multi_select", "options": ["P1","P2","P3"] },
      "Estimate": { "type": "number", "number_format": "number" },
      "Due": { "type": "date" },
      "URL": { "type": "url" }
    }
  }'
```

Formula

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-create-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "workspace": true,
    "title": "Metrics",
    "properties": {
      "Name": { "type": "title" },
      "X": { "type": "number" },
      "Y": { "type": "number" },
      "Sum": { "type": "formula", "expression": "prop(\"X\") + prop(\"Y\")" }
    }
  }'
```

Relation + Rollup

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-create-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d "{
    \"parent_page_id\": \"YOUR_PARENT_PAGE_ID\",
    \"title\": \"Projects\",\
    \"properties\": {
      \"Name\": { \"type\": \"title\" },
      \"Tasks\": {
        \"type\": \"relation\",
        \"database_id\": \"TARGET_TASKS_DB_ID\",
        \"relation_type\": \"single_property\"
      },
      \"Task Count\": {
        \"type\": \"rollup\",
        \"relation_property_name\": \"Tasks\",
        \"function\": \"count\"
      }
    }
  }"
```

Unique ID + Status

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-create-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "workspace": true,
    "title": "Roadmap",
    "properties": {
      "Status": { "type": "status", "options": ["Planned","In Progress","Done"] },
      "Ticket": { "type": "unique_id", "prefix": "RM-" }
    }
  }'
```

Raw passthrough (advanced control, e.g., status groups/colors)

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-create-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "workspace": true,
    "title": "Advanced Status",
    "properties": {
      "Status": {
        "raw": {
          "status": {
            "options": [
              { "name": "Planned", "color": "gray" },
              { "name": "In Progress", "color": "blue" },
              { "name": "Done", "color": "green" }
            ],
            "groups": [
              { "name": "Backlog", "color": "default", "option_ids": [] },
              { "name": "Active", "color": "default", "option_ids": [] },
              { "name": "Completed", "color": "default", "option_ids": [] }
            ]
          }
        }
      }
    }
  }'
```

## Notes & Best Practices

- Use property names consistently when referencing them in rollups or formulas.
- For relation/rollup, you can use either `*_property_name` fields or `*_property_id` fields.
- Prefer the raw passthrough for features beyond the simplified schema or when you need full parity with Notion’s API.
- The server logs request metadata but never logs secrets; it only checks presence of the Authorization header.

### Workspace creation constraints and fallbacks

Notion does not allow internal integrations to create pages at the workspace root. Because database creation ultimately needs a parent page, the server applies these fallbacks when you send `{ "workspace": true }` without `parent_page_id`:

1) If `NOTION_PARENT_PAGE_ID` (or `NOTION_HOLDING_PAGE_ID`) env var is set, it will be used as the parent page.
2) Else, if `NOTION_DB_ID` (or `NOTION_DB_URL`) is set, the server retrieves that database and reuses its parent page.
3) Else, it attempts to create a temporary holding page at the workspace root. If Notion rejects this (common for internal integrations), you’ll receive a 400 with guidance to either:
  - Provide `parent_page_id` explicitly, or
  - Set `NOTION_PARENT_PAGE_ID` env, or
  - Use a public integration with `insert_content` capability.

Recommendation: Configure `NOTION_PARENT_PAGE_ID` in production to make workspace-level requests deterministic and avoid errors.

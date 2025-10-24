# Update Notion Database Schema

Add new fields/columns and rename existing ones in an existing Notion database.

- Base URL (prod): https://api.wheniwas.me
- OpenAPI spec: https://api.wheniwas.me/openapi.yaml
- Auth: Bearer token (`Authorization: Bearer {CHATGPT_ACTION_SECRET}`)

## Endpoint

POST /chatgpt/notion-update-database

- Consequential: Yes
- Auth required: Yes

## What it does

- Adds new properties (columns) to a database using the same simplified definitions as creation (or raw passthrough)
- Renames existing properties by name
- Returns the updated database id and URL

## Request schema (summary)

- database_id: string (required)
  - Accepts full Notion URL or a 32-char raw ID; the server normalizes it to a hyphenated ID automatically.
- properties: object (required for adding properties)
  - Map of property name to:
    - Simplified definition: type + minimal fields
    - Or raw passthrough: { "raw": { ...NotionPropertyObject } }
- rename: object (optional)
  - Map of current property name to new name (string) or { name: "New Name" }

Supported simplified types (same as creation):
- Basic: title, rich_text, number (number_format), select (options[]), multi_select (options[]), status (options[]), date, checkbox, url, email, phone_number, people, files
- Calculated/linked: formula (expression), relation (database_id, relation_type, synced_property_*), rollup (relation_property_*, rollup_property_*, function)
- System: created_time, created_by, last_edited_time, last_edited_by, unique_id (prefix)

Notes:
- Type changes for existing properties aren’t supported here; use raw passthrough only if you know the exact Notion API semantics.
- Deleting properties isn’t exposed via this API to avoid destructive operations.

## Examples

Add fields

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-update-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "database_id": "YOUR_DB_ID",
    "properties": {
      "Assignee": { "type": "people" },
      "Points": { "type": "number", "number_format": "number" },
      "Priority": { "type": "select", "options": ["P1","P2","P3"] }
    }
  }'
```

Rename properties

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-update-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "database_id": "YOUR_DB_ID",
    "rename": {
      "Points": "Story Points",
      "Priority": "Severity"
    }
  }'
```

Add a rollup using names

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-update-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "database_id": "YOUR_DB_ID",
    "properties": {
      "Tasks": { "type": "relation", "database_id": "TARGET_TASKS_DB_ID", "relation_type": "single_property" },
      "Task Count": { "type": "rollup", "relation_property_name": "Tasks", "function": "count" }
    }
  }'
```

Raw passthrough (advanced)

```bash
curl -X POST https://api.wheniwas.me/chatgpt/notion-update-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "database_id": "YOUR_DB_ID",
    "properties": {
      "Status": {
        "raw": {
          "status": {
            "options": [
              { "name": "Planned", "color": "gray" },
              { "name": "In Progress", "color": "blue" },
              { "name": "Done", "color": "green" }
            ]
          }
        }
      }
    }
  }'
```

## Best Practices

- Prefer names consistently for relation/rollup references; use IDs when available for stability.
- Use raw only when you need full control and understand Notion’s constraints.
- This endpoint is intentionally non-destructive: it won’t remove properties.

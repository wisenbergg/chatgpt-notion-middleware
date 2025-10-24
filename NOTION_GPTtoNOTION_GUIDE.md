# GPT Actions – Notion API Connector Guide

A comprehensive technical guide for developers and power users leveraging GPT Actions to interact programmatically with Notion databases, pages, and blocks.

---

## Section 1: Overview

### Purpose  
The GPT Actions–Notion integration allows GPT models to **read from** and **write to** your Notion workspace. Through authenticated actions (`notionWrite`, `notionQuery`, `notionAppend`, `notionSearch`), GPT can manage databases, create or update pages, append structured content, and retrieve metadata—bridging conversational intelligence with structured data storage.

### Architecture  
```
GPT-5 ↔ GPT Actions Layer ↔ Notion API ↔ Notion Workspace
```
- **GPT-5**: Generates, interprets, and structures commands.  
- **GPT Actions Layer**: Secure middleware that translates model instructions into Notion API calls.  
- **Notion API**: Executes read/write operations on pages and databases.  
- **Workspace**: Your connected Notion environment (requires user authorization).

### Permissions  
- Integration token must have:  
  - `read` and `write` access to targeted databases/pages. :contentReference[oaicite:0]{index=0}  
  - Shared access via Notion’s **Connections** panel.  
- Scopes typically include:  
  - `database.query`, `database.read`, `page.create`, `page.update`, `block.append`.  
- Note: Attempting to query or modify a database not shared with the integration will result in a 403 or 404 error. :contentReference[oaicite:1]{index=1}

---

## Section 2: Function Documentation

### 1. `notionWrite`  
#### Purpose  
Creates or updates content in Notion databases or pages.

#### Parameters  
| Parameter     | Type           | Required | Description                                          |
|---------------|----------------|----------|------------------------------------------------------|
| `database_id` | string         | Optional | UUID of the target Notion database                  |
| `page_id`     | string         | Optional | UUID of the target page (for updates)               |
| `properties`  | object         | Required | Key-value mapping of Notion properties              |
| `content`     | string/object  | Optional | Rich text or block structure to insert              |
| `parent`      | object         | Optional | Parent reference if creating a new page             |
| `archived`    | boolean        | Optional | Whether to archive the page                          |
| `icon` / `cover` | object      | Optional | Page appearance metadata                             |

#### Output  
Returns a JSON object with metadata of the created or updated page, e.g.:  
```json
{
  "object": "page",
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "url": "https://www.notion.so/.../",
  "properties": { ... },
  "created_time": "2025-10-22T18:00:00.000Z"
}
```

#### Auth Requirements  
- GPT Action must be linked to an active Notion integration token.  
- Database or page must be explicitly shared with that integration.

---

### 2. `notionQuery`  
#### Purpose  
Retrieves pages or entries from a Notion database (or data source) based on filters or search terms.

#### Parameters  
| Parameter      | Type     | Required | Description                                         |
|----------------|----------|----------|-----------------------------------------------------|
| `database_id`  | string   | Required | ID of the database or data source to query          |
| `filter`       | object   | Optional | Structured filter (e.g., property conditions)       |
| `sorts`        | array    | Optional | Sort instructions for results                        |
| `page_size`    | integer  | Optional | Limit of results per query (default e.g. 100)       |
| `start_cursor` | string   | Optional | Pagination cursor for multi-page results            |

#### Output  
```json
{
  "object": "list",
  "results": [
    { "id": "...", "properties": { ... }, "url": "..." }
  ],
  "has_more": false,
  "next_cursor": null
}
```

#### Filter Example  
```json
"filter": {
  "property": "Status",
  "select": { "equals": "In Progress" }
}
```

---

### 3. `notionAppend`  
#### Purpose  
Appends structured blocks (text, headings, tables, etc.) to an existing page.

#### Parameters  
| Parameter | Type   | Required | Description                         |
|-----------|--------|----------|-------------------------------------|
| `page_id` | string | Required | Target page to append blocks        |
| `blocks`  | array  | Required | Array of block objects (paragraphs, tables, etc.) |

#### Example Request  
```json
{
  "action": "notionAppend",
  "page_id": "1234-5678",
  "blocks": [
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          { "type": "text", "text": { "content": "New section content." }}
        ]
      }
    }
  ]
}
```

#### Output  
Returns confirmation of appended blocks (metadata about new blocks inserted).

---

### 4. `notionSearch`  
#### Purpose  
Searches for pages or databases in the workspace by keyword or object type.

#### Parameters  
| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `query`   | string | Required | Search term                                      |
| `filter`  | object | Optional | Restrict to object type `"page"` or `"database"` |
| `sort`    | object | Optional | Sort by recency or relevance                      |

#### Output  
List of matching pages or databases with IDs and URLs.

---

## Section 3: Example Use Cases

### Use Case 1: Creating a New Page in a Database  
**Prompt:**  
> “Create a new page in my ‘Marketing Tasks’ database with title ‘Launch Beta Campaign’ and status ‘In Progress’.”  
**GPT Action Request:**  
```json
{
  "action": "notionWrite",
  "database_id": "abcd-1234",
  "properties": {
    "Name": {
      "title": [
        { "text": { "content": "Launch Beta Campaign" } }
      ]
    },
    "Status": {
      "select": { "name": "In Progress" }
    }
  }
}
```
**Expected Response:**  
✅ Page created with URL and metadata.

---

### Use Case 2: Querying a Database  
**Prompt:**  
> “Find all tasks marked ‘Overdue’ in my Project Tracker.”  
**GPT Action Request:**  
```json
{
  "action": "notionQuery",
  "database_id": "efgh-5678",
  "filter": {
    "property": "Status",
    "select": { "equals": "Overdue" }
  }
}
```
**Expected Response:**  
List of matching pages with IDs, properties, URLs.

---

### Use Case 3: Updating Existing Content  
**Prompt:**  
> “Update the status of ‘Beta Launch Campaign’ to ‘Complete.’”  
**GPT Action Request:**  
```json
{
  "action": "notionWrite",
  "page_id": "xxxx-yyyy",
  "properties": {
    "Status": {
      "select": { "name": "Complete" }
    }
  }
}
```
**Expected Response:**  
✅ Page updated with new status value.

---

### Use Case 4: Appending Structured Content  
**Prompt:**  
> “Append a project summary section to my ‘Launch Plan’ page.”  
**GPT Action Request:**  
```json
{
  "action": "notionAppend",
  "page_id": "xxxx-yyyy",
  "blocks": [
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [
          { "text": { "content": "Project Summary" } }
        ]
      }
    },
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          { "text": { "content": "The campaign achieved 35% higher engagement than projected." } }
        ]
      }
    }
  ]
}
```
**Expected Response:**  
✅ Blocks appended; page updated.

---

### Use Case 5: Searching or Retrieving Metadata  
**Prompt:**  
> “List all databases in my workspace.”  
**GPT Action Request:**  
```json
{
  "action": "notionSearch",
  "query": "",
  "filter": { "property": "object", "value": "database" }
}
```
**Expected Response:**  
List of databases with IDs, titles, URLs.

---

## Section 4: Replication Instructions

Follow these steps for each use case:

1. Enter the exact prompt (as shown above) into the GPT interface.  
2. The GPT model will respond with a structured **GPT Action** request JSON.  
3. The request will execute and generate a response.  
4. You’ll see the expected result (page created, updated, blocks appended, list returned).  
5. Example replication prompt:

```
Create a new page in my Notion database titled “Content Calendar.”
```

**GPT Action Request:**
```json
{
  "action": "notionWrite",
  "database_id": "abcd-1234",
  "properties": {
    "Name": {
      "title": [
        { "text": { "content": "Content Calendar" } }
      ]
    }
  }
}
```

**Expected GPT Response:**  
> ✅ “Created new page ‘Content Calendar’ in your Notion database.”

---

## Section 5: Troubleshooting & Limitations

| Issue                    | Cause                                  | Resolution                                               |
|--------------------------|----------------------------------------|----------------------------------------------------------|
| `unauthorized_client`    | Integration not shared with database   | Share database/page with integration and retry           |
| `invalid_json`           | Malformed request body                 | Validate JSON formatting (quotes, braces, arrays)         |
| `property not found`     | Property name mismatch                 | Ensure exact property key names as in Notion schema       |
| Rate limits              | Too many requests too quickly          | Queue actions or batch operations                         |
| Page size limits         | Max 100 results per `notionQuery`      | Use `start_cursor` to paginate through results           |
| Rich text truncation     | Exceeding block or content size        | Split large content into multiple blocks                 |

### Limitations  
- Some Notion block types or advanced features may not be fully supported via the connector.  
- Extensive nested block structures can lead to performance issues.  
- GPT’s natural-language interpretation might misidentify property names if schema changes — monitor property keys carefully.  
- The connector is subject to both Notion API rate limits and the GPT Actions platform limits.

---

## Section 6: Extended Notion Property Schema Appendix

### Overview  
The data-source (database) schema in Notion is defined via the `properties` object of a data source. Each property object must include:  
- `id` (string) — internal identifier  
- `name` (string) — the display name of the property  
- `type` (enum string) — the property type. Possible values include:  
  `"checkbox"`, `"created_by"`, `"created_time"`, `"date"`, `"email"`, `"files"`, `"formula"`, `"last_edited_by"`, `"last_edited_time"`, `"multi_select"`, `"number"`, `"people"`, `"phone_number"`, `"relation"`, `"rich_text"`, `"rollup"`, `"select"`, `"status"`, `"title"`, `"url"`. :contentReference[oaicite:2]{index=2}  
- A nested object whose key matches the `type`, which contains type-specific configuration.

Below is a breakdown of each property type, its config fields (if any), and an example.

---

#### `title`  
- Description: The primary title column of a row; every data source requires exactly one `title` type property. :contentReference[oaicite:3]{index=3}  
- Config object: empty `{}`  
- Example:
  ```json
  "Project name": {
    "id": "title",
    "name": "Project name",
    "type": "title",
    "title": {}
  }
  ```

---

#### `rich_text`  
- Description: Free-form text content (supports formatting)  
- Config object: empty `{}`  
- Example:
  ```json
  "Description": {
    "id": "NZZ%3B",
    "name": "Description",
    "type": "rich_text",
    "rich_text": {}
  }
  ```

---

#### `number`  
- Description: Numeric values (currency, percent, plain number)  
- Config fields:  
  - `format` (string enum): e.g., `"number"`, `"percent"`, `"dollar"`, etc. :contentReference[oaicite:4]{index=4}  
- Example:
  ```json
  "Price": {
    "id": "pX9Z",
    "name": "Price",
    "type": "number",
    "number": {
      "format": "dollar"
    }
  }
  ```

---

#### `select`  
- Description: Single-choice from a predefined list of options  
- Config fields:  
  - `options` (array of objects): each option has `id`, `name`, `color`. :contentReference[oaicite:5]{index=5}  
- Example:
  ```json
  "Food group": {
    "id": "%40Q%5BM",
    "name": "Food group",
    "type": "select",
    "select": {
      "options": [
        {
          "id": "e28f74fc-83a7-4469-8435-27eb18f9f9de",
          "name": "🥦Vegetable",
          "color": "purple"
        },
        {
          "id": "6132d771-b283-4cd9-ba44-b1ed30477c7f",
          "name": "🍎Fruit",
          "color": "red"
        }
      ]
    }
  }
  ```

---

#### `multi_select`  
- Description: Multiple-choice from a predefined list of options  
- Config fields:  
  - `options` (array like select) :contentReference[oaicite:6]{index=6}  
- Example:
  ```json
  "Tags": {
    "id": "flsb",
    "name": "Tags",
    "type": "multi_select",
    "multi_select": {
      "options": [
        {
          "id": "5de29601-9c24-4b04-8629-0bca891c5120",
          "name": "Duc Loi Market",
          "color": "blue"
        },
        {
          "id": "72ac0a6c-9e00-4e8c-80c5-720e4373e0b9",
          "name": "Nijiya Market",
          "color": "purple"
        }
      ]
    }
  }
  ```

---

#### `date`  
- Description: A date or date range  
- Config object: empty `{}`  
- Example:
  ```json
  "Due date": {
    "id": "AJP%7D",
    "name": "Due date",
    "type": "date",
    "date": {}
  }
  ```

---

#### `people`  
- Description: One or more users (workspace members/guests)  
- Config object: empty `{}`  
- Example:
  ```json
  "Project owner": {
    "id": "FlgQ",
    "name": "Project owner",
    "type": "people",
    "people": {}
  }
  ```

---

#### `files`  
- Description: File attachment(s) or external links  
- Config object: empty `{}`  
- Example:
  ```json
  "Product image": {
    "id": "pb%3E%5B",
    "name": "Product image",
    "type": "files",
    "files": {}
  }
  ```

---

#### `checkbox`  
- Description: Boolean true/false  
- Config object: empty `{}`  
- Example:
  ```json
  "Task complete": {
    "id": "BBla",
    "name": "Task complete",
    "type": "checkbox",
    "checkbox": {}
  }
  ```

---

#### `url`  
- Description: Web URL link  
- Config object: empty `{}`  
- Example:
  ```json
  "Project URL": {
    "id": "BZKU",
    "name": "Project URL",
    "type": "url",
    "url": {}
  }
  ```

---

#### `email`  
- Description: Email address  
- Config object: empty `{}`  
- Example:
  ```json
  "Contact email": {
    "id": "oZbC",
    "name": "Contact email",
    "type": "email",
    "email": {}
  }
  ```

---

#### `phone_number`  
- Description: Phone number  
- Config object: empty `{}`  
- Example:
  ```json
  "Contact phone number": {
    "id": "ULHa",
    "name": "Contact phone number",
    "type": "phone_number",
    "phone_number": {}
  }
  ```

---

#### `created_by`  
- Description: System-generated; person who created the row  
- Config object: empty `{}`  
- Example:
  ```json
  "Created by": {
    "id": "%5BJCR",
    "name": "Created by",
    "type": "created_by",
    "created_by": {}
  }
  ```

---

#### `created_time`  
- Description: System-generated timestamp of creation  
- Config object: empty `{}`  
- Example:
  ```json
  "Created time": {
    "id": "XcAf",
    "name": "Created time",
    "type": "created_time",
    "created_time": {}
  }
  ```

---

#### `last_edited_by`  
- Description: System-generated; who last edited the row  
- Config object: empty `{}`  
- Example:
  ```json
  "Last edited by": {
    "id": "jGdo",
    "name": "Last edited by",
    "type": "last_edited_by",
    "last_edited_by": {}
  }
  ```

---

#### `last_edited_time`  
- Description: System-generated timestamp of last edit  
- Config object: empty `{}`  
- Example:
  ```json
  "Last edited time": {
    "id": "jGdo",
    "name": "Last edited time",
    "type": "last_edited_time",
    "last_edited_time": {}
  }
  ```

---

#### `relation`  
- Description: Reference(s) to pages in another data source (database)  
- Config fields:  
  - `data_source_id` (string) — ID of the related data source. :contentReference[oaicite:7]{index=7}  
  - `dual_property` object (optional) — `{ "synced_property_name": string, "synced_property_id": string }`  
- Example:
  ```json
  "Projects": {
    "id": "~pex",
    "name": "Projects",
    "type": "relation",
    "relation": {
      "data_source_id": "6c4240a9-a3ce-413e-9fd0-8a51a4d0a49b",
      "dual_property": {
        "synced_property_name": "Tasks",
        "synced_property_id": "JU]K"
      }
    }
  }
  ```

- Note: The related data source must also be shared with your integration to work correctly. :contentReference[oaicite:8]{index=8}

---

#### `rollup`  
- Description: Aggregate values based on a `relation` property (e.g., sum of values in related pages, earliest date, etc.)  
- Config fields:  
  - `relation_property_name` (string) — name of the relation property  
  - `relation_property_id` (string) — id of the relation property  
  - `rollup_property_name` (string) — the name of the property in related pages to roll up  
  - `rollup_property_id` (string) — id of the rollup property  
  - `function` (string enum) — e.g., `"sum"`, `"average"`, `"min"`, `"max"`, `"latest_date"`, `"date_range"`, etc. :contentReference[oaicite:9]{index=9}  
- Example:
  ```json
  "Estimated total project time": {
    "id": "%5E%7Cy%3C",
    "name": "Estimated total project time",
    "type": "rollup",
    "rollup": {
      "relation_property_name": "Tasks",
      "relation_property_id": "Y]<y",
      "rollup_property_name": "Days to complete",
      "rollup_property_id": "\\nyY",
      "function": "sum"
    }
  }
  ```

- Note: Some rollup functions may return paginated results if the underlying relation set is large. :contentReference[oaicite:10]{index=10}

---

#### `formula`  
- Description: Computed values derived from other properties via a formula expression  
- Config fields:  
  - `expression` (string) — formula expression referencing other property values. :contentReference[oaicite:11]{index=11}  
- Example:
  ```json
  "Updated price": {
    "id": "YU%7C%40",
    "name": "Updated price",
    "type": "formula",
    "formula": {
      "expression": "{{notion:block_property:BtVS:00000000-0000-0000-0000-000000000000:8994905a-074a-415f-9bcf-d1f8b4fa38e4}}/2"
    }
  }
  ```

---

#### `status`  
- Description: Workflow/status tracking type (similar to select but with groups)  
- Config fields:  
  - `options` (array) — each option object: `id`, `name`, `color`  
  - `groups` (array) — each group object: `id`, `name`, `color`, `option_ids` (which option IDs belong in that group) :contentReference[oaicite:12]{index=12}  
- Example:
  ```json
  "Status": {
    "id": "biOx",
    "name": "Status",
    "type": "status",
    "status": {
      "options": [
        {
          "id": "034ece9a-384d-4d1f-97f7-7f685b29ae9b",
          "name": "Not started",
          "color": "default"
        },
        {
          "id": "330aeafb-598c-4e1c-bc13-1148aa5963d3",
          "name": "In progress",
          "color": "blue"
        }
      ],
      "groups": [
        {
          "id": "b9d42483-e576-4858-a26f-ed940a5f678f",
          "name": "To-do",
          "color": "gray",
          "option_ids": ["034ece9a-384d-4d1f-97f7-7f685b29ae9b"]
        }
      ]
    }
  }
  ```

- Limitations: You cannot update the `name` or `options` of a `status` property via the API; it must be updated via Notion UI. :contentReference[oaicite:13]{index=13}

---

### Summary Table  
| Property Type       | Config Present? | Notes                                          |
|----------------------|------------------|------------------------------------------------|
| title                | No               | Required one per data source                   |
| rich_text            | No               | Free-form text                                 |
| number               | Yes              | Numeric values, format config (currency etc.) |
| select               | Yes              | Single choice from options                     |
| multi_select         | Yes              | Multiple choices from options                  |
| date                 | No               | Date or range                                  |
| people               | No               | Assigned users                                 |
| files                | No               | Attachments                                    |
| checkbox             | No               | Boolean values                                 |
| url                  | No               | External links                                 |
| email                | No               | Email addresses                                |
| phone_number         | No               | Phone numbers                                  |
| created_by           | No               | System generated                               |
| created_time         | No               | System generated timestamp                    |
| last_edited_by       | No               | System generated                               |
| last_edited_time     | No               | System generated timestamp                    |
| relation             | Yes              | Links to other data source                     |
| rollup               | Yes              | Aggregated values from relation                |
| formula              | Yes              | Computed value based on other properties       |
| status               | Yes              | Workflow/status tracking                       |

### Notes & Caveats  
- This appendix covers **all publicly documented property types** and their type-specific configuration fields as of Notion API version 2025-09-03. :contentReference[oaicite:14]{index=14}  
- Some UI-only property types (e.g., `button`, `place`) might exist in the Notion app interface but are not yet exposed or fully documented via the API.  
- The property schema may evolve with future API versions (for example, the concept of “data source” vs “database” changed in version 2025-09-03). :contentReference[oaicite:15]{index=15}  
- Property names and IDs must match exactly when referencing properties in page creation/updating calls; case-sensitivity and encoding matter. :contentReference[oaicite:16]{index=16}  

---

## Conclusion  
This guide serves as the **complete operational manual** for GPT Actions with Notion.  
With these commands — `notionWrite`, `notionQuery`, `notionAppend`, and `notionSearch` — plus a full reference of Notion’s property schema, you can **build, query, and automate** your Notion workspace directly through GPT, enabling a new layer of seamless human–AI collaboration.

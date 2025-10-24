# ChatGPT Prompt Guide for Querying Notion Data

This guide provides optimal prompts for instructing ChatGPT to query and retrieve data from your Notion workspace using the `notionQuery` action.

## 🎯 Optimal Prompt Templates

### For Searching Notion Workspace

```
Search my Notion workspace for "[SEARCH_TERM]".

Use the notionQuery action with:
{
  "mode": "search",
  "query": "[SEARCH_TERM]"
}
```

**Example:**
```
Search my Notion workspace for "API Integration".

Use the notionQuery action with:
{
  "mode": "search",
  "query": "API Integration"
}
```

---

### For Searching Only Pages or Databases

```
Search for [pages/databases] containing "[SEARCH_TERM]".

Use the notionQuery action with:
{
  "mode": "search",
  "query": "[SEARCH_TERM]",
  "object": "[page/database]"
}
```

**Example:**
```
Search for databases containing "Customer".

Use the notionQuery action with:
{
  "mode": "search",
  "query": "Customer",
  "object": "database"
}
```

---

### For Querying Database Pages

```
Get all pages from database [DATABASE_ID].

Use the notionQuery action with:
{
  "mode": "db_query",
  "database_id": "[DATABASE_ID]"
}
```

**Example:**
```
Get all pages from database 39943bcc-9ec1-453e-bc02-41292073bc54.

Use the notionQuery action with:
{
  "mode": "db_query",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54"
}
```

---

### For Querying with Filters

```
Get pages from database [DATABASE_ID] where [CONDITION].

Use the notionQuery action with:
{
  "mode": "db_query",
  "database_id": "[DATABASE_ID]",
  "filter": {
    "property": "[PROPERTY_NAME]",
    "rich_text": {
      "contains": "[VALUE]"
    }
  }
}
```

**Example:**
```
Get pages from database 39943bcc-9ec1-453e-bc02-41292073bc54 where Status is "Active".

Use the notionQuery action with:
{
  "mode": "db_query",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "filter": {
    "property": "Status",
    "select": {
      "equals": "Active"
    }
  }
}
```

---

### For Sorting Query Results

```
Get pages from database [DATABASE_ID] sorted by [PROPERTY] in [ascending/descending] order.

Use the notionQuery action with:
{
  "mode": "db_query",
  "database_id": "[DATABASE_ID]",
  "sorts": [
    {
      "property": "[PROPERTY_NAME]",
      "direction": "[ascending/descending]"
    }
  ]
}
```

**Example:**
```
Get pages from database 39943bcc-9ec1-453e-bc02-41292073bc54 sorted by Priority in descending order.

Use the notionQuery action with:
{
  "mode": "db_query",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "sorts": [
    {
      "property": "Priority",
      "direction": "descending"
    }
  ]
}
```

---

### For Getting a Specific Page

```
Get the details of page [PAGE_ID].

Use the notionQuery action with:
{
  "mode": "page_get",
  "page_id": "[PAGE_ID]"
}
```

**Example:**
```
Get the details of page 123e4567-e89b-12d3-a456-426614174000.

Use the notionQuery action with:
{
  "mode": "page_get",
  "page_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### For Getting Database Information

```
Get the schema and properties of database [DATABASE_ID].

Use the notionQuery action with:
{
  "mode": "database_get",
  "database_id": "[DATABASE_ID]"
}
```

**Example:**
```
Get the schema and properties of database 39943bcc-9ec1-453e-bc02-41292073bc54.

Use the notionQuery action with:
{
  "mode": "database_get",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54"
}
```

---

### For Getting Data Source Information

```
Get the data source details for data source [DATA_SOURCE_ID].

Use the notionQuery action with:
{
  "mode": "data_source_get",
  "data_source_id": "[DATA_SOURCE_ID]"
}
```

**Example:**
```
Get the data source details for data source ed96d83a-bcbd-4d7f-a70c-e7c5da9addf5.

Use the notionQuery action with:
{
  "mode": "data_source_get",
  "data_source_id": "ed96d83a-bcbd-4d7f-a70c-e7c5da9addf5"
}
```

---

## 🔑 Key Elements that Make Prompts Optimal

### 1. Explicit Action Name
✅ `Use the notionQuery action` - Tells ChatGPT exactly which action to use

### 2. Specify the Mode
✅ Always include the `mode` field to indicate what type of query

### 3. Include Required IDs
✅ Provide `database_id`, `page_id`, or `data_source_id` as needed

### 4. Show Filter/Sort Structure
✅ When using filters or sorts, show the complete JSON structure

---

## 📋 Query Modes Reference

### Search Modes

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `search` | Search across workspace | `query` (optional) |

### Database Query Modes

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `db_query` | Query pages in a database | `database_id` |
| `data_source_query` | Query data source pages | `data_source_id` |

### Retrieval Modes

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `page_get` | Get a specific page | `page_id` |
| `database_get` | Get database metadata | `database_id` |
| `data_source_get` | Get data source schema | `data_source_id` |
| `page_property_get` | Get specific page property | `page_id`, `property_id` |

### Block Modes

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `block_get` | Get a specific block | `block_id` |
| `block_children_get` | Get child blocks | `block_id` |

---

## 🔍 Filter Types Reference

### Text Filters

```json
{
  "property": "PropertyName",
  "rich_text": {
    "contains": "search text"
  }
}
```

**Available operators:**
- `equals` - Exact match
- `does_not_equal` - Not equal
- `contains` - Contains substring
- `does_not_contain` - Does not contain
- `starts_with` - Starts with
- `ends_with` - Ends with
- `is_empty` - Is empty (true/false)
- `is_not_empty` - Is not empty (true/false)

### Number Filters

```json
{
  "property": "Price",
  "number": {
    "greater_than": 100
  }
}
```

**Available operators:**
- `equals` - Equal to
- `does_not_equal` - Not equal to
- `greater_than` - Greater than
- `less_than` - Less than
- `greater_than_or_equal_to` - Greater than or equal
- `less_than_or_equal_to` - Less than or equal
- `is_empty` - Is empty (true/false)
- `is_not_empty` - Is not empty (true/false)

### Checkbox Filters

```json
{
  "property": "Completed",
  "checkbox": {
    "equals": true
  }
}
```

### Select Filters

```json
{
  "property": "Status",
  "select": {
    "equals": "Active"
  }
}
```

**Available operators:**
- `equals` - Exact match
- `does_not_equal` - Not equal
- `is_empty` - Has no value
- `is_not_empty` - Has a value

### Multi-Select Filters

```json
{
  "property": "Tags",
  "multi_select": {
    "contains": "Urgent"
  }
}
```

### Date Filters

```json
{
  "property": "Due Date",
  "date": {
    "after": "2025-10-01"
  }
}
```

**Available operators:**
- `equals` - Exact date
- `before` - Before date
- `after` - After date
- `on_or_before` - On or before
- `on_or_after` - On or after
- `is_empty` - No date set
- `is_not_empty` - Has a date
- `past_week` - In the past week
- `past_month` - In the past month
- `past_year` - In the past year
- `next_week` - In the next week
- `next_month` - In the next month
- `next_year` - In the next year

### People Filters

```json
{
  "property": "Assignee",
  "people": {
    "contains": "user-id-here"
  }
}
```

---

## 🔀 Compound Filters

### AND Filter

```json
{
  "filter": {
    "and": [
      {
        "property": "Status",
        "select": { "equals": "Active" }
      },
      {
        "property": "Priority",
        "select": { "equals": "High" }
      }
    ]
  }
}
```

### OR Filter

```json
{
  "filter": {
    "or": [
      {
        "property": "Status",
        "select": { "equals": "Active" }
      },
      {
        "property": "Status",
        "select": { "equals": "Pending" }
      }
    ]
  }
}
```

---

## 📊 Sorting Reference

### Single Sort

```json
{
  "sorts": [
    {
      "property": "Created Date",
      "direction": "descending"
    }
  ]
}
```

### Multiple Sorts

```json
{
  "sorts": [
    {
      "property": "Priority",
      "direction": "descending"
    },
    {
      "property": "Due Date",
      "direction": "ascending"
    }
  ]
}
```

### Sort by Timestamps

```json
{
  "sorts": [
    {
      "timestamp": "created_time",
      "direction": "descending"
    }
  ]
}
```

**Available timestamps:**
- `created_time` - When the page was created
- `last_edited_time` - When the page was last edited

---

## 💡 Pro Tips

1. **Pagination:** Use `page_size` (max 100) to control results per request
2. **Max Results:** Use `max_results` (max 500) to automatically loop through all pages
3. **Search Scope:** Use `object: "page"` or `object: "database"` to narrow search results
4. **Filter Precision:** Combine multiple filters with `and`/`or` for precise queries
5. **Sort Order:** Apply multiple sorts - first sort takes priority
6. **Data Sources:** For databases using 2025-09-03 API, query the data source directly
7. **Property IDs:** Use `page_property_get` mode to retrieve large property values (like long text)

---

## ⚠️ What to Avoid

❌ Forgetting to include the required `mode` field
❌ Using `database_id` when you need `data_source_id`
❌ Setting `page_size` greater than 100
❌ Complex filters without proper JSON structure
❌ Sorting by properties that don't exist in the database

---

## 🎯 The Ultimate Power Prompt

For comprehensive queries with filters and sorting:

```
I need to query my Notion database using the notionQuery action.

Database ID: 39943bcc-9ec1-453e-bc02-41292073bc54

Get all pages where:
- Status is "Active" OR "In Progress"
- Priority is "High"
- Created in the last month

Sort by Due Date ascending, then by Priority descending.

Limit to 50 results.

Use this structure:
{
  "mode": "db_query",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "filter": {
    "and": [
      {
        "or": [
          {
            "property": "Status",
            "select": { "equals": "Active" }
          },
          {
            "property": "Status",
            "select": { "equals": "In Progress" }
          }
        ]
      },
      {
        "property": "Priority",
        "select": { "equals": "High" }
      },
      {
        "property": "Created Date",
        "date": { "past_month": {} }
      }
    ]
  },
  "sorts": [
    {
      "property": "Due Date",
      "direction": "ascending"
    },
    {
      "property": "Priority",
      "direction": "descending"
    }
  ],
  "page_size": 50
}

Execute this now.
```

---

## 🔧 Troubleshooting

### No results returned

**Problem:** Query returns empty results

**Solution:**
1. Verify the database ID is correct
2. Check that filters match actual property values (case-sensitive)
3. Ensure the database has pages that match your filter criteria
4. Try removing filters to see all pages first

### "Property not found" error

**Problem:** Filter references a property that doesn't exist

**Solution:**
- Use `database_get` mode to see all available properties
- Check property name spelling and capitalization
- Ensure you're using the correct property type in the filter

### Pagination issues

**Problem:** Not getting all results

**Solution:**
- Use `max_results` instead of manually handling `start_cursor`
- The API will automatically loop through pages up to your `max_results` limit
- Default `page_size` is 100 (the maximum)

### Date filters not working

**Problem:** Date filter returns unexpected results

**Solution:**
- Use ISO 8601 format: `"2025-10-31"` or `"2025-10-31T14:30:00"`
- For relative dates, use `past_week`, `past_month`, `next_week`, etc.
- Check timezone considerations for date comparisons

---

## 🚀 Real-World Examples

### Example 1: Get All Active High-Priority Tasks

```
Get all active high-priority tasks from project database proj-123 using notionQuery:

{
  "mode": "db_query",
  "database_id": "proj-123",
  "filter": {
    "and": [
      {
        "property": "Status",
        "select": { "equals": "Active" }
      },
      {
        "property": "Priority",
        "select": { "equals": "High" }
      }
    ]
  },
  "sorts": [
    {
      "property": "Due Date",
      "direction": "ascending"
    }
  ]
}
```

### Example 2: Search for Recent API Documentation

```
Search for pages containing "API" that were edited in the past week using notionQuery:

{
  "mode": "search",
  "query": "API",
  "object": "page"
}

Note: The API doesn't support filtering search by date, so you'll need to filter results after retrieval.
```

### Example 3: Get Overdue Tasks

```
Get all incomplete tasks with due dates before today from tasks database task-456:

{
  "mode": "db_query",
  "database_id": "task-456",
  "filter": {
    "and": [
      {
        "property": "Completed",
        "checkbox": { "equals": false }
      },
      {
        "property": "Due Date",
        "date": { "before": "2025-10-23" }
      }
    ]
  },
  "sorts": [
    {
      "property": "Due Date",
      "direction": "ascending"
    },
    {
      "property": "Priority",
      "direction": "descending"
    }
  ]
}
```

### Example 4: Get Customer List by Revenue

```
Get all active customers sorted by revenue from customer database cust-789:

{
  "mode": "db_query",
  "database_id": "cust-789",
  "filter": {
    "property": "Account Status",
    "select": { "equals": "Active" }
  },
  "sorts": [
    {
      "property": "Revenue",
      "direction": "descending"
    }
  ],
  "page_size": 100
}
```

### Example 5: Get All Unassigned Tasks

```
Get all tasks that have no assignee from project database proj-123:

{
  "mode": "db_query",
  "database_id": "proj-123",
  "filter": {
    "property": "Assignee",
    "people": { "is_empty": true }
  },
  "sorts": [
    {
      "property": "Created Date",
      "direction": "descending"
    }
  ]
}
```

### Example 6: Get Database Schema

```
Get all properties and their types from database db-abc:

{
  "mode": "database_get",
  "database_id": "db-abc"
}

This returns the full database object including:
- All property definitions
- Property types and configurations
- Database title and description
- Data source IDs
```

### Example 7: Get Specific Page Details

```
Get full details of a specific page including all properties:

{
  "mode": "page_get",
  "page_id": "page-123-456-789"
}

This returns:
- All property values
- Page metadata (created time, last edited, etc.)
- Parent information
- URL
```

---

## 📚 Additional Information

### Query Parameters Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | string | **Required.** Type of query to perform |
| `query` | string | Search term for `search` mode |
| `object` | string | Filter by `"page"` or `"database"` |
| `database_id` | string | Database to query |
| `data_source_id` | string | Data source to query |
| `page_id` | string | Page to retrieve |
| `filter` | object | Filter conditions |
| `sorts` | array | Sort criteria |
| `page_size` | number | Results per page (1-100) |
| `start_cursor` | string | Pagination cursor |
| `max_results` | number | Auto-loop up to this many results (1-500) |

### Response Format

**Success (200):**
```json
{
  "ok": true,
  "result": {
    "mode": "db_query",
    "results": [...],
    "has_more": false,
    "next_cursor": null
  }
}
```

For single item retrieval (`page_get`, `database_get`, `data_source_get`):
```json
{
  "ok": true,
  "result": {
    "mode": "page_get",
    "page": { /* full page object */ }
  }
}
```

---

## 🔗 Related Documentation

- [Adding Pages Guide](./CHATGPT_PAGES.md) - How to create pages in databases
- [Adding Properties Guide](./CHATGPT_PROMPTS.md) - How to add columns to databases
- [API Documentation](https://api.wheniwas.me/openapi.yaml) - Full OpenAPI specification
- [Notion API Reference](https://developers.notion.com/reference) - Official filter documentation

---

## 🚀 Quick Start Checklist

Before asking ChatGPT to query Notion:

- [ ] Know what type of query you need (search, db_query, page_get, etc.)
- [ ] Have the relevant IDs ready (database_id, page_id, data_source_id)
- [ ] Understand your filter requirements
- [ ] Decide on sort order if needed
- [ ] Consider pagination needs (page_size, max_results)
- [ ] Verify database is shared with your Notion integration
- [ ] Use one of the prompt templates above

---

*Last updated: October 23, 2025*
*API Version: 5.0.0*
*Base URL: https://api.wheniwas.me*
*Notion API Version: 2025-09-03*

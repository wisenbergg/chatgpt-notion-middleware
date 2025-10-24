# ChatGPT Prompt Guide for Adding Notion Database Properties

This guide provides optimal prompts for instructing ChatGPT to add properties to your Notion databases using the `notionUpdateDatabaseV5` action.

## 🎯 Optimal Prompt Templates

### For Adding a Single Property

```
Add a [TYPE] property called "[NAME]" to database [DATABASE_ID].

Use the notionUpdateDatabaseV5 action with these parameters:
- database_id: "[DATABASE_ID]"
- properties: {
    "[NAME]": {
      "type": "[TYPE]"
    }
  }
```

**Example:**
```
Add a rich_text property called "Notes" to database 39943bcc-9ec1-453e-bc02-41292073bc54.

Use the notionUpdateDatabaseV5 action with these parameters:
- database_id: "39943bcc-9ec1-453e-bc02-41292073bc54"
- properties: {
    "Notes": {
      "type": "rich_text"
    }
  }
```

---

### For Adding Multiple Properties

```
Add these properties to database [DATABASE_ID]:

1. [NAME1] - [TYPE1]
2. [NAME2] - [TYPE2]
3. [NAME3] - [TYPE3]

Use the notionUpdateDatabaseV5 action with this exact JSON structure:
{
  "database_id": "[DATABASE_ID]",
  "properties": {
    "[NAME1]": {"type": "[TYPE1]"},
    "[NAME2]": {"type": "[TYPE2]"},
    "[NAME3]": {"type": "[TYPE3]"}
  }
}
```

**Example:**
```
Add these properties to database 39943bcc-9ec1-453e-bc02-41292073bc54:

1. Contact Person - people
2. Integration Date - date
3. Notes - rich_text

Use the notionUpdateDatabaseV5 action with this exact JSON structure:
{
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "properties": {
    "Contact Person": {"type": "people"},
    "Integration Date": {"type": "date"},
    "Notes": {"type": "rich_text"}
  }
}
```

---

### For Select/Multi-Select with Options

```
Add a select property called "[NAME]" to database [DATABASE_ID] with these options: [OPTION1], [OPTION2], [OPTION3].

Use the notionUpdateDatabaseV5 action with:
{
  "database_id": "[DATABASE_ID]",
  "properties": {
    "[NAME]": {
      "type": "select",
      "options": ["[OPTION1]", "[OPTION2]", "[OPTION3]"]
    }
  }
}
```

**Example:**
```
Add a select property called "Priority" to database 39943bcc-9ec1-453e-bc02-41292073bc54 with these options: High, Medium, Low.

Use the notionUpdateDatabaseV5 action with:
{
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "properties": {
    "Priority": {
      "type": "select",
      "options": ["High", "Medium", "Low"]
    }
  }
}
```

---

### For Status Properties

```
Add a status property called "[NAME]" to database [DATABASE_ID].

Use the notionUpdateDatabaseV5 action with:
{
  "database_id": "[DATABASE_ID]",
  "properties": {
    "[NAME]": {
      "type": "status"
    }
  }
}
```

**Example:**
```
Add a status property called "Status" to database 39943bcc-9ec1-453e-bc02-41292073bc54.

Use the notionUpdateDatabaseV5 action with:
{
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "properties": {
    "Status": {
      "type": "status"
    }
  }
}
```

> **Note:** Status properties are created with default groups and options. To customize these, you must do so through the Notion UI after creation.

---

### For Number Properties with Formatting

```
Add a number property called "[NAME]" formatted as [FORMAT] to database [DATABASE_ID].

Use the notionUpdateDatabaseV5 action with:
{
  "database_id": "[DATABASE_ID]",
  "properties": {
    "[NAME]": {
      "type": "number",
      "number_format": "[FORMAT]"
    }
  }
}
```

**Example:**
```
Add a number property called "Price" formatted as dollar to database 39943bcc-9ec1-453e-bc02-41292073bc54.

Use the notionUpdateDatabaseV5 action with:
{
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "properties": {
    "Price": {
      "type": "number",
      "number_format": "dollar"
    }
  }
}
```

---

## 🔑 Key Elements that Make Prompts Optimal

### 1. Explicit Action Name
✅ `Use the notionUpdateDatabaseV5 action` - Tells ChatGPT exactly which action to use

### 2. Show the JSON Structure
✅ Providing the actual JSON structure helps ChatGPT understand the format

### 3. Include Both Required Fields
✅ Always mention both `database_id` AND `properties` explicitly

### 4. Use Correct Property Types
✅ Use the exact type names from the API (see reference below)

---

## 📋 Property Types Reference

### Basic Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `rich_text` | Text field | None |
| `number` | Numeric values | Optional: `number_format` |
| `checkbox` | True/false | None |
| `date` | Date values | None |
| `url` | URLs | None |
| `email` | Email addresses | None |
| `phone_number` | Phone numbers | None |

### Selection Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `select` | Single option dropdown | **Required:** `options` array |
| `multi_select` | Multiple options | **Required:** `options` array |
| `status` | Status workflow | Optional: `options` and `groups` |

### People Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `people` | People mentions | None |
| `created_by` | Auto: Page creator | None |
| `last_edited_by` | Auto: Last editor | None |

### Timestamp Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `created_time` | Auto: Creation timestamp | None |
| `last_edited_time` | Auto: Last edit timestamp | None |

### Advanced Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `formula` | Calculated values | **Required:** `expression` |
| `relation` | Link to another database | **Required:** `database_id` |
| `rollup` | Aggregate from relations | **Required:** `relation_property_name`, `function` |
| `files` | File attachments | None |
| `unique_id` | Auto-incrementing IDs | Optional: `prefix` |

### Number Formats

When using `type: "number"`, you can specify `number_format`:

- `number` - Plain number
- `number_with_commas` - 1,234.56
- `percent` - Percentage
- `dollar` - US Dollar
- `euro` - Euro
- `pound` - British Pound
- `yen` - Japanese Yen
- `yuan` - Chinese Yuan
- `won` - Korean Won
- `rupee` - Indian Rupee
- And many more currency formats...

---

## 💡 Pro Tips

1. **Be Specific:** Don't say "add fields" - say "add properties"
2. **Show the Structure:** Providing JSON helps ChatGPT understand
3. **Use Exact Type Names:** `rich_text` not `text`
4. **Mention Both Required Fields:** `database_id` AND `properties`
5. **One Prompt for Multiple Properties:** You can add many properties in one call
6. **Property Names:** Can contain spaces and special characters
7. **Options Uniqueness:** For select/multi-select, option names must be unique (case-insensitive)

---

## ⚠️ What to Avoid

❌ "Add some fields to my database"
❌ "Update the database with these columns"
❌ "Create new properties" (without specifying the structure)
❌ Using wrong type names like "text" instead of "rich_text"
❌ Forgetting to include the `properties` field
❌ Using commas in select/multi-select option names

---

## 🎯 The Ultimate Power Prompt

If you want to be absolutely sure ChatGPT does it right, use this comprehensive format:

```
I need to add properties to my Notion database using the notionUpdateDatabaseV5 action.

Database ID: 39943bcc-9ec1-453e-bc02-41292073bc54

Add these properties:
- Contact Person (type: people)
- Priority (type: select, options: High, Medium, Low)
- Notes (type: rich_text)
- Price (type: number, format: dollar)
- Due Date (type: date)

You MUST send a request with this structure:
{
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "properties": {
    "Contact Person": {"type": "people"},
    "Priority": {"type": "select", "options": ["High", "Medium", "Low"]},
    "Notes": {"type": "rich_text"},
    "Price": {"type": "number", "number_format": "dollar"},
    "Due Date": {"type": "date"}
  }
}

Do not omit the properties field. Execute this now.
```

---

## 🔧 Troubleshooting

### ChatGPT only sends database_id without properties

**Problem:** Response shows `'No properties or renames provided.'`

**Solution:** 
1. Re-import the OpenAPI schema: `https://api.wheniwas.me/openapi.yaml`
2. Use the "Ultimate Power Prompt" format above
3. Explicitly show the JSON structure in your prompt

### Properties aren't being created

**Problem:** API returns success but properties don't appear

**Solution:**
1. Verify you're using the correct database ID
2. Check that property types are spelled correctly
3. Ensure you have permissions to the database in Notion
4. For select/multi-select, verify option names don't contain commas

### Select/Multi-select options not working

**Problem:** Options aren't being created correctly

**Solution:**
- Use the `options` array with string values: `["Option1", "Option2"]`
- Don't use commas within option names
- Ensure option names are unique (case-insensitive)

---

## 📚 Additional Resources

- [API Documentation](https://api.wheniwas.me/openapi.yaml)
- [Notion API Reference](https://developers.notion.com/reference)
- [Database Properties Guide](./UPDATE_DATABASE.md)

---

## 🎓 Real-World Examples

### Example 1: Project Management Database

```
Add these properties to database abc123:

1. Project Owner - people
2. Status - status
3. Priority - select with options: Critical, High, Medium, Low
4. Due Date - date
5. Budget - number formatted as dollar
6. Progress - number formatted as percent
7. Notes - rich_text

Use notionUpdateDatabaseV5 with:
{
  "database_id": "abc123",
  "properties": {
    "Project Owner": {"type": "people"},
    "Status": {"type": "status"},
    "Priority": {"type": "select", "options": ["Critical", "High", "Medium", "Low"]},
    "Due Date": {"type": "date"},
    "Budget": {"type": "number", "number_format": "dollar"},
    "Progress": {"type": "number", "number_format": "percent"},
    "Notes": {"type": "rich_text"}
  }
}
```

### Example 2: Customer Database

```
Add these properties to database xyz789:

1. Company Name - rich_text
2. Contact Email - email
3. Phone - phone_number
4. Website - url
5. Account Status - select with options: Active, Inactive, Trial
6. Created Date - created_time
7. Last Contact - date

Use notionUpdateDatabaseV5 with:
{
  "database_id": "xyz789",
  "properties": {
    "Company Name": {"type": "rich_text"},
    "Contact Email": {"type": "email"},
    "Phone": {"type": "phone_number"},
    "Website": {"type": "url"},
    "Account Status": {"type": "select", "options": ["Active", "Inactive", "Trial"]},
    "Created Date": {"type": "created_time"},
    "Last Contact": {"type": "date"}
  }
}
```

### Example 3: Inventory Database

```
Add these properties to database inv456:

1. Product Name - rich_text
2. SKU - unique_id with prefix PROD
3. Category - select with options: Electronics, Clothing, Food, Books
4. In Stock - checkbox
5. Quantity - number
6. Price - number formatted as dollar
7. Supplier - relation to database supplier123
8. Last Restock - date

Use notionUpdateDatabaseV5 with:
{
  "database_id": "inv456",
  "properties": {
    "Product Name": {"type": "rich_text"},
    "SKU": {"type": "unique_id", "prefix": "PROD"},
    "Category": {"type": "select", "options": ["Electronics", "Clothing", "Food", "Books"]},
    "In Stock": {"type": "checkbox"},
    "Quantity": {"type": "number"},
    "Price": {"type": "number", "number_format": "dollar"},
    "Supplier": {"type": "relation", "database_id": "supplier123"},
    "Last Restock": {"type": "date"}
  }
}
```

---

## 🚀 Quick Start Checklist

Before asking ChatGPT to add properties:

- [ ] Have your database ID ready
- [ ] Know the property names you want
- [ ] Know the property types you need
- [ ] For select/multi-select: have your options list ready
- [ ] Have re-imported the latest OpenAPI schema
- [ ] Use one of the prompt templates above
- [ ] Include the complete JSON structure in your prompt
- [ ] Verify database is shared with your Notion integration

---

*Last updated: October 23, 2025*
*API Version: 5.0.0*
*Base URL: https://api.wheniwas.me*

# ChatGPT Prompt Guide for Creating Notion Databases

This guide provides optimal prompts for instructing ChatGPT to create new databases in your Notion workspace using the `notionCreateDatabase` action.

## 🎯 Optimal Prompt Templates

### For Creating a Simple Database

```
Create a new database called "[DATABASE_TITLE]" under page [PAGE_ID].

Use the notionCreateDatabase action with:
{
  "parent_page_id": "[PAGE_ID]",
  "title": "[DATABASE_TITLE]",
  "properties": {
    "Name": { "type": "title" }
  }
}
```

**Example:**
```
Create a new database called "Customer Contacts" under page abc-123-def-456.

Use the notionCreateDatabase action with:
{
  "parent_page_id": "abc-123-def-456",
  "title": "Customer Contacts",
  "properties": {
    "Name": { "type": "title" }
  }
}
```

---

### For Creating a Database with Multiple Properties

```
Create a new database called "[TITLE]" under page [PAGE_ID] with these properties:
- [Property1] ([type1])
- [Property2] ([type2])
- [Property3] ([type3])

Use the notionCreateDatabase action with:
{
  "parent_page_id": "[PAGE_ID]",
  "title": "[TITLE]",
  "properties": {
    "Name": { "type": "title" },
    "[Property1]": { "type": "[type1]" },
    "[Property2]": { "type": "[type2]" },
    "[Property3]": { "type": "[type3]" }
  }
}
```

**Example:**
```
Create a new database called "Project Tasks" under page abc-123-def-456 with these properties:
- Name (title)
- Assignee (people)
- Status (status)
- Due Date (date)
- Priority (select)

Use the notionCreateDatabase action with:
{
  "parent_page_id": "abc-123-def-456",
  "title": "Project Tasks",
  "properties": {
    "Name": { "type": "title" },
    "Assignee": { "type": "people" },
    "Status": { "type": "status" },
    "Due Date": { "type": "date" },
    "Priority": { 
      "type": "select",
      "options": ["High", "Medium", "Low"]
    }
  }
}
```

---

### For Creating a Database at Workspace Root

```
Create a new database called "[TITLE]" at the workspace root.

Use the notionCreateDatabase action with:
{
  "workspace": true,
  "title": "[TITLE]",
  "properties": {
    "Name": { "type": "title" }
  }
}
```

**Example:**
```
Create a new database called "Company Directory" at the workspace root.

Use the notionCreateDatabase action with:
{
  "workspace": true,
  "title": "Company Directory",
  "properties": {
    "Name": { "type": "title" },
    "Email": { "type": "email" },
    "Department": { "type": "select", "options": ["Engineering", "Sales", "Marketing"] },
    "Phone": { "type": "phone_number" }
  }
}
```

---

### For Creating a Database with Select Options

```
Create a database with select properties that have predefined options.

Use the notionCreateDatabase action with:
{
  "parent_page_id": "[PAGE_ID]",
  "title": "[TITLE]",
  "properties": {
    "Name": { "type": "title" },
    "[SelectProperty]": {
      "type": "select",
      "options": ["Option1", "Option2", "Option3"]
    }
  }
}
```

**Example:**
```
Create a database called "Customer Leads" with a Status field.

Use the notionCreateDatabase action with:
{
  "parent_page_id": "abc-123-def-456",
  "title": "Customer Leads",
  "properties": {
    "Name": { "type": "title" },
    "Company": { "type": "rich_text" },
    "Email": { "type": "email" },
    "Status": {
      "type": "select",
      "options": ["New", "Contacted", "Qualified", "Negotiating", "Won", "Lost"]
    },
    "Lead Source": {
      "type": "select",
      "options": ["Website", "Referral", "Conference", "Cold Call"]
    },
    "Expected Revenue": {
      "type": "number",
      "number_format": "dollar"
    }
  }
}
```

---

## 🔑 Key Elements that Make Prompts Optimal

### 1. Explicit Action Name
✅ `Use the notionCreateDatabase action` - Tells ChatGPT exactly which action to use

### 2. Specify Parent or Workspace
✅ Include either `parent_page_id` OR `workspace: true` (not both)

### 3. Always Include Title Property
✅ Every database needs a `"Name": { "type": "title" }` property

### 4. Show Complete JSON Structure
✅ Providing the full JSON structure ensures correct formatting

---

## 📋 Property Types Reference

### Basic Property Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `title` | Database title field | **Required** - Must have one |
| `rich_text` | Text field | None |
| `number` | Numeric values | Optional: `number_format` |
| `checkbox` | True/false | None |
| `date` | Date values | None |
| `url` | URLs | None |
| `email` | Email addresses | None |
| `phone_number` | Phone numbers | None |

### Selection Property Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `select` | Single selection dropdown | Optional: `options` array |
| `multi_select` | Multiple selections | Optional: `options` array |
| `status` | Status workflow | Optional: `options` and `groups` |

### People & Timestamp Property Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `people` | User mentions | None |
| `created_by` | Auto: Page creator | None |
| `last_edited_by` | Auto: Last editor | None |
| `created_time` | Auto: Creation time | None |
| `last_edited_time` | Auto: Last edit time | None |

### Advanced Property Types

| Type | Description | Additional Config |
|------|-------------|-------------------|
| `files` | File attachments | None |
| `formula` | Calculated values | **Required:** `expression` |
| `relation` | Link to another database | **Required:** `database_id` |
| `rollup` | Aggregate from relations | **Required:** `relation_property_name`, `function` |
| `unique_id` | Auto-incrementing IDs | Optional: `prefix` |

### Number Formats

When using `type: "number"`, you can specify `number_format`:

- `number` - Plain number (default)
- `number_with_commas` - 1,234.56
- `percent` - Percentage (0.15 displays as 15%)
- `dollar` - US Dollar ($)
- `euro` - Euro (€)
- `pound` - British Pound (£)
- `yen` - Japanese Yen (¥)
- `yuan` - Chinese Yuan (¥)
- `won` - Korean Won (₩)
- `rupee` - Indian Rupee (₹)
- And many more currency formats...

---

## 💡 Pro Tips

1. **Title Property Required:** Every database MUST have exactly one property with `type: "title"`
2. **Name Convention:** The title property is typically named "Name" but can be any name
3. **Workspace vs Parent:** Use `workspace: true` OR `parent_page_id`, never both
4. **Property Order:** Properties appear in Notion in the order you define them
5. **Select Options:** Provide options when creating select/multi-select for better UX
6. **Formula Expressions:** Use Notion's formula syntax (e.g., `prop("Name") + " - " + prop("Status")`)
7. **Relations:** You can create relation properties if the target database already exists
8. **Unique IDs:** Great for generating SKUs, ticket numbers, etc.

---

## ⚠️ What to Avoid

❌ Forgetting to include a title property (`type: "title"`)
❌ Including both `parent_page_id` and `workspace: true`
❌ Omitting the `title` field for the database name
❌ Creating relation properties without valid `database_id`
❌ Using invalid formula expressions
❌ Specifying options for property types that don't support them

---

## 🎯 The Ultimate Power Prompt

For creating a comprehensive database with multiple property types:

```
I need to create a new Notion database using the notionCreateDatabase action.

Parent Page ID: abc-123-def-456

Create a database called "Customer Relationship Manager" with these properties:

1. Name (title) - Company name
2. Contact Person (people)
3. Email (email)
4. Phone (phone_number)
5. Website (url)
6. Status (select) - Options: Lead, Qualified, Customer, Inactive
7. Lead Source (select) - Options: Website, Referral, Conference, Cold Outreach
8. Priority (select) - Options: High, Medium, Low
9. Expected Revenue (number, dollar format)
10. Contract Value (number, dollar format)
11. Close Probability (number, percent format)
12. First Contact (date)
13. Last Contact (date)
14. Active (checkbox)
15. Tags (multi_select) - Options: Enterprise, SMB, Partner, VIP
16. Notes (rich_text)
17. Created Date (created_time)
18. Last Modified (last_edited_time)

Use this exact structure:
{
  "parent_page_id": "abc-123-def-456",
  "title": "Customer Relationship Manager",
  "properties": {
    "Name": { "type": "title" },
    "Contact Person": { "type": "people" },
    "Email": { "type": "email" },
    "Phone": { "type": "phone_number" },
    "Website": { "type": "url" },
    "Status": {
      "type": "select",
      "options": ["Lead", "Qualified", "Customer", "Inactive"]
    },
    "Lead Source": {
      "type": "select",
      "options": ["Website", "Referral", "Conference", "Cold Outreach"]
    },
    "Priority": {
      "type": "select",
      "options": ["High", "Medium", "Low"]
    },
    "Expected Revenue": {
      "type": "number",
      "number_format": "dollar"
    },
    "Contract Value": {
      "type": "number",
      "number_format": "dollar"
    },
    "Close Probability": {
      "type": "number",
      "number_format": "percent"
    },
    "First Contact": { "type": "date" },
    "Last Contact": { "type": "date" },
    "Active": { "type": "checkbox" },
    "Tags": {
      "type": "multi_select",
      "options": ["Enterprise", "SMB", "Partner", "VIP"]
    },
    "Notes": { "type": "rich_text" },
    "Created Date": { "type": "created_time" },
    "Last Modified": { "type": "last_edited_time" }
  }
}

Execute this now.
```

---

## 🔧 Troubleshooting

### "Title property required" error

**Problem:** Database creation fails due to missing title property

**Solution:**
- Every database must have exactly ONE property with `type: "title"`
- Usually named "Name" but can be any name you want
- Example: `"Name": { "type": "title" }`

### "Must specify parent_page_id or workspace" error

**Problem:** Neither parent_page_id nor workspace flag provided

**Solution:**
- Include `"parent_page_id": "your-page-id"` to create under a page
- OR include `"workspace": true` to create at workspace root
- Do NOT include both

### Database created but properties missing

**Problem:** Database created successfully but properties not appearing

**Solution:**
- Verify property types are spelled correctly
- Check that select/multi-select options are in correct format
- For advanced properties (formula, relation, rollup), ensure all required fields provided
- Wait a few seconds and refresh Notion - sometimes there's a delay

### Invalid formula expression

**Problem:** Formula property causes error

**Solution:**
- Use Notion's formula syntax: `prop("PropertyName")`
- Test formula in Notion UI first to verify syntax
- Common functions: `+`, `-`, `*`, `/`, `concat()`, `if()`, `format()`
- Dates: `prop("Date").start`, `now()`, `dateAdd()`

### Relation property fails

**Problem:** Cannot create relation property

**Solution:**
- Target database must already exist
- Use the full database ID for `database_id` field
- Specify `relation_type`: `"single_property"` or `"dual_property"`
- Example:
  ```json
  "Related Items": {
    "type": "relation",
    "database_id": "target-db-id",
    "relation_type": "dual_property"
  }
  ```

---

## 🚀 Real-World Examples

### Example 1: Project Management Database

```
Create a project management database using notionCreateDatabase:

{
  "parent_page_id": "workspace-page-123",
  "title": "Project Tracker",
  "properties": {
    "Name": { "type": "title" },
    "Project Manager": { "type": "people" },
    "Status": {
      "type": "status"
    },
    "Priority": {
      "type": "select",
      "options": ["Critical", "High", "Medium", "Low"]
    },
    "Start Date": { "type": "date" },
    "Due Date": { "type": "date" },
    "Budget": {
      "type": "number",
      "number_format": "dollar"
    },
    "Progress": {
      "type": "number",
      "number_format": "percent"
    },
    "Team Members": { "type": "people" },
    "Tags": {
      "type": "multi_select",
      "options": ["Client Work", "Internal", "R&D", "Maintenance"]
    },
    "Description": { "type": "rich_text" },
    "Created": { "type": "created_time" },
    "Last Updated": { "type": "last_edited_time" }
  }
}
```

### Example 2: Inventory Management Database

```
Create an inventory database using notionCreateDatabase:

{
  "workspace": true,
  "title": "Product Inventory",
  "properties": {
    "Product Name": { "type": "title" },
    "SKU": {
      "type": "unique_id",
      "prefix": "PROD"
    },
    "Category": {
      "type": "select",
      "options": ["Electronics", "Clothing", "Food & Beverage", "Books", "Home & Garden"]
    },
    "Subcategory": { "type": "rich_text" },
    "Supplier": { "type": "rich_text" },
    "Supplier Email": { "type": "email" },
    "Unit Price": {
      "type": "number",
      "number_format": "dollar"
    },
    "Quantity in Stock": { "type": "number" },
    "Reorder Level": { "type": "number" },
    "Total Value": {
      "type": "formula",
      "expression": "prop(\"Unit Price\") * prop(\"Quantity in Stock\")"
    },
    "In Stock": { "type": "checkbox" },
    "Last Restocked": { "type": "date" },
    "Warehouse Location": { "type": "rich_text" },
    "Tags": {
      "type": "multi_select",
      "options": ["Fast Moving", "Seasonal", "Clearance", "New Arrival"]
    },
    "Product Image": { "type": "files" },
    "Added Date": { "type": "created_time" }
  }
}
```

### Example 3: Meeting Notes Database

```
Create a meeting notes database using notionCreateDatabase:

{
  "parent_page_id": "team-workspace-page",
  "title": "Meeting Notes",
  "properties": {
    "Meeting Title": { "type": "title" },
    "Meeting Type": {
      "type": "select",
      "options": ["Standup", "Planning", "Retrospective", "Client Call", "All Hands"]
    },
    "Date": { "type": "date" },
    "Attendees": { "type": "people" },
    "Meeting Lead": { "type": "people" },
    "Duration (minutes)": { "type": "number" },
    "Recording Link": { "type": "url" },
    "Action Items": { "type": "rich_text" },
    "Status": {
      "type": "select",
      "options": ["Scheduled", "Completed", "Cancelled"]
    },
    "Follow-up Required": { "type": "checkbox" },
    "Tags": {
      "type": "multi_select",
      "options": ["Strategic", "Urgent", "Weekly", "Monthly"]
    },
    "Created By": { "type": "created_by" },
    "Created": { "type": "created_time" }
  }
}
```

### Example 4: Customer Support Tickets

```
Create a support ticket database using notionCreateDatabase:

{
  "workspace": true,
  "title": "Support Tickets",
  "properties": {
    "Ticket Title": { "type": "title" },
    "Ticket ID": {
      "type": "unique_id",
      "prefix": "TICKET"
    },
    "Status": {
      "type": "status"
    },
    "Priority": {
      "type": "select",
      "options": ["Critical", "High", "Normal", "Low"]
    },
    "Customer Name": { "type": "rich_text" },
    "Customer Email": { "type": "email" },
    "Assigned To": { "type": "people" },
    "Category": {
      "type": "select",
      "options": ["Bug", "Feature Request", "Question", "Billing", "Account"]
    },
    "Product": {
      "type": "select",
      "options": ["Web App", "Mobile App", "API", "Desktop App"]
    },
    "Created Date": { "type": "created_time" },
    "Last Updated": { "type": "last_edited_time" },
    "Resolution Time (hours)": { "type": "number" },
    "Customer Satisfaction": {
      "type": "select",
      "options": ["😀 Great", "😊 Good", "😐 Okay", "😞 Poor"]
    },
    "Tags": {
      "type": "multi_select",
      "options": ["Urgent", "Enterprise", "VIP", "Follow-up Needed"]
    }
  }
}
```

### Example 5: Content Calendar

```
Create a content calendar database using notionCreateDatabase:

{
  "parent_page_id": "marketing-page-123",
  "title": "Content Calendar",
  "properties": {
    "Content Title": { "type": "title" },
    "Type": {
      "type": "select",
      "options": ["Blog Post", "Video", "Podcast", "Social Media", "Newsletter", "Case Study"]
    },
    "Status": {
      "type": "status"
    },
    "Author": { "type": "people" },
    "Editor": { "type": "people" },
    "Publish Date": { "type": "date" },
    "Platform": {
      "type": "multi_select",
      "options": ["Website", "LinkedIn", "Twitter", "YouTube", "Instagram", "Email"]
    },
    "Target Audience": {
      "type": "select",
      "options": ["Developers", "Marketers", "Sales Teams", "Executives", "General"]
    },
    "Word Count": { "type": "number" },
    "SEO Keywords": { "type": "rich_text" },
    "Published URL": { "type": "url" },
    "Performance Score": {
      "type": "number",
      "number_format": "number"
    },
    "Tags": {
      "type": "multi_select",
      "options": ["Evergreen", "Trending", "Seasonal", "Tutorial", "Thought Leadership"]
    },
    "Created": { "type": "created_time" },
    "Last Modified": { "type": "last_edited_time" }
  }
}
```

---

## 📚 Additional Information

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ **Yes** | Name of the database |
| `properties` | object | ✅ **Yes** | Property definitions (must include one title type) |
| `parent_page_id` | string | *Conditional* | Parent page ID (required if `workspace` not true) |
| `workspace` | boolean | *Conditional* | Create at workspace root (required if no `parent_page_id`) |

### Response Format

**Success (200):**
```json
{
  "ok": true,
  "action": "created_database",
  "database_id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://notion.so/database-url"
}
```

**Error (400):**
```json
{
  "ok": false,
  "error": "Error description"
}
```

---

## 🔗 Related Documentation

- [Adding Properties Guide](./CHATGPT_PROMPTS.md) - How to add properties to existing databases
- [Adding Pages Guide](./CHATGPT_PAGES.md) - How to create pages in databases
- [Query Guide](./CHATGPT_QUERY.md) - How to query databases
- [API Documentation](https://api.wheniwas.me/openapi.yaml) - Full OpenAPI specification
- [Notion API Reference](https://developers.notion.com/reference/create-a-database) - Official docs

---

## 🚀 Quick Start Checklist

Before asking ChatGPT to create a database:

- [ ] Know where to create it (parent page ID or workspace root)
- [ ] Have the database title ready
- [ ] Know what properties you want
- [ ] Understand property types needed
- [ ] For select/multi-select: have options list ready
- [ ] Include one title property in your properties object
- [ ] Verify parent page is shared with your Notion integration
- [ ] Use one of the prompt templates above

---

*Last updated: October 23, 2025*
*API Version: 5.0.0*
*Base URL: https://api.wheniwas.me*
*Notion API Version: 2025-09-03*

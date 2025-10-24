# ChatGPT Prompt Guide for Adding Pages to Notion Databases

This guide provides optimal prompts for instructing ChatGPT to create pages in your Notion databases using the `notionWrite` action.

## 🎯 Optimal Prompt Templates

### For Adding a Single Page (Simple)

```
Create a page in database [DATABASE_ID] with title "[TITLE]".

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "[DATABASE_ID]",
  "title": "[TITLE]"
}
```

**Example:**
```
Create a page in database 39943bcc-9ec1-453e-bc02-41292073bc54 with title "New Partner".

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "title": "New Partner"
}
```

---

### For Adding a Page with Properties

```
Create a page in database [DATABASE_ID] with:
- Title: "[TITLE]"
- [Property1]: [Value1]
- [Property2]: [Value2]

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "[DATABASE_ID]",
  "title": "[TITLE]",
  "properties": {
    "[Property1]": [Value1],
    "[Property2]": [Value2]
  }
}
```

**Example:**
```
Create a page in database 39943bcc-9ec1-453e-bc02-41292073bc54 with:
- Title: "Acme Corporation"
- Partner Name: "Acme Corp"
- Email: "contact@acme.com"
- Priority: "High"

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "title": "Acme Corporation",
  "properties": {
    "Partner Name": "Acme Corp",
    "Email": "contact@acme.com",
    "Priority": "High"
  }
}
```

---

### For Adding a Page with Content

```
Create a page in database [DATABASE_ID] with title "[TITLE]" and this content:

"[YOUR CONTENT TEXT]"

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "[DATABASE_ID]",
  "title": "[TITLE]",
  "content": "[YOUR CONTENT TEXT]"
}
```

**Example:**
```
Create a page in database 39943bcc-9ec1-453e-bc02-41292073bc54 with title "API Integration Notes" and this content:

"Initial discussion about API integration. They require OAuth 2.0 authentication and have a rate limit of 1000 requests per hour."

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "title": "API Integration Notes",
  "content": "Initial discussion about API integration. They require OAuth 2.0 authentication and have a rate limit of 1000 requests per hour."
}
```

---

### For Adding a Page with Structured Content

```
Create a page in database [DATABASE_ID] with structured content blocks.

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "[DATABASE_ID]",
  "title": "[TITLE]",
  "properties": { ... },
  "content": [
    { "type": "heading_1", "text": "[Heading]" },
    { "type": "paragraph", "text": "[Paragraph text]" },
    { "type": "bulleted_list_item", "text": "[Bullet point]" }
  ]
}
```

**Example:**
```
Create a page in database 39943bcc-9ec1-453e-bc02-41292073bc54 for a new project.

Use the notionWrite action with:
{
  "target": "db",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "title": "Q4 Marketing Campaign",
  "properties": {
    "Project Owner": "@sarah@company.com",
    "Status": "Planning",
    "Priority": "High"
  },
  "content": [
    { "type": "heading_1", "text": "Project Overview" },
    { "type": "paragraph", "text": "New marketing campaign targeting enterprise customers." },
    { "type": "heading_2", "text": "Key Objectives" },
    { "type": "bulleted_list_item", "text": "Increase brand awareness by 30%" },
    { "type": "bulleted_list_item", "text": "Generate 500 qualified leads" },
    { "type": "bulleted_list_item", "text": "Launch by November 1st" },
    { "type": "heading_2", "text": "Action Items" },
    { "type": "to_do", "text": "Create campaign messaging" },
    { "type": "to_do", "text": "Design landing pages" },
    { "type": "to_do", "text": "Set up email sequences" }
  ]
}
```

---

## 🔑 Key Elements that Make Prompts Optimal

### 1. Explicit Action Name
✅ `Use the notionWrite action` - Tells ChatGPT exactly which action to use

### 2. Always Include "target": "db"
✅ This tells the API you're creating a page in a database (not under another page)

### 3. Show the Complete JSON Structure
✅ Providing the actual JSON structure helps ChatGPT format the request correctly

### 4. Include All Required Fields
✅ `target` and `database_id` are always required

---

## 📋 Property Value Types

The API automatically detects property types based on the values you provide:

### Auto-Detected Types

| Value Type | Notion Property | Example |
|------------|----------------|---------|
| String | `rich_text` | `"Hello World"` |
| Number | `number` | `42` or `3.14` |
| Boolean | `checkbox` | `true` or `false` |
| Array of strings | `multi_select` | `["Tag1", "Tag2"]` |

### Special Property Formats

| Property | Format | Example |
|----------|--------|---------|
| Title | Use `"title"` parameter or `"Name"` property | `"title": "My Page"` |
| Status | String value | `"Status": "In Progress"` |
| People | Email with @ prefix | `"Assignee": "@user@company.com"` |
| Date | ISO date string | `"Due Date": "2025-10-31"` |
| Select | String value | `"Priority": "High"` |
| Multi-select | Array of strings | `"Tags": ["Urgent", "Review"]` |

---

## 🎨 Content Block Types

When using structured content, you can use these block types:

### Available Block Types

| Block Type | Description | Example |
|-----------|-------------|---------|
| `paragraph` | Regular paragraph text | Basic content |
| `heading_1` | Large heading | Main sections |
| `heading_2` | Medium heading | Subsections |
| `heading_3` | Small heading | Minor sections |
| `bulleted_list_item` | Bullet point | List items |
| `numbered_list_item` | Numbered item | Sequential lists |
| `to_do` | Checkbox item | Tasks |
| `quote` | Blockquote | Quoted text |
| `callout` | Highlighted box | Important notes |
| `toggle` | Collapsible section | Expandable content |

### Block Format

```json
{
  "type": "block_type",
  "text": "Your text content here"
}
```

---

## 💡 Pro Tips

1. **Title Flexibility:** If you don't provide `title`, it will use `properties.Name` or default to "Untitled"
2. **Database ID Formats:** Works with full Notion URLs or 32-character IDs (with or without hyphens)
3. **Property Detection:** The API intelligently maps simple values to Notion property types
4. **Bulk Content:** Use block arrays for rich, structured page content
5. **People Mentions:** Use email addresses with @ prefix for people properties
6. **Mixed Properties:** You can mix simple values and explicit Notion property formats
7. **Response Includes URL:** The API returns a direct link to the created page

---

## ⚠️ What to Avoid

❌ "Add a page to my database" (without structure)
❌ Forgetting `"target": "db"`
❌ Using `"target": "page"` when you mean database (that's for child pages under a page)
❌ Omitting the `database_id`
❌ Using complex nested objects for simple text values

---

## 🎯 The Ultimate Power Prompt

For maximum reliability, use this comprehensive format:

```
I need to create a page in my Notion database using the notionWrite action.

Database ID: 39943bcc-9ec1-453e-bc02-41292073bc54

Create a page with this exact structure:
{
  "target": "db",
  "database_id": "39943bcc-9ec1-453e-bc02-41292073bc54",
  "title": "Acme Corporation - API Partnership",
  "properties": {
    "Partner Name": "Acme Corporation",
    "Contact Person": "@john.doe@acme.com",
    "Email": "partnerships@acme.com",
    "Phone": "+1-555-0199",
    "Integration Date": "2025-10-24",
    "Status": "Active",
    "Priority": "High",
    "Revenue Share": 15.5,
    "API Key Provided": true,
    "Tags": ["Enterprise", "Priority Partner"],
    "Notes": "Met at TechConf 2025"
  },
  "content": [
    { "type": "heading_1", "text": "Partnership Overview" },
    { "type": "paragraph", "text": "Acme Corporation is interested in integrating our API into their enterprise platform." },
    { "type": "heading_2", "text": "Technical Requirements" },
    { "type": "bulleted_list_item", "text": "OAuth 2.0 authentication" },
    { "type": "bulleted_list_item", "text": "Webhook notifications for real-time updates" },
    { "type": "bulleted_list_item", "text": "Rate limit: 10,000 requests/hour" },
    { "type": "heading_2", "text": "Next Steps" },
    { "type": "to_do", "text": "Send API documentation" },
    { "type": "to_do", "text": "Schedule technical call" },
    { "type": "to_do", "text": "Draft partnership agreement" }
  ]
}

Do not omit any fields. Execute this now.
```

---

## 🔧 Troubleshooting

### Page isn't being created

**Problem:** API returns error or page doesn't appear

**Solution:**
1. Verify you're using the correct database ID
2. Ensure `"target": "db"` is included
3. Check that you have write permissions to the database in Notion
4. Verify the database is shared with your Notion integration

### Properties not showing correct values

**Problem:** Property values are empty or incorrect type

**Solution:**
- Use simple value types (string, number, boolean, array)
- For people properties, use email addresses with @ prefix
- For dates, use ISO format: `"2025-10-31"` or `"2025-10-31T14:30:00"`
- Ensure select/multi-select values match existing options in the database

### Content blocks not appearing

**Problem:** Page is created but content is missing

**Solution:**
- Verify you're using the correct block type names
- Ensure each block has both `type` and `text` fields
- Use array format for multiple blocks: `[{...}, {...}]`
- Check that special characters in text are properly escaped

### "No data sources found" error

**Problem:** Error message about data sources

**Solution:**
- The database might be newly created and still initializing
- Wait a few seconds and try again
- Verify the database ID is correct
- Check that the database isn't in the trash

---

## 🚀 Real-World Examples

### Example 1: Customer Contact Record

```
Create a customer contact page in database cust-db-123 using notionWrite:

{
  "target": "db",
  "database_id": "cust-db-123",
  "title": "Acme Inc - John Smith",
  "properties": {
    "Company Name": "Acme Inc",
    "Contact Name": "John Smith",
    "Email": "john.smith@acme.com",
    "Phone": "+1-555-0123",
    "Position": "CTO",
    "Account Status": "Active",
    "Lead Source": "Conference",
    "Tags": ["Enterprise", "Decision Maker"],
    "First Contact": "2025-10-23",
    "Interested": true
  },
  "content": [
    { "type": "heading_2", "text": "Meeting Notes" },
    { "type": "paragraph", "text": "Met John at TechConf 2025. Very interested in our enterprise solution." },
    { "type": "heading_2", "text": "Requirements" },
    { "type": "bulleted_list_item", "text": "SSO integration required" },
    { "type": "bulleted_list_item", "text": "Needs to support 500+ users" },
    { "type": "bulleted_list_item", "text": "Budget approved for Q4" },
    { "type": "heading_2", "text": "Follow-up Actions" },
    { "type": "to_do", "text": "Send product demo video" },
    { "type": "to_do", "text": "Schedule call with engineering team" },
    { "type": "to_do", "text": "Prepare custom pricing proposal" }
  ]
}
```

### Example 2: Project Task

```
Create a project task in database proj-tasks-456 using notionWrite:

{
  "target": "db",
  "database_id": "proj-tasks-456",
  "title": "Implement User Authentication System",
  "properties": {
    "Assignee": "@alice@company.com",
    "Status": "In Progress",
    "Priority": "High",
    "Due Date": "2025-11-15",
    "Estimated Hours": 40,
    "Tags": ["Backend", "Security"],
    "Sprint": "Sprint 23",
    "Story Points": 13,
    "Completed": false
  },
  "content": [
    { "type": "heading_1", "text": "Task Description" },
    { "type": "paragraph", "text": "Implement a secure authentication system with OAuth 2.0 and JWT tokens." },
    { "type": "heading_2", "text": "Requirements" },
    { "type": "bulleted_list_item", "text": "OAuth 2.0 provider integration (Google, GitHub)" },
    { "type": "bulleted_list_item", "text": "JWT token generation and validation" },
    { "type": "bulleted_list_item", "text": "Refresh token mechanism" },
    { "type": "bulleted_list_item", "text": "Session management" },
    { "type": "heading_2", "text": "Technical Notes" },
    { "type": "paragraph", "text": "Use the jsonwebtoken library for JWT handling. Tokens should expire after 1 hour." },
    { "type": "heading_2", "text": "Subtasks" },
    { "type": "to_do", "text": "Set up OAuth providers" },
    { "type": "to_do", "text": "Create JWT middleware" },
    { "type": "to_do", "text": "Implement refresh token endpoint" },
    { "type": "to_do", "text": "Write unit tests" },
    { "type": "to_do", "text": "Update API documentation" }
  ]
}
```

### Example 3: Inventory Item

```
Create an inventory item in database inv-789 using notionWrite:

{
  "target": "db",
  "database_id": "inv-789",
  "title": "Dell XPS 15 Laptop",
  "properties": {
    "Product Name": "Dell XPS 15 - 9530",
    "SKU": "LPT-XPS15-001",
    "Category": "Electronics",
    "Subcategory": "Laptops",
    "Quantity": 25,
    "Unit Price": 1299.99,
    "Total Value": 32499.75,
    "Supplier": "Dell Direct",
    "Supplier Contact": "orders@dell.com",
    "In Stock": true,
    "Reorder Level": 5,
    "Last Restock": "2025-10-15",
    "Location": "Warehouse A - Shelf B3",
    "Tags": ["High Value", "Fast Moving"]
  },
  "content": [
    { "type": "heading_2", "text": "Product Specifications" },
    { "type": "bulleted_list_item", "text": "Intel Core i7-13700H processor" },
    { "type": "bulleted_list_item", "text": "32GB DDR5 RAM" },
    { "type": "bulleted_list_item", "text": "1TB NVMe SSD" },
    { "type": "bulleted_list_item", "text": "15.6\" 4K OLED display" },
    { "type": "bulleted_list_item", "text": "NVIDIA RTX 4070 GPU" },
    { "type": "heading_2", "text": "Notes" },
    { "type": "paragraph", "text": "Popular item, moves quickly during Q4. Consider increasing stock before holiday season." },
    { "type": "callout", "text": "⚠️ Monitor inventory levels - restock when quantity drops below 5 units." }
  ]
}
```

### Example 4: Meeting Notes

```
Create meeting notes in database meetings-abc using notionWrite:

{
  "target": "db",
  "database_id": "meetings-abc",
  "title": "Q4 Planning Meeting - October 23, 2025",
  "properties": {
    "Meeting Type": "Planning",
    "Date": "2025-10-23",
    "Attendees": "@alice@company.com, @bob@company.com, @carol@company.com",
    "Duration": 60,
    "Status": "Completed",
    "Tags": ["Strategic", "Q4"],
    "Follow-up Required": true
  },
  "content": [
    { "type": "heading_1", "text": "Q4 Planning Meeting" },
    { "type": "paragraph", "text": "Date: October 23, 2025 | Time: 2:00 PM - 3:00 PM" },
    { "type": "heading_2", "text": "Attendees" },
    { "type": "bulleted_list_item", "text": "Alice Johnson - Product Lead" },
    { "type": "bulleted_list_item", "text": "Bob Martinez - Engineering Manager" },
    { "type": "bulleted_list_item", "text": "Carol Chen - Marketing Director" },
    { "type": "heading_2", "text": "Agenda" },
    { "type": "numbered_list_item", "text": "Review Q3 performance" },
    { "type": "numbered_list_item", "text": "Discuss Q4 goals and priorities" },
    { "type": "numbered_list_item", "text": "Resource allocation" },
    { "type": "numbered_list_item", "text": "Timeline and milestones" },
    { "type": "heading_2", "text": "Key Decisions" },
    { "type": "bulleted_list_item", "text": "Launch new feature set by November 15" },
    { "type": "bulleted_list_item", "text": "Increase marketing budget by 20%" },
    { "type": "bulleted_list_item", "text": "Hire 2 additional engineers" },
    { "type": "heading_2", "text": "Action Items" },
    { "type": "to_do", "text": "Alice: Create detailed feature specifications" },
    { "type": "to_do", "text": "Bob: Prepare hiring plan and job descriptions" },
    { "type": "to_do", "text": "Carol: Draft Q4 marketing campaign strategy" },
    { "type": "to_do", "text": "All: Review and approve budget by Oct 30" },
    { "type": "heading_2", "text": "Next Meeting" },
    { "type": "paragraph", "text": "November 6, 2025 - Q4 Progress Check-in" }
  ]
}
```

### Example 5: Simple Quick Entry

```
Create a quick note in database notes-xyz using notionWrite:

{
  "target": "db",
  "database_id": "notes-xyz",
  "title": "API Rate Limit Increase Request",
  "properties": {
    "Category": "Technical",
    "Priority": "Medium",
    "Tags": ["API", "Infrastructure"]
  },
  "content": "Customer ABC123 requested rate limit increase from 1000 to 5000 requests/hour. Approved by engineering team. Implement by end of week."
}
```

---

## 📚 Additional Information

### Request Parameters Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | string | ✅ **Yes** | Must be `"db"` for database pages |
| `database_id` | string | ✅ **Yes** | Database ID (32-char or full URL) |
| `title` | string | No | Page title (defaults to "Untitled") |
| `properties` | object | No | Property values as key-value pairs |
| `content` | string/array | No | Simple text or array of block objects |

### Response Format

**Success (200):**
```json
{
  "ok": true,
  "action": "created_in_database",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://notion.so/page-url"
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

- [Adding Database Properties Guide](./CHATGPT_PROMPTS.md) - How to add columns to databases
- [API Documentation](https://api.wheniwas.me/openapi.yaml) - Full OpenAPI specification
- [Update Database Guide](./UPDATE_DATABASE.md) - Technical details for database operations
- [Notion API Reference](https://developers.notion.com/reference) - Official Notion API docs

---

## 🚀 Quick Start Checklist

Before asking ChatGPT to create pages:

- [ ] Have your database ID ready
- [ ] Know what title and properties you want
- [ ] Decide if you need content blocks or simple text
- [ ] Verify database is shared with your Notion integration
- [ ] Re-imported the latest OpenAPI schema if needed
- [ ] Use one of the prompt templates above
- [ ] Include `"target": "db"` in your JSON structure

---

## 💬 Example ChatGPT Conversations

### Conversation 1: Simple Page Creation
```
User: Create a page for a new customer "TechCorp" in database abc123

ChatGPT: I'll create that page for you.
[Uses notionWrite with database_id: "abc123", title: "TechCorp"]

Success! Created page: https://notion.so/...
```

### Conversation 2: Detailed Page with Properties
```
User: Add a new project to database proj-456 called "Website Redesign" 
with owner @sarah@company.com, priority High, status Planning, 
and add some initial tasks in the content

ChatGPT: I'll create the project page with those details.
[Uses notionWrite with all properties and content blocks for tasks]

Created project page with 5 initial tasks: https://notion.so/...
```

### Conversation 3: Bulk Creation (with clarification)
```
User: Add 3 customer pages to database cust-789

ChatGPT: I can create those pages, but I'll need the customer details for each one. 
Could you provide:
- Customer names
- Any property values (email, phone, status, etc.)

User: Sure, add:
1. Acme Inc - contact@acme.com - Active
2. Beta Corp - info@beta.com - Trial
3. Gamma LLC - sales@gamma.com - Active

ChatGPT: I'll create those three customer pages now.
[Makes 3 separate notionWrite calls]

Created 3 customer pages successfully!
```

---

*Last updated: October 23, 2025*
*API Version: 5.0.0*
*Base URL: https://api.wheniwas.me*
*Notion API Version: 2025-09-03*

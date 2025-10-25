# ChatGPT Prompt Guide for Updating Notion Pages

This guide provides optimal prompts for instructing ChatGPT to update existing pages in your Notion workspace using the `notionWrite` action with `target: "update"`.

## 🎯 Optimal Prompt Templates

### For Updating Page Properties

```
Update page [PAGE_ID] with these changes:
- [Property1]: [NewValue1]
- [Property2]: [NewValue2]

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "[PAGE_ID]",
  "properties": {
    "[Property1]": [NewValue1],
    "[Property2]": [NewValue2]
  }
}
```

**Example:**
```
Update page 123e4567-e89b-12d3-a456-426614174000 with these changes:
- Status: "Completed"
- Priority: "High"

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "properties": {
    "Status": "Completed",
    "Priority": "High"
  }
}
```

---

### For Adding Content to a Page

```
Add this content to page [PAGE_ID]:

"[YOUR CONTENT TEXT]"

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "[PAGE_ID]",
  "content": "[YOUR CONTENT TEXT]"
}
```

**Example:**
```
Add this content to page 123e4567-e89b-12d3-a456-426614174000:

"Meeting completed successfully. All stakeholders agreed on the proposed timeline."

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Meeting completed successfully. All stakeholders agreed on the proposed timeline."
}
```

---

### For Updating Properties and Adding Content

```
Update page [PAGE_ID]:
- Change [Property1] to [Value1]
- Change [Property2] to [Value2]
- Add content: "[CONTENT]"

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "[PAGE_ID]",
  "properties": {
    "[Property1]": [Value1],
    "[Property2]": [Value2]
  },
  "content": "[CONTENT]"
}
```

**Example:**
```
Update page 123e4567-e89b-12d3-a456-426614174000:
- Change Status to "In Progress"
- Change Assignee to "@alice@company.com"
- Add content: "Started implementation of authentication system"

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "properties": {
    "Status": "In Progress",
    "Assignee": "@alice@company.com"
  },
  "content": "Started implementation of authentication system"
}
```

---

### For Adding Structured Content Blocks

```
Add structured content to page [PAGE_ID].

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "[PAGE_ID]",
  "content": [
    { "type": "heading_1", "text": "[Heading]" },
    { "type": "paragraph", "text": "[Paragraph]" },
    { "type": "bulleted_list_item", "text": "[Bullet point]" }
  ]
}
```

**Example:**
```
Add meeting notes to page 123e4567-e89b-12d3-a456-426614174000.

Use the notionWrite action with:
{
  "target": "update",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "content": [
    { "type": "heading_2", "text": "Discussion Points" },
    { "type": "bulleted_list_item", "text": "Reviewed Q4 goals" },
    { "type": "bulleted_list_item", "text": "Discussed budget allocation" },
    { "type": "bulleted_list_item", "text": "Planned next sprint" },
    { "type": "heading_2", "text": "Action Items" },
    { "type": "to_do", "text": "Update project timeline" },
    { "type": "to_do", "text": "Schedule follow-up meeting" }
  ]
}
```

---

## 🔑 Key Elements that Make Prompts Optimal

### 1. Explicit Action and Target
✅ `Use the notionWrite action with "target": "update"` - Specifies update mode

### 2. Include Page ID
✅ Always provide the `page_id` of the page to update

### 3. Specify What to Update
✅ Include `properties`, `content`, or both depending on what you're changing

### 4. Show Complete JSON Structure
✅ Providing the full JSON structure ensures correct formatting

---

## 📋 Property Value Types

**⚡ CRITICAL: The middleware fetches the database schema and auto-converts property types.**

### Send FLAT Values - Middleware Converts Automatically

**✅ CORRECT - Send simple flat values:**
```json
{
  "properties": {
    "Email": "user@example.com",
    "Status": "Active", 
    "Priority": "High",
    "Count": 42,
    "Done": true,
    "Start Date": "2025-10-24",
    "Tags": ["Tag1", "Tag2"]
  }
}
```

**❌ WRONG - Don't send nested Notion objects:**
```json
{
  "properties": {
    "Email": {"email": "user@example.com"},
    "Status": {"select": {"name": "Active"}}
  }
}
```

### How Schema-Aware Conversion Works

The middleware:
1. Fetches the page to get its database ID
2. Retrieves the database schema with all property types
3. Converts your flat values to proper Notion property formats

### Automatic Type Conversions (Schema-Aware)

| Property Type in Database | Send This | Middleware Converts To |
|---------------------------|-----------|------------------------|
| **email** | `"user@example.com"` | `{email: "user@example.com"}` |
| **select** | `"Active"` | `{select: {name: "Active"}}` |
| **multi_select** | `["Tag1", "Tag2"]` | `{multi_select: [{name:"Tag1"}, {name:"Tag2"}]}` |
| **status** | `"In Progress"` | `{status: {name: "In Progress"}}` |
| **date** | `"2025-10-24"` | `{date: {start: "2025-10-24"}}` |
| **number** | `42` | `{number: 42}` |
| **checkbox** | `true` | `{checkbox: true}` |
| **rich_text** | `"Hello"` | `{rich_text: [{text: {content: "Hello"}}]}` |
| **url** | `"https://example.com"` | `{url: "https://example.com"}` |
| **phone_number** | `"555-1234"` | `{phone_number: "555-1234"}` |
| **people** | User IDs required | `{people: [{id: "user-id"}]}` |

### Special Property Formats

| Property | What to Send | Notes |
|----------|--------------|-------|
| Status | String value: `"Status": "In Progress"` | Must match existing status option |
| People | ⚠️ User IDs only | Email strings will be SKIPPED - query for user IDs first |
| Date | ISO string: `"Due Date": "2025-10-31"` | Can include time: `"2025-10-31T14:30:00"` |
| Select | String value: `"Priority": "High"` | Must match existing select option |
| Multi-select | Array: `"Tags": ["Urgent", "Review"]` | All values must exist as options |

---

## 🎨 Content Block Types

When adding structured content, you can use these block types:

### Available Block Types

| Block Type | Description | Usage |
|-----------|-------------|-------|
| `paragraph` | Regular paragraph | Basic text content |
| `heading_1` | Large heading | Main sections |
| `heading_2` | Medium heading | Subsections |
| `heading_3` | Small heading | Minor sections |
| `bulleted_list_item` | Bullet point | List items |
| `numbered_list_item` | Numbered item | Sequential lists |
| `to_do` | Checkbox item | Tasks/action items |
| `quote` | Blockquote | Quoted text |
| `callout` | Highlighted box | Important notes |
| `toggle` | Collapsible section | Expandable content |

---

## 💡 Pro Tips

1. **Partial Updates:** You only need to include properties you want to change
2. **Content Appends:** Content is **appended** to the page, not replaced
3. **Property Preservation:** Properties not mentioned remain unchanged
4. **People Format:** Use `"@email@domain.com"` for people properties
5. **Date Format:** ISO 8601 format works best: `"2025-10-31"` or `"2025-10-31T14:30:00"`
6. **Checkbox Updates:** Use `true` or `false` boolean values
7. **Select Validation:** Select values must match existing options in the database
8. **Multiple Updates:** Can update multiple properties in one call
9. **Request ID:** Use optional `request_id` for tracking/logging

---

## ⚠️ What to Avoid

❌ Forgetting `"target": "update"`
❌ Omitting the `page_id`
❌ Trying to change property types (that requires database schema changes)
❌ Using select values that don't exist in the database
❌ Expecting content to replace instead of append
❌ Using invalid date formats

---

## 🎯 The Ultimate Power Prompt

For comprehensive page updates with properties and content:

```
I need to update a Notion page using the notionWrite action.

Page ID: 123e4567-e89b-12d3-a456-426614174000

Update these properties:
- Status: "Completed"
- Assignee: "@alice@company.com"
- Priority: "High"
- Due Date: "2025-11-01"
- Progress: 85
- Tags: ["Urgent", "Review Ready"]
- Completed: true

Add this content:
- Heading: "Final Summary"
- Paragraph: "Project completed ahead of schedule with all requirements met."
- Action Items:
  * Send completion report to stakeholders
  * Archive project documentation
  * Schedule retrospective meeting

Use this exact structure:
{
  "target": "update",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "properties": {
    "Status": "Completed",
    "Assignee": "@alice@company.com",
    "Priority": "High",
    "Due Date": "2025-11-01",
    "Progress": 85,
    "Tags": ["Urgent", "Review Ready"],
    "Completed": true
  },
  "content": [
    { "type": "heading_2", "text": "Final Summary" },
    { "type": "paragraph", "text": "Project completed ahead of schedule with all requirements met." },
    { "type": "heading_3", "text": "Action Items" },
    { "type": "to_do", "text": "Send completion report to stakeholders" },
    { "type": "to_do", "text": "Archive project documentation" },
    { "type": "to_do", "text": "Schedule retrospective meeting" }
  ]
}

Execute this now.
```

---

## 🔧 Troubleshooting

### Page not found error

**Problem:** Cannot find page with given ID

**Solution:**
1. Verify the page ID is correct
2. Ensure the page hasn't been deleted
3. Check that the page is shared with your Notion integration
4. Confirm you have edit permissions

### Property update fails

**Problem:** Properties don't get updated

**Solution:**
- Verify property names match exactly (case-sensitive)
- For select properties, ensure values match existing options
- For people properties, use email format with @ prefix
- For dates, use ISO 8601 format
- Check that property types accept the value type you're providing

### Content not appearing

**Problem:** Content blocks aren't added to the page

**Solution:**
- Verify you're using valid block types
- Ensure each block has both `type` and `text` fields
- Check that you're using the `content` field (not `children`)
- Remember: content is appended, not replacing existing content

### Select value not recognized

**Problem:** Select/multi-select value causes error

**Solution:**
- Values must match existing options in the database schema
- Check capitalization and spelling
- Use `notionQuery` with `mode: "database_get"` to see available options
- Create new options using `notionUpdateDatabaseV5` first if needed

---

## 🚀 Real-World Examples

### Example 1: Mark Task as Complete

```
Update task page task-123 to mark it complete using notionWrite:

{
  "target": "update",
  "page_id": "task-123",
  "properties": {
    "Status": "Done",
    "Completed": true,
    "Completion Date": "2025-10-23",
    "Progress": 100
  },
  "content": [
    { "type": "heading_3", "text": "Completion Notes" },
    { "type": "paragraph", "text": "Task completed successfully. All acceptance criteria met." },
    { "type": "paragraph", "text": "Total time spent: 12 hours" }
  ]
}
```

### Example 2: Update Customer Status

```
Update customer page cust-456 after successful sale using notionWrite:

{
  "target": "update",
  "page_id": "cust-456",
  "properties": {
    "Status": "Active Customer",
    "Account Owner": "@sales@company.com",
    "Contract Value": 50000,
    "Contract Start": "2025-10-23",
    "Tags": ["Enterprise", "Priority"],
    "Active": true
  },
  "content": [
    { "type": "heading_2", "text": "Deal Closed" },
    { "type": "paragraph", "text": "Successfully closed enterprise deal worth $50,000 annually." },
    { "type": "heading_3", "text": "Next Steps" },
    { "type": "to_do", "text": "Send welcome package" },
    { "type": "to_do", "text": "Schedule onboarding call" },
    { "type": "to_do", "text": "Set up API access" }
  ]
}
```

### Example 3: Update Project Status

```
Update project page proj-789 with weekly progress using notionWrite:

{
  "target": "update",
  "page_id": "proj-789",
  "properties": {
    "Status": "On Track",
    "Progress": 65,
    "Last Updated": "2025-10-23",
    "Next Milestone": "Beta Release"
  },
  "content": [
    { "type": "heading_2", "text": "Week 42 Update" },
    { "type": "paragraph", "text": "Significant progress this week on core features." },
    { "type": "heading_3", "text": "Completed" },
    { "type": "bulleted_list_item", "text": "User authentication system" },
    { "type": "bulleted_list_item", "text": "Dashboard UI" },
    { "type": "bulleted_list_item", "text": "API documentation" },
    { "type": "heading_3", "text": "In Progress" },
    { "type": "bulleted_list_item", "text": "Payment integration" },
    { "type": "bulleted_list_item", "text": "Email notifications" },
    { "type": "heading_3", "text": "Blockers" },
    { "type": "paragraph", "text": "None at this time." }
  ]
}
```

### Example 4: Add Meeting Notes

```
Update meeting page meeting-abc with discussion notes using notionWrite:

{
  "target": "update",
  "page_id": "meeting-abc",
  "properties": {
    "Status": "Completed",
    "Duration": 60,
    "Follow-up Required": true
  },
  "content": [
    { "type": "heading_1", "text": "Meeting Notes" },
    { "type": "paragraph", "text": "Date: October 23, 2025 | Attendees: Alice, Bob, Carol" },
    { "type": "heading_2", "text": "Discussion" },
    { "type": "paragraph", "text": "Reviewed Q4 roadmap and resource allocation." },
    { "type": "heading_2", "text": "Decisions Made" },
    { "type": "numbered_list_item", "text": "Approved budget increase for infrastructure" },
    { "type": "numbered_list_item", "text": "Moved feature X to Q1 2026" },
    { "type": "numbered_list_item", "text": "Hired contractor for design work" },
    { "type": "heading_2", "text": "Action Items" },
    { "type": "to_do", "text": "Alice: Update project timeline by Friday" },
    { "type": "to_do", "text": "Bob: Review contractor proposals" },
    { "type": "to_do", "text": "Carol: Send budget approval to finance" },
    { "type": "heading_2", "text": "Next Meeting" },
    { "type": "paragraph", "text": "November 6, 2025 - Q4 Progress Review" }
  ]
}
```

### Example 5: Update Inventory Item

```
Update inventory page inv-xyz after restock using notionWrite:

{
  "target": "update",
  "page_id": "inv-xyz",
  "properties": {
    "Quantity": 150,
    "In Stock": true,
    "Last Restock": "2025-10-23",
    "Unit Price": 29.99,
    "Total Value": 4498.50
  },
  "content": [
    { "type": "heading_3", "text": "Restock Details" },
    { "type": "paragraph", "text": "Received shipment of 100 units on October 23, 2025." },
    { "type": "bulleted_list_item", "text": "Supplier: ABC Wholesale" },
    { "type": "bulleted_list_item", "text": "Purchase Order: PO-2025-1023" },
    { "type": "bulleted_list_item", "text": "Total Cost: $2,500" },
    { "type": "callout", "text": "⚠️ Monitor inventory levels - product moving quickly this quarter" }
  ]
}
```

### Example 6: Simple Property Update

```
Just update the status of page task-999 using notionWrite:

{
  "target": "update",
  "page_id": "task-999",
  "properties": {
    "Status": "In Progress"
  }
}
```

### Example 7: Append Quick Note

```
Add a quick note to page page-abc using notionWrite:

{
  "target": "update",
  "page_id": "page-abc",
  "content": "Follow-up: Customer requested demo on Friday. Schedule confirmed."
}
```

---

## 📚 Additional Information

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | string | ✅ **Yes** | Must be `"update"` for page updates |
| `page_id` | string | ✅ **Yes** | ID of the page to update |
| `properties` | object | No | Property values to update |
| `content` | string/array | No | Content to append to the page |
| `request_id` | string | No | Optional tracking ID |

### Response Format

**Success (200):**
```json
{
  "ok": true,
  "action": "updated_page",
  "page_id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://notion.so/page-url",
  "request_id": "optional-tracking-id"
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

- [Adding Pages Guide](./CHATGPT_PAGES.md) - How to create new pages
- [Query Guide](./CHATGPT_QUERY.md) - How to retrieve page information
- [Adding Properties Guide](./CHATGPT_PROMPTS.md) - How to add columns to databases
- [API Documentation](https://api.wheniwas.me/openapi.yaml) - Full OpenAPI specification
- [Notion API Reference](https://developers.notion.com/reference/patch-page) - Official docs

---

## 🚀 Quick Start Checklist

Before asking ChatGPT to update a page:

- [ ] Have the page ID ready
- [ ] Know which properties to update
- [ ] Have the new property values ready
- [ ] Decide if you need to add content
- [ ] For select properties: verify values match existing options
- [ ] For people properties: have email addresses ready
- [ ] Verify page is shared with your Notion integration
- [ ] Use one of the prompt templates above

---

*Last updated: October 23, 2025*
*API Version: 5.0.0*
*Base URL: https://api.wheniwas.me*
*Notion API Version: 2025-09-03*

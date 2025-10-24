# Complete Documentation Index

This is your complete documentation for the ChatGPT → Notion Middleware API (v5.0.0).

## 📚 Documentation Library

### For ChatGPT Users

These guides are designed to help you get the most out of ChatGPT Actions with your Notion workspace:

#### 1. [Adding Database Properties](./CHATGPT_PROMPTS.md)
**Learn how to add columns to your Notion databases**

What's inside:
- ✅ Templates for single and multiple properties
- ✅ All 25+ property types reference (text, number, select, status, people, etc.)
- ✅ Number formatting options (currency, percent, etc.)
- ✅ Select/multi-select with options
- ✅ Formula, relation, and rollup examples
- ✅ 3 complete real-world examples (project management, CRM, inventory)
- ✅ Troubleshooting common issues
- ✅ The "Ultimate Power Prompt" for guaranteed success

**Best for:** Setting up database schemas, adding new columns

---

#### 2. [Creating Pages](./CHATGPT_PAGES.md)
**Learn how to create pages in your Notion databases**

What's inside:
- ✅ Templates for simple and complex page creation
- ✅ Property value auto-detection guide
- ✅ All 10 content block types (headings, lists, todos, callouts, etc.)
- ✅ 5 complete real-world examples (contacts, tasks, inventory, meetings, quick notes)
- ✅ Structured content with multiple blocks
- ✅ People mentions and date formats
- ✅ Troubleshooting page creation issues

**Best for:** Adding records to databases, creating content

---

#### 3. [Updating Pages](./CHATGPT_UPDATE_PAGE.md)
**Learn how to update existing pages in Notion**

What's inside:
- ✅ Templates for property updates
- ✅ Templates for adding content
- ✅ Combined property + content updates
- ✅ 7 complete real-world examples (tasks, customers, projects, meetings)
- ✅ Partial updates (only change what you need)
- ✅ Content appending with blocks
- ✅ Troubleshooting update failures

**Best for:** Modifying existing records, adding notes, status updates

---

#### 4. [Querying Data](./CHATGPT_QUERY.md)
**Learn how to search and retrieve data from Notion**

What's inside:
- ✅ 14+ query mode templates (search, db_query, page_get, etc.)
- ✅ Complete filter reference for all property types
- ✅ Compound filters (AND/OR logic)
- ✅ Sorting by single or multiple properties
- ✅ 7 complete real-world examples (active tasks, overdue items, revenue reports)
- ✅ Pagination handling
- ✅ Troubleshooting query issues

**Best for:** Finding records, generating reports, checking status

---

#### 5. [Creating Databases](./CHATGPT_CREATE_DATABASE.md)
**Learn how to create new databases in Notion**

What's inside:
- ✅ Templates for simple and advanced databases
- ✅ All property types with configurations
- ✅ Workspace root vs parent page creation
- ✅ 5 complete real-world examples (projects, inventory, support tickets, content calendar)
- ✅ Formula expressions and relation properties
- ✅ Select options and number formatting
- ✅ Troubleshooting database creation

**Best for:** Setting up new databases, creating templates

---

### Technical Documentation

#### [API Reference](../openapi.yaml)
Complete OpenAPI 3.1.0 specification with all endpoints, schemas, and examples.

**Available at:** `https://api.wheniwas.me/openapi.yaml`

#### [Main README](../README.md)
Project overview, setup instructions, deployment guide, and architecture details.

---

## 🎯 Quick Start Guide

### Step 1: Choose Your Task

| I want to... | Use this guide |
|-------------|----------------|
| Add columns to a database | [Adding Properties](./CHATGPT_PROMPTS.md) |
| Create a new record | [Creating Pages](./CHATGPT_PAGES.md) |
| Modify an existing record | [Updating Pages](./CHATGPT_UPDATE_PAGE.md) |
| Find or search records | [Querying Data](./CHATGPT_QUERY.md) |
| Create a new database | [Creating Databases](./CHATGPT_CREATE_DATABASE.md) |

### Step 2: Find the Template

Each guide has multiple prompt templates for different scenarios. Find the one that matches your needs.

### Step 3: Customize and Execute

Replace the placeholders with your actual values and give the prompt to ChatGPT.

---

## 💡 Pro Tips for All Operations

### 1. **Be Explicit**
Always show ChatGPT the exact JSON structure you want. Don't rely on it guessing.

✅ Good:
```
Use notionWrite with:
{
  "target": "db",
  "database_id": "abc123",
  "title": "New Record"
}
```

❌ Bad:
```
Add a record to my database
```

### 2. **Use Database IDs, Not Names**
ChatGPT can't see your workspace structure. Always provide the actual database ID.

Find it: Open database in Notion → Copy link → Extract the 32-character ID

### 3. **Verify Property Names**
Property names are case-sensitive. Use the exact names from your database.

### 4. **Test with Simple Cases First**
Start with a simple prompt, verify it works, then add complexity.

### 5. **Keep the Ultimate Power Prompt Handy**
Each guide has an "Ultimate Power Prompt" template that maximizes reliability.

---

## 🔧 Common Workflows

### Workflow 1: Set Up a New Database

1. Use [Creating Databases](./CHATGPT_CREATE_DATABASE.md) to create the database
2. Use [Adding Properties](./CHATGPT_PROMPTS.md) to add additional columns
3. Use [Creating Pages](./CHATGPT_PAGES.md) to populate with initial data

### Workflow 2: Manage Records

1. Use [Creating Pages](./CHATGPT_PAGES.md) to add new records
2. Use [Querying Data](./CHATGPT_QUERY.md) to find specific records
3. Use [Updating Pages](./CHATGPT_UPDATE_PAGE.md) to modify them

### Workflow 3: Reporting

1. Use [Querying Data](./CHATGPT_QUERY.md) with filters to get specific data
2. Use sorting to organize results
3. Use [Updating Pages](./CHATGPT_UPDATE_PAGE.md) to add summary notes

---

## 📖 Documentation Features

Every guide includes:

### ✅ Optimal Prompt Templates
Copy-paste templates that work reliably with ChatGPT

### ✅ Real-World Examples
Complete, tested examples from actual use cases

### ✅ Reference Tables
Quick lookup for property types, filters, modes, etc.

### ✅ Pro Tips
Best practices from production usage

### ✅ What to Avoid
Common mistakes and how to prevent them

### ✅ Troubleshooting
Solutions for the most common issues

### ✅ The Ultimate Power Prompt
A comprehensive template for maximum reliability

---

## 🚀 API Information

- **Base URL:** `https://api.wheniwas.me`
- **API Version:** 5.0.0
- **Notion API:** 2025-09-03
- **Authentication:** Bearer token
- **OpenAPI Version:** 3.1.0

---

## 📞 Support

### Documentation Issues
If you find errors or have suggestions for the guides, please create an issue.

### API Issues
For API-related problems:
1. Check the troubleshooting section in the relevant guide
2. Verify your database IDs and property names
3. Test with the debug endpoint: `POST /debug/ping`
4. Check the API response for error messages

### Notion API Issues
For Notion-specific questions, refer to [Notion's official documentation](https://developers.notion.com/reference).

---

## 🔄 Updates

These guides are maintained alongside the API. Check the "Last updated" date at the bottom of each guide.

**Current version:** October 23, 2025

---

## 🎓 Learning Path

**Beginner:** Start here
1. Read [Creating Pages](./CHATGPT_PAGES.md) - Learn the basics
2. Try [Querying Data](./CHATGPT_QUERY.md) - Find your data
3. Practice [Updating Pages](./CHATGPT_UPDATE_PAGE.md) - Modify records

**Intermediate:** Level up
1. Study [Adding Properties](./CHATGPT_PROMPTS.md) - Customize databases
2. Master filters in [Querying Data](./CHATGPT_QUERY.md)
3. Use compound filters and complex queries

**Advanced:** Expert level
1. Work with [Creating Databases](./CHATGPT_CREATE_DATABASE.md)
2. Set up formulas, relations, and rollups
3. Build complete workflows combining multiple operations

---

*Happy automating! 🚀*

---

**Quick Links:**
- [Add Properties](./CHATGPT_PROMPTS.md) | [Create Pages](./CHATGPT_PAGES.md) | [Update Pages](./CHATGPT_UPDATE_PAGE.md) | [Query Data](./CHATGPT_QUERY.md) | [Create Databases](./CHATGPT_CREATE_DATABASE.md)
- [API Reference](../openapi.yaml) | [Main README](../README.md)

# Best Prompts for Fetching Notion Database Schema

## 🎯 The Problem You're Experiencing

When ChatGPT displays the result, it shows `{...}` for nested objects, hiding the actual property schema. The schema IS being returned - it's just collapsed in the UI.

---

## ✅ Best Prompts to Get Full Schema

### Option 1: Ask for Properties Explicitly (RECOMMENDED)

```
"Get the database schema for [database_id] and list all the property names and types"
```

**Why it works:**
- ChatGPT will parse the nested `properties` object
- It will format the output as a readable list
- You'll see: property name, type, and configuration (options, etc.)

**Example:**
```
User: "Get the database schema for 39943bcc-9ec1-453e-bc02-41292073bc54 
       and list all property names and types"

ChatGPT: "Here are the properties in your database:
- Name (title)
- Status (status) - options: Active, Inactive
- Priority (select) - options: High, Medium, Low
- Created (created_time)
- Owner (people)
..."
```

---

### Option 2: Request JSON Format

```
"Show me the full database schema as JSON for [database_id]"
```

**Why it works:**
- ChatGPT will expand the full JSON response
- You'll see the complete `properties` object
- Useful for copying exact property configurations

---

### Option 3: Ask for Specific Details

```
"What properties exist in database [database_id]? 
Include property types, options for select fields, and any formulas"
```

**Why it works:**
- ChatGPT knows to extract specific parts of the schema
- You get formatted, easy-to-read output
- Includes advanced property details (formulas, relations, etc.)

---

## 🔍 Where the Schema Actually Is

**YES - The schema includes ALL columns (properties)!**

In Notion terminology:
- **Columns** = **Properties** (same thing)
- Each property/column has a name, type, and configuration

In the response you shared, the schema is hiding in:

```json
{
  "ok": true,
  "result": {
    "mode": "database_get",
    "database": {
      "object": "database",
      "id": "39943bcc-9ec1-453e-bc02-41292073bc54",
      "title": [...],
      "data_sources": [...],
      
      // 👇 ALL COLUMNS/PROPERTIES ARE HERE (collapsed in UI as {...})
      "properties": {
        "Name": {                    // ← COLUMN 1
          "id": "title",
          "type": "title",
          "title": {}
        },
        "Company": {                 // ← COLUMN 2
          "id": "abc123",
          "type": "rich_text",
          "rich_text": {}
        },
        "Status": {                  // ← COLUMN 3
          "id": "def456",
          "type": "status",
          "status": {
            "options": [
              {"name": "Active", "color": "green"},
              {"name": "Inactive", "color": "gray"}
            ]
          }
        },
        "Priority": {                // ← COLUMN 4
          "id": "xyz789",
          "type": "select",
          "select": {
            "options": [
              {"name": "High", "color": "red"},
              {"name": "Medium", "color": "yellow"},
              {"name": "Low", "color": "blue"}
            ]
          }
        },
        "Contact Email": {           // ← COLUMN 5
          "id": "ghi012",
          "type": "email",
          "email": {}
        },
        "Revenue": {                 // ← COLUMN 6
          "id": "jkl345",
          "type": "number",
          "number": {
            "format": "dollar"
          }
        }
        // ... ALL other columns/properties
      }
    }
  }
}
```

**What You Get:**
- ✅ Every column name (e.g., "Name", "Status", "Priority")
- ✅ Every column type (title, select, status, rich_text, email, number, etc.)
- ✅ Configuration for each column:
  - Select/Multi-select: All option names and colors
  - Status: All status options and groups
  - Number: Format (currency, percent, etc.)
  - Formula: The formula expression
  - Relation: The linked database ID
  - Rollup: The rollup configuration

The UI is showing `properties: {...}` but the **complete column/property definitions** are there - ChatGPT just needs to be prompted to expand it.

---

## 📋 Complete Prompt Templates

### For API Partners Database (Your Example)

```
"Get the schema for my API Partners database (39943bcc-9ec1-453e-bc02-41292073bc54). 
List all properties with their types and any options for select/status fields."
```

### Generic Template

```
"Retrieve the database schema for [DATABASE_ID] and show me:
1. All property names
2. Property types
3. Options for select/multi-select/status fields
4. Any formula expressions
5. Any relation configurations"
```

### For Creating Similar Database

```
"Get the full schema from database [DATABASE_ID] and format it 
so I can use it to create a new database with the same structure"
```

---

## 🎨 Expected Output Format

When you use the recommended prompts, ChatGPT should respond with:

```
Database: API Partners
ID: 39943bcc-9ec1-453e-bc02-41292073bc54

Properties:
1. Name (title)
   - Required for all databases

2. Company (rich_text)
   - Plain text field

3. Status (status)
   - Options: Active, Inactive, Pending
   - Default: Active

4. Priority (select)
   - Options: High, Medium, Low
   - Single selection

5. Tags (multi_select)
   - Options: Client, Prospect, Partner, Vendor
   - Multiple selections allowed

6. Contact Email (email)
   - Email format validation

7. Created Date (created_time)
   - Auto-populated on creation

8. Last Modified (last_edited_time)
   - Auto-updated on changes

9. Owner (people)
   - Notion user selection

10. Revenue (number)
    - Format: Currency (USD)
    - Precision: 2 decimals
```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: ChatGPT Says "No Properties Found"

**Cause:** Database might be empty or access restricted

**Solution:**
```
"Try getting the database schema again with mode: 'database_get'. 
If that fails, check if the integration has access to this database."
```

### Issue 2: Only Seeing Object References `{...}`

**Cause:** ChatGPT's default display is collapsing nested objects

**Solution:**
```
"Expand the properties object and list each property individually"
```

### Issue 3: Missing Select Options

**Cause:** Options are in a nested structure

**Solution:**
```
"For each select, multi-select, and status property, 
list all available options with their names and colors"
```

---

## 💡 Advanced Use Cases

### Copy Schema to New Database

**Prompt:**
```
"Get the schema from database A [ID_A] and create a new database 
called 'Clone of A' with the exact same properties"
```

**ChatGPT will:**
1. Query database A for schema
2. Extract all property configurations
3. Create new database with `notionCreateDatabase`
4. Return the new database ID

---

### Compare Two Database Schemas

**Prompt:**
```
"Compare the schemas of database [ID_1] and database [ID_2]. 
Show me which properties exist in one but not the other."
```

**ChatGPT will:**
1. Query both databases
2. Extract property lists
3. Show differences in a table format

---

### Generate Documentation

**Prompt:**
```
"Get the schema for [DATABASE_ID] and create a markdown table 
documenting all properties, types, and descriptions"
```

**Output:**
```markdown
| Property | Type | Configuration | Description |
|----------|------|---------------|-------------|
| Name | title | Required | Primary identifier |
| Status | status | Active, Inactive, Pending | Current state |
| Priority | select | High, Medium, Low | Urgency level |
```

---

## 🚀 Best Practice Workflow

### When Creating Records

1. **First, get the schema:**
   ```
   "Show me the properties in database [ID]"
   ```

2. **Then create record with exact property names:**
   ```
   "Create a record in that database with:
   - Name: 'New Partner'
   - Status: 'Active'
   - Priority: 'High'"
   ```

This ensures you use correct property names and valid values.

---

### When Updating Database Structure

1. **Get current schema:**
   ```
   "Get the schema for database [ID]"
   ```

2. **Plan changes:**
   ```
   "I want to add a 'Region' select property with options: 
   North, South, East, West"
   ```

3. **Execute:**
   ```
   "Add that property to the database"
   ```

---

## 📊 Example Conversation

**User:**
```
Get the database schema for 39943bcc-9ec1-453e-bc02-41292073bc54 
and list all properties
```

**ChatGPT:**
```
I'll retrieve the database schema for you.

[Uses notionQuery with mode: 'database_get']

Your "API Partners" database has the following properties:

1. Name (title) - Required
2. Company (rich_text)
3. Status (status)
   - Options: Active, Inactive, Pending
4. Priority (select)
   - Options: High, Medium, Low
5. Contact Email (email)
6. Revenue (number)
   - Format: USD currency
7. Created (created_time)
8. Owner (people)

Would you like to create a record in this database?
```

---

## 🎯 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ QUICK PROMPTS FOR DATABASE SCHEMA                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Basic:                                                   │
│ "Get schema for database [ID]"                          │
│                                                          │
│ Detailed:                                                │
│ "List all properties and their types for [ID]"          │
│                                                          │
│ With Options:                                            │
│ "Show property types and select options for [ID]"       │
│                                                          │
│ JSON Format:                                             │
│ "Show full schema as JSON for [ID]"                     │
│                                                          │
│ For Copying:                                             │
│ "Get schema from [ID] formatted for creating new DB"    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Alternative: Using Raw API Response

If ChatGPT isn't expanding the properties, you can:

1. **Ask for raw response:**
   ```
   "Query database [ID] with mode: 'database_get' and 
   show me the entire response object without collapsing nested fields"
   ```

2. **Use Code Interpreter:**
   ```
   "Query database [ID], then use Code Interpreter to parse 
   the properties object and create a formatted table"
   ```

---

## 📝 Summary

**BEST PROMPT (Copy & Use):**
```
"Get the database schema for [DATABASE_ID] and list all property 
names with their types and any options for select fields"
```

**Why the {…} appears:**
- It's just ChatGPT's UI collapsing nested objects
- The data IS there in `database.properties`
- Asking ChatGPT to "list" or "show" forces it to expand

**Pro Tip:**
Enable Code Interpreter capability - it can parse the nested JSON and create beautiful formatted tables of your schema automatically.

---

*Last Updated: October 24, 2025 | API v5.0.0*

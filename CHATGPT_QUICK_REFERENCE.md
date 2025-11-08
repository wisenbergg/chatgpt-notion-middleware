# ChatGPT Quick Reference for Notion Middleware API

## ⚠️ CRITICAL RULES - READ FIRST

### Relations Format
```json
// ✅ CORRECT (Notion API 2025-09-03)
{
  "Related Tasks": {
    "relation": {
      "data_source_id": "uuid-here",
      "dual_property": {}
    }
  }
}

// ⚠️ ALSO WORKS (auto-converted by middleware)
{
  "Related Tasks": {
    "relation": {
      "database_id": "uuid-here",  // Auto-converted to data_source_id
      "dual_property": {}
    }
  }
}

// ❌ WRONG - DO NOT USE
{
  "Related Tasks": {
    "relation": {
      "database_id": "uuid-here",
      "type": "dual_property"  // ❌ NEVER use "type" for relations
    }
  }
}
```

### Property Updates Format
```json
// ✅ CORRECT - Send properties as object
{
  "database_id": "uuid",
  "properties": {
    "Status": {"select": {"options": [{"name": "Active"}]}},
    "Count": {"number": {"format": "number"}}
  }
}

// ❌ WRONG - Do not stringify into content
{
  "database_id": "uuid",
  "content": "{\"Status\": ...}"  // ❌ NEVER stringify properties
}
```

## 📚 Property Type Quick Reference

### Basic Properties

**Title**
```json
{"title": {}}
```

**Rich Text**
```json
{"rich_text": {}}
```

**Number**
```json
{"number": {"format": "number"}}      // Plain number
{"number": {"format": "dollar"}}      // $1,234.56
{"number": {"format": "percent"}}     // 45%
{"number": {"format": "euro"}}        // €1,234.56
```

**Select**
```json
{
  "select": {
    "options": [
      {"name": "Active", "color": "green"},
      {"name": "Inactive", "color": "gray"}
    ]
  }
}
```

**Multi-Select**
```json
{
  "multi_select": {
    "options": [
      {"name": "Tag1"},
      {"name": "Tag2"}
    ]
  }
}
```

**Date**
```json
{"date": {}}
```

**Checkbox**
```json
{"checkbox": {}}
```

**URL**
```json
{"url": {}}
```

**Email**
```json
{"email": {}}
```

**Phone**
```json
{"phone_number": {}}
```

### Advanced Properties

**Formula**
```json
{
  "formula": {
    "expression": "prop(\"Revenue\") - prop(\"Costs\")"
  }
}
```

Common formula functions:
- `prop("Property Name")` - Reference another property
- `if(condition, true_value, false_value)` - Conditional
- `round(number)` or `round(number, decimals)` - Round numbers
- `concat(str1, str2)` - Combine strings
- `format(value)` - Convert to string
- `pow(base, exponent)` - Power function
- `log(number)` - Natural logarithm

**Relation (Dual Property)**
```json
{
  "relation": {
    "data_source_id": "target-database-uuid",
    "dual_property": {}
  }
}
```

**Relation (Single Property)**
```json
{
  "relation": {
    "data_source_id": "target-database-uuid",
    "single_property": {}
  }
}
```

**Rollup**
```json
{
  "rollup": {
    "relation_property_name": "Related Tasks",
    "rollup_property_name": "Status",
    "function": "count"
  }
}
```

Common rollup functions:
- `count` - Count related items
- `count_values` - Count unique values
- `sum` - Sum numbers
- `average` - Average numbers
- `median` - Median value
- `min` - Minimum value
- `max` - Maximum value
- `show_original` - Show first related value

### Read-Only Properties

**Created Time**
```json
{"created_time": {}}
```

**Created By**
```json
{"created_by": {}}
```

**Last Edited Time**
```json
{"last_edited_time": {}}
```

**Last Edited By**
```json
{"last_edited_by": {}}
```

## 🔧 Common Workflows

### 1. Create Database
```json
POST /chatgpt/notion-create-database
{
  "parent_page_id": "parent-page-uuid",
  "title": "My Database",
  "properties": {
    "Name": {"title": {}},
    "Status": {
      "select": {
        "options": [
          {"name": "Todo", "color": "red"},
          {"name": "Done", "color": "green"}
        ]
      }
    },
    "Due Date": {"date": {}}
  }
}
```

### 2. Add Properties to Existing Database
```json
POST /chatgpt/notion-update-database
{
  "database_id": "database-uuid",
  "properties": {
    "Priority": {
      "select": {
        "options": [{"name": "High"}, {"name": "Low"}]
      }
    },
    "Count": {"number": {"format": "number"}}
  }
}
```

### 3. Create Relations and Rollups
```json
POST /chatgpt/notion-update-database
{
  "database_id": "database-uuid",
  "properties": {
    "Related Items": {
      "relation": {
        "data_source_id": "target-db-uuid",
        "dual_property": {}
      }
    },
    "Item Count": {
      "rollup": {
        "relation_property_name": "Related Items",
        "rollup_property_name": "Name",
        "function": "count"
      }
    }
  }
}
```

### 4. Create Page in Database
```json
POST /chatgpt/notion-write
{
  "target": "db",
  "database_id": "database-uuid",
  "properties": {
    "Name": "My Page",
    "Status": "Active",
    "Count": 42,
    "Due Date": "2025-12-31"
  }
}
```

### 5. Query Database
```json
POST /chatgpt/notion-query
{
  "mode": "db_query",
  "database_id": "database-uuid",
  "filter": {
    "property": "Status",
    "select": {
      "equals": "Active"
    }
  },
  "sorts": [
    {
      "property": "Created Time",
      "direction": "descending"
    }
  ],
  "page_size": 100
}
```

### 6. Get Page Details
```json
POST /chatgpt/notion-query
{
  "mode": "page_get",
  "page_id": "page-uuid"
}
```

Or use URL directly:
```json
{
  "mode": "page_get",
  "page_url": "https://www.notion.so/Page-Name-abc123..."
}
```

## 🎯 Best Practices

### Property Updates
1. ✅ **DO** use `notionUpdateDatabaseV5` operation
2. ✅ **DO** send properties as direct object in `properties` field
3. ❌ **DON'T** stringify properties into `content` field
4. ❌ **DON'T** use `notionUpdateDatabaseCompat` unless specifically instructed

### Relations
1. ✅ **DO** use `"dual_property": {}` for two-way relations
2. ✅ **DO** use `"single_property": {}` for one-way relations
3. ❌ **DON'T** use `"type": "dual_property"`
4. ✅ **DO** create relations before rollups that reference them

### Formulas
1. ✅ **DO** use `prop("Property Name")` to reference properties
2. ✅ **DO** escape quotes in expressions: `prop(\"Name\")`
3. ✅ **DO** use `if()` for conditionals
4. ✅ **DO** test formulas with simple cases first

### Page Creation
1. ✅ **DO** use flat values: `"Status": "Active"` not `"Status": {"select": {"name": "Active"}}`
2. ✅ **DO** use ISO dates: `"2025-12-31"`
3. ✅ **DO** use simple arrays for multi-select: `["Tag1", "Tag2"]`
4. ⚠️ **PEOPLE properties** require user IDs, not emails - query for IDs first

## ⚠️ Common Errors and Fixes

### Error: "Invalid input" for all properties
**Cause:** Properties stringified in `content` field
**Fix:** Send as object in `properties` field

### Error: Relation validation failed
**Cause:** Used `"type": "dual_property"` instead of `"dual_property": {}`
**Fix:** Use correct format shown above

### Error: Property doesn't exist
**Cause:** Trying to write to property that hasn't been added to database schema
**Fix:** Add property to database first using `notionUpdateDatabaseV5`

### Error: UnrecognizedKwargsError
**Cause:** Sending parameter not in OpenAPI spec
**Fix:** Use only documented parameters (database_id, page_id, properties, etc.)

## 🚀 Pro Tips

1. **URLs work everywhere**: You can use full Notion URLs instead of IDs for `database_id`, `database_url`, `page_id`, `page_url`

2. **Batch property updates**: You can add up to 100 properties in a single API call

3. **Formula complexity**: Formulas can reference other formulas, creating calculated chains

4. **Rollup flexibility**: Use `show_original` function to pull single values from related databases

5. **Auto-conversion**: The middleware automatically converts simple values to Notion format for page creation

6. **Execute immediately**: Don't ask for confirmation when calling API operations - execute directly

# ChatGPT → Notion Middleware

> **Version 5.0.0** - Comprehensive Notion API 2025-09-03 integration middleware with full CRUD operations

A production-ready middleware that provides seamless integration between ChatGPT Actions and the Notion API 2025-09-03. Built with modern Notion API architecture supporting data sources, comprehensive property management, and full database operations.

## 🚀 Features

- **✅ Complete API Coverage**: All 14+ query modes and CRUD operations
- **✅ Notion API 2025-09-03**: Full compatibility with latest data source architecture  
- **✅ Data Source Management**: Proper schema handling and property updates
- **✅ Production Ready**: Deployed with custom domain and comprehensive error handling
- **✅ ChatGPT Actions**: Optimized for ChatGPT Actions integration
- **✅ Type Safety**: Full TypeScript implementation with Zod validation

## 🏗️ Architecture

### Modern Notion API Structure
```
Database (metadata) → Data Sources (schemas) → Pages (content)
```

The middleware properly handles the 2025-09-03 architecture where:
- **Databases** contain metadata and reference data sources
- **Data Sources** contain the actual property schemas (columns)
- **Pages** are created within data sources, not directly in databases

## 📊 API Endpoints

### Core Operations
- `POST /chatgpt/notion-write` - Create/update content in databases and pages
- `POST /chatgpt/notion-create-database` - Create new databases with property schemas
- `POST /chatgpt/notion-update-database` - Add/rename properties via data source updates
- `POST /chatgpt/notion-query` - Query databases, search content, retrieve pages

### Query Modes
Supports 14+ query modes including:
- `search` - Search pages and databases
- `db_query` - Query database content via data sources
- `page_get` - Retrieve individual pages
- `database_get` - Get database metadata and data sources
- `data_source_get` - Retrieve data source schemas
- `data_source_query` - Query data source content
- `data_source_update` - Update data source properties
- `block_*` - Block-level operations (get, update, append, delete)
- `page_property_get` - Retrieve page property values

### Utility
- `GET/POST /debug/ping` - Health check and environment validation
- `GET /openapi.yaml` - Complete API documentation

## 🔧 Property Types

Full support for all Notion property types:
- **Basic**: `title`, `rich_text`, `number`, `checkbox`, `url`, `email`, `phone_number`
- **Selection**: `select`, `multi_select`, `status`
- **Advanced**: `date`, `people`, `files`, `formula`, `relation`, `rollup`
- **Metadata**: `created_time`, `created_by`, `last_edited_time`, `last_edited_by`, `unique_id`

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Notion Integration Token
- Vercel Account (for deployment)

### Environment Variables
```env
NOTION_TOKEN=your_notion_integration_token
CHATGPT_ACTION_SECRET=your_chatgpt_action_secret
NOTION_PARENT_PAGE_ID=optional_default_parent_page
```

### Installation
```bash
npm install
npm run build
npm run start
```

### Development
```bash
npm run dev  # Watch mode with tsx
```

## 🚀 Deployment

### Vercel Deployment
```bash
vercel --prod
```

### Custom Domain
Configure your custom domain in Vercel settings and update the OpenAPI spec:
```yaml
servers:
  - url: https://your-domain.com
```

## 📖 Usage Examples

### Create Database
```javascript
POST /chatgpt/notion-create-database
{
  "title": "Project Tasks",
  "parent_page_id": "page-id",
  "properties": {
    "Task Name": { "type": "title" },
    "Status": { 
      "type": "select", 
      "options": ["Todo", "In Progress", "Done"] 
    },
    "Due Date": { "type": "date" },
    "Priority": { "type": "number" }
  }
}
```

### Add Database Properties
```javascript
POST /chatgpt/notion-update-database
{
  "database_id": "database-id",
  "properties": {
    "Notes": { "type": "rich_text" },
    "Assignee": { "type": "people" }
  }
}
```

### Query Database
```javascript
POST /chatgpt/notion-query
{
  "mode": "db_query",
  "database_id": "database-id",
  "filter": {
    "property": "Status",
    "select": { "equals": "In Progress" }
  }
}
```

### Create Page
```javascript
POST /chatgpt/notion-write
{
  "target": "db",
  "database_id": "database-id",
  "title": "New Task",
  "properties": {
    "Status": "Todo",
    "Priority": 3
  },
  "content": "Task description here"
}
```

## 🔐 Authentication

Uses bearer token authentication:
```
Authorization: Bearer YOUR_CHATGPT_ACTION_SECRET
```

## 📋 Response Format

All endpoints return consistent JSON responses:
```javascript
{
  "ok": true,
  "action": "created_database",
  "database_id": "abc123...",
  "url": "https://notion.so/...",
  "request_id": "optional"
}
```

## 🏭 Production Features

- **Error Handling**: Comprehensive error responses with helpful messages
- **Request Validation**: Zod schema validation for all inputs
- **ID Normalization**: Accepts Notion URLs or raw IDs
- **Logging**: Detailed console logging for debugging
- **CORS**: Configured for ChatGPT Actions integration
- **Health Checks**: Built-in ping endpoints for monitoring

## 🔄 API Versioning

- **OpenAPI Version**: 3.1.0 (latest specification)
- **Middleware Version**: 5.0.0 (matches Notion SDK 5.0.0)
- **Notion API**: 2025-09-03 (latest with data source architecture)

## 📚 Documentation

- **OpenAPI Spec**: Available at `/openapi.yaml`
- **Interactive Docs**: Import OpenAPI spec into your preferred API client
- **Type Definitions**: Full TypeScript types in `src/schema.ts`

## 🛡️ Error Handling

Common error responses:
- `400 Bad Request` - Invalid payload or missing parameters
- `401 Unauthorized` - Missing or invalid authentication
- `500 Internal Server Error` - Notion API errors or server issues

## 🔧 Development

### Project Structure
```
src/
├── notion.ts     # Core Notion API integration
├── schema.ts     # Zod validation schemas
└── server.ts     # Express server and routing

openapi.yaml      # API documentation
package.json      # Dependencies and scripts
tsconfig.json     # TypeScript configuration
```

### Key Dependencies
- `@notionhq/client` v5.0.0 - Official Notion SDK
- `express` - Web server framework
- `zod` - Runtime type validation
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

## 📝 License

This project is designed for integration with ChatGPT Actions and Notion workspaces.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues related to:
- **Notion API**: Check [Notion's official documentation](https://developers.notion.com)
- **ChatGPT Actions**: Refer to OpenAI's Actions documentation
- **This Middleware**: Create an issue in this repository

---

Built with ❤️ for seamless Notion integration with ChatGPT Actions

## Deploy
Any Node-friendly host works (Fly.io, Render, Vercel functions, Cloud Run, etc.). Ensure `openapi.yaml` is accessible at a public URL for ChatGPT Actions, and the service is reachable over HTTPS.
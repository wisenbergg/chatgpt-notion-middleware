# ChatGPT → Notion Middleware

> **Version 5.3.12** - Comprehensive Notion API 2025-09-03 integration middleware with database aliases and intelligent normalization

A production-ready middleware that provides seamless integration between ChatGPT Actions and the Notion API 2025-09-03. Built with modern Notion API architecture supporting data sources, comprehensive property management, full database operations, and friendly database aliases.

## 🚀 Features

- **✅ Database Aliases**: Use friendly names like `weekly_poc_reports` instead of long UUIDs
- **✅ Complete API Coverage**: All 14+ query modes and CRUD operations
- **✅ Notion API 2025-09-03**: Full compatibility with latest data source architecture  
- **✅ Smart Pagination**: Default limits prevent overwhelming responses
- **✅ Intelligent Normalization**: Accepts URLs, IDs, or aliases - auto-converts to proper format
- **✅ Schema-Aware Properties**: Dynamic title property detection and type conversion
- **✅ Production Ready**: Deployed with comprehensive error handling
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

### Intelligent Features

**🏷️ Database Aliases**
- Use friendly names: `weekly_poc_reports`, `master_tasks_db`, `social_accounts`
- Automatically resolves to actual database IDs
- Works across all endpoints (write, query, update, create)
- 34 pre-configured workspace databases
- Configurable via `NOTION_DB_ALIASES` environment variable

**🔧 Smart Normalization**
- Accepts Notion URLs: `https://notion.so/workspace/abc123...`
- Accepts raw IDs: `abc123...` or `abc-123-...`
- Accepts database aliases: `weekly_poc_reports`
- Auto-converts between `database_id` ↔ `data_source_id`
- Dynamic title property detection (no hardcoded field names)

**📊 Pagination Defaults**
- Default max results: 50 (prevents overwhelming responses)
- Default page size: 20
- Prevents ChatGPT from receiving too much data at once

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
# Required
NOTION_TOKEN=secret_your_notion_integration_token
CHATGPT_ACTION_SECRET=your_chatgpt_action_secret

# Optional
PORT=8787  # For local development
NOTION_DB_ID=abc-123...  # Default database (less important with aliases)
NOTION_PARENT_PAGE_ID=xyz-789...  # Default parent page for databases

# Optional: Override database aliases (JSON format)
NOTION_DB_ALIASES={"my_custom_alias":"database-id-here"}
```

### Pre-configured Database Aliases

Your workspace has 34 databases ready to use with friendly names:

**Main Databases:**
- `marketing_projects_2025_q`
- `weekly_poc_reports`
- `poc_kpi_tracking`
- `poc_implementation_tasks`
- `microinfluencer_tracker_2025_api`
- `master_tasks_db`
- `meeting_notes_db`
- `master_content_db`
- `social_accounts`
- `okrs_2025_master`
- `projects_epics_db`
- `software_engineering_ats`
- `therapist_contact_directory`
- `onboarding`
- `couchloop_launch_content_tracker`
- `social_media_log_in_info`
- `competitor_matrix`
- `content_ideas`
- `content_schedule`
- `schedule`
- `decisions`
- `app_testing_tracker`
- `crisis_management_example_log`
- `feedback_database`
- `internal_feedback_form`
- And more...

**Legacy Aliases (for backward compatibility):**
- `influencers` → microinfluencer_tracker_2025_api
- `poc_tasks` → poc_implementation_tasks
- `default` → marketing_projects_2025_q

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Notion Integration Token ([Create one here](https://www.notion.so/my-integrations))
- Vercel Account (for deployment)

### Quick Start

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd chatgpt-notion-middleware
npm install
```

2. **Configure Environment**
```bash
# Copy example environment file
cp .env.example .env.notion

# Edit .env.notion with your credentials
NOTION_TOKEN=secret_your_token_here
CHATGPT_ACTION_SECRET=choose-a-strong-secret
PORT=8787
```

3. **Build and Run**
```bash
# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

4. **Verify Setup**
```bash
# Test the health endpoint
curl http://localhost:8787/debug/ping
```

### Discovering Your Databases

Run the included script to discover all databases in your workspace:
```bash
node scripts/fetch-databases.mjs
```

This will output:
- All database names and IDs
- Suggested aliases
- Ready-to-use DB_ALIASES configuration

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Initial Setup**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link project to Vercel
vercel link

# Set environment variables in Vercel
vercel env add NOTION_TOKEN
vercel env add CHATGPT_ACTION_SECRET
```

2. **Deploy to Production**
```bash
vercel --prod
```

3. **Verify Deployment**
```bash
# Check deployment status
vercel ls --prod

# Test your production endpoint
curl https://your-domain.vercel.app/debug/ping
```

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `api.yourcompany.com`)
4. Update DNS records as instructed by Vercel
5. Update `openapi.yaml` with your custom domain:
```yaml
servers:
  - url: https://api.yourcompany.com
```

### Environment Variables in Production

Make sure to set these in Vercel:
- `NOTION_TOKEN` - Your Notion integration token
- `CHATGPT_ACTION_SECRET` - Secret for authenticating ChatGPT
- `NOTION_DB_ALIASES` (optional) - Custom database aliases as JSON

## 📖 Usage Examples

### Using Database Aliases (New! 🎉)

**Before (v5.3.11 and earlier):**
```javascript
POST /chatgpt/notion-write
{
  "target": "db",
  "database_id": "c64e730c-5cb2-46f6-b379-792b5591e33e",  // Long UUID
  "title": "Weekly Update",
  "properties": { "Status": "Published" }
}
```

**After (v5.3.12+):**
```javascript
POST /chatgpt/notion-write
{
  "target": "db",
  "database_id": "weekly_poc_reports",  // Friendly alias! 
  "title": "Weekly Update",
  "properties": { "Status": "Published" }
}
```

### Create Database
```javascript
POST /chatgpt/notion-create-database
{
  "title": "Project Tasks",
  "parent_page_id": "page-id",  // Or use an alias if it's a database
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

### Query Database (with Alias)
```javascript
POST /chatgpt/notion-query
{
  "mode": "db_query",
  "database_id": "master_tasks_db",  // Use alias instead of UUID!
  "filter": {
    "property": "Status",
    "select": { "equals": "In Progress" }
  },
  "max_results": 10  // Optional: override default pagination
}
```

### Create Page (Multiple Ways)
```javascript
POST /chatgpt/notion-write
{
  "target": "db",
  // All of these work:
  "database_id": "weekly_poc_reports",  // ✅ Alias
  // "database_id": "c64e730c-5cb2-46f6-b379-792b5591e33e",  // ✅ UUID
  // "database_id": "https://notion.so/workspace/c64e730c5cb246f6b379792b5591e33e",  // ✅ URL
  
  "title": "New Task",
  "properties": {
    "Status": "Todo",
    "Priority": 3
  },
  "content": "Task description here"
}
```

### Add Properties to Database
```javascript
POST /chatgpt/notion-update-database
{
  "database_id": "poc_implementation_tasks",  // Use alias!
  "properties": {
    "Notes": { "type": "rich_text" },
    "Assignee": { "type": "people" },
    "Estimated Hours": { "type": "number" }
  }
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

- **Current Version**: 5.3.12
- **OpenAPI Version**: 3.1.0 (latest specification)
- **Notion SDK**: 5.0.0
- **Notion API**: 2025-09-03 (latest with data source architecture)

### Recent Updates

**v5.3.12** (October 25, 2024)
- ✨ Added database aliases for all 34 workspace databases
- ✨ Pagination defaults (max 50 results, 20 per page)
- ✨ Alias resolution across all endpoints
- 🐛 Fixed: Dynamic title property detection (no longer hardcoded)

**v5.3.11** (October 25, 2024)
- 🐛 Fixed: "Name is not a property" error with dynamic schema detection
- 📚 Added comprehensive `.github/copilot-instructions.md` documentation

**v5.3.10** (October 24, 2024)
- 🔧 Improved operation clarity for ChatGPT
- 🔧 Changed `isConsequential` to `true` for schema operations

## 📚 Documentation

### API Documentation
- **OpenAPI Spec**: Available at `/openapi.yaml`
- **Interactive Docs**: Import OpenAPI spec into your preferred API client
- **Type Definitions**: Full TypeScript types in `src/schema.ts`

### ChatGPT Prompt Guides

Comprehensive guides for optimal ChatGPT Actions integration:

- **[Adding Properties](./docs/CHATGPT_PROMPTS.md)** - How to add columns/properties to databases
- **[Creating Pages](./docs/CHATGPT_PAGES.md)** - How to create pages in databases
- **[Updating Pages](./docs/CHATGPT_UPDATE_PAGE.md)** - How to update existing pages
- **[Querying Data](./docs/CHATGPT_QUERY.md)** - How to search and query your Notion workspace
- **[Creating Databases](./docs/CHATGPT_CREATE_DATABASE.md)** - How to create new databases

Each guide includes:
- ✅ Optimal prompt templates
- ✅ Real-world examples
- ✅ Property type references
- ✅ Troubleshooting tips
- ✅ Complete JSON structures
- ✅ Common pitfalls to avoid

## 🛡️ Error Handling

Common error responses:
- `400 Bad Request` - Invalid payload or missing parameters
- `401 Unauthorized` - Missing or invalid authentication
- `500 Internal Server Error` - Notion API errors or server issues

## 🔧 Development

### Project Structure
```
.github/
├── copilot-instructions.md   # Comprehensive development guide
scripts/
├── fetch-databases.mjs        # Auto-discover workspace databases
src/
├── notion.ts                  # Core Notion API integration & handlers
├── schema.ts                  # Zod validation schemas & TypeScript types
└── server.ts                  # Express server, routing & middleware
docs/
├── CHATGPT_*.md              # ChatGPT prompt guides
openapi.yaml                   # API documentation for ChatGPT Actions
package.json                   # Dependencies and scripts
tsconfig.json                  # TypeScript configuration
vercel.json                    # Vercel deployment config
```

### Key Files

**Critical Functions** (see `.github/copilot-instructions.md` for details):
1. `extractNotionId()` - Normalizes URLs/IDs to hyphenated format
2. `resolveDataSourceId()` - Converts database_id ↔ data_source_id
3. `resolveDatabaseAlias()` - Resolves friendly names to UUIDs
4. `getDatabaseSchema()` - Fetches property schema from data source
5. `toNotionPropertiesWithSchema()` - Schema-aware property conversion
6. `handleWrite()` - Main write operation with dynamic title detection
7. `handleQuery()` - Multi-mode query handler with pagination
8. `handleUpdateDatabase()` - Add/rename properties (uses data_sources endpoint)
9. `handleUpdateDataSource()` - Update database metadata (uses databases endpoint)

### Key Dependencies
- `@notionhq/client` v5.0.0 - Official Notion SDK
- `express` v4.19.2 - Web server framework
- `zod` v3.23.8 - Runtime type validation
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `tsx` - TypeScript execution for development

## 📝 License

This project is designed for integration with ChatGPT Actions and Notion workspaces.

## 🤝 For Your Team

### Getting Started with ChatGPT Integration

1. **Get Access**
   - Request the production URL from your team lead
   - Get the `CHATGPT_ACTION_SECRET` for authentication

2. **Configure ChatGPT Action**
   - In ChatGPT, create a new custom GPT or Action
   - Import the OpenAPI schema from: `https://your-domain.com/openapi.yaml`
   - Set authentication to "API Key" with header `Authorization: Bearer YOUR_SECRET`
   - Test with: "List my Notion databases"

3. **Use Database Aliases**
   - Instead of long UUIDs, use friendly names:
     - "Add a task to `weekly_poc_reports`"
     - "Query `master_tasks_db` for open tasks"
     - "Create a page in `microinfluencer_tracker_2025_api`"

4. **Common Operations**
   - **Create pages**: "Add a new task to [database] with [details]"
   - **Query data**: "Show me all [status] items in [database]"
   - **Update pages**: "Update the page titled [X] in [database]"
   - **Search**: "Find pages about [topic] in my workspace"

### Available Databases

Your team has 34 databases available with aliases:
- `weekly_poc_reports`, `poc_kpi_tracking`, `poc_implementation_tasks`
- `master_tasks_db`, `meeting_notes_db`, `master_content_db`
- `social_accounts`, `okrs_2025_master`, `projects_epics_db`
- `microinfluencer_tracker_2025_api`, `content_schedule`
- And 23 more! (see full list in Environment Variables section)

### Need Help?

- **API Documentation**: Visit `/openapi.yaml` on the production server
- **ChatGPT Guides**: Check the `docs/` folder for prompt templates
- **Development Guide**: See `.github/copilot-instructions.md` for technical details
- **Issues**: Contact your technical lead or create an issue in the repository

## 🤝 Contributing

### For Team Members

1. **Get Repository Access**
```bash
git clone https://github.com/wisenbergg/chatgpt-notion-middleware.git
cd chatgpt-notion-middleware
```

2. **Set Up Local Environment**
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.notion

# Get credentials from team lead and add to .env.notion
```

3. **Make Changes**
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Test locally with: npm run dev

# Build to verify
npm run build
```

4. **Submit Changes**
```bash
# Commit with descriptive message
git add -A
git commit -m "feat: description of your changes"

# Push and create PR
git push origin feature/your-feature-name
```

### Development Guidelines

- **Before modifying critical functions**: Read `.github/copilot-instructions.md`
- **Testing**: Test with actual ChatGPT integration, not just curl
- **Database IDs**: Never hardcode - use aliases or environment variables
- **Error messages**: Make them helpful and actionable
- **Logging**: Use descriptive console logs for debugging

## 📞 Support

### For Team Members
- **ChatGPT Integration Issues**: Contact your team lead
- **Database Access**: Ensure your Notion integration has access to databases
- **Authentication Errors**: Verify you're using the correct `CHATGPT_ACTION_SECRET`
- **Can't find database**: Use the discovery script: `node scripts/fetch-databases.mjs`

### For Developers
- **Notion API**: Check [Notion's official documentation](https://developers.notion.com)
- **ChatGPT Actions**: Refer to [OpenAI's Actions documentation](https://platform.openai.com/docs/actions)
- **This Middleware**: 
  - Technical details: `.github/copilot-instructions.md`
  - Issues: Create an issue in this repository
  - Questions: Ask in your team's development channel

### Common Issues

**"Could not find database"**
- Database might not be shared with integration
- Go to database → Share → Add your integration

**"API token is invalid"**
- Check `NOTION_TOKEN` in environment variables
- Verify token hasn't been revoked in Notion settings

**"UnrecognizedKwargsError" from ChatGPT**
- OpenAPI schema might be cached by ChatGPT
- Try refreshing the action or waiting a few minutes
- Current version should handle most parameter variations

---

Built with ❤️ for seamless Notion integration with ChatGPT Actions

**Version**: 5.3.12 | **Last Updated**: October 25, 2024
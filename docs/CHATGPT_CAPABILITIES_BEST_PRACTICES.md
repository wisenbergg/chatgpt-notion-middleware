# Best Practices for ChatGPT Actions Capabilities

## What Are Capabilities?

In ChatGPT GPT Actions, **capabilities** are the short descriptions that appear in the GPT's interface telling users what the GPT can do. They're critical for discoverability and setting user expectations.

---

## ✅ Best Practices for Writing Capabilities

### 1. **Be Specific and Action-Oriented**

❌ **Bad:** "Notion integration"  
✅ **Good:** "Create and manage records in your Notion databases"

❌ **Bad:** "Database operations"  
✅ **Good:** "Search, filter, and retrieve data from Notion databases"

### 2. **Use User Language, Not Technical Jargon**

❌ **Bad:** "Execute POST requests to notionWrite endpoint"  
✅ **Good:** "Add new records to your Notion databases"

❌ **Bad:** "Query databases via filter operators"  
✅ **Good:** "Find specific records by status, date, or other properties"

### 3. **Highlight the Most Common Operations First**

Order matters! List capabilities by frequency of use:

1. ✅ "Create new records in Notion databases" (MOST COMMON)
2. ✅ "Search and filter database records"
3. ✅ "Update existing records"
4. ✅ "Create custom databases with properties"

### 4. **Focus on Outcomes, Not Technical Details**

❌ **Bad:** "Supports notionWrite, notionQuery, notionUpdateDatabaseV5"  
✅ **Good:** "Manage your Notion workspace: create, search, and update content"

### 5. **Keep It Concise (Under 60 Characters per Capability)**

Short capabilities are scannable and fit better in UI:

✅ "Add records to Notion databases" (34 chars)  
✅ "Search Notion data by filters" (29 chars)  
✅ "Update record properties" (24 chars)

### 6. **Use Parallel Structure**

All capabilities should follow the same grammatical pattern:

✅ All verb phrases:
- "Create database records"
- "Search existing data"
- "Update record properties"

✅ All outcome-focused:
- "Add tasks to your project tracker"
- "Find overdue items in databases"
- "Mark records as completed"

### 7. **Avoid Redundancy**

❌ **Redundant:**
- "Create Notion pages"
- "Add Notion records"
- "Insert Notion entries"

✅ **Combined:**
- "Create and manage Notion database records"

### 8. **Include Real-World Use Cases When Possible**

❌ **Generic:** "Query databases"  
✅ **Contextual:** "Find active projects, overdue tasks, or high-priority items"

---

## 📋 Recommended Capabilities for Your Notion API

Based on your API's most common operations, here are optimized capabilities:

### Option A: Brief & Focused (4 capabilities)

```
1. Create records in Notion databases
2. Search and filter your Notion data
3. Update existing database records
4. Design custom databases with properties
```

### Option B: Outcome-Focused (4 capabilities)

```
1. Add tasks, customers, or items to Notion databases
2. Find records by status, date, priority, or custom filters
3. Update record properties and content
4. Build structured databases with custom fields
```

### Option C: Use-Case Driven (4 capabilities)

```
1. Manage project tasks in Notion databases
2. Track customers and deals in your CRM
3. Search records by status, priority, or date
4. Create custom databases for any workflow
```

---

## 🎯 Capabilities vs. Instructions vs. Conversation Starters

Understanding the difference helps you optimize each:

| Element | Purpose | Character Limit | Best For |
|---------|---------|----------------|----------|
| **Capabilities** | High-level overview of what GPT can do | ~60 chars each | Marketing, discoverability |
| **Instructions** | Detailed protocol for how to execute | 8000 chars total | Technical accuracy |
| **Conversation Starters** | Specific example prompts | ~50 chars each | User guidance, onboarding |

### Example Hierarchy:

**Capability:** "Create records in Notion databases"
  ↓
**Instruction:** "Use notionWrite with target='db' and database_id. Always clarify property names and validate before execution..."
  ↓
**Conversation Starter:** "Add a new task to my project database"

---

## 🔍 Real-World Examples from Popular GPTs

### Zapier GPT Capabilities:
✅ "Interact with over 6,000 apps"  
✅ "Create automated workflows"  
✅ "Search and manage your connected apps"

**Why they work:** Action-oriented, outcome-focused, quantifiable

### Code Interpreter Capabilities:
✅ "Run Python code"  
✅ "Analyze data and create visualizations"  
✅ "Process files and generate reports"

**Why they work:** Verb-first, specific outcomes, user language

### DALL·E Capabilities:
✅ "Generate images from text descriptions"  
✅ "Edit existing images"  
✅ "Create variations of images"

**Why they work:** Simple, clear, parallel structure

---

## ⚡ Testing Your Capabilities

### Questions to Ask:

1. **Clarity:** Can a non-technical user understand what this does?
2. **Specificity:** Does it describe a concrete action or outcome?
3. **Priority:** Is it ordered by most-common to least-common operations?
4. **Uniqueness:** Does each capability describe a distinct function?
5. **Scannability:** Can users grasp all capabilities in 5 seconds?

### A/B Test Framework:

Show your capabilities to 5 users and ask:
- "What do you think this GPT does?"
- "Which capability would you use first?"
- "Is anything unclear or technical?"

---

## 🚫 Common Mistakes to Avoid

### 1. **Too Technical**
❌ "Execute CRUD operations via REST API endpoints"  
✅ "Create, read, update, and delete Notion records"

### 2. **Too Vague**
❌ "Notion automation"  
✅ "Automatically create and update Notion database records"

### 3. **Too Many Capabilities**
❌ Listing 10+ capabilities overwhelms users  
✅ Keep to 4-6 most important capabilities

### 4. **Mixing Abstraction Levels**
❌ "Manage databases" + "Update the Status property to Active"  
✅ All high-level OR all specific (stay consistent)

### 5. **Ignoring User Perspective**
❌ "Support for Notion API 2025-09-03"  
✅ "Works with your latest Notion workspace"

---

## 📝 Template for Writing Capabilities

Use this formula: **[Action Verb]** + **[Object]** + **[Context/Benefit]**

Examples:
- **Create** + **database records** + **with custom properties**
- **Search** + **Notion data** + **by filters and conditions**
- **Update** + **record properties** + **in real-time**
- **Build** + **custom databases** + **for any workflow**

---

## 🎨 Visual Presentation Tips

### In ChatGPT Interface:
- Capabilities appear as bullet points
- Users scan them quickly
- First capability gets most attention

### Optimization:
1. **Most important capability first** (usually creation/write operations)
2. **Search/read operations second** (high frequency)
3. **Update operations third** (moderate frequency)
4. **Advanced features last** (lower frequency but high value)

---

## 🔄 Iteration Strategy

### Phase 1: Launch (Week 1)
Use clear, conservative capabilities:
- "Create Notion database records"
- "Search and filter data"
- "Update existing records"

### Phase 2: Optimize (Week 2-4)
Based on user feedback, add specificity:
- "Create tasks, projects, or customer records"
- "Find records by status, date, or priority"
- "Update properties and add notes"

### Phase 3: Differentiate (Month 2+)
Add unique value propositions:
- "Auto-organize your Notion workspace"
- "Smart search with natural language"
- "Batch update multiple records"

---

## 💡 Pro Tips

1. **Use Numbers When Relevant**
   - "Search across 10+ property types"
   - "Support for all 25+ Notion property types"

2. **Highlight Key Differentiators**
   - If your API is faster: "Instantly create Notion records"
   - If more reliable: "Reliably sync with Notion databases"

3. **Match Your Audience**
   - For developers: "Integrate Notion into your workflow"
   - For business users: "Manage projects and tasks in Notion"
   - For general users: "Organize your life in Notion databases"

4. **Test with ChatGPT**
   Ask ChatGPT to suggest capabilities based on your OpenAPI spec:
   ```
   "Based on this OpenAPI spec, suggest 4 user-friendly capabilities 
   that describe what this GPT can do. Use action verbs and avoid 
   technical jargon."
   ```

---

## 📊 Recommended Capabilities for Your Notion API

### Final Recommendation (Based on Your API):

```
1. Create and manage records in Notion databases
2. Search data using filters and conditions
3. Update record properties and content
4. Build custom databases with any structure
```

**Why this works:**
- ✅ Action-oriented (Create, Search, Update, Build)
- ✅ Ordered by frequency (create is MOST COMMON)
- ✅ User language (records, not pages)
- ✅ Comprehensive but concise
- ✅ Parallel structure (all verb + object)

### Alternative (Use-Case Focused):

```
1. Track tasks, projects, and customers in Notion
2. Find records by status, priority, or date
3. Update databases with new information
4. Design custom workflows with structured data
```

---

## 📚 Additional Resources

- [OpenAI GPT Actions Documentation](https://platform.openai.com/docs/actions)
- [UX Writing Best Practices](https://uxwritinghub.com)
- Your detailed API docs: `docs/CHATGPT_PAGES.md`, `docs/CHATGPT_QUERY.md`, etc.

---

## 🎯 Quick Checklist

Before finalizing your capabilities, verify:

- [ ] Each capability is under 60 characters
- [ ] Uses action verbs (Create, Search, Update, Build, etc.)
- [ ] Avoids technical jargon (no API, endpoint, POST, etc.)
- [ ] Ordered by frequency of use
- [ ] Parallel grammatical structure
- [ ] Focus on user outcomes, not implementation
- [ ] Clear to non-technical users
- [ ] Distinct from each other (no redundancy)

---

*Last Updated: October 24, 2025 | API v5.0.0*

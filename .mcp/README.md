# MCP Development Environment

## Overview
This is a sophisticated MCP setup optimized for AI-agentic development with advanced LLM features.

## Server Capabilities

### Core Infrastructure
- **filesystem**: File operations and code analysis
- **memory**: Persistent context and learning
- **postgres**: Structured data and vector storage
- **github**: Version control and collaboration

### Intelligence Layer
- **sequential-thinking**: Chain-of-thought reasoning
- **puppeteer**: Web automation and visual understanding
- **fetch**: API integration and data retrieval

### Collaboration & Discovery
- **slack**: Team communication and notifications
- **google-maps**: Location-aware features
- **everything**: Semantic search and indexing

## Advanced Workflows

### 1. Agentic Development Loop
```
Plan (sequential-thinking) →
Code (filesystem) →
Test (puppeteer) →
Deploy (github) →
Monitor (memory)
```

### 2. Knowledge Synthesis Pipeline
```
Gather (fetch/puppeteer) →
Index (everything) →
Store (postgres) →
Retrieve (memory) →
Apply (filesystem)
```

### 3. Continuous Improvement Cycle
```
Observe (all servers) →
Reflect (memory) →
Learn (sequential-thinking) →
Adapt (update prompts)
```

## Prompt Engineering Patterns

### Multi-Agent Orchestration
Use the `agent-orchestrator` prompt to coordinate multiple specialized agents for complex tasks.

### Feature Development
Use the `feature-architect` prompt to design AI-native features with optimal LLM integration.

### Code Evolution
Use the `code-evolution` prompt to refactor code for AI-first patterns.

## Best Practices

1. **Context Management**: Use memory server for long-running conversations
2. **Tool Chaining**: Combine multiple servers for complex operations
3. **Semantic Caching**: Enable for improved response times
4. **Parallel Processing**: Use concurrent server calls when possible
5. **Error Handling**: Implement retry logic with exponential backoff

## Experimental Features

- **Adaptive Context Windows**: Dynamically adjust context based on task complexity
- **Tool Chaining**: Automatic sequential tool execution
- **Semantic Caching**: Intelligence response caching
- **Streaming Responses**: Real-time output for long operations

## Getting Started

1. Copy `.env.example` to `.env` and fill in your credentials
2. Install MCP servers: `npm install -g @modelcontextprotocol/server-*`
3. Restart VS Code to activate the configuration
4. Use Command Palette to access MCP features

## Custom Extensions

To add custom MCP servers, extend the configuration in `.vscode/mcp.json` following the existing patterns.

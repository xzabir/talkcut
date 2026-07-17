---
type: document
name: mcp_recommendations
---

# MCP Server Recommendations & Policies

This organization relies heavily on the Model Context Protocol (MCP) to interact with external tools and systems.

## Global Rules
- **No Direct Destructive Actions**: Agents must not use MCP tools to delete external repositories or drop databases without explicit human approval.
- **Context Management**: Use the `Context7` or `Memory` MCP servers to persist long-term state across agent boundaries.

## Recommended Servers

### 1. @modelcontextprotocol/server-github
- **Why it exists**: To perform deep repository analysis, mine issues, and review PRs.
- **Allowed Agents**: `Codebase_Investigator`, `Security_Auditor`, `DevOps_Engineer`.
- **Restricted**: `Product_Manager` should not directly query GitHub; they consume reports from the Investigator.

### 2. @modelcontextprotocol/server-sequential-thinking
- **Why it exists**: Enables agents to break down highly complex problems (like architecture design) into structured logical steps before concluding.
- **Allowed Agents**: `Principal_Architect`, `Director`, `Product_Manager`.

### 3. @tavily/mcp-server / Brave Search
- **Why it exists**: OSINT web search for market validation, finding Reddit threads, and Hacker News posts.
- **Allowed Agents**: `Market_Analyst`.

### 4. @modelcontextprotocol/server-filesystem
- **Why it exists**: To read and write artifacts, templates, and scaffold source code in the local workspace.
- **Allowed Agents**: All agents.

### 5. @modelcontextprotocol/server-playwright
- **Why it exists**: For scraping documentation sites, discord logs, and dynamic SPA competitor websites that require rendering.
- **Allowed Agents**: `Market_Analyst`, `Codebase_Investigator`.

### 6. @modelcontextprotocol/server-notion
- **Why it exists**: To sync PRDs, roadmaps, and feature matrices to the company wiki.
- **Allowed Agents**: `Product_Manager`.

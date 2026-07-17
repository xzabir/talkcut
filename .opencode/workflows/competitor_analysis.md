---
type: workflow
name: competitor_analysis
---

# Workflow: Competitor Analysis

Executed by the **Researcher** agent.

## Steps
1. **Identify Keywords**: Extract 5-10 core keywords from the project idea.
2. **GitHub Search**: Use the GitHub MCP to find the top 10 repositories matching the keywords. Filter by >500 stars, active within the last 6 months.
3. **Web Search**: Use Tavily/Brave Search to find "Top [Topic] tools", Reddit discussions, and Hacker News threads.
4. **Issue Mining**: For the top 3 competitors, analyze their open issues. Find the most upvoted feature requests and bug reports.
5. **Synthesis**: Compile findings into a `Competitor Matrix` (comparing features, stars, license, architecture) and a narrative `Research Report`.

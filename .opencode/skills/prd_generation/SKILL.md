---
name: prd_generation
description: Specialized instruction set for executing the Prd Generation workflow.
version: 1.0.0
author: Deep Agents Org
---

# Skill: Prd Generation

## Overview
This skill provides the rigid framework required to execute the `prd_generation` task at a world-class level. When an agent invokes this skill, they must follow every constraint and execution step precisely.

## Pre-requisites
- The agent must have access to the required context or GitHub repositories.
- The agent must have permission to use the necessary MCP servers (e.g., Sequential Thinking, GitHub).

## Execution Steps

### 1. Context Gathering
- Identify all relevant parameters (e.g., target repository, competitor names, target domain).
- Formulate a plan using Sequential Thinking to break down the task.
- Scrape or fetch all necessary raw data (READMEs, issues, PRs, metric graphs).

### 2. Deep Analysis
- Do not stop at surface-level observations.
- If analyzing a repository, look at the last 50 commits to judge velocity, not just star count.
- If evaluating a technology, look at open bugs in their issue tracker to find hidden flaws.
- Synthesize the raw data into actionable insights.

### 3. Synthesis & Formatting
- Produce highly structured markdown.
- Use GitHub alerts (`> [!NOTE]`, `> [!WARNING]`) to highlight critical insights.
- Provide hard evidence (URLs, code snippets, issue numbers) for every claim made.
- Do NOT hallucinate data. If data is unavailable, state "DATA UNAVAILABLE".

## Expected Artifact
The output of this skill must be written to a markdown artifact (e.g., via a template). The artifact must contain:
1. Executive Summary
2. Evidence/Data points collected
3. Analytical synthesis
4. Concrete recommendations

## Failure Modes to Avoid
- **Superficial Analysis**: Just quoting the README is a failure. You must analyze the code and issues.
- **Opinion without Evidence**: Stating "Framework X is better" without providing benchmark or adoption data is unacceptable.
- **Scope Creep**: Do not analyze unrelated repositories or technologies.

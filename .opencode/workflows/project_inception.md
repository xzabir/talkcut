---
type: workflow
name: project_inception
---

# Workflow: Project Inception

This workflow is executed by the Director when a new project idea is proposed.

## Phase 1: Discovery
1. Delegate to **Researcher**: Execute the `competitor_analysis` workflow. Gather intelligence on existing solutions in the space.
2. Review the output `Research Report` and `Competitor Matrix`.

## Phase 2: Definition
1. Delegate to **Product Manager**: Based on the research, identify the core feature gaps and define the MVP scope.
2. Require output: `PRD` and `Feature Gap Report`.

## Phase 3: Architecture
1. Delegate to **Architect**: Review the PRD. Evaluate 2-3 potential tech stacks. Propose the optimal system architecture.
2. Require output: `Architecture Review`, `Technology Comparison`, and initial `ADRs`.

## Phase 4: Foundation
1. Delegate to **Builder**: Define the folder structure, setup the repo instructions, and draft the `Contributor Guide`.
2. Require output: `Implementation Plan`.

## Phase 5: Hardening
1. Delegate to **QA Engineer**: Review the architecture and implementation plan for security risks and define the CI/CD and testing strategy.
2. Require output: `Risk Assessment`.

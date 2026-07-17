# Sync script for TalkCut Agent Definitions
$ErrorActionPreference = "Stop"

$sourceAgent = Join-Path $PSScriptRoot "..\.agent\agents"
$targetAgent = Join-Path $PSScriptRoot "..\.opencode\agent"

$sourceSkill = Join-Path $PSScriptRoot "..\.agent\skills"
$targetSkill = Join-Path $PSScriptRoot "..\.opencode\skill"

# Ensure target directories exist
if (-not (Test-Path $targetAgent)) { New-Item -ItemType Directory -Force -Path $targetAgent | Out-Null }
if (-not (Test-Path $targetSkill)) { New-Item -ItemType Directory -Force -Path $targetSkill | Out-Null }

# Copy agents
Copy-Item -Path "$sourceAgent\*" -Destination $targetAgent -Recurse -Force

# Copy skills
Copy-Item -Path "$sourceSkill\*" -Destination $targetSkill -Recurse -Force

Write-Host "Sync complete."

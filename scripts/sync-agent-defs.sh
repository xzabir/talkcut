#!/bin/bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

SOURCE_AGENT="$DIR/../.agent/agents"
TARGET_AGENT="$DIR/../.opencode/agent"

SOURCE_SKILL="$DIR/../.agent/skills"
TARGET_SKILL="$DIR/../.opencode/skill"

mkdir -p "$TARGET_AGENT"
mkdir -p "$TARGET_SKILL"

cp -R "$SOURCE_AGENT/"* "$TARGET_AGENT/"
cp -R "$SOURCE_SKILL/"* "$TARGET_SKILL/"

echo "Sync complete."

#!/usr/bin/env bash
# ==============================================================================
# Milk Hisab (मिल्क हिसाब) - One-Click Deploy Script
# Compiles, Builds, and Launches Production Service
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 1. Run Build
bash build.sh

# 2. Start Production Server
bash start.sh

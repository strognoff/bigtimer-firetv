#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v gradle >/dev/null 2>&1; then
  echo "ERROR: gradle is not installed."
  echo "Install Gradle (or Android Studio), then run:"
  echo "  gradle wrapper --gradle-version 8.7"
  echo "  ./gradlew assembleDebug"
  exit 1
fi

gradle wrapper --gradle-version 8.7
./gradlew assembleDebug

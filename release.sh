#!/bin/bash

# ==== CONFIGURATION (EDIT THESE) ====
B2_BUCKET="your-b2-bucket-name"
BACKEND_URL="https://api.banzar.ng/v1/app/update"
BEARER_TOKEN="your_bearer_token_here"
RELEASE_DIR="./release"

# ================================

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install jq first."
  exit 1
fi

# Read current version from package.json
CURRENT_VERSION=$(jq -r '.version' package.json)
if [[ -z "$CURRENT_VERSION" ]]; then
  echo "Error: Unable to read version from package.json"
  exit 1
fi
echo "Current version: $CURRENT_VERSION"

# Function to bump patch version (x.y.z)
bump_version() {
  IFS='.' read -r -a parts <<< "$1"
  major=${parts[0]}
  minor=${parts[1]}
  patch=${parts[2]}
  patch=$((patch + 1))
  echo "$major.$minor.$patch"
}

NEW_VERSION=$(bump_version "$CURRENT_VERSION")
echo "Bumping version to: $NEW_VERSION"

# Update package.json with new version
jq --arg newVersion "$NEW_VERSION" '.version = $newVersion' package.json > package.tmp.json && mv package.tmp.json package.json

# Run build:all script (make sure it's defined in your package.json)
npm run build:all
if [ $? -ne 0 ]; then
  echo "Build failed, aborting."
  exit 1
fi

# Upload release files using rclone (ensure rclone remote is configured)
echo "Uploading files to Backblaze B2 bucket: $B2_BUCKET"
rclone copy "$RELEASE_DIR" "b2:$B2_BUCKET" --progress
if [ $? -ne 0 ]; then
  echo "Upload failed, aborting."
  exit 1
fi

# Notify backend of new release
echo "Notifying backend about new version: $NEW_VERSION"
curl -X POST "$BACKEND_URL" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"version\": \"$NEW_VERSION\"}"

echo "Release process completed successfully."

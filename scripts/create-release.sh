#!/bin/bash
# Create git tag and optionally GitHub release for current version

VERSION=$(node -p "require('./package.json').version")

if [ -z "$VERSION" ]; then
  echo "❌ Could not read version from package.json"
  exit 1
fi

# Check if tag already exists
if git rev-parse "v${VERSION}" >/dev/null 2>&1; then
  echo "✅ Tag v${VERSION} already exists"
  exit 0
fi

# Create annotated tag
echo "🏷️  Creating tag v${VERSION}..."
git tag -a "v${VERSION}" -m "Release v${VERSION}"

# Push tag
echo "📤 Pushing tag to remote..."
git push origin "v${VERSION}"

echo "✅ Tag v${VERSION} created and pushed!"

# Optional: Create GitHub release (requires gh CLI)
if command -v gh &> /dev/null; then
  read -p "Create GitHub release? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh release create "v${VERSION}" --generate-notes --title "v${VERSION}"
    echo "✅ GitHub release created!"
  fi
fi


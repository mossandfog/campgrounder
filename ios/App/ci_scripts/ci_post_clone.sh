#!/bin/sh
set -e

# Xcode Cloud doesn't have Node.js pre-installed — install via Homebrew
echo "==> Installing Node.js..."
brew install node

echo "==> Installing Node dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install

echo "==> Running pod install..."
cd "$CI_PRIMARY_REPOSITORY_PATH/ios/App"
pod install

echo "==> Done."

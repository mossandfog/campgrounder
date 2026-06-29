#!/bin/sh
set -e

echo "==> Installing Node dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install

echo "==> Running pod install..."
cd "$CI_PRIMARY_REPOSITORY_PATH/ios/App"
pod install

echo "==> Done."

#!/usr/bin/env bash
set -e

echo "==> Building app..."
npm run build

echo "==> Checking Firebase login..."
if ! npx firebase-tools projects:list >/dev/null 2>&1; then
  echo "==> You need to sign in to Firebase (one time). A link will appear below."
  echo "==> Open the link, approve, then paste the code back here."
  npx firebase-tools login --no-localhost
fi

echo "==> Deploying to Firebase Hosting..."
npx firebase-tools deploy --only hosting

echo "==> Done! Your site is live."

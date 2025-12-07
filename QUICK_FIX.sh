#!/bin/bash

# Quick Fix Script for Build Errors
# Run this script to fix permission and Tailwind CSS issues

echo "🔧 Fixing build issues..."

# Step 1: Fix permissions (requires sudo)
echo "📝 Step 1: Fixing node_modules permissions..."
sudo chown -R $(whoami) node_modules 2>/dev/null || echo "⚠️  Permission fix requires sudo. Run: sudo chown -R \$(whoami) node_modules"

# Step 2: Clear Vite cache (both old and new locations)
echo "🧹 Step 2: Clearing Vite cache..."
rm -rf node_modules/.vite .vite

# Step 3: Fix Tailwind CSS version mismatch
echo "🎨 Step 3: Fixing Tailwind CSS version..."
echo "   Current: v4.1.17 installed, but package.json says v3.4.1"
echo "   Removing Tailwind CSS v4..."

# Step 4: Reinstall correct version
echo "📦 Step 4: Installing Tailwind CSS v3.4.1..."
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.1

echo "✅ Done! Now run: npm run dev"



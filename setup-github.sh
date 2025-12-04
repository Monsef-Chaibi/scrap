#!/bin/bash

# Deployment Helper Script
# This script helps you set up Git and push to GitHub

set -e

echo "========================================"
echo "🚀 kwrds Scraper API - GitHub Setup"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git config user.email "you@example.com"
    git config user.name "Your Name"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "📦 Adding files to Git..."
git add .

echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Production-ready kwrds scraper API" || echo "ℹ️  (Files already committed)"

echo ""
echo "========================================"
echo "📝 NEXT STEPS:"
echo "========================================"
echo ""
echo "1. Create a repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Copy your repository URL (HTTPS or SSH)"
echo ""
echo "3. Add remote and push:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/kwrds-scraper-api.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Then deploy on Render.com:"
echo "   https://render.com/dashboard"
echo ""
echo "========================================"

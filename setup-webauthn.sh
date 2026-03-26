#!/bin/bash

# WebAuthn Passkey Authentication - Quick Setup Script
# This script helps you set up passkey authentication quickly

echo "🔐 WebAuthn Passkey Authentication Setup"
echo "========================================"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install @simplewebauthn/server @simplewebauthn/browser jsonwebtoken @types/jsonwebtoken

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check your npm setup."
    exit 1
fi

echo ""

# Step 2: Generate JWT Secret
echo "🔑 Step 2: Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

# Step 3: Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Step 3: Creating .env.local file..."
    cp .env.example .env.local
    
    # Update JWT_SECRET in .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|your-very-secure-random-jwt-secret-at-least-32-characters-long|$JWT_SECRET|" .env.local
    else
        # Linux
        sed -i "s|your-very-secure-random-jwt-secret-at-least-32-characters-long|$JWT_SECRET|" .env.local
    fi
    
    echo "✅ .env.local created! Please update DATABASE_URL and other settings."
else
    echo "⚠️  .env.local already exists. Skipping..."
    echo "   Add this line to your .env.local:"
    echo "   JWT_SECRET=$JWT_SECRET"
fi

echo ""

# Step 4: Database setup reminder
echo "💾 Step 4: Database setup"
echo "   Please run the following command to create database tables:"
echo "   mysql -u your_user -p your_database < lib/db-init.sql"
echo ""

# Step 5: Final instructions
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_URL in .env.local with your MySQL connection string"
echo "2. Run the database initialization script (see Step 4 above)"
echo "3. Start the development server: npm run dev"
echo "4. Navigate to http://localhost:3000/blogs and register your first passkey!"
echo ""
echo "📚 For detailed documentation, see WEBAUTHN_SETUP.md"
echo ""

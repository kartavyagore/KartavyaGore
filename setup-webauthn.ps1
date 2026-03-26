# WebAuthn Passkey Authentication - Windows Setup Script
# This script helps you set up passkey authentication quickly on Windows

Write-Host "🔐 WebAuthn Passkey Authentication Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install @simplewebauthn/server @simplewebauthn/browser jsonwebtoken @types/jsonwebtoken

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies. Please check your npm setup." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Generate JWT Secret
Write-Host "🔑 Step 2: Generating JWT secret..." -ForegroundColor Yellow
$JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "Generated JWT_SECRET: $JWT_SECRET" -ForegroundColor Green
Write-Host ""

# Step 3: Create .env.local if it doesn't exist
if (-not (Test-Path .env.local)) {
    Write-Host "📝 Step 3: Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local
    
    # Update JWT_SECRET in .env.local
    (Get-Content .env.local) -replace 'your-very-secure-random-jwt-secret-at-least-32-characters-long', $JWT_SECRET | Set-Content .env.local
    
    Write-Host "✅ .env.local created! Please update DATABASE_URL and other settings." -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local already exists. Skipping..." -ForegroundColor Yellow
    Write-Host "   Add this line to your .env.local:"
    Write-Host "   JWT_SECRET=$JWT_SECRET" -ForegroundColor Cyan
}

Write-Host ""

# Step 4: Database setup reminder
Write-Host "💾 Step 4: Database setup" -ForegroundColor Yellow
Write-Host "   Please run the following command to create database tables:"
Write-Host "   mysql -u your_user -p your_database < lib\db-init.sql" -ForegroundColor Cyan
Write-Host ""

# Step 5: Final instructions
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update DATABASE_URL in .env.local with your MySQL connection string"
Write-Host "2. Run the database initialization script (see Step 4 above)"
Write-Host "3. Start the development server: npm run dev"
Write-Host "4. Navigate to http://localhost:3000/blogs and register your first passkey!"
Write-Host ""
Write-Host "📚 For detailed documentation, see WEBAUTHN_SETUP.md" -ForegroundColor Cyan
Write-Host ""

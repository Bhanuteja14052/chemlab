# AI-Powered Virtual Chemistry Lab Setup Script
# Run this script to set up your development environment

Write-Host "🧪 Setting up AI-Powered Virtual Chemistry Lab..." -ForegroundColor Cyan

# Check Node.js version
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
Write-Host "`n🔑 Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local file not found" -ForegroundColor Yellow
    Write-Host "📋 Creating .env.local from template..." -ForegroundColor Cyan
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host "🔧 Please edit .env.local with your actual API keys before continuing" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Required API Keys:" -ForegroundColor White
    Write-Host "  • Clerk (Authentication): https://dashboard.clerk.dev/" -ForegroundColor Gray
    Write-Host "  • Google Gemini (AI): https://aistudio.google.com/" -ForegroundColor Gray
    Write-Host "  • MongoDB (Database): https://cloud.mongodb.com/" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Have you configured your API keys in .env.local? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Please configure your API keys first, then run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check build
Write-Host "`n🔨 Testing build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed - please check your configuration" -ForegroundColor Red
    exit 1
}

# Success message
Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your app will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Happy experimenting!" -ForegroundColor Magenta

# Ask if user wants to start dev server
$startDev = Read-Host "`nWould you like to start the development server now? (y/n)"
if ($startDev -eq "y" -or $startDev -eq "Y") {
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
    npm run dev
}

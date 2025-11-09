#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Upload .env variables as GitHub Secrets to the current repository
.DESCRIPTION
    This script reads a .env file and uploads all variables as GitHub Secrets
    to the current repository using the GitHub CLI (gh).
.PARAMETER EnvFile
    Path to the .env file (default: .env)
.PARAMETER Force
    Force overwrite existing secrets without confirmation
.EXAMPLE
    .\upload-env-secrets.ps1
.EXAMPLE
    .\upload-env-secrets.ps1 -EnvFile .env.production -Force
#>

param(
    [string]$EnvFile = ".env",
    [switch]$Force
)

# Check if gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: GitHub CLI (gh) is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Not authenticated with GitHub CLI." -ForegroundColor Red
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ Error: $EnvFile file not found!" -ForegroundColor Red
    exit 1
}

# Get current repository info
try {
    $repoInfo = gh repo view --json nameWithOwner | ConvertFrom-Json
    $repo = $repoInfo.nameWithOwner
    Write-Host "📦 Repository: $repo" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: Not in a git repository or no remote configured." -ForegroundColor Red
    exit 1
}

# Parse .env file
$envVars = @{}
$lineNumber = 0

Get-Content $EnvFile | ForEach-Object {
    $lineNumber++
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ($line -eq "" -or $line.StartsWith("#")) {
        return
    }
    
    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
    } else {
        Write-Host "⚠️  Warning: Line $lineNumber has invalid format: $line" -ForegroundColor Yellow
    }
}

if ($envVars.Count -eq 0) {
    Write-Host "❌ No valid environment variables found in $EnvFile" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Found $($envVars.Count) environment variables:" -ForegroundColor Green
$envVars.Keys | Sort-Object | ForEach-Object {
    $value = $envVars[$_]
    $maskedValue = if ($value.Length -gt 10) { 
        $value.Substring(0, 3) + "..." + $value.Substring($value.Length - 3) 
    } else { 
        "***" 
    }
    Write-Host "  • $_ = $maskedValue" -ForegroundColor Gray
}

# Confirm upload
if (-not $Force) {
    Write-Host "`n⚠️  This will upload these secrets to: $repo" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Cancelled by user." -ForegroundColor Red
        exit 0
    }
}

# Upload secrets
Write-Host "`n🚀 Uploading secrets..." -ForegroundColor Cyan
$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    try {
        # Upload secret using gh CLI
        $value | gh secret set $key --repo $repo
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $key" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ $key (failed)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "  ✗ $key (error: $_)" -ForegroundColor Red
        $failCount++
    }
}

# Summary
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  ✗ Failed:  $failCount" -ForegroundColor Red
}
Write-Host ("="*50) -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "`n✅ All secrets uploaded successfully!" -ForegroundColor Green
    Write-Host "`n📝 Note: You still need to manually add:" -ForegroundColor Yellow
    Write-Host "  • SERVER_IP      (your Ubuntu server IP address)" -ForegroundColor Yellow
    Write-Host "  • SSH_PRIVATE_KEY (your private SSH key for deployment)" -ForegroundColor Yellow
    Write-Host "`nAdd them with:" -ForegroundColor Gray
    Write-Host "  gh secret set SERVER_IP --repo $repo" -ForegroundColor Gray
    Write-Host "  gh secret set SSH_PRIVATE_KEY --repo $repo < path/to/private_key" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some secrets failed to upload. Please check the errors above." -ForegroundColor Red
    exit 1
}

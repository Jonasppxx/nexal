# 🚀 Auto-Upload und Setup Script
# Lädt alles auf GitHub hoch und konfiguriert npm Token

param(
    [Parameter(Mandatory=$false)]
    [string]$NpmToken = ""
)

Write-Host "🚀 GitHub Auto-Upload & Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Git Repository vorhanden
if (-not (Test-Path ".git")) {
    Write-Host "❌ Kein Git Repository gefunden!" -ForegroundColor Red
    Write-Host "Führe zuerst 'git init' aus." -ForegroundColor Yellow
    exit 1
}

# 1. Git Status prüfen
Write-Host "📊 Prüfe Git Status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "✅ Änderungen gefunden - werden committed..." -ForegroundColor Green
    
    # Alle Änderungen hinzufügen
    git add .
    
    # Commit mit Timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "chore: Auto-upload $timestamp"
    
    Write-Host "✅ Commit erstellt" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Keine Änderungen zu committen" -ForegroundColor Cyan
}

# 2. Zu GitHub pushen
Write-Host ""
Write-Host "📤 Pushe zu GitHub..." -ForegroundColor Yellow

try {
    git push --follow-tags
    Write-Host "✅ Erfolgreich zu GitHub gepusht!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Push fehlgeschlagen - prüfe deine Git-Konfiguration" -ForegroundColor Red
    Write-Host "Tipp: Führe 'git remote -v' aus um Remote zu prüfen" -ForegroundColor Yellow
}

# 3. npm Token Setup (optional)
Write-Host ""
if ([string]::IsNullOrEmpty($NpmToken)) {
    Write-Host "⚠️  Kein npm Token angegeben" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 npm Token hinzufügen:" -ForegroundColor Cyan
    Write-Host "1. Token erstellen: https://www.npmjs.com/settings/jonastest/tokens/create" -ForegroundColor White
    Write-Host "2. GitHub Secret hinzufügen: https://github.com/Jonasppxx/vorlage/settings/secrets/actions/new" -ForegroundColor White
    Write-Host "   - Name: NPM_TOKEN" -ForegroundColor White
    Write-Host "   - Value: (dein Token)" -ForegroundColor White
    Write-Host ""
    Write-Host "Oder führe dieses Script mit Token aus:" -ForegroundColor Cyan
    Write-Host "  .\upload.ps1 -NpmToken 'dein-token-hier'" -ForegroundColor White
} else {
    Write-Host "🔑 npm Token gefunden - richte GitHub Secret ein..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Token kopiert in Zwischenablage!" -ForegroundColor Green
    Set-Clipboard -Value $NpmToken
    Write-Host ""
    Write-Host "➡️  Öffne jetzt:" -ForegroundColor Cyan
    Write-Host "   https://github.com/Jonasppxx/vorlage/settings/secrets/actions/new" -ForegroundColor White
    Write-Host ""
    Write-Host "Füge dort ein:" -ForegroundColor Cyan
    Write-Host "   - Name: NPM_TOKEN" -ForegroundColor White
    Write-Host "   - Value: [Strg+V zum Einfügen]" -ForegroundColor White
    Write-Host ""
    
    # Öffne Browser automatisch
    Start-Process "https://github.com/Jonasppxx/vorlage/settings/secrets/actions/new"
    Write-Host "✅ Browser geöffnet - füge das Secret hinzu!" -ForegroundColor Green
}

# 4. Status-Übersicht
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Upload abgeschlossen!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "1. ✅ Code ist auf GitHub" -ForegroundColor White
Write-Host "2. 🔑 npm Token als Secret hinzufügen (falls nicht schon geschehen)" -ForegroundColor White
Write-Host "3. 🚀 GitHub Actions prüfen: https://github.com/Jonasppxx/vorlage/actions" -ForegroundColor White
Write-Host ""
Write-Host "💡 Ab jetzt einfach pushen:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'feat: Meine Änderung'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
Write-Host ""
Write-Host "   → Automatisch: Version bump + npm publish! 🎉" -ForegroundColor Green
Write-Host ""

# Links anzeigen
Write-Host "🔗 Wichtige Links:" -ForegroundColor Cyan
Write-Host "   GitHub Repo: https://github.com/Jonasppxx/vorlage" -ForegroundColor White
Write-Host "   npm Package: https://www.npmjs.com/package/@jonastest/vorlage" -ForegroundColor White
Write-Host "   GitHub Actions: https://github.com/Jonasppxx/vorlage/actions" -ForegroundColor White
Write-Host "   npm Token erstellen: https://www.npmjs.com/settings/jonastest/tokens/create" -ForegroundColor White
Write-Host ""

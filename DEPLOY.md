# 🚀 Automatisches npm Publishing Setup

## Was wurde eingerichtet?

Du hast jetzt **2 GitHub Actions Workflows**:

### 1. **Automatisches Publishing** (`publish.yml`)
- ✅ Triggert bei jedem Push auf `main`
- ✅ Prüft ob die Version geändert wurde
- ✅ Veröffentlicht automatisch auf npm
- ✅ Erstellt Git Tags

### 2. **Manueller Version Bump** (`version-bump.yml`)
- ✅ Manuell über GitHub auslösbar
- ✅ Erhöht Version (patch/minor/major)
- ✅ Veröffentlicht automatisch
- ✅ Erstellt GitHub Release

---

## 📋 Setup-Schritte

### Schritt 1: npm Access Token erstellen

1. Gehe zu https://www.npmjs.com/
2. Klicke auf dein Profil → **Access Tokens**
3. Klicke **Generate New Token** → **Classic Token**
4. Wähle **Automation** (für CI/CD)
5. Kopiere den Token (wird nur einmal angezeigt!)

### Schritt 2: GitHub Secret hinzufügen

1. Gehe zu deinem GitHub Repository: https://github.com/Jonasppxx/vorlage
2. Klicke auf **Settings** → **Secrets and variables** → **Actions**
3. Klicke **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: (Füge den npm Token ein)
6. Klicke **Add secret**

### Schritt 3: Code zu GitHub pushen

```powershell
# Alle Änderungen committen
git add .
git commit -m "feat: Add automatic npm publishing workflow"

# Zu GitHub pushen
git push origin main
```

**🎉 Fertig!** Ab jetzt wird bei jedem Push automatisch veröffentlicht (wenn Version geändert wurde)

---

## 🔄 Workflow verwenden

### Option A: Automatisch bei Version-Änderung

1. Ändere die Version in `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Commit und Push:
   ```powershell
   git add package.json
   git commit -m "chore: bump version to 1.0.1"
   git push
   ```

3. GitHub Actions veröffentlicht automatisch! ✅

### Option B: Manuell mit Workflow

1. Gehe zu GitHub → **Actions** Tab
2. Wähle **Version Bump and Publish**
3. Klicke **Run workflow**
4. Wähle Version Type:
   - `patch` - 1.0.0 → 1.0.1 (Bugfixes)
   - `minor` - 1.0.0 → 1.1.0 (Features)
   - `major` - 1.0.0 → 2.0.0 (Breaking Changes)
5. Klicke **Run workflow**

### Option C: Lokal mit npm version

```powershell
# Version erhöhen
npm version patch  # oder minor / major

# Automatisch gepusht und veröffentlicht!
git push --follow-tags
```

---

## 📊 Status überwachen

### GitHub Actions Status ansehen
1. Gehe zu https://github.com/Jonasppxx/vorlage/actions
2. Siehst du alle Workflow-Läufe
3. Grüner Haken ✅ = Erfolgreich
4. Rotes X ❌ = Fehler (klick drauf für Details)

### npm Package prüfen
```powershell
# Aktuelle veröffentlichte Version
npm view @jonastest/vorlage version

# Alle Informationen
npm view @jonastest/vorlage

# Download-Statistiken (nach 24h)
npm view @jonastest/vorlage --json
```

---

## 🛠️ Workflow-Features

### Was der Workflow macht:

1. **Checkout Code** - Lädt deinen Code
2. **Install Dependencies** - `npm ci`
3. **Build Check** - `npm run build` (stellt sicher es funktioniert)
4. **Version Check** - Vergleicht mit npm Registry
5. **Publish** - Nur wenn Version neu ist
6. **Create Tag** - Erstellt Git Tag (z.B. `v1.0.1`)

### Sicherheitsfeatures:

- ✅ Nur bei erfolgreicher Build
- ✅ Nur bei neuer Version
- ✅ Verwendet sichere npm Token
- ✅ Ignoriert README-Änderungen (kein unnötiges Publishing)

---

## 🎯 Typischer Workflow

### Bugfix veröffentlichen:

```powershell
# 1. Fix implementieren
# ... Code ändern ...

# 2. Version erhöhen
npm version patch

# 3. Pushen
git push --follow-tags

# 4. Fertig! GitHub Actions übernimmt den Rest
```

### Neues Feature veröffentlichen:

```powershell
# 1. Feature entwickeln
# ... Code ändern ...

# 2. Version erhöhen
npm version minor

# 3. Pushen
git push --follow-tags

# 4. Automatisch auf npm veröffentlicht! 🎉
```

---

## 🚨 Troubleshooting

### "NPM_TOKEN not found"
→ Stelle sicher, dass du den npm Token als GitHub Secret hinzugefügt hast (Schritt 2)

### "Version already exists"
→ Erhöhe die Version in `package.json` oder nutze `npm version`

### "Build failed"
→ Teste lokal: `npm run build` - Behebe Fehler zuerst

### Workflow läuft nicht
→ Prüfe ob `.github/workflows/` Dateien committed sind

---

## 📝 Best Practices

### 1. Semantic Versioning

- **PATCH** (1.0.x) - Bugfixes, keine Breaking Changes
- **MINOR** (1.x.0) - Neue Features, abwärtskompatibel
- **MAJOR** (x.0.0) - Breaking Changes

### 2. Commit Messages

```powershell
git commit -m "fix: Behebe Button Styling"        # → patch
git commit -m "feat: Neue Komponente hinzugefügt" # → minor
git commit -m "feat!: API Breaking Change"        # → major
```

### 3. Testing vor Release

Immer lokal testen:
```powershell
npm run build  # Muss erfolgreich sein
npm run dev    # Testen ob alles funktioniert
```

---

## 🎉 Zusammenfassung

✅ **Setup erledigt** - Workflows sind bereit
✅ **npm Token hinzufügen** - Als GitHub Secret
✅ **Push to main** - Automatisches Publishing
✅ **Version erhöhen** - `npm version patch/minor/major`

**Alles läuft automatisch nach dem Push! 🚀**

---

## 📚 Weitere Infos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)

Bei Fragen: https://github.com/Jonasppxx/vorlage/issues

# 🔧 Trusted Publisher Fix

## ❌ Problem

Der Trusted Publisher funktioniert beim ersten Publish, aber nicht bei Updates:
```
404 Not Found - '@jonastest/vorlage@1.0.5' is not in this registry.
```

## ✅ Lösung: Trusted Publisher richtig konfigurieren

### Schritt 1: Auf npm.com gehen

1. Gehe zu: **https://www.npmjs.com/package/@jonastest/vorlage/access**
2. Oder: https://www.npmjs.com/settings/jonastest/packages → `@jonastest/vorlage` → **Publishing Access**

### Schritt 2: Trusted Publisher überprüfen

Du solltest dort sehen:
- **Repository:** Jonasppxx/vorlage
- **Workflow:** publish.yml (oder .github/workflows/publish.yml)
- **Environment:** (leer lassen)

### Schritt 3: Falls nicht korrekt - neu konfigurieren

1. Klicke auf **"Remove"** beim bestehenden Trusted Publisher
2. Klicke auf **"Add Trusted Publisher"**
3. Fülle aus:
   - **GitHub Organization/User:** `Jonasppxx`
   - **Repository:** `vorlage`
   - **Workflow:** `.github/workflows/publish.yml`
   - **Environment:** (leer lassen!)
4. Klicke **"Add"**

### Schritt 4: Prüfe die Konfiguration

Der Trusted Publisher muss **GENAU** diese Werte haben:
- Organization: `Jonasppxx` (dein GitHub Username)
- Repository: `vorlage`
- Workflow: `.github/workflows/publish.yml` (voller Pfad!)

## 🔄 Alternative: npm Token verwenden (Schnellere Lösung)

Falls Trusted Publisher nicht funktioniert, nutze einen Token:

### 1. npm Token erstellen
```
https://www.npmjs.com/settings/jonastest/tokens/create
```
- Type: **Automation**
- Kopiere den Token

### 2. Als GitHub Secret hinzufügen
```
https://github.com/Jonasppxx/vorlage/settings/secrets/actions/new
```
- Name: `NPM_TOKEN`
- Value: (dein Token)

### 3. Workflow anpassen

Füge in `.github/workflows/publish.yml` hinzu:

```yaml
- name: Publish to npm
  run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🎯 Was ich empfehle

**Option 1 (Empfohlen):** Trusted Publisher richtig konfigurieren
- ✅ Sicherer
- ✅ Keine Token-Verwaltung
- ⚠️ Konfiguration muss genau stimmen

**Option 2 (Einfacher):** npm Token
- ✅ Funktioniert sofort
- ✅ Keine komplizierte Konfiguration
- ⚠️ Token muss sicher gespeichert werden

Welche Option möchtest du?

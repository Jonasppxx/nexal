# ⚡ QUICK FIX - npm Token hinzufügen

## 🚨 Problem: Trusted Publisher funktioniert nicht bei Updates

Der einfachste Weg: **npm Token verwenden**

---

## ✅ Lösung in 3 Schritten:

### 1️⃣ npm Token erstellen

**Gehe zu:** https://www.npmjs.com/settings/jonastest/tokens/create

1. Klicke **"Generate New Token"**
2. Wähle **"Classic Token"**
3. Wähle **"Automation"** (für CI/CD)
4. Klicke **"Generate Token"**
5. **Kopiere den Token** (wird nur EINMAL angezeigt!)

---

### 2️⃣ Token zu GitHub hinzufügen

**Gehe zu:** https://github.com/Jonasppxx/vorlage/settings/secrets/actions/new

1. Name: `NPM_TOKEN` (genau so!)
2. Value: (Füge deinen kopierten Token ein)
3. Klicke **"Add secret"**

---

### 3️⃣ Testen

```powershell
# Mache eine kleine Änderung
git commit --allow-empty -m "test: Trigger workflow"
git push
```

**Gehe zu:** https://github.com/Jonasppxx/vorlage/actions

Nach ~2 Minuten sollte es funktionieren! ✅

---

## 🎯 Das war's!

Mit dem Token funktioniert der Workflow jetzt:
- ✅ Automatisches Version-Bump
- ✅ Automatisches npm Publishing
- ✅ Keine manuellen Schritte mehr nötig

**Workflow unterstützt jetzt beides:**
- Trusted Publisher (falls richtig konfiguriert)
- npm Token (als Fallback)

---

## 📊 Nach dem Token-Setup:

```powershell
# Einfach Code ändern und pushen
git add .
git commit -m "feat: Meine Änderung"
git push

# Automatisch: Version bump + npm publish! 🚀
```

---

**Direkt-Links:**
- **Token erstellen:** https://www.npmjs.com/settings/jonastest/tokens/create
- **Secret hinzufügen:** https://github.com/Jonasppxx/vorlage/settings/secrets/actions/new
- **Workflow Status:** https://github.com/Jonasppxx/vorlage/actions

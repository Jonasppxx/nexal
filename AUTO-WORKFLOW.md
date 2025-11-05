# 🚀 Workflow: Automatisches Publishing

## ✅ Wie es jetzt funktioniert

**Du musst NUR noch pushen - alles andere passiert automatisch!**

```powershell
# 1. Code ändern
# ... mache deine Änderungen ...

# 2. Committen und pushen
git add .
git commit -m "feat: Neue Funktion hinzugefügt"
git push

# 3. Fertig! GitHub Actions macht den Rest:
#    ✅ Baut das Projekt
#    ✅ Erhöht automatisch die Version (patch)
#    ✅ Veröffentlicht auf npm
#    ✅ Erstellt Git Tag
```

---

## 🤖 Was der Workflow automatisch macht:

### Bei Code-Änderungen:
1. **Erkennt Code-Änderungen** (nicht nur Docs)
2. **Prüft aktuelle Version** auf npm
3. **Erhöht Version automatisch** (patch: 1.0.4 → 1.0.5)
4. **Baut das Projekt** (`npm run build`)
5. **Veröffentlicht auf npm** (mit Provenance)
6. **Pusht neuen Version-Tag** zu GitHub

### Bei nur Dokumentations-Änderungen:
- Überspringt Publishing (README.md, DEPLOY.md, etc.)
- Kein unnötiges Release

---

## 📝 Commit-Typen für verschiedene Version-Bumps

Aktuell: **Immer patch** (1.0.x → 1.0.y)

Wenn du später andere Version-Typen willst:
- Nutze den manuellen Workflow in GitHub Actions
- Oder ändere manuell die Version in `package.json`

---

## 🎯 Beispiel-Workflow

```powershell
# Neue Komponente hinzufügen
# ... Code ändern in app/components/Button.tsx ...

git add .
git commit -m "feat: Add Button component"
git push

# Warte ~2 Minuten
# ✅ Automatisch auf npm veröffentlicht!
```

---

## 📊 Status prüfen

- **GitHub Actions:** https://github.com/Jonasppxx/vorlage/actions
- **npm Package:** https://www.npmjs.com/package/@jonastest/vorlage

---

## ⚠️ Wichtig

Der Workflow überspringt Publishing wenn:
- ❌ Nur README/Docs geändert wurden
- ❌ Nur `.github/` Dateien geändert wurden

Das ist gut, weil nicht jeder kleine Docs-Change ein neues Release triggert!

---

## 🎉 Das war's!

**Einfach coden, committen, pushen - fertig! 🚀**

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName) {
  console.log(`
🚀 Next.js Template mit Prisma & MongoDB

Usage:
  npx @jonastest/vorlage <project-name>

Example:
  npx @jonastest/vorlage my-app
  
📦 Das erstellt:
  ✅ Next.js 16 + TypeScript
  ✅ Tailwind CSS 4
  ✅ Prisma + MongoDB
  ✅ API Routes
  ✅ src/ directory Struktur
  `);
  process.exit(0);
}

console.log(`\n🚀 Erstelle neues Projekt: ${projectName}\n`);

// Erstelle Projektverzeichnis
const projectPath = path.join(process.cwd(), projectName);

if (fs.existsSync(projectPath)) {
  console.error(`❌ Ordner ${projectName} existiert bereits!`);
  process.exit(1);
}

try {
  fs.mkdirSync(projectPath, { recursive: true });
  
  console.log('📦 Kopiere Template-Dateien...');

  // Kopiere alle Template-Dateien
  const templatePath = path.join(__dirname, '..');
  const filesToCopy = [
    'src',
    'public',
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'tailwind.config.ts',
    'postcss.config.mjs',
    'prisma.config.ts',
    'eslint.config.mjs',
    '.gitignore',
    'README.md',
    '.env.example'
  ];

  function copyRecursive(src, dest) {
    try {
      if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    } catch (error) {
      console.warn(`⚠️  Warnung beim Kopieren von ${src}: ${error.message}`);
    }
  }

  filesToCopy.forEach(file => {
    const srcPath = path.join(templatePath, file);
    const destPath = path.join(projectPath, file);
    
    if (fs.existsSync(srcPath)) {
      try {
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          // Stelle sicher, dass das Zielverzeichnis existiert
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (error) {
        console.warn(`⚠️  Überspringe ${file}: ${error.message}`);
      }
    }
  });

  // Copy .env.example to .env
  const envExamplePath = path.join(projectPath, '.env.example');
  const envPath = path.join(projectPath, '.env');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env Datei erstellt');
  }

  // Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = projectName;
  packageJson.version = '0.1.0';
  delete packageJson.bin;
  delete packageJson.files;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('📥 Installiere Dependencies...');

  // Wechsle ins Projektverzeichnis und installiere Dependencies
  process.chdir(projectPath);
  execSync('npm install', { stdio: 'inherit' });

  console.log(`
✅ Projekt erfolgreich erstellt!

📁 Nächste Schritte:
  cd ${projectName}
  
📝 Konfiguriere deine MongoDB Verbindung:
  - Öffne .env
  - Trage deine DATABASE_URL ein
  
🚀 Starte das Projekt:
  npm run dev
  
🗄️ Prisma Commands:
  npm run prisma:studio  # Öffne Prisma Studio
  npm run prisma:generate # Generiere Prisma Client
  
🎉 Viel Erfolg mit deinem Projekt!
`);

} catch (error) {
  console.error(`\n❌ Fehler beim Erstellen des Projekts: ${error.message}`);
  process.exit(1);
}

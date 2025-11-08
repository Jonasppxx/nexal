/**
 * Validierungs-Script für Database-Konfiguration
 * Prüft ob next.config.ts und schema.prisma übereinstimmen
 */

const fs = require('fs');
const path = require('path');

const NEXT_CONFIG_PATH = path.join(__dirname, '../next.config.ts');
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

function extractProviderFromConfig() {
  const content = fs.readFileSync(NEXT_CONFIG_PATH, 'utf-8');
  const match = content.match(/DATABASE_PROVIDER:\s*DatabaseProvider\s*=\s*["'](\w+)["']/);
  return match ? match[1] : null;
}

function extractProviderFromSchema() {
  const content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const match = content.match(/datasource\s+db\s*{[^}]*provider\s*=\s*["'](\w+)["']/s);
  return match ? match[1] : null;
}

function hasMapAnnotation(schemaContent) {
  return schemaContent.includes('@map("_id")');
}

function main() {
  console.log('🔍 Validiere Database-Konfiguration...\n');

  const configProvider = extractProviderFromConfig();
  const schemaProvider = extractProviderFromSchema();
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const hasMap = hasMapAnnotation(schemaContent);

  console.log('📋 Konfiguration:');
  console.log(`   next.config.ts: ${configProvider || '❌ NICHT GEFUNDEN'}`);
  console.log(`   schema.prisma:  ${schemaProvider || '❌ NICHT GEFUNDEN'}`);
  console.log(`   @map("_id"):    ${hasMap ? '✅ Ja (MongoDB)' : '❌ Nein (PostgreSQL)'}\n`);

  let isValid = true;
  const issues = [];

  // Prüfe ob Provider übereinstimmen
  if (configProvider !== schemaProvider) {
    isValid = false;
    issues.push(`❌ Provider stimmen nicht überein: next.config.ts sagt "${configProvider}" aber schema.prisma nutzt "${schemaProvider}"`);
  }

  // Prüfe ob @map bei MongoDB vorhanden ist
  if (configProvider === 'mongodb' && !hasMap) {
    isValid = false;
    issues.push('❌ MongoDB Provider, aber @map("_id") fehlt im Schema');
  }

  // Prüfe ob @map bei PostgreSQL NICHT vorhanden ist
  if (configProvider === 'postgresql' && hasMap) {
    isValid = false;
    issues.push('❌ PostgreSQL Provider, aber @map("_id") ist im Schema (sollte nicht sein)');
  }

  if (isValid) {
    console.log('✅ Konfiguration ist korrekt!\n');
    console.log('Nächste Schritte:');
    console.log('1. Stelle sicher, dass DATABASE_URL in .env gesetzt ist');
    console.log('2. Führe `npx prisma generate` aus');
    console.log('3. Führe `npx prisma db push` aus\n');
  } else {
    console.log('⚠️  Probleme gefunden:\n');
    issues.forEach(issue => console.log('   ' + issue));
    console.log('\nBehebung:');
    console.log('   Führe `npm run setup:db` aus, um die Konfiguration zu reparieren\n');
    process.exit(1);
  }
}

main();

import type { NextConfig } from "next";

/**
 * Database Provider Typ
 * Wird beim Projekt-Setup (index.js) konfiguriert
 */
export type DatabaseProvider = "mongodb" | "postgresql";

/**
 * Konfigurierter Database Provider für diese Anwendung
 * 
 * WICHTIG: Dieser Wert bestimmt, welche Datenbank verwendet wird:
 * - "mongodb": Verwendet MongoDB (mit @map("_id") in Prisma Models)
 * - "postgresql": Verwendet PostgreSQL (ohne @map in Prisma Models)
 * 
 * Um den Provider zu ändern:
 * 1. Führe `npm run setup:db` aus, oder
 * 2. Ändere diesen Wert manuell und aktualisiere prisma/schema.prisma entsprechend
 * 
 * Nach dem Ändern:
 * - Führe `npx prisma generate` aus
 * - Führe `npx prisma db push` aus
 */
export const DATABASE_PROVIDER: DatabaseProvider = "mongodb";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

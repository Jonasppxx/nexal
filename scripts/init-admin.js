#!/usr/bin/env node
/*
  scripts/init-admin.js
  Creates or updates an admin user in the database using providerId 'credentials'.

  Usage:
    node scripts/init-admin.js <email> <password> [name]

  NOTE: Expects DATABASE_URL in env or .env in project root.
*/

'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

try {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    require('dotenv').config({ path: dotenvPath });
  }
} catch (e) {}

const prisma = new PrismaClient();

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: node scripts/init-admin.js <email> <password> [name]');
    process.exit(2);
  }
  const [email, password, name] = argv;
  const accountId = (email || '').toLowerCase();
  const hashed = bcrypt.hashSync(password, 10);

  try {
    let user = await prisma.user.findUnique({ where: { email: accountId } }).catch(() => null);
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || null,
          email: accountId,
          emailVerified: true,
          role: 'admin',
          accounts: { create: { providerId: 'credentials', accountId, password: hashed } },
        },
      });
      console.log(`Admin user created: ${user.email} (id: ${user.id})`);
    } else {
      if (user.role !== 'admin') {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
        console.log(`User role updated to 'admin' for ${user.email}`);
      } else {
        console.log(`User ${user.email} already exists with role 'admin'`);
      }

      const existingAccount = await prisma.account.findFirst({ where: { providerId: 'credentials', accountId } });
      if (existingAccount) {
        await prisma.account.update({ where: { id: existingAccount.id }, data: { password: hashed } });
        console.log('Existing credentials account password updated.');
      } else {
        await prisma.account.create({ data: { providerId: 'credentials', accountId, password: hashed, user: { connect: { id: user.id } } } });
        console.log('Credentials account created for user.');
      }
    }
  } catch (err) {
    console.error('Error creating admin:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

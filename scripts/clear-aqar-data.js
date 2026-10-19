/**
 * Delete all AQAR document, part, section, and row data.
 * Usage: node scripts/clear-aqar-data.js
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '..', '.env');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const eq = trimmed.indexOf('=');
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is missing in .env');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collections = [
    'naacaqardocumentrows',
    'naacaqardocumentsections',
    'naacaqardocumentparts',
    'naacaqardocuments',
  ];

  for (const name of collections) {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) {
      console.log(`Skip (not found): ${name}`);
      continue;
    }
    const result = await db.collection(name).deleteMany({});
    console.log(`Deleted ${result.deletedCount} from ${name}`);
  }

  await mongoose.disconnect();
  console.log('AQAR data cleared.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

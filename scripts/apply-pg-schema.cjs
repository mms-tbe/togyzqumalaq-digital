/**
 * Applies supabase/pg_direct_minimal.sql using DATABASE_URL.
 * Loads DATABASE_URL from the environment, or from .env.local if unset.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS script */
const fs = require("fs");
const path = require("path");
const pg = require("pg");

function loadDatabaseUrlFromEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^DATABASE_URL=(.*)$/);
    if (m && !process.env.DATABASE_URL) {
      let v = m[1].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env.DATABASE_URL = v;
    }
  }
}

async function main() {
  loadDatabaseUrlFromEnvLocal();
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("Set DATABASE_URL or define it in .env.local");
    process.exit(1);
  }
  const sqlPath = path.join(__dirname, "..", "supabase", "pg_direct_minimal.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Applied:", sqlPath);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

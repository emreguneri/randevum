import { Client } from "pg";
import { Config } from "../config/env";
import { up as initUp, name as initName } from "./migrations/0001_init";

const migrations = [{ name: initName, up: initUp }];

async function run() {
  const client = new Client({ connectionString: Config.databaseUrl });
  await client.connect();
  await ensureMeta(client);

  for (const migration of migrations) {
    const applied = await hasRun(client, migration.name);
    if (applied) {
      continue;
    }
    // eslint-disable-next-line no-console
    console.log(`Applying migration ${migration.name}`);
    await client.query("BEGIN");
    try {
      await client.query(migration.up);
      await client.query(
        "INSERT INTO schema_migrations(name, run_at) VALUES ($1, now())",
        [migration.name],
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }
  await client.end();
  // eslint-disable-next-line no-console
  console.log("Migrations complete");
}

async function ensureMeta(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL
    );
  `);
}

async function hasRun(client: Client, name: string) {
  const res = await client.query(
    "SELECT 1 FROM schema_migrations WHERE name = $1",
    [name],
  );
  return (res.rowCount || 0) > 0;
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed", err);
  process.exit(1);
});


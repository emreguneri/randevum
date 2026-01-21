import { Client } from "pg";
import { Config } from "../config/env";
import { runSeed } from "./seeds/default-seed";

async function run() {
  const client = new Client({ connectionString: Config.databaseUrl });
  await client.connect();
  await runSeed(client);
  await client.end();
  // eslint-disable-next-line no-console
  console.log("Seed complete");
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed", err);
  process.exit(1);
});


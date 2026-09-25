import "dotenv/config";
import { HexclaveServerApp } from "@hexclave/next";
import { ensureUserExists } from "./sync-user";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to sync users.");
  }

  const app = new HexclaveServerApp({ tokenStore: "memory" });
  let cursor: string | undefined;
  let count = 0;

  do {
    const users = await app.listUsers({
      cursor,
      limit: 100,
      includeAnonymous: false,
      includeRestricted: true,
    });

    for (const user of users) {
      await ensureUserExists(user);
      count++;
    }

    console.log(`Synced ${count} users...`);
    cursor = users.nextCursor ?? undefined;
  } while (cursor);

  console.log(`User sync complete: ${count} users synced.`);
}

void main().catch((error) => {
  console.error("User sync failed:", error);
  process.exitCode = 1;
});

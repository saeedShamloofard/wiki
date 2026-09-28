import { db } from "@/db";
import { usersSync } from "@/db/schema";

type StackUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
};

export async function ensureUserExists(stackUser: StackUser): Promise<void> {
  const name = stackUser.displayName ?? "";
  const email = stackUser.primaryEmail ?? "";

  await db
    .insert(usersSync)
    .values({
      id: stackUser.id,
      name,
      email,
    })
    .onConflictDoUpdate({
      target: usersSync.id,
      set: {
        name,
        email,
      },
    });
}

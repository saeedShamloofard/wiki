import { hexclaveServerApp } from "@/hexclave/server";

export async function authenticateUser() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    return {
      success: false as const,
      message: "The user is not authenticated!",
    };
  }

  return { success: true as const, user };
}

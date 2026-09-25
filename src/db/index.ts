import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import "dotenv/config";

// Handle missing DATABASE_URL gracefully for testing scenarios
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a placeholder URL that won't be used until tests set it
    return "postgresql://placeholder@localhost/placeholder";
  }
  return url;
};

export const sql = neon(getDatabaseUrl());
export const db = drizzle(sql, { schema });

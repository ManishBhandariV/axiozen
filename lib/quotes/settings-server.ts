import "server-only";
import { getDb } from "@/lib/db";
import { DEFAULT_QUOTE_SETTINGS } from "./defaults";
import type { QuoteSettings } from "./types";

const KEY = "quote_settings";

export async function loadQuoteSettings(): Promise<QuoteSettings> {
  try {
    const db = await getDb();
    const row = await db.get<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = ?",
      [KEY],
    );
    if (row?.value) {
      const parsed = JSON.parse(row.value) as Partial<QuoteSettings>;
      return { ...DEFAULT_QUOTE_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn("[quotes] settings load failed, using defaults", e);
  }
  return DEFAULT_QUOTE_SETTINGS;
}

export async function saveQuoteSettings(s: QuoteSettings): Promise<void> {
  const db = await getDb();
  const value = JSON.stringify(s);
  const existing = await db.get<{ key: string }>(
    "SELECT key FROM app_settings WHERE key = ?",
    [KEY],
  );
  if (existing) {
    await db.run("UPDATE app_settings SET value = ? WHERE key = ?", [value, KEY]);
  } else {
    await db.run("INSERT INTO app_settings (key, value) VALUES (?, ?)", [KEY, value]);
  }
}

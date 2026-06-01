import type { EntriesMap } from "./types";

/**
 * Storage backend abstraction.
 *
 * The same React UI runs in two environments:
 *  - Browser (dev / GitHub Pages demo): persists to localStorage.
 *  - Tauri desktop app (.exe): persists to a real SQLite file on disk.
 *
 * We detect Tauri at runtime and pick the backend. Components never know
 * which one is active — they only call these methods on the interface.
 */
export interface StorageBackend {
  load(): Promise<EntriesMap>;
  save(entries: EntriesMap): Promise<void>;
  /** Generic key/value settings (e.g. date of birth). Survives restarts. */
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  /** Human-readable description of where data lives (for the UI). */
  describe(): string;
}

const STORE_KEY = "memento900.entries.v1";
const SETTING_PREFIX = "memento900.setting.";

/** True when running inside the Tauri desktop shell. */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/* ---------------- Browser backend (localStorage) ---------------- */

const browserBackend: StorageBackend = {
  async load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as EntriesMap;
    } catch {
      return {};
    }
  },
  async save(entries) {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries));
  },
  async getSetting(key) {
    return localStorage.getItem(SETTING_PREFIX + key);
  },
  async setSetting(key, value) {
    localStorage.setItem(SETTING_PREFIX + key, value);
  },
  describe() {
    return "browser";
  },
};

/* ---------------- Tauri backend (SQLite) ------------------------ */
/**
 * Entries are a single JSON blob row; settings are individual rows — all in
 * one `kv` table. We keep the JSON document model identical to the browser so
 * import/export and the data shape never diverge between the two builds.
 */
function makeTauriBackend(): StorageBackend {
  // Lazy import so the browser build never pulls in the Tauri plugin.
  let dbPromise: Promise<import("@tauri-apps/plugin-sql").default> | null = null;

  async function db() {
    if (!dbPromise) {
      const Database = (await import("@tauri-apps/plugin-sql")).default;
      dbPromise = (async () => {
        const conn = await Database.load("sqlite:memento900.db");
        await conn.execute(
          "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
        );
        return conn;
      })();
    }
    return dbPromise;
  }

  async function readKey(key: string): Promise<string | null> {
    const conn = await db();
    const rows = (await conn.select("SELECT value FROM kv WHERE key = $1", [
      key,
    ])) as { value: string }[];
    return rows.length > 0 ? rows[0]!.value : null;
  }

  async function writeKey(key: string, value: string): Promise<void> {
    const conn = await db();
    await conn.execute(
      "INSERT INTO kv (key, value) VALUES ($1, $2) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value],
    );
  }

  return {
    async load() {
      const raw = await readKey(STORE_KEY);
      if (raw === null) return {};
      try {
        return JSON.parse(raw) as EntriesMap;
      } catch {
        return {};
      }
    },
    async save(entries) {
      await writeKey(STORE_KEY, JSON.stringify(entries));
    },
    async getSetting(key) {
      return readKey(SETTING_PREFIX + key);
    },
    async setSetting(key, value) {
      await writeKey(SETTING_PREFIX + key, value);
    },
    describe() {
      return "sqlite";
    },
  };
}

export const backend: StorageBackend = isTauri() ? makeTauriBackend() : browserBackend;

CREATE TABLE IF NOT EXISTS custom_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lang TEXT NOT NULL CHECK (lang IN ('en-US','nl-NL')),
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  kind TEXT NOT NULL CHECK (kind IN ('word','sentence')),
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_custom_entries_lookup
  ON custom_entries (lang, level, kind);

  What Exists Now

  - The app is a single static page in reading.html.
  - The two tiles already exist in UI:
      - reading.html:205 (tile.customWords.value)
      - reading.html:215 (tile.customSentences.value)
  - They are translated in both languages:
      - reading.html:254 and reading.html:276 (Own/Eigen words)
      - reading.html:260 and reading.html:282 (Own/Eigen sentences)
  - They are currently inactive because click handling falls through to announce(choice):
      - reading.html:922
      - reading.html:933
  - Normal tiles pull randomized content from JSON (data/word-pools_jipjanneke.json) via ensurePoolData():
      - reading.html:641
      - reading.html:889

  Recommended Implementation (Keep Everything Else the Same)

  1. Add a tiny backend (Node + Express) that:

  - Serves reading.html and data/*
  - Exposes API for custom entries
  - Uses SQLite for persistence

  2. Add SQLite table for custom content:

  CREATE TABLE custom_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lang TEXT NOT NULL CHECK (lang IN ('en-US','nl-NL')),
    level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
    kind TEXT NOT NULL CHECK (kind IN ('word','sentence')),
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX idx_custom_entries_lookup ON custom_entries(lang, level, kind);

  3. Add API endpoints:

  - GET /api/custom?lang=nl-NL&level=0&kind=word
  - POST /api/custom with { lang, level, kind, text }
  - DELETE /api/custom/:id (optional but practical)
  - Optional bulk insert endpoint for easier editing

  4. Frontend behavior changes in reading.html only:

  - On click of tile.customWords.value: load user words from API and run same display/speech sequence as existing
    tiles.
  - On click of tile.customSentences.value: same for sentences.
  - Use existing currentLang() and currentLevel() so language/level selectors keep working unchanged.
  - Add a minimal input UI (modal/panel) for entry:
      - Reuse tile.edit.value as “manage custom content” screen.
      - Two tabs/sections: Own words / Own sentences.
      - Add text, save to DB, list existing entries.

  5. Keep fallback behavior safe:

  - If no custom entries exist, show a friendly message in selection area instead of running empty sequence.
  - Do not alter existing words/expressions/sentences logic.

  Docker Desktop Setup
  Use one container (simplest) with Express + SQLite + static files.

  - Dockerfile:
      - Base node:20-alpine
      - Copy app files
      - Install deps
      - Start server on 3000
  - docker-compose.yml:
      - Map 3000:3000
      - Mount persistent volume for SQLite DB (e.g. /app/data/app.db)
      - Restart policy unless-stopped

  Example compose shape:

  - Service app
  - Volume sqlite_data
  - Env DB_PATH=/app/data/app.db

  This gives:

  - Persistent custom words/sentences
  - Same UI/UX
  - Runs cleanly in Docker Desktop

  Files You’d Add/Change

  - Add server.js (or server/index.js) for API + static hosting
  - Add DB init/migration SQL file
  - Update reading.html to call API for custom tiles + editor UI
  - Add package.json for backend deps
  - Add Dockerfile
  - Add docker-compose.yml
  - Optionally add .dockerignore
  
  
› Introduce those changes, but do not make any additional changes to those files except for what has been agreed
  in your list. Also, append README.md file with instructions on how to run this application, but do not
  overwrite the README.md, just append. Make this application transferable to a different machine which uses
  docker desktop. Do not change any words, expressions or sentences. Make sure the application uses the SQLite
  database. Make sure the pannel where I enter my own words or sentences is in line with the current look of the
  application.
const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'storage', 'app.db');
const INIT_SQL_PATH = path.join(__dirname, 'db', 'init.sql');

const VALID_LANGS = new Set(['en-US', 'nl-NL']);
const VALID_KINDS = new Set(['word', 'sentence']);

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function normalizeLang(value) {
  return VALID_LANGS.has(value) ? value : null;
}

function normalizeLevel(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 2) return null;
  return parsed;
}

function normalizeKind(value) {
  return VALID_KINDS.has(value) ? value : null;
}

function normalizeText(value) {
  const text = (value || '').toString().trim();
  if (!text) return null;
  if (text.length > 300) return null;
  return text;
}

async function initDb() {
  const sql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
  await exec(sql);
}

app.use(express.json({ limit: '200kb' }));

app.get('/api/custom', async (req, res) => {
  try {
    const lang = normalizeLang(req.query.lang);
    const level = normalizeLevel(req.query.level);
    const kind = normalizeKind(req.query.kind);

    if (!lang || level === null || !kind) {
      res.status(400).json({ error: 'Invalid query. Use lang, level, and kind.' });
      return;
    }

    const rows = await all(
      `SELECT id, lang, level, kind, text, created_at
       FROM custom_entries
       WHERE lang = ? AND level = ? AND kind = ?
       ORDER BY created_at ASC, id ASC`,
      [lang, level, kind]
    );

    res.json({ items: rows });
  } catch (error) {
    console.error('GET /api/custom failed', error);
    res.status(500).json({ error: 'Failed to load custom entries.' });
  }
});

app.post('/api/custom', async (req, res) => {
  try {
    const lang = normalizeLang(req.body?.lang);
    const level = normalizeLevel(req.body?.level);
    const kind = normalizeKind(req.body?.kind);
    const text = normalizeText(req.body?.text);

    if (!lang || level === null || !kind || !text) {
      res.status(400).json({ error: 'Invalid payload. Use lang, level, kind, text.' });
      return;
    }

    const result = await run(
      `INSERT INTO custom_entries (lang, level, kind, text)
       VALUES (?, ?, ?, ?)`,
      [lang, level, kind, text]
    );

    res.status(201).json({
      item: {
        id: result.lastID,
        lang,
        level,
        kind,
        text
      }
    });
  } catch (error) {
    console.error('POST /api/custom failed', error);
    res.status(500).json({ error: 'Failed to save custom entry.' });
  }
});

app.post('/api/custom/bulk', async (req, res) => {
  try {
    const lang = normalizeLang(req.body?.lang);
    const level = normalizeLevel(req.body?.level);
    const kind = normalizeKind(req.body?.kind);
    const texts = Array.isArray(req.body?.texts)
      ? req.body.texts.map(normalizeText).filter(Boolean)
      : [];

    if (!lang || level === null || !kind || !texts.length) {
      res.status(400).json({ error: 'Invalid payload. Use lang, level, kind, texts[].' });
      return;
    }

    await run('BEGIN TRANSACTION');
    try {
      for (const text of texts) {
        await run(
          `INSERT INTO custom_entries (lang, level, kind, text)
           VALUES (?, ?, ?, ?)`,
          [lang, level, kind, text]
        );
      }
      await run('COMMIT');
    } catch (innerError) {
      await run('ROLLBACK');
      throw innerError;
    }

    res.status(201).json({ inserted: texts.length });
  } catch (error) {
    console.error('POST /api/custom/bulk failed', error);
    res.status(500).json({ error: 'Failed to save custom entries.' });
  }
});

app.delete('/api/custom/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid id.' });
      return;
    }

    const result = await run('DELETE FROM custom_entries WHERE id = ?', [id]);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Entry not found.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DELETE /api/custom/:id failed', error);
    res.status(500).json({ error: 'Failed to delete custom entry.' });
  }
});

app.use(express.static(__dirname, { extensions: ['html'] }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'reading.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`SQLite DB: ${DB_PATH}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });

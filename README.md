# Subitation_reading_modular_panel

## Running the app with Docker Desktop

### Prerequisites
- Docker Desktop installed and running.

### Start the application
1. Open a terminal in this project folder.
2. Build and start the container:
   ```bash
   docker compose up --build
   ```
3. Open the app in your browser:
   - `http://localhost:3000`

### Stop the application
- Press `Ctrl+C` in the running terminal, then run:
  ```bash
  docker compose down
  ```

### Data persistence (SQLite)
- Custom words and custom sentences are stored in a SQLite database inside the Docker volume `sqlite_data`.
- The database path inside the container is `/app/storage/app.db`.
- Your custom entries remain available across container restarts.

### Moving to another machine
1. Copy/clone this project to the other machine.
2. Install Docker Desktop there.
3. Run:
   ```bash
   docker compose up --build
   ```
4. Open `http://localhost:3000`.

• Yes, this program can be moved to another computer.

  The key point is the database: custom entries are in SQLite at /app/storage/app.db inside Docker, persisted via
  the named volume sqlite_data (docker-compose.yml:10, docker-compose.yml:14, server.js:8, README.md:24).

  If you only copy the project folder and run it on another machine, the app works, but custom DB data will be
  empty unless you also migrate app.db.

  Move app without custom data (fresh DB)

  1. Copy/clone the project folder to the new machine.
  2. Install Docker Desktop.
  3. Run docker compose up --build.
  4. Open http://localhost:3000.

  Move app with existing custom data (recommended)
  On old machine:

  1. Start app: docker compose up -d
  2. Export DB file to project folder: docker compose cp app:/app/storage/app.db ./app.db
  3. Copy the whole project folder (including app.db) to the new machine.

  On new machine:
  2. Import DB file into container volume: docker compose cp ./app.db app:/app/storage/app.db
  3. Restart app: docker compose restart app

  That preserves your custom_entries table data (db/init.sql:1).

  No files were changed.

• app.db is not in your project folder by default.

  It lives inside Docker’s named volume sqlite_data, mounted into the container at /app/storage, so the file path
  /app/storage/app.db

  That is why you don’t see ./app.db next to server.js or docker-compose.yml.
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

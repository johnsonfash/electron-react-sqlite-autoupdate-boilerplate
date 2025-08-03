# Electron + React Boilerplate

A production-ready **Electron + React** boilerplate template with:

* **Drizzle ORM** (better-sqlite3 for local storage)
* **Auto-update support** (via electron-updater)
* **POS printing capabilities**
* **Hot-reload for development** (Electron, React, and TypeScript)
* **TailwindCSS** for styling

---

## Features

* **Electron + React**: Combine powerful desktop capabilities with a React UI.
* **Drizzle ORM**: Type-safe database operations with SQLite.
* **Auto-update**: Built-in update management using `electron-updater`.
* **POS Printing**: Ready to integrate receipt printing.
* **Hot Module Replacement**: Faster development using Vite & electronmon.
* **Multi-platform builds**: Windows, macOS, and Linux.
* **TailwindCSS**: Utility-first styling for fast UI development.

---

## Project Structure

```
.
├── src/
│   ├── main/              # Electron main process (TypeScript)
│   ├── renderer/          # React frontend (Vite + TailwindCSS)
├── scripts/               # Helper scripts (version bump, update feed sync)
├── dist/                  # Compiled main process code
├── release/               # Build artifacts for all platforms
├── package.json           # Project configuration
└── tsconfig*.json         # TypeScript configs
```

---

## Prerequisites

* **Node.js** >= 18
* **npm** >= 9
* **macOS, Windows, or Linux** for building respective packages

---

## Getting Started

```bash
git clone https://github.com/yourusername/electron-react-boilerplate.git
cd electron-react-boilerplate
npm install
```

---

## Development

Start the development server:

```bash
npm run dev
```

This will:

* Compile the Electron main process in watch mode.
* Start Vite for the React renderer.
* Launch Electron with hot reload.

---

## Database (Drizzle ORM)

* **Push schema & generate types:**

```bash
npm run drizzle:push && npm run drizzle:generate
```

* **Seed database:**

```bash
npm run seed
```

---

## Building for Production

Build the main process & renderer:

```bash
npm run build
```

Create platform-specific installers:

```bash
# macOS
echo "Building for macOS..."
npm run build:mac

# Windows
echo "Building for Windows..."
npm run build:win

# Linux
echo "Building for Linux..."
npm run build:linux

# All platforms
echo "Building for all..."
npm run build:all
```

Artifacts are saved in the `release/` directory.

---

## Additional Scripts

* `npm run dev:main` – Watch & build Electron main process.
* `npm run dev:renderer` – Run Vite dev server for React.
* `npm run dev:electron` – Run Electron with hot reload.
* `npm run prebuild:db` – Prepare database before build (push + generate).
* `npm run build:dev` – Build with development mode configs.
* `npm run sync-update-feed` – Sync update feeds for auto-update.
* `npm run bump-version` – Bump the app version (used in releases).
* `npm run release` – Bump version, build all platforms & sync updates.
* `npm run npm:install` – Clean install (remove node\_modules & lockfile).

---

## Auto-updates

This template integrates **electron-updater**. To enable:

1. Configure `publish` in `electron-builder.yml` (e.g., GitHub releases).
2. Use the `npm run release` script to build & sync update feeds.

---

## POS Printing

Use the Electron main process to send raw print commands to connected POS printers. Extend `src/main` to handle printing logic for receipts or labels.

---

## Technologies Used

* **Electron**: Desktop application runtime
* **React + Vite**: Modern frontend framework & tooling
* **Drizzle ORM**: Database management
* **TailwindCSS**: CSS utilities
* **TypeScript**: Type safety for all layers

---

## License

MIT License © [Tosin Fashanu](mailto:fashanutosin7@gmail.com)

---

## Author

**Tosin Fashanu** – [GitHub](https://github.com/yourusername)

# Electron App

This project is an Electron-based desktop application.

## Features

* Cross-platform support (Windows, macOS, Linux)
* Modern UI using HTML, CSS, and JavaScript
* Easy packaging, auto-updates, and distribution
* Environment-based configuration (dev, staging, prod)

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or later)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* (Optional) [VS Code](https://code.visualstudio.com/) for development

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. Install dependencies:

   ```bash
   npm install
   ```

### Development

To start the app in development mode with live reload:

```bash
npm run dev
```

### Usage

After building or starting the app in development:

1. Launch the application.
2. Use the navigation menu to access different features.
3. Configuration files for different environments can be found in `config/`. Adjust them as needed.
4. Check logs in the `logs/` folder for debugging information.

### Building for Production

To build distributable packages for all platforms:

```bash
npm run build
```

### Building for Specific Platforms

* **Windows:**

  ```bash
  npm run build:win
  ```
* **macOS:**

  ```bash
  npm run build:mac
  ```
* **Linux:**

  ```bash
  npm run build:linux
  ```

### Auto-Updater Setup

* Configure the update server URL in `electron-builder.yml`.
* Ensure signed builds for macOS and Windows.

### Code Signing

* **macOS:** Requires an Apple Developer certificate.
* **Windows:** Requires a Code Signing certificate (e.g., from DigiCert).

### Directory Structure

```
project-root/
├── src/           # Renderer and main process code
├── public/        # Static assets
├── main.js        # Electron entry point
├── package.json   # Project configuration
├── electron-builder.yml # Build settings
└── README.md      # Documentation
```

### Packaging & Distribution

* The built application files will be in the `dist/` directory.
* Use [Electron Builder](https://www.electron.build/) for packaging.

### Troubleshooting

* Delete `node_modules` and reinstall:

  ```bash
  rm -rf node_modules && npm install
  ```
* Clear Electron cache:

  ```bash
  rm -rf ~/.electron
  ```

### Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

### License

This project is licensed under the MIT License.

# Athena - Phase 1

Athena is a desktop assessment and proctoring application built with **React 19**, **Vite**, and **Electron**. It provides an exam environment with webcam verification, kiosk-style fullscreen protection, and scheduled periodic webcam snapshots.

---

## Key Features

- **macOS System-Level Camera Permissions**: Integrates with Electron's `systemPreferences` to check and request camera permissions, with a direct fallback link to macOS Privacy & Security settings.
- **Kiosk Fullscreen Enforcement**: Prevents accidental app switching by locking the browser window into kiosk mode upon test start.
- **Automated Proctor Snapshots**: Captures periodic webcam snapshots every 4 seconds using an offscreen canvas and securely persists them directly into the Electron `userData/cameraFeed` directory as JPEG images.
- **Native Exam Rules Modal**: Displays rules confirmation using Electron native dialogs before the test starts.
- **Timer & Assessment Engine**: Real-time timer countdown managed by the Electron main process IPC and reflected in the React UI with instant scoring and review.

---

## Architecture & Tech Stack

- **Runtime**: Electron 41.x
- **Frontend**: React 19 + Vite 8
- **Inter-Process Communication**: ContextBridge exposed via `electron/preload.cjs`
- **Styling**: Vanilla CSS design system with responsive layouts and dark/light system adaptation

---

## Project Structure

```
.
├── electron/
│   ├── main.cjs       # Main Electron process, window management & IPC handlers
│   └── preload.cjs    # Secure ContextBridge APIs exposed to React
├── public/            # Static assets and icons
├── src/
│   ├── App.css        # Clean responsive styles for setup and exam flows
│   ├── App.jsx        # Root component handling permissions, quiz & snapshot loop
│   ├── index.css      # Base typography and design system variables
│   └── main.jsx       # React application entrypoint
├── index.html         # HTML root document
├── package.json       # Project dependencies and run scripts
└── vite.config.js     # Vite configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

1. Start the Vite development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, launch the Electron application:
   ```bash
   npm start
   ```

### Building for Production

```bash
npm run build
```

---

## License

Private / Confidential
